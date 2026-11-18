/**
 * Plans one sync run over the fictional ERP snapshot, starting from an empty MES.
 *
 *   npm run sync:plan
 *
 * Then simulates a second run with nothing changed, to show that the second run sends nothing.
 */
import { readFileSync } from "node:fs";
import type { Product, ProductionFormula, ProductionOrder } from "../src/contract/types";
import { applyToState, planSync, summarize, type SyncState } from "../src/sync/plan";

interface Snapshot {
  integratedLines: string[];
  products: Product[];
  formulas: ProductionFormula[];
  orders: ProductionOrder[];
}

const path = process.argv[2] ?? new URL("../fixtures/erp-snapshot.json", import.meta.url).pathname;
const snap = JSON.parse(readFileSync(path, "utf8")) as Snapshot;
const base = { orders: snap.orders, formulas: snap.formulas, products: snap.products, lines: snap.integratedLines };

const first = planSync({ ...base, state: new Map() });
const state: SyncState = applyToState(new Map(), first);
const second = planSync({ ...base, state });

console.log("First run :", JSON.stringify(summarize(first)));
for (const s of first.filter((s) => s.action === "hold")) console.log(`  hold ${s.orderId}: ${s.reason}`);
console.log("Second run:", JSON.stringify(summarize(second)));
