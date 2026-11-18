# Sprint 001: review

> The integration wasn't late. It was undefined.

## Goal

Unblock an integration that had been stuck between the ERP and MES vendors for almost six months,
and put production orders on the floor without retyping.

## What shipped

- **The contract.** Which orders cross, which fields they carry, where each field comes from, what
  happens when an order changes, closes or reopens, and who decides when the data is wrong.
- **The go-live check, anchored on orders.** Instead of asking whether the catalog was complete, the
  check asked whether every live order in the integrated lines could be sent as is.
- **Go-live.** On the vendor environment that already behaved like production, made official later.
- **Sync that remembers.** Each run sends only what changed; a repeated run sends nothing new.
- **Run summary in chat.** Imported, updated, deactivated and held, with reasons.

## Numbers

- 21 days from taking over the definition to production, after almost six months blocked.
- Production data from monthly to every 5 minutes.
- 815 orders synchronized in the first phase, at 99.97% synchronization between ERP and MES.

## Left for later

- The situation rule still included P (reviewed in sprint 002).
- Bill of materials documents for the terminal.
