# Contributing

## Pull requests

Open PRs as **non-draft** against `main`. Every PR body must include non-empty `## Verification` and `## Blast Radius` sections (enforced by PR Hygiene).

## Auto-merge

`.github/workflows/automerge.yml` enables squash auto-merge (`gh pr merge --auto --squash`) for every same-repo pull request once required checks pass. That includes `cursor/*` branches, every Dependabot update (major bumps and GitHub Actions included), and pull requests that change `.github/**`, `.cursor/rules/**`, or `AGENTS.md`.

A fork or an outside contributor waits for Connor. Agents open the PR and do not merge it themselves.

The workflow is `pull_request` only. It does not use `pull_request_target`, a schedule, or a direct squash fallback.

`allow_auto_merge` is already on. `--auto` waits for CI when `main` has required status checks. This token cannot write branch protection. Until an admin adds them, the workflow waits for these checks to succeed, then enables `--auto`:

- `Lint and Type Check`
- `Build`
- `Content Guard`
- `E2E Smoke Tests`
- `Check PR Body`

Vercel deploys `main` through its GitHub App. That path does not depend on an Actions `push` workflow. Production smoke runs on `pull_request` `closed` when merged, and on a CI `workflow_run` whose PR is already merged.
