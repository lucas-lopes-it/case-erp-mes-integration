import type { MesOrderPayload, Product, ProductionFormula, ProductionOrder } from "./types";

export class ContractError extends Error {
  constructor(
    message: string,
    readonly orderId: number,
    readonly field: string,
  ) {
    super(message);
    this.name = "ContractError";
  }
}

/**
 * Builds what the MES receives for one order (decision P4 in docs/DECISIONS.md).
 *
 * The part always comes from the order, never from the formula. The formula only supplies the
 * cycle, setup and stop tolerance for that part. Because the order's product code is unique,
 * the same order can never be sent as two different parts.
 *
 * Missing times are a contract violation, not something to fill with a default: a made-up time
 * on the shop floor terminal is worse than an order that waits for its data.
 */
export function buildPayload(
  order: ProductionOrder,
  formula: ProductionFormula | undefined,
  product: Product | undefined,
): MesOrderPayload {
  if (!product) {
    throw new ContractError("product not found in the ERP catalog", order.orderId, "partCode");
  }
  if (!product.active) {
    throw new ContractError("product is inactive in the ERP catalog", order.orderId, "partCode");
  }
  if (!formula || !formula.active) {
    throw new ContractError("no active formula for the product", order.orderId, "formula");
  }

  const required = {
    cycleSeconds: formula.cycleSeconds,
    setupMinutes: formula.setupMinutes,
    stopToleranceMinutes: formula.stopToleranceMinutes,
  };
  for (const [field, value] of Object.entries(required)) {
    if (value == null || !Number.isFinite(value) || value <= 0) {
      throw new ContractError(`${field} is missing or not positive`, order.orderId, field);
    }
  }

  return {
    orderId: order.orderId,
    partCode: order.productCode,
    partDescription: product.description,
    line: order.line,
    quantity: order.quantity,
    cycleSeconds: formula.cycleSeconds as number,
    setupMinutes: formula.setupMinutes as number,
    stopToleranceMinutes: formula.stopToleranceMinutes as number,
  };
}

/** A stable fingerprint of a payload, used to know whether anything changed since the last sync. */
export function fingerprint(payload: MesOrderPayload): string {
  const keys = Object.keys(payload).sort() as (keyof MesOrderPayload)[];
  return keys.map((k) => `${k}=${String(payload[k])}`).join("|");
}
