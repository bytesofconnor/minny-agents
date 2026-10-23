# Contributing

## Pull requests

Open PRs as **non-draft** against `main`. Every PR body must include non-empty `## Verification` and `## Blast Radius` sections (enforced by PR Hygiene).

## Auto-merge

`.github/workflows/automerge.yml` enables squash auto-merge (`gh pr merge --auto --squash`) only for:

- a same-repo `cursor/*` branch
- a Dependabot patch or minor update

It skips major bumps, forks, outside contributors, and any PR that changes `.github/**`, `.cursor/rules/**`, or `AGENTS.md`. Those wait for Connor. Agents open the PR and do not merge it themselves.

The workflow is `pull_request` only. It does not use `pull_request_target`, a schedule, or a direct squash fallback.

`allow_auto_merge` is already on. `--auto` waits for CI only when `main` has required status checks. Until an admin adds these checks, the workflow refuses to enable auto-merge (GitHub would merge immediately):

- `Lint and Type Check`
- `Build`
- `Content Guard`
- `E2E Smoke Tests`
- `Check PR Body`

This token cannot write branch protection (403).

Vercel deploys `main` through its GitHub App. That path does not depend on an Actions `push` workflow. Production smoke runs on `pull_request` `closed` when merged, and on a CI `workflow_run` whose PR is already merged.
