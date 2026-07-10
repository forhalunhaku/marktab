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

test('home content omits the duplicate folder grid while keeping the browse guide', () => {
  assert.doesNotMatch(html, /id="homeFoldersSection"/);
  assert.doesNotMatch(html, /id="homeFolderPills"/);
  assert.doesNotMatch(js, /renderHomeFolders/);
  assert.match(js, /msg\('browseFolders'\)/);
});

test('tablet and mobile layouts use drawer navigation instead of stacking the full sidebar above content', () => {
  assert.match(html, /id="homeSidebarToggle"[^>]*aria-controls="homeSidebar"[^>]*aria-expanded="false"/);
  assert.match(html, /id="sidebarToggle"[^>]*aria-controls="folderSidebar"[^>]*aria-expanded="false"/);
  assert.match(html, /class="home-mobile-nav"/);
  assert.match(html, /id="mobileDrawerScrim"/);
  assert.match(js, /function toggleMobileDrawer\(target, trigger\)/);
  assert.match(js, /window\.innerWidth <= 1200/);
  assert.match(js, /function syncDrawerAccessibility\(\)/);
  assert.match(js, /sidebar\.inert = drawerLayout && !open/);
  assert.match(js, /el\.homeMain\.inert = homeOpen/);
  assert.match(js, /toggle\.setAttribute\('aria-expanded', String\(open\)\)/);
  assert.match(js, /isDrawerOpen\(\) && e\.key === 'Escape'/);
  assert.match(js, /isDrawerOpen\(\) && e\.key === 'Tab'/);
  assert.match(css, /@media \(max-width:\s*1200px\)[\s\S]*?\.home-sidebar,\s*\.folder-sidebar\s*\{[^}]*position:\s*fixed;[^}]*transform:\s*translateX\(calc\(-100%\s*-\s*24px\)\)/s);
  assert.match(css, /@media \(max-width:\s*1200px\)[\s\S]*?\.home-sidebar-toggle,\s*\.sidebar-toggle\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.home-mobile-nav\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /body\.drawer-open \.mobile-drawer-scrim\s*\{[^}]*pointer-events:\s*auto/s);
});

test('dialogs manage focus and expose modal semantics', () => {
  assert.match(html, /id="settingsPanel"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(html, /id="searchPanel"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(html, /id="mobileDrawerScrim"[^>]*aria-hidden="true"[^>]*tabindex="-1"/);
  assert.match(js, /function trapFocus\(container, event\)/);
  assert.match(js, /const returnFocus = resolveAccessibleReturnFocus\(searchReturnFocus\) \|\| el\.homeSearchInput/);
  assert.match(js, /suppressSearchTriggerFocus = true/);
  assert.match(js, /requestAnimationFrame\(\(\) => el\.settingsPanelClose\.focus\(\)\)/);
  assert.match(js, /el\.homeView\.inert = modalOpen/);
});

test('responsive surfaces honor safe areas and reduced motion', () => {
  assert.match(css, /top:\s*max\(14px,\s*env\(safe-area-inset-top\)\)/);
  assert.match(css, /left:\s*max\(24px,\s*env\(safe-area-inset-left\)\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation-duration:\s*0\.01ms\s*!important[\s\S]*?transition-duration:\s*0\.01ms\s*!important/s);
  assert.match(js, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  assert.match(js, /behavior:\s*getScrollBehavior\(\)/);
});

test('page backgrounds omit ambient glows and dark drawer toggles stay legible', () => {
  assert.match(css, /body\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*#f4f7fb/s);
  assert.match(css, /:root\[data-theme="dark"\] body\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*var\(--dark-bg\)/s);
  assert.doesNotMatch(css, /body\s*\{[^}]*radial-gradient/s);
  assert.match(css, /\.app-backdrop\s*\{[^}]*background:\s*none/s);
  assert.match(css, /:root\[data-theme="dark"\] \.home-sidebar-toggle,\s*:root\[data-theme="dark"\] \.sidebar-toggle\s*\{[^}]*color:\s*var\(--dark-accent\);[^}]*background:\s*rgba\(15,\s*23,\s*42,\s*0\.78\);[^}]*border-color:\s*rgba\(148,\s*163,\s*184,\s*0\.18\);[^}]*box-shadow:\s*0 18px 48px rgba\(2,\s*6,\s*23,\s*0\.34\)/s);
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
