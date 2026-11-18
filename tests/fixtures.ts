import type { Product, ProductionFormula, ProductionOrder } from "../src/contract/types";

export const product = (over: Partial<Product> = {}): Product => ({
  productCode: 1001,
  description: "Wall fan 1m 127V black",
  active: true,
  ...over,
});

export const formula = (over: Partial<ProductionFormula> = {}): ProductionFormula => ({
  productCode: 1001,
  cycleSeconds: 30,
  setupMinutes: 15,
  stopToleranceMinutes: 5,
  active: true,
  ...over,
});

export const order = (over: Partial<ProductionOrder> = {}): ProductionOrder => ({
  orderId: 50001,
  productCode: 1001,
  line: "LINE-A",
  situation: "C",
  quantity: 500,
  ...over,
});
