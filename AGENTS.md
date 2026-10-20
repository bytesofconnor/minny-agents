# Northern Bytes Marketing Site — Agent Context

## Project Overview

This is the production marketing site for Northern Bytes, a forward-deployed engineering consultancy specializing in AI agents and automation. Built with Next.js 15 App Router, TypeScript, and Tailwind CSS 4.

## Technology Stack

- **Framework**: Next.js 15.5.28 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Fonts**: Inter Tight (sans), JetBrains Mono (monospace)
- **Linting**: ESLint 9 with Next.js config
- **Testing**: Playwright

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main landing page component
│   ├── globals.css         # Global styles and Tailwind config
│   ├── Fig.tsx             # Aurora visualization component
│   ├── Flow.tsx            # Agent workflow diagram component
│   └── favicon.ico         # Site favicon
├── public/                 # Static assets
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

- Fully static export (SSG)
- Responsive design (mobile-first)
- Semantic HTML with accessibility
- Performance-optimized
- Zero runtime dependencies beyond React

## Deployment

Designed for Vercel deployment:
- Framework preset: Next.js
- Plan: Hobby (free tier compatible)
- Build command: `npm run build`
- Output: Static export
- No environment variables required

## Content Guidelines

**Do not modify**:
- Copy/messaging
- Color scheme
- Typography scale
- Layout grid
- Component structure
- Contact information (hello@northernbytes.co)

## Agent Instructions

When working on this codebase:

1. **Preserve design**: Do not alter visual design, copy, or branding
2. **Maintain structure**: Keep component organization intact
3. **Type safety**: All changes must pass TypeScript checks
4. **Build verification**: Run build and lint before committing
5. **Static output**: Ensure no dynamic features break SSG
6. **Performance**: Maintain lighthouse scores and bundle size

## Contact

- Email: hello@northernbytes.co
- Founder: Connor Barrett
- Location: Minneapolis, MN
