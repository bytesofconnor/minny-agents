# Minny Agents Marketing Site — Agent Context

## Project Overview

This is the production marketing site for Minny Agents, an independent engineering practice that builds AI agents for Twin Cities businesses. Built with Next.js 16 App Router, TypeScript, and Tailwind CSS 4. The GitHub repo is `bytesofconnor/minny-agents`.

## Technology Stack

The versioned lines name majors. Exact versions are in `package.json`.

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Fonts**: Inter Tight (sans), JetBrains Mono (monospace)
- **Linting**: ESLint 10 with Next.js config
- **Testing**: Playwright

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main landing page component
│   ├── seo.ts              # Titles, FAQ, JSON-LD, industry copy
│   ├── restaurants/        # Local-intent page
│   ├── home-services/      # Local-intent page
│   ├── clinics/            # Local-intent page
│   ├── globals.css         # Global styles and Tailwind config
│   ├── Fig.tsx             # Aurora visualization component
│   ├── Flow.tsx            # Agent workflow diagram component
│   └── favicon.ico         # Site favicon
├── public/                 # Static assets (llms.txt, llms-full.txt)
├── .cursor/
│   ├── rules/              # Agent-specific rules
│   ├── skills/             # Custom agent skills
│   └── README.md           # Cursor integration docs
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── vercel.json            # Vercel deployment config
```

## Development Commands

```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Production build
npm run lint            # Run ESLint
npm start               # Start production server
```

## Design System

### Colors
- **ink**: Background (dark)
- **paper**: Primary text (light)
- **mute**: Secondary text
- **dim**: Tertiary text
- **line**: Border color
- **teal**: Primary accent
- **green**: Success/Phase 1
- **violet**: Ongoing/Phase 3

### Typography
- **Sans**: Inter Tight (primary content)
- **Mono**: JetBrains Mono (labels, technical content)

### Component Patterns
- Grid-based layout (4-col mobile, 12-col desktop)
- Sticky header with navigation
- Section-based content organization
- Responsive tables and diagrams

## Content Sections

1. **Hero**: Positioning statement and key info
2. **Figure 01**: Aurora visualization (illustrative)
3. **Positioning**: Value proposition
4. **Approach**: Engagement timeline (3 phases)
5. **Capabilities**: Service offerings table
6. **Applications**: Example use cases with flows
7. **Contact**: CTA and contact information

## Key Features

- Mostly static pages (SSG); `/api/contact` and `/api/inbound` are Vercel functions
- Responsive design (mobile-first)
- Semantic HTML with accessibility
- Performance-optimized

## Deployment

Designed for Vercel deployment:
- Framework preset: Next.js
- Plan: Hobby (free tier compatible)
- Build command: `npm run build`
- Output: Next.js (static pages + two API routes)
- Production URL: `https://minnyagents.com`
- Environment (Vercel, not in git): `RESEND_API_KEY`, `CONVEX_URL`, and `RESEND_WEBHOOK_SECRET`. `RESEND_WEBHOOK_SECRET` is required in Vercel for `/api/inbound`.
- Convex functions to deploy from your machine: `convex/leads.ts` → public `leads:submitContact`, internal `leads:deleteLead`

### Domain setup

**In Vercel (project domains — not in git):**
- `minnyagents.com` attached as the apex primary domain
- `www.minnyagents.com` attached and verified on Vercel DNS

**In the repo:**
- `app/site.ts` — `SITE_URL` default `https://minnyagents.com` (metadataBase, canonical, OG/Twitter, JSON-LD, sitemap, robots)
- `vercel.json` — host-based 308s (`/` and `/:path*`; `has: host` so preview `*.vercel.app` URLs are not redirected):
  - `northern-bytes.vercel.app` → `https://minnyagents.com`
  - `www.minnyagents.com` → `https://minnyagents.com`
- `.github/workflows/prod-smoke.yml` and Playwright `BASE_URL` — production checks hit `https://minnyagents.com`
### Vercel builds

`vercel.json` `ignoreCommand` is `bash scripts/vercel-ignore-build.sh`. Exit 0 skips the build. Exit 1 runs it. Preview builds whose ref starts with `dependabot/` or `cursor/` are skipped. A commit with no changes versus `HEAD^` is skipped. If `HEAD^` does not exist, the build runs. Production builds of `main` still run when files changed. Bot branches get no Vercel previews. CI `checks` is the gate for those branches.

The GitHub repo is `bytesofconnor/minny-agents`. The Vercel project is still `northern-bytes`. Do not publish `northern-bytes.vercel.app` in visitor-facing copy.

### SEO / AEO (in the repo)

- Titles, descriptions, FAQ answers, and JSON-LD live in `app/seo.ts`
- `robots.ts` allows GPTBot, PerplexityBot, ClaudeBot, Google-Extended, and related crawlers
- `public/llms.txt` is the short map; `public/llms-full.txt` is the long form for answer engines
- Industry pages (`/restaurants`, `/home-services`, `/clinics`) reuse the same chrome; no invented clients, metrics, phones, or emails
- Published email is `connor@minnyagents.com`

