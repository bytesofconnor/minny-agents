---
name: blast-radius
description: Find what a change could break somewhere else before it ships, beyond the diff, and prove the one fact it's safe because of by running real code.
---

Listing callers is not the job; find the breakage grep won't show. Don't trust your own writeup: find the one or two facts the change's safety depends on and prove them. Confidence ladder: 1 you said so (worthless), 2 pointed at file:line, 3 walked the failure and showed it can't happen, 4 ran a script/test calling real code, 5 reproduced in the running app. Steps: read the change incl. what it now does differently; find the one fact it's safe because of; look where grep stops (library source, pinned versions, run timing, JSON shapes, flags, downstream code); be honest about each risk with likelihood and cost, list cleared risks separately, never invent callers or APIs; prove the one fact with a script. Hand back: what it does; the safety fact and its proof or 'unproven'; risks with file:line, likelihood, cost, check; cleared; cheapest pre-merge test.
