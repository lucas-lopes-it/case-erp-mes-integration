# Sprint 003: review

> Same word, two teams, two scopes.

## Goal

Close the loop between the documents generated from the ERP and what the operator sees on the
terminal, and settle what "everything" meant.

## What shipped

- **Written scope.** The integration covers the documents that come from the ERP. The raw-material
  photos stay with the planner who prepares them.
- **A question to the vendor.** Whether the MES can take the planner's uploads directly, so the photos
  don't need a manual copy at all.
- **No manual step for the ERP documents.** They now reach the MES server on their own every day, in a
  separate run from the one that generates them, instead of waiting for a manual copy.

## Left for later

- The vendor's answer on uploads by planning.
