# Vision

## Mission

Make what the ERP knows and what the shop floor does the same thing. The floor sees only the orders
it can act on, with real numbers; the ERP learns what was produced as it happens; and one written
contract says what crosses between them.

## The problem

Integrations between business systems and the shop floor tend to fail in the same place: the space
between two vendors. Each one builds its side well. Nobody owns the definition in the middle, so the
project waits, and the factory keeps retyping.

The usual answers don't solve it:

- escalate to both vendors: it had already been tried for four months;
- give one vendor the whole integration: it moves the dependency without defining anything;
- add a middleware product: it connects systems that still disagree on what they mean.

## The vision

Every integration has a contract with an owner. The contract says which records cross, which fields
they carry, where each field comes from, what happens when a record changes, closes or reopens, and
who decides when the data is wrong. Both vendors build to it. The client owns it.

## What this repository is

The public reconstruction of that contract, with fictional data. The rules that run in production
are rebuilt as tested code, and the go-live check can be run by anyone in a minute.

It serves two readers:

- whoever is evaluating my product work and wants to see diagnosis, decision, accepted cost and
  outcome;
- whoever is stuck between two vendors and wants a small example of a contract that unblocked one.

## What this repository is not

- It is not the production integration. There is no real code, data or credential here.
- It is not a connector for Sankhya or Syneco.
- It is not a middleware product. It is a case with its rules exposed.

## Where it is going

The path is in [roadmap.md](../product/roadmap.md). The direction: every new line, field or system
that joins enters through the contract first.
