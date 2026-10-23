#!/usr/bin/env node
/**
 * Same-repo PRs enable squash auto-merge once CI is green.
 * A fork or an outside contributor waits. Paths and Dependabot
 * update types are not a reason to wait.
 *
 *   node scripts/automerge-policy.js --self-test
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const { mainIsProtectedWithRequiredChecks } = require('./required-checks');

const TRUSTED = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);

function decide(input) {
  const fork =
    input.fork === true ||
    (input.headRepo && input.baseRepo && input.headRepo !== input.baseRepo);
  const dependabot = input.actor === 'dependabot[bot]';
  const outside = !dependabot && !TRUSTED.has(input.authorAssociation);

  if (input.draft) return { merge: false, reason: 'draft' };
  if (fork) return { merge: false, reason: 'fork' };
  if (outside) return { merge: false, reason: 'outside contributor' };
  if (dependabot) return { merge: true, reason: 'dependabot' };
  if (typeof input.headRef === 'string' && input.headRef.startsWith('cursor/')) {
    return { merge: true, reason: 'same-repo cursor/*' };
  }
  return { merge: true, reason: 'same-repo collaborator' };
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
    headRef: 'cursor/example-68af',
    files: ['app/page.tsx'],
  };
  const cases = [
    { name: 'cursor/* PR', input: base, merge: true, reason: 'same-repo cursor/*' },
    {
      name: 'rules-touching PR',
      input: {
        ...base,
        headRef: 'cursor/rules-68af',
        files: ['.github/workflows/automerge.yml', '.cursor/rules/pstack-models.mdc', 'AGENTS.md'],
      },
      merge: true,
      reason: 'same-repo cursor/*',
    },
    {
      name: 'Dependabot major',
      input: {
        ...base,
        actor: 'dependabot[bot]',
        authorAssociation: 'NONE',
        headRef: 'dependabot/npm_and_yarn/next-16.0.0',
        updateType: 'version-update:semver-major',
        files: ['package.json', 'package-lock.json'],
      },
      merge: true,
      reason: 'dependabot',
    },
    {
      name: 'Dependabot GitHub Actions',
      input: {
        ...base,
        actor: 'dependabot[bot]',
        authorAssociation: 'NONE',
        headRef: 'dependabot/github_actions/actions/checkout-5',
        updateType: 'version-update:semver-major',
        files: ['.github/workflows/ci.yml'],
      },
      merge: true,
      reason: 'dependabot',
    },
    {
      name: 'fork PR',
      input: {
        ...base,
        fork: true,
        headRepo: 'outsider/northern-bytes',
        authorAssociation: 'CONTRIBUTOR',
        actor: 'outsider',
        headRef: 'cursor/from-fork',
        files: ['app/page.tsx'],
      },
      merge: false,
      reason: 'fork',
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
      reason: 'outside contributor',
    },
  ];

  for (const sample of cases) {
    const result = decide(sample.input);
    console.log(`${result.merge ? 'MERGE' : 'SKIP '}  ${sample.name}: ${result.reason}`);
    assert(result.merge === sample.merge, `${sample.name} expected merge=${sample.merge}, got ${result.merge} (${result.reason})`);
    assert(result.reason === sample.reason, `${sample.name} expected reason ${sample.reason}, got ${result.reason}`);
  }
  console.log('automerge policy self-test passed');
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
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
    headRef: pr.head?.ref || '',
    number: pr.number,
  };
}

function writeOutput(merge, reason) {
  const output = process.env.GITHUB_OUTPUT;
  console.log(`${merge ? 'MERGE' : 'SKIP'} ${reason}`);
  if (!output) return;
  require('fs').appendFileSync(output, `merge=${merge ? 'true' : 'false'}\nreason=${reason}\n`);
}

function checksGreen(prNumber) {
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'required-checks.js'),
    '--pr',
    String(prNumber),
  ], { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.status === 0;
}

// --auto waits only when main requires status checks. This token cannot
// set that protection. Until an admin does, wait here, then enable --auto.
function waitUntilChecksPass(prNumber) {
  const attempts = 50;
  for (let i = 1; i <= attempts; i++) {
    if (checksGreen(prNumber)) return true;
    if (i === attempts) return false;
    console.log(`required checks not green yet (${i}/${attempts}); retrying in 30s`);
    spawnSync('sleep', ['30']);
  }
  return false;
}

function runEvent() {
  const event = require(process.env.GITHUB_EVENT_PATH);
  const input = fromEvent(event);
  const decision = decide(input);
  if (!decision.merge) {
    writeOutput(false, decision.reason);
    return;
  }

  const repo = JSON.parse(gh(['api', `repos/${process.env.GITHUB_REPOSITORY}`]));
  if (!repo.allow_auto_merge) {
    writeOutput(false, 'allow_auto_merge is off');
    return;
  }

  const protection = mainIsProtectedWithRequiredChecks();
  if (!protection.protected && !waitUntilChecksPass(input.number)) {
    writeOutput(false, 'required checks did not succeed');
    return;
  }
  writeOutput(true, decision.reason);
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

module.exports = { decide };
