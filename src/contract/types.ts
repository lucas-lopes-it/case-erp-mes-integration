/**
 * The shapes on each side of the contract.
 *
 * ERP field names in comments point to the original Sankhya tables, so the reconstruction can be
 * read next to the real system. All data in this repository is fictional.
 */

/** Production order situation codes, as the ERP stores them. */
export const ORDER_SITUATIONS = ["P", "R", "M", "B", "C", "A", "E", "D", "F"] as const;
export type OrderSituation = (typeof ORDER_SITUATIONS)[number];

/** A production order read from the ERP (AD_TPROPC). */
export interface ProductionOrder {
  orderId: number;
  productCode: number; // OP.CODPROD: the product the shop floor will make
  line: string; // OP.CODLOCAL: the production line, used to decide what is in scope
  situation: OrderSituation;
  quantity: number;
}

/** A production formula (AD_TPRFOR): it only supplies the times for a product. */
export interface ProductionFormula {
  productCode: number;
  cycleSeconds: number | null;
  setupMinutes: number | null;
  stopToleranceMinutes: number | null; // AD_TMPPARADA, filled by hand per product
  active: boolean;
}

/** A product from the ERP catalog (TGFPRO). */
export interface Product {
  productCode: number;
  description: string;
  active: boolean;
}

/** What the MES receives for each order. */
export interface MesOrderPayload {
  orderId: number;
  partCode: number;
  partDescription: string;
  line: string;
  quantity: number;
  cycleSeconds: number;
  setupMinutes: number;
  stopToleranceMinutes: number;
}

/** MES actions, as numbered by the vendor's API. */
export const MES_ACTIONS = { import: 1, update: 2, deactivate: 3 } as const;
export type MesAction = keyof typeof MES_ACTIONS;
