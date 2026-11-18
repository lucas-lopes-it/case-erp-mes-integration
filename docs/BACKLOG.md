# Backlog

Two epics. The first is what shipped in sprints 001 to 003 and is rebuilt in this repository. The
second is what comes next, from the [roadmap](product/roadmap.md).

Each story has acceptance criteria in Given / When / Then, the vendor it depends on, and why it sits
where it sits in the order.

## How the order is decided

1. **What the operator sees must be right.** A wrong order on the terminal costs the floor's trust,
   and trust is the adoption metric.
2. **Then, the numbers built on it.** Efficiency figures are only as good as the times behind them.
3. **Then, widening the scope.** A new line or field enters through the contract and the readiness
   check, never around them.
4. **Vendor-blocked work waits visibly.** It stays in the backlog with the owner of the block named,
   instead of being worked around on our side.

---

## Epic 1. Live orders reach the floor without retyping

**Outcome:** about 77 orders a day reach the MES with no manual touch, at 99.97% synchronization.
**Status:** shipped (sprints 001 to 003). Rules rebuilt as tested code in `src/`.

### 1.1 Only orders the floor can act on cross the boundary

> As a line operator, I want to see only orders that can be produced now, so I don't start work the
> plan has not released.

| | |
|---|---|
| **Given** an order in situation C, A or E on an integrated line | **When** the sync runs **Then** it is imported (action 1) or updated (action 2) in the MES |
| **Given** an order in situation P, R, M or B | **When** the sync runs **Then** nothing is sent, and the order stays in the ERP |
| **Given** an order already in the MES that moves to D or F | **When** the sync runs **Then** it is deactivated (action 3) |
| **Given** a deactivated order that returns to A | **When** the sync runs **Then** it is reactivated with action 2, not imported again |

- **Depends on:** SKA (MES) confirming the meaning of actions 1, 2 and 3. Production planning
  signing off on the situation rule.
- **Priority 1:** this is what the operator sees. When P was also sent, 402 orders reached the floor
  ahead of time and stayed frozen there.
