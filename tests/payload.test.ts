import { describe, expect, it } from "vitest";
import { buildPayload, ContractError, fingerprint } from "../src/contract/payload";
import { formula, order, product } from "./fixtures";

describe("payload contract", () => {
  it("takes the part from the order and the times from the formula", () => {
    const p = buildPayload(order({ productCode: 1001 }), formula(), product());
    expect(p).toMatchObject({
      orderId: 50001,
      partCode: 1001,
      partDescription: "Wall fan 1m 127V black",
      line: "LINE-A",
      quantity: 500,
      cycleSeconds: 30,
      setupMinutes: 15,
      stopToleranceMinutes: 5,
    });
  });

  it("rejects a product missing from the catalog", () => {
    expect(() => buildPayload(order(), formula(), undefined)).toThrow(ContractError);
  });

  it("rejects an inactive product", () => {
    expect(() => buildPayload(order(), formula(), product({ active: false }))).toThrow(/inactive/);
  });

  it("rejects a missing or inactive formula", () => {
    expect(() => buildPayload(order(), undefined, product())).toThrow(/formula/);
    expect(() => buildPayload(order(), formula({ active: false }), product())).toThrow(/formula/);
  });

  it.each(["cycleSeconds", "setupMinutes", "stopToleranceMinutes"] as const)(
    "rejects a missing %s instead of inventing a default",
    (field) => {
      for (const bad of [null, 0, -1, Number.NaN]) {
        try {
          buildPayload(order(), formula({ [field]: bad }), product());
          expect.unreachable();
        } catch (err) {
          expect(err).toBeInstanceOf(ContractError);
          expect((err as ContractError).field).toBe(field);
          expect((err as ContractError).orderId).toBe(50001);
        }
      }
    },
  );

  it("fingerprints ignore key order and change when any field changes", () => {
    const a = buildPayload(order(), formula(), product());
    const shuffled = Object.fromEntries(Object.entries(a).reverse()) as typeof a;
    expect(fingerprint(shuffled)).toBe(fingerprint(a));
    expect(fingerprint({ ...a, quantity: 501 })).not.toBe(fingerprint(a));
    expect(fingerprint({ ...a, stopToleranceMinutes: 6 })).not.toBe(fingerprint(a));
  });
});
