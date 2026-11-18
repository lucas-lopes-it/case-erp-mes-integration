# The contract

What crosses the boundary between the ERP and the shop floor, and who owns each part of it. This is
the document that was missing for almost six months. The rules marked as rebuilt have tests in this
repository.

## Parties

| Party | Owns |
|---|---|
| Production planning | The meaning of each order situation, the cycle, setup and stop times, the catalog |
| ERP side | Producing orders, formulas and products as they are in the ERP |
| MES vendor | Receiving orders and showing them on the operator's terminal |
| Product (me) | This document, the go-live check and the decision when the two sides disagree |

## Scope

- **Lines:** only the integrated production lines. A line enters after its live orders pass the
  readiness check (decision P2).
- **Orders:** production orders, by situation (below).
- **Out of scope:** stock movements, quality records and anything the MES produces back to the ERP.

## Order situations

| ERP situation | Meaning for the floor | MES action |
|---|---|---|
| C, A, E | The floor works on it now | Import if new, update if changed |
| D, F | The order is over | Deactivate |
| P, R, M, B | Not the floor's business yet | None |

Rebuilt in `src/contract/orderState.ts`. The first version also sent P (decision P3).

## Payload

| Field | Source | Rule |
|---|---|---|
| `orderId` | Order | Unique per order |
| `partCode` | Order's product code | Never from the formula (decision P4) |
| `partDescription` | Product catalog | Product must exist and be active |
| `line` | Order's line | Defines scope; the formula's line is not used |
| `quantity` | Order | As in the ERP |
| `cycleSeconds` | Formula | Required, positive, no default |
| `setupMinutes` | Formula | Required, positive, no default |
| `stopToleranceMinutes` | Formula (filled by planning) | Required, positive, no default |

Rebuilt in `src/contract/payload.ts`. An order that breaks a rule is held with the field that failed.

## Change, close, reopen

| Situation now | Known to the MES as | Action |
|---|---|---|
| Live | Not sent | Import |
| Live | Active, same payload | Nothing |
| Live | Active, different payload | Update |
| Live | Deactivated | Update (reactivates, as the vendor confirmed) |
| Closed | Active | Deactivate |
| Closed | Not sent or deactivated | Nothing |

Rebuilt in `src/sync/plan.ts`. A second run with nothing changed sends nothing.

## Readiness

A line is ready when every live order in it can be sent as is. Findings come in three levels:

- **Blocker:** a live order breaks the contract.
- **Risk:** distinct active parts share a description and look the same on the terminal.
- **Information:** inactive products that appear only on closed orders.

Rebuilt in `src/contract/readiness.ts`; run `npm run readiness`.

## Open items

- Setup time per line instead of per product (one line needs a longer setup than the others).
- Number of operators per order, once the vendor confirms the field name.
