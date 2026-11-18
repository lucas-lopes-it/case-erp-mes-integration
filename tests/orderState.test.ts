import { describe, expect, it } from "vitest";
import { FIRST_VERSION_LIVE_SITUATIONS, intentFor } from "../src/contract/orderState";
import { ORDER_SITUATIONS } from "../src/contract/types";

describe("order situation rule", () => {
  it.each(["C", "A", "E"] as const)("%s is live on the shop floor", (s) => {
    expect(intentFor(s)).toBe("keep-live");
  });

  it.each(["D", "F"] as const)("%s closes the order in the MES", (s) => {
    expect(intentFor(s)).toBe("close");
  });

  it.each(["P", "R", "M", "B"] as const)("%s is not the shop floor's business yet", (s) => {
    expect(intentFor(s)).toBe("ignore");
  });

  it("covers every situation the ERP can store", () => {
    for (const s of ORDER_SITUATIONS) expect(["keep-live", "close", "ignore"]).toContain(intentFor(s));
  });

  it("documents that the first version also sent P", () => {
    expect(FIRST_VERSION_LIVE_SITUATIONS).toContain("P");
    expect(intentFor("P")).toBe("ignore");
  });
});
