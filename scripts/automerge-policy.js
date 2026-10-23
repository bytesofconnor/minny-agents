#!/usr/bin/env node
/**
 * Decide whether this PR may enable GitHub squash auto-merge.
 * The only yeses are a same-repo cursor/* branch, or a Dependabot
 * patch/minor update. Protected paths, forks, outside contributors,
 * and major bumps are no.
 *
 *   node scripts/automerge-policy.js --self-test
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync } = require('child_process');
const { mainIsProtectedWithRequiredChecks } = require('./required-checks');

const TRUSTED = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
const PATCH_OR_MINOR = new Set([
  'version-update:semver-patch',
  'version-update:semver-minor',
]);

function isProtected(file) {
  return (
    file === 'AGENTS.md' ||
    file.startsWith('.github/') ||
    file.startsWith('.cursor/rules/')
  );
}

function decide(input) {
  const files = input.files || [];
  const protectedFiles = files.filter(isProtected);
  const fork =
    input.fork === true ||
    (input.headRepo && input.baseRepo && input.headRepo !== input.baseRepo);
  const cursor = typeof input.headRef === 'string' && input.headRef.startsWith('cursor/');
  const dependabot = input.actor === 'dependabot[bot]';
  const updateType = input.updateType || '';
  const patchOrMinor = dependabot && PATCH_OR_MINOR.has(updateType);
  const outside = !TRUSTED.has(input.authorAssociation);

  if (input.draft) return { merge: false, reason: 'draft' };
  if (fork) return { merge: false, reason: 'fork' };
  if (protectedFiles.length) {
    return { merge: false, reason: `protected paths: ${protectedFiles.join(', ')}` };
  }
  if (dependabot && updateType === 'version-update:semver-major') {
    return { merge: false, reason: 'dependabot major' };
  }
  if (dependabot && !patchOrMinor) {
    return { merge: false, reason: 'dependabot update is not patch or minor' };
  }
  if (patchOrMinor) return { merge: true, reason: `dependabot ${updateType}` };
  if (outside) return { merge: false, reason: 'outside contributor' };
  if (cursor) return { merge: true, reason: 'same-repo cursor/*' };
  return { merge: false, reason: 'not a same-repo cursor/* branch or a dependabot patch/minor update' };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function selfTest() {
  const repo = 'bytesofconnor/northern-bytes';
  const base = {
    draft: false,
    fork: false,
    headRepo: repo,
    baseRepo: repo,
    actor: 'bytesofconnor',
    authorAssociation: 'OWNER',
    updateType: '',
    headRef: 'cursor/example-68af',
    files: ['app/page.tsx'],
  };
  const cases = [
    { name: 'same-repo cursor/*', input: base, merge: true },
    {
      name: 'rules-touching PR',
      input: { ...base, files: ['.cursor/rules/pstack-models.mdc', 'app/page.tsx'] },
      merge: false,
    },
    {
      name: 'fork cursor/*',
      input: {
        ...base,
        fork: true,
        headRepo: 'outsider/northern-bytes',
        authorAssociation: 'CONTRIBUTOR',
        actor: 'outsider',
        files: ['app/page.tsx'],
      },
      merge: false,
    },
    {
      name: 'AGENTS.md',
      input: { ...base, files: ['AGENTS.md'] },
      merge: false,
    },
    {
      name: '.github workflow',
      input: { ...base, files: ['.github/workflows/automerge.yml'] },
      merge: false,
    },
    {
      name: 'dependabot minor',
      input: {
        ...base,
        actor: 'dependabot[bot]',
        authorAssociation: 'NONE',
        headRef: 'dependabot/npm_and_yarn/next-15.5.9',
        updateType: 'version-update:semver-minor',
        files: ['package.json', 'package-lock.json'],
      },
      merge: true,
    },
    {
      name: 'dependabot major',
      input: {
        ...base,
        actor: 'dependabot[bot]',
        authorAssociation: 'NONE',
        headRef: 'dependabot/npm_and_yarn/next-16.0.0',
        updateType: 'version-update:semver-major',
        files: ['package.json'],
      },
      merge: false,
    },
    {
      name: 'outside contributor',
      input: {
        ...base,
        actor: 'stranger',
        authorAssociation: 'FIRST_TIME_CONTRIBUTOR',
        headRef: 'fix-typo',
        files: ['README.md'],
      },
      merge: false,
    },
  ];

  for (const sample of cases) {
    const result = decide(sample.input);
    console.log(`${result.merge ? 'MERGE' : 'SKIP '}  ${sample.name}: ${result.reason}`);
    assert(result.merge === sample.merge, `${sample.name} expected merge=${sample.merge}, got ${result.merge} (${result.reason})`);
  }
  console.log('automerge policy self-test passed');
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

function pullFiles(repo, number) {
  const out = gh([
    'api',
    '--paginate',
    `repos/${repo}/pulls/${number}/files`,
    '--jq',
    '.[].filename',
  ]);
  return out.split('\n').map((line) => line.trim()).filter(Boolean);
}

function fromEvent(event) {
  const pr = event.pull_request;
  if (!pr) throw new Error('pull_request payload is missing');
  const repo = process.env.GITHUB_REPOSITORY;
  return {
    draft: pr.draft === true,
    fork: pr.head?.repo?.fork === true,
    headRepo: pr.head?.repo?.full_name || '',
    baseRepo: pr.base?.repo?.full_name || repo,
    actor: process.env.GITHUB_ACTOR || pr.user?.login || '',
    authorAssociation: pr.author_association || '',
    updateType: process.env.UPDATE_TYPE || '',
    headRef: pr.head?.ref || '',
    files: pullFiles(repo, pr.number),
    number: pr.number,
  };
}

function writeOutput(merge, reason) {
  const path = process.env.GITHUB_OUTPUT;
  console.log(`${merge ? 'MERGE' : 'SKIP'} ${reason}`);
  if (!path) return;
  require('fs').appendFileSync(path, `merge=${merge ? 'true' : 'false'}\nreason=${reason}\n`);
}

function runEvent() {
  const event = require(process.env.GITHUB_EVENT_PATH);
  const input = fromEvent(event);
  const decision = decide(input);
  if (!decision.merge) {
    writeOutput(false, decision.reason);
    return;
  }

  const repo = ghJsonRepo();
  if (!repo.allow_auto_merge) {
    writeOutput(false, 'allow_auto_merge is off');
    return;
  }
  const protection = mainIsProtectedWithRequiredChecks();
  if (!protection.protected) {
    writeOutput(
      false,
      'main has no required status checks, so gh pr merge --auto would merge before CI'
    );
    return;
  }
  writeOutput(true, decision.reason);
}

function ghJsonRepo() {
  const repo = process.env.GITHUB_REPOSITORY;
  return JSON.parse(gh(['api', `repos/${repo}`]));
}

function main(argv) {
  if (argv.includes('--self-test')) {
    selfTest();
    return;
  }
  if (!process.env.GITHUB_EVENT_PATH) {
    console.error('Usage: automerge-policy.js --self-test');
    process.exitCode = 2;
    return;
  }
  runEvent();
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { decide, isProtected };
