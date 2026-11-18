# Principles

These principles guide decisions about the contract. When in doubt between two solutions, they
break the tie. Each one points to the decision in [DECISIONS.md](../DECISIONS.md) that gave rise to it.

## 1. Own the definition, not the code

The client owns what crosses the boundary. Each vendor owns its side. Origin: P1.

## 2. Scope grows one line at a time

A line enters after its live orders pass the readiness check. Origin: P2.

## 3. The floor sees only what it can act on

What reaches the terminal is decided by the people who plan the floor, and written down. Origin: P3.

## 4. No made-up numbers

A missing value holds the record, with the field that failed. It never travels with a default.
Origin: P4.

## 5. Anchor every check on what the user receives

Go-live and acceptance criteria are asked from the records that cross, not from the catalog behind
them. Origin: P5.

## 6. The environment that works is the safer one

Under time pressure, prefer the environment already behaving like production over a rushed
migration, and make it official afterwards. Origin: P6.

## 7. Write the scope when a word can mean two things

"Everything", "all" and "done" get a written scope before work starts. Origin: P7.

## 8. Send only what changed

The integration remembers what it sent. A repeated run sends nothing new. Origin: A1.

## 9. Vendor behavior we depend on gets a test

If the contract relies on something a vendor confirmed but didn't document, it is recorded and
tested. Origin: A2.

## 10. A failure nobody sees is two failures

Each run says what it did and what it held, where the team already reads. Origin: A4.
