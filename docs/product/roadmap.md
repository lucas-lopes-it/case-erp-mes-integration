# Roadmap

The roadmap is organized by capability, not by date. Each capability is something the product
learned to do. The first three sprints happened in production; the fourth is this public
reconstruction.

The direction comes from the [vision](../vision/vision.md): every new line, field or system enters
through the contract first.

## Capabilities

| Capability | Status | Sprint |
|---|---|---|
| Written contract between ERP and MES, owned by the client | Shipped | 001 |
| Go-live readiness anchored on live orders | Shipped | 001 |
| Orders on the floor without retyping, first lines | Shipped | 001 |
| Sync that sends only what changed | Shipped | 001 |
| Run summary in the team's chat | Shipped | 001 |
| Situation rule reviewed with production planning | Shipped | 002 |
| One more line added through the readiness check | Shipped | 002 |
| Bill of materials documents regenerated daily from the ERP | Shipped | 002 |
| Acceptance criterion for documents anchored on orders | Shipped | 002 |
| Written scope for "everything" (ERP documents vs. manual photos) | Shipped | 003 |
| Documents delivered to the MES server without a manual step | Shipped | 003 |
| Public reconstruction: contract, rules as tested code, go-live check | Shipped | 004 |
| Setup time per line | Next | |
| Number of operators per order | Next | |
| Raw-material photos uploaded by planning directly in the MES | Waiting on vendor | |
| Workflow uptime above the first measured period (90.2%) | Next | |

## Next

The stories behind each item, with acceptance criteria and vendor dependencies, are in the
[backlog](../BACKLOG.md).

### Setup time per line

**Problem:** one line needs a longer setup than the others, and setup lives per product today.

**Deliverable:** setup time per line in the ERP, read by the payload, with the contract updated in
the same change.

### Operators per order

**Problem:** the MES can use the number of operators per order, and the field name is not confirmed.

**Deliverable:** the field in the contract once the vendor confirms it, with a hold rule if missing.

## Off the roadmap, on purpose

- The whole plant at once.
- Default times when a value is missing.
- Taking over either vendor's code.
