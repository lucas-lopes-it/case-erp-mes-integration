import type { OrderSituation } from "./types";

/**
 * Which ERP situations the shop floor needs to see (decision P3 in docs/DECISIONS.md).
 *
 * Agreed with production planning:
 *   C, A, E  -> the order is live on the floor: import it or keep it updated
 *   D, F     -> the order is over: deactivate it in the MES
 *   P, R, M, B -> not the shop floor's business yet: ignore
 *
 * The first version of the rule also sent P. That is why some orders reached the MES too early
 * and stayed frozen there until they moved on (see docs/sprints/sprint-002/retrospective.md).
 */
export const LIVE_SITUATIONS: readonly OrderSituation[] = ["C", "A", "E"];
export const CLOSED_SITUATIONS: readonly OrderSituation[] = ["D", "F"];

export type OrderIntent = "keep-live" | "close" | "ignore";

export function intentFor(situation: OrderSituation): OrderIntent {
  if (LIVE_SITUATIONS.includes(situation)) return "keep-live";
  if (CLOSED_SITUATIONS.includes(situation)) return "close";
  return "ignore";
}

/** The rule used before production planning reviewed it. Kept to explain the frozen orders. */
export const FIRST_VERSION_LIVE_SITUATIONS: readonly OrderSituation[] = ["P", "C", "A", "E"];
