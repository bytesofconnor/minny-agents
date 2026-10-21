---
name: principle-fix-root-causes
description: Apply when debugging. Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate.
---

Reproduce first. Ask why until the answer is a wrong decision in the code. When stuck, instrument; read actual errors and state. If the triggering state is legitimate, handle it where it broke; if it should never exist, find what produced it — guards, retries, swallowed errors, clamped values hide bugs. After-restart failures: suspect persisted state. Fix the pattern, not just the instance. A workaround needing a paragraph comment means the code is wrong. Propose the cheap always-on signal that would have shown the deciding fact.
