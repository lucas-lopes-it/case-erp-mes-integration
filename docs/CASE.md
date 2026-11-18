# The contract nobody owned

The product story in first person. The decisions are detailed in [DECISIONS.md](DECISIONS.md), the
contract in [CONTRACT.md](CONTRACT.md), and the code that rebuilds its rules is in this repository.

## Almost six months of two systems that didn't talk

Ventisol makes fans and air conditioners in Santa Catarina, Brazil. The ERP (Sankhya, on Oracle)
holds the production orders. The shop floor runs on a MES (Syneco, from the vendor SKA), where
operators see what to produce, record what they produced and report stops.

When I arrived, the integration between the two had been stuck for almost six months. Each vendor
had its side ready and each one pointed at the other. Meanwhile production was recorded by hand,
the ERP learned what the factory had made only at the end of the day, and the production records
that existed were dead data: written down, never used to manage anything.

## What Melvin Conway had already written in 1968

Conway observed that organizations design systems that mirror their own communication structures.
The integration was a clean example. Two vendors who only talked through the client had produced
two systems that only talked through the client. Nobody owned the space in between.

That changed the question. The problem wasn't the API on either side. It was that no one had
written down what should cross the boundary, in which state, with which fields, and who decides
when the data is wrong. An integration without that definition is not late. It is undefined.

## The decision: own the contract, not the code

I didn't take over either vendor's work. I took over the definition. I wrote the contract between
the ERP and the shop floor: which production orders the floor needs to see, which fields each one
carries, where each field comes from, and what happens when an order changes, closes or reopens.

Three rules came out of conversations with production planning, not from the systems:

- **Only orders the floor can act on cross the boundary.** Orders in the three situations the
  floor works on (C, A, E) go to the MES. Closed orders (D, F) are deactivated there. Everything
  else (P, R, M, B) stays in the ERP. The rule only settled once production planning owned it: an
  early version also sent P, and a few hundred orders reached the floor ahead of time. Since then
  the rule lives in the contract, with a test, and planning signs off on any change.
- **The part comes from the order, the times come from the formula.** The order says what to make.
  The formula only says how long it takes. Because the order's product code is unique, the same
  order can never show up on the floor as two different parts.
- **No made-up numbers on the floor.** If a product has no cycle, setup or stop time, the order
  waits for its data. A default time on the operator's terminal is worse than an order that waits.

## Asking the right go-live question

Before go-live, the first check said over a hundred products had no times. It looked like weeks of
catalog cleanup. Most of those products had never had a production order. The check was anchored
on the catalog, and the catalog was not what the floor would receive.

I changed the question to the one that mattered: can every order the floor will receive, in the
lines we are integrating, be sent as it is? The answer was a short list, not a project. The same
check surfaced two things nobody had asked about: distinct products with the same description,
which an operator cannot tell apart on the terminal, and inactive products that only appeared on
closed orders, which were history and not a problem.

## Going live in the environment that already worked

The vendor's side was formally in a test environment, but that environment had been behaving like
production for weeks. Waiting for a formal migration would have added risk, not removed it. We went
live there and changed the pointer later to make it official. The integration was in production
**21 days** after I took on the definition.

## What changed

- Production data went from **monthly to every 5 minutes**. Management stopped waiting for the end
  of the month to know what the floor had made.
- About **77 orders a day** reach the floor with no manual touch, across 10 lines. The first phase
  alone synchronized 815 orders, at **99.97%** synchronization between the ERP and the MES.
- The plant could measure its own efficiency for the first time from source data. With planning, we
  closed the first OEE: 1,932.5 productive hours against 15.9 hours of unplanned stops, 736,727
  units, 14,428 stops tracked by reason.
- Stock started to reflect what the floor produced, as it was produced.

## Where "everything" meant two different things

After go-live, production planning asked for each product's bill of materials as a document the
floor could open on the terminal. The commitment was to cover "everything". For the integration,
that meant the documents that come from the ERP. For IT and planning, it also included the photos
of raw materials that a planner prepares by hand. Same word, two scopes.

I wrote the scope down: the ERP documents are regenerated every day from the ERP itself (459
documents, with an index that lists the 16 products that have no raw materials registered, so
planning can close that gap); the photos stay with the planner, and I asked the vendor whether the
MES could take her uploads directly. I also wrote the acceptance criterion, the same way as the
go-live check: every product that has ever had an order in the integrated lines, not every formula
in the catalog.

## The line I would take to any meeting

Integrations don't stall on APIs. They stall on definitions nobody owns.

Most integration projects measure whether the systems are connected. I started measuring whether
the people on both sides agree on what crosses the boundary, and treating that agreement as the
product.

## What was not my merit

The state rule that keeps the floor clean wasn't my idea. Production planning knew exactly which
orders mattered to the floor and which didn't. My contribution was to turn their rule into the
contract, in a place where both vendors had to follow it.
