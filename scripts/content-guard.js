#!/usr/bin/env node
/**
 * Content Guard — prevents banned claims from shipping
 * Fails CI if copy contains invented metrics, clients, prices, or prohibited terms
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Banned patterns: terms that should never appear in production copy
const BANNED_PATTERNS = [
  // Financial/pricing claims
  { pattern: /\$\d+/g, reason: 'No prices stated per policy' },
  { pattern: /\d+k?\s*\/\s*(month|year|hour)/gi, reason: 'No pricing information' },
  
  // Funding/investment claims
  { pattern: /venture[- ]backed/gi, reason: 'False funding claim' },
  { pattern: /series [a-z]/gi, reason: 'No funding rounds' },
  { pattern: /\$\d+[mk]?\s*(raised|funding)/gi, reason: 'No funding announcements' },
  
  // Fake metrics
  { pattern: /\d+%\s*(increase|improvement|faster)/gi, reason: 'Unverified metric claim' },
  { pattern: /\d+x\s*(faster|more|revenue)/gi, reason: 'Unverified multiplier claim' },
  
  // Team size claims (only Connor Barrett is named)
  { pattern: /team of \d+/gi, reason: 'Inaccurate team size claim' },
  { pattern: /\d+\+?\s*engineers/gi, reason: 'Inflated team claim' },
  
  // Client name examples (add known non-clients here)
  { pattern: /\b(acme|contoso|northwind|fabrikam)\b/gi, reason: 'Placeholder/fake client name' },
  
  // Testimonial markers without attribution
  { pattern: /[""].*reduced.*time.*by.*\d+.*[""]/gi, reason: 'Unattributed testimonial' },
  { pattern: /[""].*saved.*\$.*[""]/gi, reason: 'Unattributed savings claim' },
  
  // Misleading endorsement language (these are past employers, not clients)
  { pattern: /trusted by.*(AmFam|American Family|3M|DNV|Livefront)/gi, reason: 'Past employers, not endorsing clients' },
  { pattern: /(AmFam|American Family|3M|DNV|Livefront).*trusted/gi, reason: 'Past employers, not endorsing clients' },
  
  // Employers' clients that must never appear as studio clients
  { pattern: /\b(PECO|PSEG|DTE|PNM|Consumers Energy|UnitedHealth|RVO Health|Alight|UW-Madison|University of Wisconsin)\b/gi, reason: 'Past employers\' clients, not studio clients' },

  // Unowned / not-final brand contact (do not publish)
  { pattern: /hello@northernbytes\.co/gi, reason: 'Unowned email; brand name not final' },
  { pattern: /mailto:[^\s"'<>]*northernbytes\.co/gi, reason: 'Unowned northernbytes.co mailto' },
];

// Retired brand name — must not appear in anything visitors see
const RENDERED_BANNED_PATTERNS = [
  { pattern: /Northern Bytes/g, reason: 'Old brand name must not appear in rendered output' },
  { pattern: /northern-bytes\.vercel\.app/g, reason: 'Production URL is https://minnyagents.com; do not publish the old Vercel alias' },
];

// Files to check (app source and public content)
const FILES_TO_CHECK = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/opengraph-image.tsx',
  'public/llms.txt',
  'README.md',
  'AGENTS.md',
];

const RENDERED_FILES = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/opengraph-image.tsx',
  'public/llms.txt',
];

let violations = [];

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} (not found)`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  for (const { pattern, reason } of BANNED_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file: filePath,
        matches: matches,
        reason: reason,
        pattern: pattern.toString(),
      });
    }
  }

  if (RENDERED_FILES.includes(filePath)) {
    for (const { pattern, reason } of RENDERED_BANNED_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          file: filePath,
          matches: matches,
          reason: reason,
          pattern: pattern.toString(),
        });
      }
    }
  }
}

// Run checks
console.log('🛡️  Content Guard — checking for banned claims...\n');

for (const file of FILES_TO_CHECK) {
  checkFile(file);
}

// Report results
if (violations.length > 0) {
  console.error('❌ Content Guard violations found:\n');
  
  for (const v of violations) {
    console.error(`File: ${v.file}`);
    console.error(`Reason: ${v.reason}`);
    console.error(`Pattern: ${v.pattern}`);
    console.error(`Matches: ${v.matches.join(', ')}`);
    console.error('');
  }
  
  console.error(`Found ${violations.length} violation(s). Fix before merging.`);
  process.exit(1);
}

console.log('✅ Content Guard passed — no banned claims detected');
process.exit(0);
