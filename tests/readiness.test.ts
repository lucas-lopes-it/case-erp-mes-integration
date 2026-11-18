import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkReadiness, formulasWithoutTimes } from "../src/contract/readiness";
import { formula, order, product } from "./fixtures";

const lines = ["LINE-A"];

describe("go-live readiness, anchored on orders", () => {
  it("is ready when every live order can be sent", () => {
    const r = checkReadiness({ orders: [order()], formulas: [formula()], products: [product()], lines });
    expect(r.ready).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.scope).toEqual({ lines, liveOrders: 1, products: 1 });
  });

  it("blocks go-live when a live order breaks the contract, and groups by reason", () => {
    const r = checkReadiness({
      orders: [order({ orderId: 1 }), order({ orderId: 2 })],
      formulas: [formula({ stopToleranceMinutes: null })],
      products: [product()],
      lines,
    });
    expect(r.ready).toBe(false);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]).toMatchObject({ severity: "blocker", orderIds: [1, 2], productCodes: [1001] });
  });

  it("ignores lines outside the integration", () => {
    const r = checkReadiness({
      orders: [order({ line: "LINE-X" })],
      formulas: [formula({ cycleSeconds: null })],
      products: [product()],
      lines,
    });
    expect(r.ready).toBe(true);
    expect(r.scope.liveOrders).toBe(0);
  });

  it("does not block on formulas that no live order uses", () => {
    const r = checkReadiness({
      orders: [order()],
      formulas: [formula(), formula({ productCode: 9999, cycleSeconds: null })],
      products: [product(), product({ productCode: 9999 })],
      lines,
    });
    expect(r.ready).toBe(true);
  });

  it("flags distinct active parts that share a description as a risk, not a blocker", () => {
    const r = checkReadiness({
      orders: [order({ orderId: 1 }), order({ orderId: 2, productCode: 1002 })],
      formulas: [formula(), formula({ productCode: 1002 })],
      products: [product(), product({ productCode: 1002, description: " wall fan 1m 127v BLACK " })],
      lines,
    });
    expect(r.ready).toBe(true);
    expect(r.findings).toEqual([expect.objectContaining({ severity: "risk", productCodes: [1001, 1002] })]);
  });

  it("reports inactive products on closed orders as information only", () => {
    const r = checkReadiness({
      orders: [order({ situation: "F", productCode: 1201 })],
      formulas: [formula({ productCode: 1201 })],
      products: [product({ productCode: 1201, active: false })],
      lines,
    });
    expect(r.ready).toBe(true);
    expect(r.findings).toEqual([expect.objectContaining({ severity: "info", productCodes: [1201] })]);
  });
});

describe("the fictional snapshot", () => {
  const snap = JSON.parse(readFileSync(new URL("../fixtures/erp-snapshot.json", import.meta.url), "utf8"));
  const report = checkReadiness({ ...snap, lines: snap.integratedLines });

  it("shows the gap between the two ways of asking", () => {
    const blockingProducts = report.findings.filter((f) => f.severity === "blocker").flatMap((f) => f.productCodes);
    expect(formulasWithoutTimes(snap.formulas).length).toBeGreaterThan(30);
    expect(blockingProducts).toEqual([1102]);
  });

  it("finds the same-description pair and the historical inactive products", () => {
    expect(report.findings.map((f) => f.kind).sort()).toEqual([
      "contract-violation",
      "inactive-on-closed-orders",
      "same-description",
    ]);
  });
});
