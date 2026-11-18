# Sprint 002: review

> The rule belongs to the people who know it.

## Goal

Correct the situation rule with production planning, add one more line, and give the floor the bill
of materials for each product on the terminal.

## What shipped

- **Situation rule, reviewed.** C, A and E go to the floor; D and F are deactivated; P, R, M and B
  stay in the ERP. Orders sent under the first rule were left to resolve as they moved on.
- **Vendor behavior confirmed.** An update reactivates a deactivated order, so a reopened order never
  needs a new import.
- **One more line.** Added to the scope after its own readiness check.
- **Bill of materials documents.** Regenerated every day from the ERP, published in one place, with an
  index.
- **Acceptance criterion, anchored on orders.** Every product that has had an order in the integrated
  lines, with an active formula. Scope by the order's line, not the formula's.

## Numbers

- 459 bill of materials documents generated.
- 16 products listed in the index as having no raw materials registered, sent to planning to close.
- Readiness after adding the line: every live order with cycle, setup and stop times; inactive
  products appeared only on closed orders.

## Left for later

- Raw-material photos, which planning prepares by hand.
