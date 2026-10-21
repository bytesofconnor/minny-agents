---
name: principle-minimize-reader-load
description: Apply when reviewing or shaping code that's hard to trace. Count layers between question and answer, and hidden state in the reader's head; collapse one-caller wrappers and shrink mutable scope.
---

Track layers to trace and state to hold. Collapse one-caller wrappers and pass-through layers; demand interfaces that hide meaningful decisions; shrink state scope (pure functions, locals over fields over module state over globals; derive instead of sync); name invariants at the boundary. Test: can a new reader answer 'where does X come from?' and 'what can change X?' in under 30 seconds?
