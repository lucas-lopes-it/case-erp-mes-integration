# Sprint 001: retrospective

> The fastest way out of a vendor standoff is a document both sides have to answer to.

## What worked

### Writing the contract before touching either system

Both vendors received the same document. Disagreements became comments on a line of the contract
instead of messages about the other vendor.

### Changing the go-live question

The catalog-anchored check reported over a hundred products without times. The order-anchored check
reported a short list. The second one is what the floor would actually receive.

### Going live where it already worked

The formal migration would have been the riskiest step of the sprint. Skipping it was the decision
that saved the most time.

## What could improve

### The first situation rule included P

The first version also sent orders in situation P. A few hundred of them reached the floor too
early. The rule was right only after production planning reviewed it.

### Availability had no target

Synchronization had a clear number from day one. Availability came in at 90.2% in the first
measured period, and there was no target to compare it with.

## What changed

- Rules about what the floor sees are validated with production planning before they ship.
- Availability has a target in the roadmap.
