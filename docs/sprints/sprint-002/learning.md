# Sprint 002: learning

## Acceptance criteria should come from what the user receives

### What happened

Twice in a row, a check anchored on the catalog gave a long, alarming answer, and a check anchored on
the orders gave a short, useful one. First for go-live, then for the bill of materials documents.

### Why this matters for product people

A catalog describes everything a company could make. A production order describes what the floor
will actually do. Acceptance criteria written against the catalog measure completeness of data;
criteria written against orders measure whether the user can work. Only the second one tells you if
the product is ready.

### How to apply it

1. Name the record your user actually receives (an order, a ticket, an invoice).
2. Write the acceptance criterion as "every X the user will receive satisfies Y".
3. Keep catalog gaps in a separate list, labeled as information, so nobody mistakes them for blockers.

### Exercise

Run `npm run readiness` and read the last line. Then find a check in your own work that is anchored
on the catalog and rewrite it from the record your user receives.
