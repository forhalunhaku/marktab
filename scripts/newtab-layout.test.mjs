import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [css, js, html] = await Promise.all([
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../newtab.js', import.meta.url), 'utf8'),
  readFile(new URL('../newtab.html', import.meta.url), 'utf8')
]);

test('home layout uses the sidebar shell and wider centered search field', () => {
  assert.match(css, /\.home-main\s*\{[^}]*margin-left:\s*calc\(var\(--sidebar-width\)\s*\+\s*48px\)/s);
  assert.match(css, /\.home-container\s*\{[^}]*width:\s*min\(100%,\s*var\(--content-max\)\)/s);
  assert.match(css, /\.search-wrap\s*\{[^}]*width:\s*min\(760px,\s*100%\)/s);
});

test('desktop sidebar stays fixed while the main content scrolls independently', () => {
  assert.match(css, /\.home-shell\s*\{[^}]*height:\s*100dvh;[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.home-sidebar,\s*\.folder-sidebar\s*\{[^}]*position:\s*fixed;[^}]*top:\s*28px;[^}]*bottom:\s*28px;[^}]*left:\s*28px;[^}]*width:\s*var\(--sidebar-width\)/s);
  assert.match(css, /\.home-main\s*\{[^}]*height:\s*100%;[^}]*overflow-y:\s*auto/s);
  assert.match(css, /@media \(max-width:\s*1200px\)[\s\S]*?\.home-shell\s*\{[^}]*height:\s*auto;[^}]*overflow:\s*visible/s);
});

test('only the shared sidebar folder list scrolls while the footer stays fixed', () => {
  assert.match(css, /\.home-sidebar-top\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0/s);
  assert.match(css, /\.home-sidebar-group\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0/s);
  assert.match(css, /\.home-sidebar-folders\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.home-sidebar-bottom\s*\{[^}]*flex:\s*0\s+0\s+auto/s);
  assert.match(css, /\.home-sidebar-folders::\-webkit-scrollbar\s*\{[^}]*width:\s*4px/s);
  assert.match(html, /class="home-sidebar-panel folder-sidebar-panel"/);
  assert.doesNotMatch(js, /\.slice\(0,\s*8\)/);
});

test('sidebar wrapper stays transparent while the panel owns the glass surface', () => {
  assert.match(css, /\.home-sidebar,\s*\.folder-sidebar\s*\{[^}]*overflow:\s*visible;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none/s);
  assert.match(css, /\.home-sidebar-panel\s*\{[^}]*border-radius:\s*32px;[^}]*border:\s*1px solid rgba\(15,\s*23,\s*42,\s*0\.08\);[^}]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.78\);[^}]*box-shadow:\s*0 24px 80px rgba\(15,\s*23,\s*42,\s*0\.08\)/s);
  assert.match(css, /\.home-sidebar-actions,[^}]*justify-content:\s*center;[^}]*gap:\s*12px/s);
  assert.match(css, /\.home-sidebar-action\s*\{[^}]*width:\s*42px;[^}]*height:\s*42px;[^}]*border-radius:\s*14px/s);
});

test('pinned layout supports a five-column desktop grid', () => {
  assert.match(css, /\.home-pinned-grid\s*\{[^}]*minmax\(190px,\s*1fr\)/s);
  assert.match(css, /repeat\(5,\s*minmax\(0,\s*1fr\)\)/s);
});

test('guide cards only render when there are no pinned bookmarks', () => {
  assert.match(js, /if \(pinned\.length === 0\)/);
  assert.doesNotMatch(js, /if \(pinned\.length < 4\)/);
});

test('home favicon shells share the refined 44px icon container', () => {
  assert.match(css, /\.home-card-favicon,\s*\.home-recent-favicon,[^}]*width:\s*44px;[^}]*height:\s*44px;[^}]*border-radius:\s*14px/s);
  assert.match(css, /\.home-card-favicon-img,\s*\.home-recent-favicon-img,[^}]*width:\s*24px;[^}]*height:\s*24px/s);
});

test('recent bookmarks render inside a single lightweight surface', () => {
  assert.match(js, /home-recent-surface/);
  assert.doesNotMatch(js, /function createRecentGroup\(bookmarks\)/);
  assert.match(css, /\.home-recent-surface\s*\{/);
  assert.match(css, /\.home-recent-item:hover\s*\{[^}]*rgba\(79,\s*124,\s*255,\s*0\.06\)/s);
});

test('folders use larger unified folder cards without duplicate count badges', () => {
  assert.match(css, /\.folder-pill\s*\{[^}]*min-height:\s*116px;[^}]*border-radius:\s*20px/s);
  assert.match(css, /\.home-folder-pills\s*\{[^}]*repeat\(auto-fill,\s*minmax\(220px,\s*1fr\)\)/s);
  assert.doesNotMatch(js, /folder-pill-count/);
});

test('folder view uses a constrained responsive grid and compact cards', () => {
  assert.match(css, /\.folder-content-inner\s*\{[^}]*width:\s*min\(100%,\s*var\(--content-max\)\)/s);
  assert.match(css, /\.folder-bookmarks-grid\s*\{[^}]*repeat\(auto-fill,\s*minmax\(180px,\s*1fr\)\)[^}]*gap:\s*16px/s);
  assert.match(css, /\.folder-card\s*\{[^}]*height:\s*140px;[^}]*min-height:\s*132px;[^}]*max-height:\s*148px;[^}]*border-radius:\s*18px/s);
  assert.match(css, /\.folder-card-favicon\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;[^}]*border-radius:\s*12px/s);
  assert.match(css, /\.folder-card-title\s*\{[^}]*-webkit-line-clamp:\s*2;[^}]*font-size:\s*14px;[^}]*font-weight:\s*600/s);
  assert.match(css, /\.folder-card-domain\s*\{[^}]*font-size:\s*12px;[^}]*text-overflow:\s*ellipsis/s);
  assert.match(html, /data-folder-view-mode="grid"/);
  assert.match(html, /data-folder-view-mode="list"/);
  assert.match(html, /class="folder-view-toggle"/);
  assert.match(html, /stroke-width="1\.8"/);
  assert.doesNotMatch(html, /data-i18n-title="sortBookmarks"/);
});

test('dark theme uses dedicated dark surfaces and readable text tokens', () => {
  assert.match(css, /:root\[data-theme="dark"\]\s*\{[^}]*--dark-bg:\s*#080d16;[^}]*--dark-surface:\s*rgba\(15,\s*23,\s*42,\s*0\.72\);[^}]*--dark-text-primary:\s*#f8fafc;[^}]*--dark-border:\s*rgba\(148,\s*163,\s*184,\s*0\.16\)/s);
  assert.match(css, /:root\[data-theme="dark"\] \.folder-card,[\s\S]*?background:\s*var\(--dark-surface\);[^}]*border-color:\s*var\(--dark-border\)/s);
  assert.match(css, /:root\[data-theme="dark"\] \.search-bar,[\s\S]*?background:\s*rgba\(15,\s*23,\s*42,\s*0\.78\);[^}]*border-color:\s*rgba\(148,\s*163,\s*184,\s*0\.18\)/s);
  assert.match(css, /:root\[data-theme="dark"\] \.home-sidebar-stats\s*\{[^}]*background:\s*var\(--dark-surface-muted\)/s);
  assert.match(css, /:root\[data-theme="dark"\] \.folder-view-toggle\s*\{[^}]*background:\s*var\(--dark-surface\)/s);
});
