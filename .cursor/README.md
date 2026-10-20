# Cursor Integration — Northern Bytes Marketing Site

This directory contains Cursor-specific configuration for AI-assisted development of the Northern Bytes marketing site.

## Overview

Cursor is configured with custom rules and skills to ensure:
- Design and copy integrity
- Build quality standards
- Deployment readiness
- Development workflow consistency

## Directory Structure

```
.cursor/
├── README.md                    # This file
├── rules/
│   └── northernbytes.mdc       # Project-specific development rules
└── skills/
    └── build-verify.mdc        # Build verification workflow
```

## Files

### `rules/northernbytes.mdc`

Agent-specific rules that constrain AI behavior to preserve:
- Production copy and messaging
- Visual design and branding
- Component structure
- Performance characteristics

**When to reference**: Any time an agent works on this codebase.

### `skills/build-verify.mdc`

Standardized build verification workflow that ensures:
- Dependencies are installed
- Types are valid
- Lint passes
- Build succeeds
- Bundle size is acceptable

**When to use**: Before committing, after dependency updates, when troubleshooting builds.

## Agent Guidelines

### For Cursor Agents

When working on this project:

1. **Read `AGENTS.md` first** for project context
2. **Follow `rules/northernbytes.mdc`** for development constraints
3. **Use `skills/build-verify.mdc`** to validate changes
4. **Never modify** copy, design, or branding without explicit approval

### For Human Developers

When working with Cursor on this project:

1. **Be specific**: "Fix the responsive layout on mobile" vs "make it better"
2. **Reference rules**: "Following northernbytes.mdc, improve accessibility"
3. **Use skills**: "Run build-verify skill before committing"
4. **Provide context**: Paste error messages, describe unexpected behavior

## Common Commands

```bash
# Let Cursor install dependencies
"Install dependencies"

# Let Cursor verify build
"Run the build-verify skill"

# Let Cursor fix a specific issue
"Fix TypeScript error in app/page.tsx without changing layout"

# Let Cursor analyze
"Review the bundle size after build"
```

## Cursor Features in Use

### Context Files
- `AGENTS.md`: Project overview and structure
- `.cursor/rules/northernbytes.mdc`: Development constraints
- `.cursor/skills/build-verify.mdc`: Verification workflow

### Custom Skills
- `build-verify`: Full build verification pipeline

### Rules
- Production copy locked
- Design system preserved
- Build quality gates enforced

## Integration with Version Control

### Pre-Commit Flow

1. Agent makes changes
2. Agent runs build-verify skill
3. If checks pass → commit
4. If checks fail → fix and retry

### Pull Request Flow

1. Agent creates feature branch
2. Agent implements changes
3. Agent runs build-verify
4. Agent creates PR with verification results
5. Human reviews and approves

## Configuration Options

### Adjusting Agent Behavior

To modify how agents work on this project:

1. **Edit `rules/northernbytes.mdc`** to change constraints
2. **Add skills** to `.cursor/skills/` for new workflows
3. **Update `AGENTS.md`** with new project context

### Adding New Skills

Create a new `.mdc` file in `skills/`:

```markdown
# My Custom Skill

## When to Use
...

## Steps
1. ...
2. ...

## Expected Output
...
```

Reference it in conversations: "Use the my-custom-skill"

## Troubleshooting

### Agent Ignoring Rules

**Symptom**: Agent makes changes that violate northernbytes.mdc

**Fix**:
1. Explicitly reference the rules: "Following .cursor/rules/northernbytes.mdc..."
2. Be more specific in your request
3. Review and revert unwanted changes

### Build-Verify Skill Failing

**Symptom**: build-verify reports failures

**Fix**:
1. Read the error messages carefully
2. Run commands manually to debug: `npm run lint`, `npm run build`
3. Check Node version: `node -v` (needs 18+)
4. Clear caches: `rm -rf .next node_modules && npm install`

### Agent Makes Unwanted Changes

**Symptom**: Design or copy is altered

**Fix**:
1. Use git to revert: `git checkout -- <file>`
2. Remind agent: "Do not change copy or design per northernbytes.mdc"
3. Be explicit: "Only fix the bug without changing layout"

## Best Practices

### For Development

1. **Always run build-verify** before committing
2. **Test responsive behavior** after layout changes
3. **Check bundle size** after dependency updates
4. **Review agent changes** in git diff before accepting

### For Agent Interactions

1. **Be specific**: Clear, narrow requests work best
2. **Reference context**: Point to AGENTS.md or rules
3. **Verify output**: Always check agent work
4. **Iterate**: Refine requests based on results

### For Maintenance

1. **Keep rules updated** as project evolves
2. **Add skills** for repeated workflows
3. **Document decisions** in AGENTS.md
4. **Review agent logs** to improve prompts

## Resources

- **Cursor Documentation**: https://cursor.sh/docs
- **Project Context**: See `/workspace/AGENTS.md`
- **Development Rules**: See `.cursor/rules/northernbytes.mdc`
- **Build Verification**: See `.cursor/skills/build-verify.mdc`

## Support

For issues with Cursor integration:

1. Check this README
2. Review error messages
3. Consult Cursor documentation
4. Reach out to hello@northernbytes.co for project-specific questions

## Version

Last updated: 2026-10-20
Compatible with: Cursor 0.41+, Next.js 15, React 19
