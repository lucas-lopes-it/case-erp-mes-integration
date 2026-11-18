# Decisions

For each decision: what was chosen, the alternatives considered and the accepted cost.

**P** decisions are product decisions, made in the real project. **A** decisions are about how the
integration was built. For A decisions, the status shows what this repository rebuilds:
**rebuilt** has code and tests here; **described** is documented and not rebuilt.

# Product decisions

## P1. Own the contract, not either vendor's code

**Choice:** take ownership of the definition between the two systems (what crosses, in which state,
with which fields, who decides when it is wrong) and leave each vendor responsible for its own side.

**Alternatives**
- Escalate to both vendors and wait for them to agree. It had already been tried for almost six months.
- Ask one vendor to own the whole integration. It moves the problem without defining it, and makes
  the client dependent on that vendor for every future change.
- Build both sides internally. Fastest on paper, but it takes on code that two vendors already
  maintain.

**Why:** the integration was not blocked by a missing API. It was blocked by a missing definition.
Conway described the pattern in 1968: two vendors who only talk through the client produce two
systems that only talk through the client.

**Accepted cost:** the client now owns a document that must be kept current, and someone has to say
no when a vendor wants to change it unilaterally.

## P2. Integrate the lines that matter first, not the whole plant

**Choice:** start with the production lines that would use the MES and widen the scope one line at a
time. A new line enters only after its orders pass the readiness check.

**Alternatives:** integrate every line at once; or a single pilot line for weeks.

**Accepted cost:** for a while, some lines record production in the MES and others don't, and
reports have to say which is which.

## P3. Only orders the floor can act on cross the boundary

**Choice:** situations C, A and E go to the MES; D and F deactivate the order there; P, R, M and B
stay in the ERP. The rule was validated with production planning.

**Alternatives**
- Send every order and let the floor filter. It puts the planning noise on the operator's terminal.
- The first version, which also sent P. A few hundred orders reached the floor too early and stayed
  frozen there until they moved on.

**Why:** the operator's terminal should show only what can be produced now. Production planning
knew that rule; it had never been written down where both systems could follow it.

**Accepted cost:** orders sent under the first rule were left to resolve as they progressed, instead
of being cleaned by hand.

## P4. The part comes from the order; no made-up numbers on the floor

**Choice:** the part sent to the MES is always the order's product. The formula only supplies cycle,
setup and stop tolerance. If any of them is missing, the order is held with the reason, not sent
with a default.

**Alternatives:** default times per line; or sending the order without times and letting the floor
fill them in.

**Why:** a default time on the terminal looks like a real number and corrupts every efficiency
figure built on it. An order that waits is visible; a wrong number is not.

**Accepted cost:** an order can wait for a planner to fill in a time. The hold reason says which
field, so the wait is short.

## P5. Ask the go-live question from the orders, not the catalog

**Choice:** go-live readiness is "can every live order in the integrated lines be sent as is?",
checked from production orders. The same anchor is used for every later acceptance criterion.

**Alternatives:** the first check, anchored on formulas, which reported over a hundred products
without times. Most had never had an order.

**Why:** the catalog is not what the floor receives. Anchoring on it turned a short list into what
looked like weeks of cleanup.

**Accepted cost:** catalog gaps on products nobody produces stay open. They are reported separately,
as information, so nobody mistakes them for a blocker.

## P6. Go live in the environment that already behaved like production

**Choice:** the vendor's side was formally a test environment but had been working like production.
We went live there and changed the pointer later to make it official.

**Alternatives:** wait for a formal migration on the vendor side before going live.

**Why:** a migration under time pressure would have added risk. The environment that worked was the
safer one.

**Accepted cost:** for a short period, production ran on an environment whose name said "test", and
that had to be explained to everyone who looked.

## P7. Write the scope down when "everything" can mean two things

**Choice:** for the bill-of-materials documents, the integration delivers what comes from the ERP,
regenerated daily, with an acceptance criterion anchored on orders. The raw-material photos a
planner prepares by hand stay hers, and the vendor was asked whether the MES can take her uploads.

**Alternatives:** automate the photos too; or keep "everything" as an informal promise.

**Why:** the same word meant two scopes to two teams. Writing it down cost one message; leaving it
implicit would have cost the relationship when the photos didn't show up.

**Accepted cost:** one manual step stays manual, by decision.

# Build decisions

## A1. A state layer that remembers what was sent

**Status:** rebuilt (`src/sync/plan.ts`).

**Choice:** the integration keeps, for each order, a fingerprint of the last payload sent and
whether it is active in the MES. Each run compares and sends only what changed.

**Alternatives:** resend everything on every run; or ask the MES what it has before each run.

**Accepted cost:** one more store to keep consistent. If it is lost, the next run re-imports, which
the MES accepts as updates.

## A2. Update reactivates; import is only for new orders

**Status:** rebuilt.

**Choice:** a closed order that reopens is sent as an update, not as a new import. The vendor
confirmed that an update reactivates a deactivated order.

**Accepted cost:** depends on vendor behavior that is not in the API documentation. It is recorded
here and covered by a test so a change on their side shows up.

## A3. Orchestration in n8n, rules in one place

**Status:** described. The rules are rebuilt in TypeScript here; the original ran in n8n workflows.

**Choice:** scheduling, retries and calls between systems run in n8n; the contract rules live in one
place that every workflow reads.

**Accepted cost:** workflows are hard to review in a diff. The rules being separate is what keeps
them reviewable.

## A4. Run results go to the team's chat

**Status:** described.

**Choice:** each run posts a short summary (imported, updated, deactivated, held, with reasons) to
the team's chat channel.

**Why:** a failure that only lives in a log is a failure nobody sees. Planning reads chat.

**Accepted cost:** one more message a day in a busy channel.
