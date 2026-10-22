# Contributing

## Pull requests

Open PRs as **non-draft** against `main`. Every PR body must include non-empty `## Verification` and `## Blast Radius` sections (enforced by PR Hygiene).

## Auto-merge

Eligible PRs squash-merge to `main` without a human click.

A PR is eligible when all of the following are true:

- It is **not a draft**
- It does **not** have the `hold` label
- These check runs have `status=completed` and `conclusion=success` on the **current head SHA**:
  - `Lint and Type Check`
  - `Build`
  - `Content Guard`
  - `E2E Smoke Tests`
  - `Check PR Body`

`mergeStateStatus=CLEAN` is **not** enough. On an unprotected `main`, GitHub reports CLEAN as soon as the PR opens.

Add `hold` to keep a PR open after CI is green:

```bash
gh pr edit <number> --add-label hold
gh pr edit <number> --remove-label hold
```

### How it is wired

1. **Enable auto-merge** (`.github/workflows/automerge.yml`) runs on `pull_request` `opened` / `reopened` / `ready_for_review` / `synchronize` / `labeled` / `unlabeled`. If `main` has required status checks configured, it turns on GitHub squash auto-merge (`gh pr merge --squash --auto`). If `main` is unprotected, it does **not** enable auto-merge — that would merge immediately. Native `--auto` also needs repo `allow_auto_merge`. This integration cannot flip either admin setting.

2. **Safety net** runs on a 10-minute schedule, after the `CI` workflow succeeds, and on `workflow_dispatch`. It lists open non-draft, non-hold PRs and squash-enables auto-merge (direct squash as fallback) only after `scripts/required-checks.js` confirms the five required check-run conclusions on the head SHA.

3. **CI job `Queue squash merge`** runs after Lint, Build, Content Guard, and E2E. It still requires Check PR Body via the same head-SHA check-run gate, then prefers native auto-merge.

Use `AUTOMERGE_TOKEN` (a PAT with `repo` / PR write) if `GITHUB_TOKEN` is blocked by branch protection; otherwise the workflow uses `GITHUB_TOKEN`. Merges performed with `GITHUB_TOKEN` do **not** trigger new workflows on `main` (GitHub suppresses `push` events from that token), so post-merge CI and production smoke may not run unless a PAT is set.

### Required checks

These job names should also be listed as required status checks on `main` (Settings → Branches). Until they are, native auto-merge cannot wait for CI:

- `Lint and Type Check`
- `Build`
- `Content Guard`
- `E2E Smoke Tests`
- `Check PR Body` (PR Hygiene)

If a required-check name in branch protection does not match one of these job names, GitHub native auto-merge will never become satisfied. This token cannot write branch protection (403); an admin must set the rule.

Vercel commit statuses (`Vercel`) are separate from the CI workflow. They only block merge if they are listed as required.
