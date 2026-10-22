#!/usr/bin/env node
/**
 * Gate merges on required GitHub Actions check-run conclusions
 * for a PR head SHA. mergeStateStatus / mergeable_state is not used.
 *
 *   node scripts/required-checks.js --self-test
 *   node scripts/required-checks.js --pr <n>
 *   node scripts/required-checks.js --main-protected
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync } = require('child_process');

const REQUIRED_CHECKS = [
  'Lint and Type Check',
  'Build',
  'Content Guard',
  'E2E Smoke Tests',
  'Check PR Body',
];

function latestByName(runs) {
  const map = new Map();
  for (const run of runs) {
    const prev = map.get(run.name);
    if (!prev || new Date(run.started_at || 0) > new Date(prev.started_at || 0)) {
      map.set(run.name, run);
    }
  }
  return map;
}

function evaluate(runs, required = REQUIRED_CHECKS) {
  const latest = latestByName(runs);
  const missing = [];
  const pending = [];
  const failed = [];
  const passed = [];

  for (const name of required) {
    const run = latest.get(name);
    if (!run) {
      missing.push(name);
      continue;
    }
    if (run.status !== 'completed') {
      pending.push({ name, status: run.status });
      continue;
    }
    if (run.conclusion !== 'success') {
      failed.push({ name, conclusion: run.conclusion });
      continue;
    }
    passed.push(name);
  }

  return {
    ok: missing.length + pending.length + failed.length === 0,
    missing,
    pending,
    failed,
    passed,
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function selfTest() {
  const base = (name, status, conclusion, started_at) => ({
    name,
    status,
    conclusion,
    started_at,
  });

  const allGreen = REQUIRED_CHECKS.map((name, i) =>
    base(name, 'completed', 'success', `2026-01-01T00:00:0${i}Z`)
  );
  assert(evaluate(allGreen).ok, 'all green should pass');

  const extra = [...allGreen, base('Vercel', 'completed', 'success', '2026-01-01T00:00:09Z')];
  assert(evaluate(extra).ok, 'unrelated checks should be ignored');

  const missing = allGreen.filter((r) => r.name !== 'Check PR Body');
  const miss = evaluate(missing);
  assert(!miss.ok && miss.missing.includes('Check PR Body'), 'missing required check should fail');

  const pending = allGreen.map((r) =>
    r.name === 'Build' ? { ...r, status: 'in_progress', conclusion: null } : r
  );
  const pend = evaluate(pending);
  assert(!pend.ok && pend.pending.some((p) => p.name === 'Build'), 'pending required check should fail');

  const failed = allGreen.map((r) =>
    r.name === 'E2E Smoke Tests' ? { ...r, conclusion: 'failure' } : r
  );
  const fail = evaluate(failed);
  assert(!fail.ok && fail.failed.some((f) => f.name === 'E2E Smoke Tests'), 'failed conclusion should fail');

  const skipped = allGreen.map((r) =>
    r.name === 'Content Guard' ? { ...r, conclusion: 'skipped' } : r
  );
  assert(!evaluate(skipped).ok, 'skipped is not success');

  const olderFailNewerPass = [
    ...allGreen,
    base('Build', 'completed', 'failure', '2026-01-01T00:00:00Z'),
    base('Build', 'completed', 'success', '2026-01-01T00:01:00Z'),
  ];
  assert(evaluate(olderFailNewerPass).ok, 'latest success should win over older failure');

  const olderPassNewerFail = [
    ...allGreen,
    base('Build', 'completed', 'success', '2026-01-01T00:00:00Z'),
    base('Build', 'completed', 'failure', '2026-01-01T00:01:00Z'),
  ];
  assert(!evaluate(olderPassNewerFail).ok, 'latest failure should win over older success');

  // CLEAN / mergeable_state must not be an input to evaluate()
  assert(!('mergeStateStatus' in evaluate(allGreen)), 'evaluate must not consult mergeStateStatus');

  console.log('✅ required-checks self-test passed');
}

function ghJson(args) {
  const out = execFileSync('gh', args, { encoding: 'utf8' });
  return JSON.parse(out);
}

function repo() {
  return process.env.GH_REPO || process.env.GITHUB_REPOSITORY;
}

function fetchCheckRuns(sha) {
  const r = repo();
  if (!r) throw new Error('GH_REPO or GITHUB_REPOSITORY is required');
  const payload = ghJson(['api', `repos/${r}/commits/${sha}/check-runs?per_page=100`]);
  return payload.check_runs || [];
}

function report(result, context) {
  console.log(context);
  if (result.passed.length) console.log(`  passed: ${result.passed.join(', ')}`);
  if (result.missing.length) console.log(`  missing: ${result.missing.join(', ')}`);
  if (result.pending.length) {
    console.log(`  pending: ${result.pending.map((p) => `${p.name} (${p.status})`).join(', ')}`);
  }
  if (result.failed.length) {
    console.log(`  failed: ${result.failed.map((f) => `${f.name} (${f.conclusion})`).join(', ')}`);
  }
}

function checkPr(pr) {
  const data = ghJson([
    'pr', 'view', String(pr),
    '--json', 'number,headRefOid,url,title',
  ]);
  const sha = data.headRefOid;
  const runs = fetchCheckRuns(sha);
  const result = evaluate(runs);
  report(result, `PR #${data.number} ${data.url}\nhead ${sha}`);
  if (!result.ok) {
    process.exitCode = 1;
    return result;
  }
  console.log('✅ All required checks succeeded on the head SHA');
  return result;
}

function mainIsProtectedWithRequiredChecks() {
  const r = repo();
  if (!r) throw new Error('GH_REPO or GITHUB_REPOSITORY is required');
  const branch = ghJson(['api', `repos/${r}/branches/main`]);
  const contexts = branch.protection?.required_status_checks?.contexts || [];
  const checks = branch.protection?.required_status_checks?.checks || [];
  const classic = branch.protected === true && (contexts.length > 0 || checks.length > 0);

  let ruleset = false;
  try {
    const rulesets = ghJson(['api', `repos/${r}/rulesets`]);
    const list = Array.isArray(rulesets) ? rulesets : [];
    for (const rs of list) {
      const detail = ghJson(['api', `repos/${r}/rulesets/${rs.id}`]);
      const rules = detail.rules || [];
      if (rules.some((rule) => rule.type === 'required_status_checks')) {
        ruleset = true;
        break;
      }
    }
  } catch {
    // Listing rulesets may 403; classic protection is still authoritative when present.
  }

  return { protected: Boolean(classic || ruleset), classic, ruleset, contexts, checks };
}

function main(argv) {
  if (argv.includes('--self-test')) {
    selfTest();
    return;
  }

  if (argv.includes('--main-protected')) {
    const info = mainIsProtectedWithRequiredChecks();
    console.log(JSON.stringify(info));
    process.exitCode = info.protected ? 0 : 1;
    return;
  }

  const prFlag = argv.indexOf('--pr');
  if (prFlag !== -1 && argv[prFlag + 1]) {
    checkPr(argv[prFlag + 1]);
    return;
  }

  console.error('Usage: required-checks.js --self-test | --pr <n> | --main-protected');
  process.exitCode = 2;
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { REQUIRED_CHECKS, evaluate, latestByName };