## Content Guidelines

**Do not modify**:
- Copy/messaging
- Color scheme
- Typography scale
- Layout grid
- Component structure
- Contact information except the published address `connor@minnyagents.com`

## Agent Instructions

When working on this codebase:

Work under /poteto-mode for all non-trivial tasks. pstack model choices live in .cursor/rules/pstack-models.mdc (Cursor models first; non-Cursor models are opt-in only).

Do not merge pull requests yourself. Open the PR and let `.github/workflows/automerge.yml` squash-merge it once required checks pass. Only a fork or an outside contributor waits for Connor.

1. **Preserve design**: Do not alter visual design, copy, or branding
2. **Maintain structure**: Keep component organization intact
3. **Type safety**: All changes must pass TypeScript checks
4. **Build verification**: Run build and lint before committing
5. **Static output**: Ensure no dynamic features break SSG
6. **Performance**: Maintain lighthouse scores and bundle size

## Principle Skills

Use these skills to maintain code quality and shipping standards:

### When to Use Each Skill

- **principle-prove-it-works** (`.cursor/skills/principle-prove-it-works/SKILL.md`): Apply after completing any task, before declaring done. Verify against the real artifact — run the feature, read the actual value, inspect the diff. Never infer from proxies or "it compiles."

- **blast-radius** (`.cursor/skills/blast-radius/SKILL.md`): Use before opening a PR to find what a change could break beyond the diff. Prove the one fact it's safe because of by running real code. Required for refactors and API changes.

- **principle-fix-root-causes** (`.cursor/skills/principle-fix-root-causes/SKILL.md`): Apply when debugging. Trace each symptom back to the first place the system went wrong and fix it there. Don't add guards for states that should never exist.

- **principle-experience-first** (`.cursor/skills/principle-experience-first/SKILL.md`): Use when product, UX, or feature-scope tradeoffs come up. Choose user delight over implementation convenience. Ship fewer polished features over more rough ones.

- **principle-minimize-reader-load** (`.cursor/skills/principle-minimize-reader-load/SKILL.md`): Apply when reviewing or shaping code that's hard to trace. Count layers between question and answer. Collapse one-caller wrappers and shrink mutable scope.

- **principle-laziness-protocol** (`.cursor/skills/principle-laziness-protocol/SKILL.md`): Use when refactoring or evaluating diff size. Bias toward deletion and the smallest change that solves the problem. Minimize the diff.

## Pull Request Requirements

Every PR must:

1. **Pass CI**: All checks (lint, typecheck, build, content guard, E2E smoke tests) must pass before merge
2. **Include verification** (prove-it-works): Show evidence the change works — CI logs, test output, screenshots, or script results
3. **Include blast-radius note**: For non-trivial changes, document what could break and why it won't (or what testing proves it's safe)

### Merge Policy

Open the PR. Do not squash-merge it yourself. `.github/workflows/automerge.yml` runs on `pull_request` (never `pull_request_target`) and calls `gh pr merge --auto --squash` once the required checks are green.

Every same-repo pull request squash auto-merges, including:

- Cloud-agent branches named `cursor/*`
- Every Dependabot update, including major bumps and GitHub Actions
- Pull requests that change `.github/**`, `.cursor/rules/**`, or `AGENTS.md`

Connor reviews only a fork, or an outside contributor (author association other than `OWNER`, `MEMBER`, or `COLLABORATOR`, and not `dependabot[bot]`). Paths and Dependabot update types are not a reason to wait. Drafts stay drafts until marked ready.

`allow_auto_merge` is on. The workflow's only merge command is `gh pr merge --auto --squash`. GitHub waits on the required status check. That check is the CI job named `checks`. Do not rename `checks` without telling Connor first. The job `needs` Lint and Type Check, Build, Content Guard, and E2E Smoke Tests. It uses `if: always()`. Those four must be `success`. There is no schedule, no `workflow_run` merge, and no direct squash fallback. PR bodies need Summary, Verification, Blast Radius headings (checked in CI; Dependabot exempt). Dependabot opens one weekly npm pull request for every update, including majors, so `react` and `react-dom` move together, and one weekly pull request for GitHub Actions. `@types/node` updates at version 21 or newer are ignored because CI runs Node 20. Major updates of `typescript` are ignored: the npm group pull request failed `checks` on TypeScript 7 (`typescript-eslint` does not support TS 7.0).

#### Post-merge

Production smoke listens for `pull_request` `closed` when merged, and for a successful CI `workflow_run` whose PR is already merged. It does not listen for `push`. A merge made with `GITHUB_TOKEN` does not start `push` workflows. Vercel deploys through its GitHub App webhook, which is separate from Actions, so production deploys still run.

#### Monitoring

- **CI runs**: All PRs trigger CI checks before merge
- **Production health**: Post-merge smoke tests validate production deployment
- **Visual regression**: Full-page screenshots (desktop + mobile) uploaded as artifacts
- **Failure alerts**: GitHub issues auto-created for production failures

## Contact

- Email: connor@minnyagents.com
- Founder: Connor Barrett
- Location: Minneapolis, MN
