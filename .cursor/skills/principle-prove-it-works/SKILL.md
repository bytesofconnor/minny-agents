---
name: principle-prove-it-works
description: Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'
---

Verify every task output by checking the real thing directly. Do not infer from proxies, self-reports, or 'it compiles.' Why: Unverified work has unknown correctness. Indirect verification feels cheaper than direct observation; acting on a wrong inference costs far more than checking the source. Check the real thing, not a proxy: check process liveness directly; read the actual value, not a cached or derived representation; when verification fails, suspect the observation method before the system. Script the check when you can: the strongest proof is a deterministic script that re-runs the same comparison. Write it, run it, keep its output as an artifact a reviewer can re-run.
