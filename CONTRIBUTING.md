# Contributing

## Pull requests

Open PRs as **non-draft** against `main`. Every PR body must include non-empty `## Verification` and `## Blast Radius` sections (enforced by PR Hygiene).

## Auto-merge

Eligible PRs squash-merge to `main` without a human click.

A PR is eligible when all of the following are true:

- It is **not a draft**
- It does **not** have the `hold` label
- GitHub reports `mergeStateStatus=CLEAN` (required checks passed, no conflicts)

Add `hold` to keep a PR open after CI is green:

```bash
gh pr edit <number> --add-label hold
gh pr edit <number> --remove-label hold
```

### How it is wired

1. **Enable auto-merge** (`.github/workflows/automerge.yml`) runs on `pull_request` `opened` / `reopened` / `ready_for_review` / `synchronize` / `labeled` / `unlabeled`. It turns on GitHub squash auto-merge (`gh pr merge --squash --auto`). That path needs the repo setting `allow_auto_merge`. This integration cannot flip that setting (403); an admin must enable it in repo Settings → General → Pull Requests → Allow auto-merge.

2. **Safety net** runs on a 10-minute schedule, after the `CI` workflow succeeds, and on `workflow_dispatch`. It squash-merges every open, non-draft, non-hold PR whose merge state is `CLEAN`. This does **not** depend on `allow_auto_merge`.

3. **CI job `Queue squash merge`** runs after Lint, Build, Content Guard, and E2E pass on a non-draft PR. If the PR is `CLEAN` and not on `hold`, it squash-merges immediately. This runs from the PR branch, so it works even before `automerge.yml` on `main` is updated.

Use `AUTOMERGE_TOKEN` (a PAT with `repo` / PR write) if `GITHUB_TOKEN` is blocked by branch protection; otherwise the workflow uses `GITHUB_TOKEN`.

### Required checks

CI job names that should match branch-protection required checks:

- `Lint and Type Check`
- `Build`
- `Content Guard`
- `E2E Smoke Tests`
- `Check PR Body` (PR Hygiene)

If a required-check name in branch protection does not match one of these job names, GitHub will never report `CLEAN` and auto-merge will not fire. This token cannot read branch protection (403); confirm the names in Settings → Branches.

Vercel commit statuses (`Vercel`) are separate from the CI workflow. They only block merge if they are listed as required.
