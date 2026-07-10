import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const workflowPath = fileURLToPath(new URL('../.github/workflows/release.yml', import.meta.url));
const chromeGuidePath = fileURLToPath(new URL('../CHROME_STORE_SUBMISSION.md', import.meta.url));
const edgeGuidePath = fileURLToPath(new URL('../EDGE_STORE_SUBMISSION.md', import.meta.url));
const readWorkflow = () => readFile(workflowPath, 'utf8');

function positionOf(source, token) {
  const position = source.indexOf(token);
  assert.notEqual(position, -1, `Expected workflow to contain: ${token}`);
  return position;
}

test('release workflow has intended triggers and controls', async () => {
  const workflow = await readWorkflow();
  assert.match(workflow, /^name: Release$/m);
  assert.match(workflow, /^on:\n  push:\n    tags:\n      - 'v\*'\n  workflow_dispatch:/m);
  assert.match(workflow, /publish_github_release_only:\n        description: .*Chrome.*Edge.*\n        required: false/);
  assert.doesNotMatch(workflow, /pull_request/);
  assert.match(workflow, /^permissions:\n  contents: write$/m);
  assert.match(workflow, /^concurrency:\n  group: browser-store-release\n  queue: max\n  cancel-in-progress: false$/m);
  assert.match(workflow, /^jobs:\n  release:\n    runs-on: ubuntu-latest\n    timeout-minutes: 30$/m);
});

test('release workflow validates an exact tag and checks it out', async () => {
  const workflow = await readWorkflow();
  assert.match(workflow, /REQUESTED_TAG: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.tag \|\| github\.ref_name \}\}/);
  assert.match(workflow, /\^v\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$/);
  assert.match(workflow, /ref: refs\/tags\/\$\{\{ steps\.release\.outputs\.tag \}\}/);
  assert.match(workflow, /node-version: 20/);
});

test('release order is package, Chrome, Edge, then GitHub publication', async () => {
  const workflow = await readWorkflow();
  const tokens = [
    'node scripts/release-version.mjs "$TAG"', 'npm test', 'npm run validate', 'npm run package',
    'gh release create "$TAG" --verify-tag --draft',
    'gh release upload "$TAG" "dist/marktab-$VERSION.zip" --clobber',
    'npm run cws:publish -- "dist/marktab-$VERSION.zip"',
    'npm run edge:publish -- "dist/marktab-$VERSION.zip"',
    'gh release edit "$TAG" --draft=false',
  ];
  const positions = tokens.map((token) => positionOf(workflow, token));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('store secrets are confined to their respective steps', async () => {
  const workflow = await readWorkflow();
  const chromeStart = positionOf(workflow, '- name: Publish to Chrome Web Store');
  const edgeStart = positionOf(workflow, '- name: Publish to Microsoft Edge Add-ons');
  const githubStart = positionOf(workflow, '- name: Publish GitHub Release');
  const chromeStep = workflow.slice(chromeStart, edgeStart);
  const edgeStep = workflow.slice(edgeStart, githubStart);
  for (const name of ['CWS_CLIENT_ID', 'CWS_CLIENT_SECRET', 'CWS_REFRESH_TOKEN', 'CWS_ITEM_ID']) {
    assert.equal((workflow.match(new RegExp(`\\$\\{\\{ secrets\\.${name} \\}\\}`, 'g')) ?? []).length, 1);
    assert.match(chromeStep, new RegExp(`${name}: \\$\\{\\{ secrets\\.${name} \\}\\}`));
  }
  for (const name of ['EDGE_PRODUCT_ID', 'EDGE_CLIENT_ID', 'EDGE_API_KEY']) {
    assert.equal((workflow.match(new RegExp(`\\$\\{\\{ secrets\\.${name} \\}\\}`, 'g')) ?? []).length, 1);
    assert.match(edgeStep, new RegExp(`${name}: \\$\\{\\{ secrets\\.${name} \\}\\}`));
  }
});

test('recovery skips both stores and keeps failed releases as drafts', async () => {
  const workflow = await readWorkflow();
  for (const step of ['Check out release tag', 'Set up Node.js', 'Verify release version', 'Run tests', 'Validate extension', 'Package extension', 'Prepare draft GitHub Release', 'Publish to Chrome Web Store', 'Publish to Microsoft Edge Add-ons']) {
    assert.match(workflow, new RegExp(`- name: ${step}\\n        if: steps\\.release\\.outputs\\.recovery != 'true'`));
  }
  assert.match(workflow, /Chrome Web Store and Edge Add-ons acceptance were confirmed/i);
  assert.match(workflow, /Recovery mode skips both store submissions/i);
  assert.match(workflow, /draft remains unpublished/i);
  assert.match(workflow, /timeout 60s gh release edit/);
});

test('store guides document safe recovery', async () => {
  const chrome = await readFile(chromeGuidePath, 'utf8');
  const edge = await readFile(edgeGuidePath, 'utf8');
  for (const guide of [chrome, edge]) {
    assert.match(guide, /publish_github_release_only/);
    assert.match(guide, /both.*store/i);
  }
});

test('npm test includes Edge and workflow contracts', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  for (const testPath of ['scripts/newtab-layout.test.mjs', 'scripts/package-release.test.mjs', 'scripts/release-version.test.mjs', 'scripts/cws-api.test.mjs', 'scripts/cws-publish.test.mjs', 'scripts/cws-auth.test.mjs', 'scripts/edge-api.test.mjs', 'scripts/edge-publish.test.mjs', 'scripts/release-workflow.test.mjs']) {
    assert.match(packageJson.scripts.test, new RegExp(testPath.replaceAll('.', '\\.')));
  }
});