- **Code:** `src/contract/orderState.ts`, `src/sync/plan.ts`. Decision [P3](DECISIONS.md#p3-only-orders-the-floor-can-act-on-cross-the-boundary).

### 1.2 Times come from the formula, never from a default

> As a production manager, I want every efficiency figure built on real times, so the numbers I
> review are numbers the plant actually set.

| | |
|---|---|
| **Given** a live order whose formula has cycle, setup and stop tolerance | **When** the payload is built **Then** the part comes from the order and the times from the formula |
| **Given** a live order whose formula is missing any of the three times | **When** the sync runs **Then** the order is held, nothing is sent, and the hold names the missing field |
| **Given** a held order whose time is filled in by planning | **When** the next sync runs **Then** it is sent with no manual step |

- **Depends on:** no vendor. Planning keeps formulas complete in the ERP.
- **Priority 2:** a default time looks real on the terminal and corrupts every figure built on it.
  An order that waits is visible; a wrong number is not.
- **Code:** `src/contract/payload.ts`. Decision [P4](DECISIONS.md#p4-the-part-comes-from-the-order-no-made-up-numbers-on-the-floor).

### 1.3 Go-live readiness is checked from live orders

> As the person deciding a line's go-live, I want to know which live orders would fail today, so the
> decision is about the floor and not about the catalog.

| | |
|---|---|
| **Given** a line about to be integrated | **When** the readiness check runs **Then** it reports blockers only for products with live orders on that line |
| **Given** a product with no live order and missing times | **When** the readiness check runs **Then** it appears as information, not as a blocker |
| **Given** zero blockers | **When** the readiness check runs **Then** the result is READY and the line can go live |

- **Depends on:** no vendor.
- **Priority 3:** it decides when a line goes live. Anchored on formulas, the first check reported
  116 products as blockers that had no live order; anchored on orders, the list was short enough
  to clear before go-live.
- **Code:** `src/contract/readiness.ts`, `npm run readiness`. Decision [P5](DECISIONS.md#p5-ask-the-go-live-question-from-the-orders-not-the-catalog).

### 1.4 The integration sends only what changed

> As the MES vendor, I want to receive an order only when something about it changed, so the floor
> server is not reprocessing the same data every few minutes.

| | |
|---|---|
| **Given** an order whose payload is identical to the last one sent | **When** the sync runs **Then** it is skipped |
| **Given** an order whose quantity or times changed | **When** the sync runs **Then** it is sent as an update (action 2) |
| **Given** a run that fails halfway | **When** the next run starts **Then** it resumes from the recorded state without sending duplicates |

- **Depends on:** SKA accepting updates by order key.
- **Priority 4:** keeps production data every 5 minutes without loading the MES server.
- **Code:** `src/sync/plan.ts` (fingerprint and state).

### 1.5 Every run reports itself where the team already works

> As production planning, I want a short summary of each run in the team chat, so I fix a held order
> without opening a log.

| | |
|---|---|
| **Given** a run with held orders | **When** it finishes **Then** the team chat gets the held orders and the field that failed for each |
| **Given** a run with no holds | **When** it finishes **Then** the summary shows counts only (imported, updated, deactivated, skipped) |

- **Depends on:** no vendor. IT provides the chat channel.
- **Priority 5:** turns a hold into a two-minute fix for planning instead of a ticket.

---

## Epic 2. The floor's data stays trustworthy as the scope grows

**Outcome:** efficiency figures per line that the plant can defend, and an integration whose own
uptime is measured against a target.
**Status:** next. Ordered by the rules at the top of this page.

### 2.1 Setup time per line

> As a production manager, I want setup measured against the line's own setup time, so the line with
> a longer setup is not flagged as inefficient every time it changes over.

| | |
|---|---|
| **Given** a line with its own setup time in the ERP | **When** the payload is built **Then** it uses the line's setup instead of the product's |
| **Given** a line with no setup time of its own | **When** the payload is built **Then** it keeps the product's setup, as today |
| **Given** the change ships | **When** the contract is read **Then** it describes the new field in the same change |

- **Depends on:** no vendor. A field in the ERP, owned by planning.
- **Priority 1:** one line sets up in 20 minutes and the others in 15. Until this ships, that line's
  efficiency is measured against the wrong number every changeover.

### 2.2 A target for the integration's own uptime

> As IT, I want the workflow uptime measured against an agreed target, with an alert when a run
> fails, so the integration is never the reason the floor works blind.

| | |
|---|---|
| **Given** a workflow run that fails | **When** it fails **Then** the team chat gets an alert with the workflow and the step |
| **Given** a month of runs | **When** it closes **Then** uptime is reported against the target agreed with IT |
| **Given** the report | **When** it is read **Then** workflow uptime and machine availability are shown separately |

- **Depends on:** no vendor. IT agrees the target.
- **Priority 2:** workflow uptime (90.2% in the first period) is the weakest measured number in the
  case. It measures the integration, not the machines, and it has to be read that way.

### 2.3 Operators per order

> As a production manager, I want the number of operators on each order in the MES, so productivity
> per person can be measured from source.

| | |
|---|---|
| **Given** an order with the number of operators set in the ERP | **When** the payload is built **Then** the field is sent under the name the MES expects |
| **Given** an order without that number | **When** the sync runs **Then** the order is held with the reason, as in story 1.2 |

- **Depends on:** **SKA confirming the field name.** Blocked until then.
- **Priority 3:** valuable, but it adds a new hold reason. It ships after the times are right on
  every line.

### 2.4 Raw-material photos uploaded by planning in the MES

> As a planner, I want to upload raw-material photos directly in the MES, so the photos stop
> depending on a manual hand-off.

| | |
|---|---|
| **Given** a planner with access to the MES | **When** a photo is uploaded for a product **Then** it is shown on the terminal with the ERP documents |
| **Given** the ERP documents | **When** the daily generation runs **Then** they are unaffected by the photos |

- **Depends on:** **SKA providing the upload feature.** Blocked until then.
- **Priority 4:** it closes the second scope of "everything" (decision
  [P7](DECISIONS.md#p7-write-the-scope-down-when-everything-can-mean-two-things)). It stays out of
  the integration on purpose: the photos are planning's content, not ERP data.
