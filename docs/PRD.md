# PRD: Production orders on the shop floor, straight from the ERP

> PRD rebuilt for the portfolio from the integration that runs in production at Ventisol. The
> outcome numbers are in the [README](../README.md#outcome); the decisions, with alternatives and
> accepted cost, in [DECISIONS.md](DECISIONS.md); the contract in [CONTRACT.md](CONTRACT.md).

## Context

Ventisol manufactures fans and air conditioners. Production orders live in the ERP (Sankhya on
Oracle). The shop floor runs on a MES (Syneco, by SKA). The integration between them had been stuck
between the two vendors for almost six months.

## Problem

The company had invested in a MES so production planning could run the floor from it, and for
almost six months the MES received no orders. The floor didn't receive orders from the ERP, so production was recorded by hand and the ERP learned
what had been produced late. The production records that existed were never used to manage the
floor. Neither vendor owned the definition of what should cross from one system to the other.

## Users

| User | Job | Pain |
|---|---|---|
| Production planning | Release orders and keep times and catalog right | Retypes what the ERP already knows; can't see the floor in real time |
| Operator and supervisor | Produce what is due and record stops | Works from paper or retyped orders; can't trust what the terminal shows |
| Plant management | Know what was produced and why it stopped | Gets last month's numbers, built by hand |
| IT | Keep both systems running | Caught between two vendors with no shared definition |

## Goals

1. Make the MES investment work for production planning, line by line.
2. Live production orders reach the floor without retyping.
3. What the floor sees matches the ERP, and the mismatch is measured.
4. Manual production recording ends in the integrated lines.

## Out of scope

- Data from the MES back to the ERP beyond what the vendor already provides.
- Lines that don't use the MES yet.
- Raw-material photos prepared by hand (decision P7).

## Riskiest hypothesis

The integration is blocked by a missing definition, not by a technical limit on either side. If that
is wrong, owning the contract changes nothing and the project needs a different vendor. It was
tested first, by writing the contract and asking both vendors to build to it.

## Requirements

### Contract
- R1. Send only orders in the situations the floor works on (C, A, E); deactivate closed ones (D, F).
- R2. Take the part from the order and the times from the formula.
- R3. Hold an order with a missing time, with the field that failed; never send a default.
- R4. Send only what changed since the last run; a repeated run sends nothing new.
- R5. Bring back a reopened order with an update.

### Go-live and scope
- R6. Check readiness from the live orders in the lines being integrated.
- R7. Add lines one at a time, each after its own readiness check.
- R8. Report findings as blocker, risk or information.

### Visibility
- R9. Post each run's summary, with held orders and reasons, to the team's chat.
- R10. Regenerate the bill-of-materials documents daily from the ERP, for every product that has had
  an order in the integrated lines, with an index of products that have no raw materials registered.

## Success metrics

| Metric | Type |
|---|---|
| Lines running on the MES (none before) | Business outcome |
| Production data latency (monthly before) | North star |
| Synchronization between ERP and MES | Quality |
| Orders reaching the floor with no manual touch | Adoption |
| Stops tracked by reason | Outcome |
| Time from definition to production | Delivery |
| Held orders and time to release them | Data quality |
| Workflow uptime | Health |

## Risks

| Risk | Mitigation |
|---|---|
| A vendor changes its side without telling the other | The contract is the reference; changes go through it |
| Wrong times on the terminal | No defaults; missing time holds the order |
| Orders reach the floor too early | Situation rule validated with planning and tested |
| Operators confuse two parts with the same description | Readiness flags it as a risk for planning to rename |
| A failure nobody sees | Run summary in the team's chat |

## Open questions

- Setup time per line, since one line needs a longer setup.
- Number of operators per order, once the vendor confirms the field.
