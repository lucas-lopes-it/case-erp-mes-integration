import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildPayload, fingerprint } from "../src/contract/payload";
import { applyToState, planSync, summarize, type SyncState } from "../src/sync/plan";
import { formula, order, product } from "./fixtures";

const base = { formulas: [formula()], products: [product()], lines: ["LINE-A"] };
const stateWith = (status: "active" | "deactivated", fp = "old"): SyncState =>
  new Map([[50001, { orderId: 50001, fingerprint: fp, status }]]);

describe("sync plan", () => {
  it("imports a new live order", () => {
    const [s] = planSync({ ...base, orders: [order()], state: new Map() });
    expect(s).toMatchObject({ action: "import", orderId: 50001 });
  });

  it("skips a live order that did not change", () => {
    const fp = fingerprint(buildPayload(order(), formula(), product()));
    const [s] = planSync({ ...base, orders: [order()], state: stateWith("active", fp) });
    expect(s?.action).toBe("skip");
  });

  it("updates a live order that changed", () => {
    const [s] = planSync({ ...base, orders: [order({ quantity: 900 })], state: stateWith("active") });
    expect(s).toMatchObject({ action: "update", reason: "changed since last sync" });
  });

  it("uses update, not import, to bring back a deactivated order", () => {
    const [s] = planSync({ ...base, orders: [order({ situation: "A" })], state: stateWith("deactivated") });
    expect(s).toMatchObject({ action: "update", reason: expect.stringContaining("reactivates") });
  });

  it("deactivates a closed order that is active in the MES", () => {
    const [s] = planSync({ ...base, orders: [order({ situation: "F" })], state: stateWith("active") });
    expect(s?.action).toBe("deactivate");
  });

  it("does not deactivate what was never sent or is already deactivated", () => {
    expect(planSync({ ...base, orders: [order({ situation: "D" })], state: new Map() })[0]?.action).toBe("skip");
    expect(planSync({ ...base, orders: [order({ situation: "D" })], state: stateWith("deactivated") })[0]?.action).toBe("skip");
  });

  it("holds a live order that breaks the contract, with the field that failed", () => {
    const [s] = planSync({ ...base, formulas: [formula({ setupMinutes: null })], orders: [order()], state: new Map() });
    expect(s).toMatchObject({ action: "hold", reason: expect.stringContaining("setupMinutes") });
  });

  it("leaves an order sent under the first rule frozen until it moves on", () => {
    const [s] = planSync({ ...base, orders: [order({ situation: "P" })], state: stateWith("active") });
    expect(s).toMatchObject({ action: "skip", reason: expect.stringContaining("stays as it is") });
  });

  it("ignores orders outside the integrated lines", () => {
    expect(planSync({ ...base, orders: [order({ line: "LINE-X" })], state: new Map() })).toEqual([]);
  });

  it("applies accepted steps to the state", () => {
    const steps = planSync({ ...base, orders: [order()], state: new Map() });
    const state = applyToState(new Map(), steps);
    expect(state.get(50001)?.status).toBe("active");
    const closed = planSync({ ...base, orders: [order({ situation: "F" })], state });
    expect(applyToState(state, closed).get(50001)?.status).toBe("deactivated");
  });
});

describe("idempotency over the fictional snapshot", () => {
  const snap = JSON.parse(readFileSync(new URL("../fixtures/erp-snapshot.json", import.meta.url), "utf8"));
  const input = { orders: snap.orders, formulas: snap.formulas, products: snap.products, lines: snap.integratedLines };

  it("sends nothing on a second run with no changes", () => {
    const first = planSync({ ...input, state: new Map() });
    const second = planSync({ ...input, state: applyToState(new Map(), first) });
    expect(summarize(first).import).toBeGreaterThan(0);
    expect(second.filter((s) => s.action === "import" || s.action === "update")).toEqual([]);
  });

  it("running the same plan twice does not import the same order twice", () => {
    const first = planSync({ ...input, state: new Map() });
    const ids = first.filter((s) => s.action === "import").map((s) => s.orderId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
