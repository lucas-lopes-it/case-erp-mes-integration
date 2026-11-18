/**
 * Go-live readiness report over the fictional ERP snapshot.
 *
 *   npm run readiness
 *
 * Prints the same check used before go-live: can every live order in the integrated lines be
 * sent as is? It also prints the formula-anchored count, to show why that question was the wrong one.
 */
import { readFileSync } from "node:fs";
import { checkReadiness, formulasWithoutTimes } from "../src/contract/readiness";
import type { Product, ProductionFormula, ProductionOrder } from "../src/contract/types";

interface Snapshot {
  integratedLines: string[];
  products: Product[];
  formulas: ProductionFormula[];
  orders: ProductionOrder[];
}

const path = process.argv[2] ?? new URL("../fixtures/erp-snapshot.json", import.meta.url).pathname;
const snap = JSON.parse(readFileSync(path, "utf8")) as Snapshot;

const report = checkReadiness({
  orders: snap.orders,
  formulas: snap.formulas,
  products: snap.products,
  lines: snap.integratedLines,
});
const formulaAnchored = formulasWithoutTimes(snap.formulas);

const icon = { blocker: "BLOCKER", risk: "RISK", info: "INFO" } as const;
const out: string[] = [];
out.push("# Go-live readiness");
out.push("");
out.push(`Lines in scope: ${report.scope.lines.join(", ")}`);
out.push(`Live orders (C, A, E): ${report.scope.liveOrders}, covering ${report.scope.products} products`);
out.push(`Verdict: ${report.ready ? "READY" : "NOT READY"}`);
out.push("");
for (const f of report.findings) {
  out.push(`- ${icon[f.severity]} ${f.message}`);
  out.push(`  orders: ${f.orderIds.join(", ")} | products: ${f.productCodes.join(", ")}`);
}
out.push("");
out.push("## The question we stopped asking");
out.push("");
out.push(
  `Anchored on formulas, ${formulaAnchored.length} products look "without times". ` +
    `Anchored on live orders, ${report.findings.filter((f) => f.severity === "blocker").reduce((n, f) => n + f.productCodes.length, 0)} product(s) actually block go-live.`,
);
console.log(out.join("\n"));
