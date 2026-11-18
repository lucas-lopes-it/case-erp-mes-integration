import { CLOSED_SITUATIONS, LIVE_SITUATIONS } from "./orderState";
import { buildPayload, ContractError } from "./payload";
import type { Product, ProductionFormula, ProductionOrder } from "./types";

/**
 * Go-live readiness, anchored on production orders (decision P5 in docs/DECISIONS.md).
 *
 * The first check was anchored on formulas and reported over a hundred products "without times".
 * Most of them had never had a production order. The question that matters for go-live is not
 * "is the catalog complete?" but "can every order the shop floor will receive be sent as is?".
 */

export type Severity = "blocker" | "risk" | "info";

export interface Finding {
  severity: Severity;
  kind: string;
  message: string;
  orderIds: number[];
  productCodes: number[];
}

export interface ReadinessReport {
  scope: { lines: string[]; liveOrders: number; products: number };
  ready: boolean;
  findings: Finding[];
}

export interface ReadinessInput {
  orders: ProductionOrder[];
  formulas: ProductionFormula[];
  products: Product[];
  lines: string[];
}

export function checkReadiness(input: ReadinessInput): ReadinessReport {
  const formulaBy = new Map(input.formulas.map((f) => [f.productCode, f]));
  const productBy = new Map(input.products.map((p) => [p.productCode, p]));
  const inScope = input.orders.filter((o) => input.lines.includes(o.line));
  const live = inScope.filter((o) => LIVE_SITUATIONS.includes(o.situation));
  const findings: Finding[] = [];

  // 1. Every live order must produce a valid payload.
  const violations = new Map<string, { orderIds: number[]; productCodes: Set<number> }>();
  for (const order of live) {
    try {
      buildPayload(order, formulaBy.get(order.productCode), productBy.get(order.productCode));
    } catch (err) {
      if (!(err instanceof ContractError)) throw err;
      const key = err.message;
      const entry = violations.get(key) ?? { orderIds: [], productCodes: new Set<number>() };
      entry.orderIds.push(order.orderId);
      entry.productCodes.add(order.productCode);
      violations.set(key, entry);
    }
  }
  for (const [message, entry] of violations) {
    findings.push({
      severity: "blocker",
      kind: "contract-violation",
      message,
      orderIds: entry.orderIds,
      productCodes: [...entry.productCodes],
    });
  }

  // 2. Two active parts with the same description look identical on the operator's terminal.
  const liveCodes = [...new Set(live.map((o) => o.productCode))];
  const byDescription = new Map<string, number[]>();
  for (const code of liveCodes) {
    const product = productBy.get(code);
    if (!product?.active) continue;
    const key = product.description.trim().toUpperCase();
    byDescription.set(key, [...(byDescription.get(key) ?? []), code]);
  }
  for (const [description, codes] of byDescription) {
    if (codes.length > 1) {
      findings.push({
        severity: "risk",
        kind: "same-description",
        message: `active parts share the description "${description}"`,
        orderIds: live.filter((o) => codes.includes(o.productCode)).map((o) => o.orderId),
        productCodes: codes,
      });
    }
  }

  // 3. Inactive products on closed orders are history, not a problem. Say so, so nobody chases it.
  const historical = inScope.filter(
    (o) => CLOSED_SITUATIONS.includes(o.situation) && productBy.get(o.productCode)?.active === false,
  );
  if (historical.length > 0) {
    findings.push({
      severity: "info",
      kind: "inactive-on-closed-orders",
      message: "inactive products appear only on closed orders",
      orderIds: historical.map((o) => o.orderId),
      productCodes: [...new Set(historical.map((o) => o.productCode))],
    });
  }

  return {
    scope: { lines: input.lines, liveOrders: live.length, products: liveCodes.length },
    ready: !findings.some((f) => f.severity === "blocker"),
    findings,
  };
}

/**
 * The formula-anchored check the reconstruction replaces. It answers a different question:
 * which formulas lack times, whether or not anyone will ever produce them.
 */
export function formulasWithoutTimes(formulas: ProductionFormula[]): number[] {
  return formulas
    .filter(
      (f) =>
        f.active &&
        [f.cycleSeconds, f.setupMinutes, f.stopToleranceMinutes].some((v) => v == null || v <= 0),
    )
    .map((f) => f.productCode);
}
