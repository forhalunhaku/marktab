import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [css, js] = await Promise.all([
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../newtab.js', import.meta.url), 'utf8')
]);

test('home layout uses the approved wide container and responsive search width', () => {
  assert.match(css, /\.home-container\s*\{[^}]*width:\s*min\(88vw,\s*1680px\)/s);
  assert.doesNotMatch(css, /\.home-container\s*\{[^}]*1180px/s);
  assert.match(css, /\.search-wrap\s*\{[^}]*width:\s*min\(540px,\s*100%\)/s);
});

test('pinned layout uses auto-fill responsive columns', () => {
  assert.match(css, /auto-fill,\s*minmax\(130px,\s*1fr\)/s);
  assert.match(css, /repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
});

test('home favicon shells share the approved dimensions', () => {
  assert.match(css, /\.home-card-favicon,\s*\.home-recent-favicon\s*\{[^}]*width:\s*38px;[^}]*height:\s*38px;[^}]*border-radius:\s*12px/s);
  assert.match(css, /\.home-card-favicon-img,\s*\.home-recent-favicon-img\s*\{[^}]*width:\s*24px;[^}]*height:\s*24px/s);
});

test('recent bookmarks render as two presentation cards', () => {
  assert.match(js, /function createRecentGroup\(bookmarks\)/);
  assert.match(js, /recentGroups\.map\(createRecentGroup\)\.join\(''\)/);
  assert.match(css, /\.home-recent-card\s*\{/);
  assert.match(css, /\.home-recent-item\s*\+\s*\.home-recent-item\s*\{/);
});

test('folders use compact pills with count badge', () => {
  assert.match(css, /\.folder-pill\s*\{[^}]*border-radius:\s*16px/s);
  assert.match(css, /\.folder-pill-count\s*\{[^}]*min-width:\s*28px;[^}]*height:\s*24px/s);
});
