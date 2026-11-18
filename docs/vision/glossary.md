# Glossary

The terms as they appear in the documentation and the code. ERP table names are shown in
parentheses so the reconstruction can be read next to the real system.

## Systems and parties

**ERP.** Sankhya on Oracle. Holds production orders, formulas and the product catalog.

**MES.** Manufacturing Execution System. Syneco, by the vendor SKA. Shows orders on the operator's
terminal and records production and stops.

**Production planning.** The team that releases orders and keeps times and catalog right. Owns the
meaning of each order situation.

**Contract.** The written definition of what crosses between the ERP and the MES. See
[CONTRACT.md](../CONTRACT.md).

## ERP records

**Production order** (`AD_TPROPC`). What the floor must produce: product, line, quantity, situation.

**Situation.** The order's state in the ERP, as a letter. C, A and E are live on the floor; D and F
are closed; P, R, M and B are not the floor's business yet.

**Formula** (`AD_TPRFOR`). Supplies the times for a product: cycle, setup and stop tolerance.

**Stop tolerance** (`AD_TMPPARADA`). How long a stop can last before it counts as a stop. Filled by
hand per product.

**Product catalog** (`TGFPRO`). Product code, description and whether the product is active.

**Line** (`CODLOCAL`). The production line. Scope is decided by the order's line, not the formula's.

## Integration

**Payload.** What the MES receives for one order.

**Hold.** An order that breaks the contract and waits, with the field that failed.

**Fingerprint.** A stable summary of a payload, used to know whether anything changed since the last
run.

**Import, update, deactivate.** The MES actions, numbered 1, 2 and 3 by the vendor. An update also
reactivates a deactivated order.

**Readiness.** Whether every live order in the integrated lines can be sent as is. Findings are
blockers, risks or information.

**Frozen order.** An order sent under the first version of the situation rule that is now out of
scope; it stays as it is in the MES until it moves on.

**Bill of materials document.** The list of raw materials for a product, generated from the ERP as a
document the operator can open on the terminal.
