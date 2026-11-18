import { intentFor } from "../contract/orderState";
import { buildPayload, ContractError, fingerprint } from "../contract/payload";
import type { MesAction, MesOrderPayload, Product, ProductionFormula, ProductionOrder } from "../contract/types";

/**
 * What the integration remembers about each order it has already sent (decision A1).
 *
 * Without this memory, every run would resend everything, and a retry after a failure could
 * create the same order twice on the shop floor.
 */
export interface SyncedOrder {
  orderId: number;
  fingerprint: string;
  status: "active" | "deactivated";
}

export type SyncState = Map<number, SyncedOrder>;

export type PlannedStep =
  | { action: MesAction; orderId: number; payload?: MesOrderPayload; reason: string }
  | { action: "skip"; orderId: number; reason: string }
  | { action: "hold"; orderId: number; reason: string };

export interface PlanInput {
  orders: ProductionOrder[];
  formulas: ProductionFormula[];
  products: Product[];
  lines: string[];
  state: SyncState;
}

/**
 * Decides, for each order in scope, what to send to the MES in this run.
 *
 * - live and never sent            -> import
 * - live and changed since last    -> update (also reactivates a deactivated order, as the vendor confirmed)
 * - live and unchanged             -> skip
 * - closed and active in the MES   -> deactivate
 * - closed and never sent          -> skip
 * - live but breaking the contract -> hold, with the reason, until the data is fixed
 * - ignored situation              -> skip; if it was sent under the first rule, it stays frozen
 */
export function planSync(input: PlanInput): PlannedStep[] {
  const formulaBy = new Map(input.formulas.map((f) => [f.productCode, f]));
  const productBy = new Map(input.products.map((p) => [p.productCode, p]));
  const steps: PlannedStep[] = [];

  for (const order of input.orders) {
    if (!input.lines.includes(order.line)) continue;
    const known = input.state.get(order.orderId);
    const intent = intentFor(order.situation);

    if (intent === "ignore") {
      steps.push({
        action: "skip",
        orderId: order.orderId,
        reason: known
          ? `situation ${order.situation} is out of scope; the order stays as it is in the MES until it moves on`
          : `situation ${order.situation} is out of scope`,
      });
      continue;
    }

    if (intent === "close") {
      if (known?.status === "active") {
        steps.push({ action: "deactivate", orderId: order.orderId, reason: `order closed (${order.situation})` });
      } else {
        steps.push({ action: "skip", orderId: order.orderId, reason: "closed and not active in the MES" });
      }
      continue;
    }

    let payload: MesOrderPayload;
    try {
      payload = buildPayload(order, formulaBy.get(order.productCode), productBy.get(order.productCode));
    } catch (err) {
      if (!(err instanceof ContractError)) throw err;
      steps.push({ action: "hold", orderId: order.orderId, reason: err.message });
      continue;
    }

    const print = fingerprint(payload);
    if (!known) {
      steps.push({ action: "import", orderId: order.orderId, payload, reason: "new live order" });
    } else if (known.status === "deactivated") {
      steps.push({ action: "update", orderId: order.orderId, payload, reason: "reopened: update reactivates it" });
    } else if (known.fingerprint !== print) {
      steps.push({ action: "update", orderId: order.orderId, payload, reason: "changed since last sync" });
    } else {
      steps.push({ action: "skip", orderId: order.orderId, reason: "unchanged" });
    }
  }

  return steps;
}

/** Applies a successful run to the state. Only steps the MES accepted should be passed in. */
export function applyToState(state: SyncState, accepted: PlannedStep[]): SyncState {
  const next: SyncState = new Map(state);
  for (const step of accepted) {
    if ((step.action === "import" || step.action === "update") && step.payload) {
      next.set(step.orderId, { orderId: step.orderId, fingerprint: fingerprint(step.payload), status: "active" });
    } else if (step.action === "deactivate") {
      const known = next.get(step.orderId);
      if (known) next.set(step.orderId, { ...known, status: "deactivated" });
    }
  }
  return next;
}

/** Counts steps by action, for the run summary posted to the team channel. */
export function summarize(steps: PlannedStep[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of steps) out[s.action] = (out[s.action] ?? 0) + 1;
  return out;
}
