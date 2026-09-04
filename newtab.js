/**
 * MarkTab — Bookmark Launcher
 * Search-first, keyboard-driven, paper-calm new tab.
 */

// ─── Theme Registry ──────────────────────────────────────────
const THEMES = [
  { id: 'light',  name: 'Light',  desc: 'Soft daylight workspace' },
  { id: 'dark',   name: 'Dark',   desc: 'Graphite focus mode' },
  { id: 'system', name: 'System', desc: 'Follow your device' }
];

// ─── Defaults ────────────────────────────────────────────────
const DEFAULTS = {
  hiddenFolderIds: [],
  pinnedBookmarkUrls: [],
  recentUrls: [],
  recentVisitTimes: {},
  theme: 'light',
  homeShowRecent: true,
  homeRecentCount: 6,
  sidebarCollapsed: false
};

// ─── State ───────────────────────────────────────────────────
let settings = {};
let allBookmarks = [];
let bookmarkTree = [];
let flatFolders = [];
let uncategorizedBookmarks = [];
let drawerReturnFocus = null;
let searchReturnFocus = null;
let settingsReturnFocus = null;
let suppressSearchTriggerFocus = false;

const FALLBACK_MESSAGES = {
  searchBookmarksAndFolders: '搜索书签、文件夹或输入网址',
  search: '搜索',
  hintOpen: '打开',
  hintWeb: '搜索网页',
  hintClose: '关闭',
  settingsSaved: '设置已保存',
  loadingBookmarks: '正在加载书签…',
  untitled: '未命名',
  browseFolders: '浏览文件夹',
  noPinnedBookmarksYet: '还没有固定书签',
  pinnedEmptyDescription: '在搜索结果或文件夹里点固定，常用站点会出现在这里',
  searchAndPin: '搜索并固定',
  noRecentBookmarksYet: '还没有最近访问',
  recentEmptyDescription: '通过 MarkTab 打开书签后，记录会出现在这里',
  viewAll: '查看全部',
  recent: '最近访问',
  yesterday: '昨天',
  justNow: '刚刚',
  minutesAgo: '$1 分钟前',
  hoursAgo: '$1 小时前',
  daysAgo: '$1 天前',
  collapseSidebar: '收起侧边栏',
  expandSidebar: '展开侧边栏',
  home: '首页',
  folders: '文件夹',
  bookmarkCount: '$1 个书签',
  bookmarkCountPlural: '$1 个书签',
  searchInFolderNamed: '在 $1 中搜索…',
  searchInFolder: '在当前文件夹中搜索',
  listView: '列表视图',
  thisFolderIsEmpty: '当前文件夹暂无书签',
  folderEmptyDescription: '你可以从浏览器书签中移动或添加内容',
  pin: '固定',
  unpin: '取消固定',
  pinned: '已固定',
  unpinned: '已取消固定',
  startTypingToSearch: '输入内容开始搜索',
  searchWebFor: '搜索网页：$1',
  searchFailed: '搜索失败',
  theme: '主题：$1',
  themeLight: '浅色',
  themeDark: '深色',
  themeSystem: '跟随系统',
  themeToggle: '切换主题',
  newTabPage: '新标签页',
  commonBookmarks: '常用书签',
  bookmarkStats: '书签统计',
  productSubtitle: '书签，触手可及',
  bookmarksUnit: '个书签',
  foldersUnit: '个文件夹',
  appearance: '外观',
  hide: '隐藏',
  show: '显示',
  greetingLate: '夜深了',
  greetingMorning: '早上好',
  greetingNoon: '中午好',
  greetingAfternoon: '下午好',
  greetingEvening: '晚上好'
};

// ─── DOM refs ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = {
  homeView:            $('homeView'),
  homeMain:            document.querySelector('.home-main'),
  folderView:          $('folderView'),
  homeClock:           $('homeClock'),
  homeDate:            $('homeDate'),
  homeSearchInput:     $('homeSearchInput'),
  homeSearchShortcut:  $('homeSearchShortcut'),
  homeGreeting:        $('homeGreeting'),
  homeHero:            $('homeHero'),
  homeSections:        $('homeSections'),
  homePinnedGrid:      $('homePinnedGrid'),
  homeRecentGrid:      $('homeRecentGrid'),
  homeLoading:         $('homeLoading'),
  homeFab:             $('homeFab'),
  homeSidebar:         $('homeSidebar'),
  homeSidebarToggle:   $('homeSidebarToggle'),
  homeSidebarFolders:  $('homeSidebarFolders'),
  homeSidebarFolderTotal: $('homeSidebarFolderTotal'),
  homeStatsBookmarks:  $('homeStatsBookmarks'),
  homeStatsFolders:    $('homeStatsFolders'),
  homeSidebarSettingsBtn: $('homeSidebarSettingsBtn'),
  homeSidebarThemeBtn: $('homeSidebarThemeBtn'),
  homeSidebarCollapseBtn: $('homeSidebarCollapseBtn'),
  folderSidebar:       $('folderSidebar'),
  sidebarToggle:       $('sidebarToggle'),
  sidebarNav:          $('sidebarNav'),
  sidebarHomeBtn:      $('sidebarHomeBtn'),
  folderSidebarHomeBtn: $('folderSidebarHomeBtn'),
  folderSidebarSettingsBtn: $('folderSidebarSettingsBtn'),
  folderSidebarThemeBtn: $('folderSidebarThemeBtn'),
  folderSidebarCollapseBtn: $('folderSidebarCollapseBtn'),
  folderSidebarFolderTotal: $('folderSidebarFolderTotal'),
  folderStatsBookmarks: $('folderStatsBookmarks'),
  folderStatsFolders: $('folderStatsFolders'),
  folderSearchInput:   $('folderSearchInput'),
  folderTitle:         $('folderTitle'),
  folderCount:         $('folderCount'),
  folderContent:       $('folderContent'),
  folderBookmarksGrid: $('folderBookmarksGrid'),
  folderEmpty:         $('folderEmpty'),
  settingsPanelOverlay: $('settingsPanelOverlay'),
  settingsPanel:       $('settingsPanel'),
  settingsPanelClose:  $('settingsPanelClose'),
  themeOptions:        $('themeOptions'),
  settingsFolderList:  $('settingsFolderList'),
  searchPanel:         $('searchPanel'),
  searchPanelOverlay:  $('searchPanelOverlay'),
  searchPanelInput:    $('searchPanelInput'),
  searchPanelClose:    $('searchPanelClose'),
  searchPanelResults:  $('searchPanelResults'),
  searchBookmarkItems: $('searchBookmarkItems'),
  searchFolderItems:   $('searchFolderItems'),
  searchWebItem:       $('searchWebItem'),
  searchEmpty:         $('searchEmpty'),
  mobileDrawerScrim:   $('mobileDrawerScrim'),
  toastContainer:      $('toastContainer')
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function resolveFocusOrigin(origin, fallback = null) {
  if (origin instanceof HTMLElement) return origin;
  if (origin?.currentTarget instanceof HTMLElement) return origin.currentTarget;
  if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
    return document.activeElement;
  }
  return fallback;
}

function resolveAccessibleReturnFocus(target) {
  if (!target || !target.isConnected) return null;
  if (isMobileLayout() && target.closest('#homeSidebar')) return el.homeSidebarToggle;
  if (isMobileLayout() && target.closest('#folderSidebar')) return el.sidebarToggle;
  return target;
}

function restoreFocus(target, fallback = null) {
  const destination = resolveAccessibleReturnFocus(target) || fallback;
  if (!destination?.isConnected) return;
  requestAnimationFrame(() => destination.focus({ preventScroll: true }));
}

function blurFocusWithin(container) {
  if (container?.contains(document.activeElement)) document.activeElement.blur();
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(item =>
    !item.hidden && item.getAttribute('aria-hidden') !== 'true' && !item.closest('[inert]')
  );
}

function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusable = getFocusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!container.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url || ''; }
}

function getFaviconUrl(pageUrl, size = 32) {
  if (!pageUrl || typeof chrome === 'undefined' || !chrome.runtime) return '';
  try {
    const u = new URL(chrome.runtime.getURL('/_favicon/'));
    u.searchParams.set('pageUrl', pageUrl);
    u.searchParams.set('size', String(size));
    return u.toString();
  } catch { return ''; }
}

function highlightMatch(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function getUiLocale() {
  const language = typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage
    ? chrome.i18n.getUILanguage()
    : navigator.language;
  return language || 'en';
}

function getShortcutHint() {
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
  return /\b(Mac|iPhone|iPad|iPod)\b/.test(platform) ? '⌘ K' : 'Ctrl K';
}

function msg(key, substitutions = []) {
  const values = Array.isArray(substitutions) ? substitutions : [substitutions];
  if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
    const translated = chrome.i18n.getMessage(key, values);
    if (translated) return translated;
  }
  return values.reduce(
    (text, value, index) => text.replaceAll(`$${index + 1}`, String(value)),
    FALLBACK_MESSAGES[key] || key
  );
}

function bookmarkCountLabel(count) {
  return msg(count === 1 ? 'bookmarkCount' : 'bookmarkCountPlural', String(count));
}

function localizeDocument() {
  const locale = getUiLocale().replace('_', '-');
  document.documentElement.lang = locale.startsWith('zh') ? 'zh-CN' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(node => {
    node.textContent = msg(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
    node.setAttribute('placeholder', msg(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(node => {
    node.setAttribute('aria-label', msg(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(node => {
    node.setAttribute('title', msg(node.dataset.i18nTitle));
  });
}

// ─── Toast ───────────────────────────────────────────────────
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// ─── Time ────────────────────────────────────────────────────
function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.homeClock.textContent = `${h}:${m}`;
  el.homeDate.textContent = now.toLocaleDateString(getUiLocale(), {
    month: 'long', day: 'numeric', weekday: 'long'
  }).replace(/,\s*/g, ' ');
  // Greeting
  const hour = now.getHours();
  let greeting;
  if (hour < 6) greeting = msg('greetingLate');
  else if (hour < 12) greeting = msg('greetingMorning');
  else if (hour < 14) greeting = msg('greetingNoon');
  else if (hour < 18) greeting = msg('greetingAfternoon');
  else greeting = msg('greetingEvening');
  if (el.homeGreeting) el.homeGreeting.textContent = greeting;
}

// ─── Theme ───────────────────────────────────────────────────
let systemWatcher = null;
let systemCallback = null;

function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  settings.theme = theme.id;

  // Stop previous system watcher
  if (systemWatcher && systemCallback) {
    systemWatcher.removeEventListener('change', systemCallback);
    systemWatcher = null;
    systemCallback = null;
  }

  if (theme.id === 'system') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    document.documentElement.dataset.theme = mq.matches ? 'dark' : 'light';
    systemCallback = e => {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    };
    mq.addEventListener('change', systemCallback);
    systemWatcher = mq;
  } else {
    document.documentElement.dataset.theme = theme.id;
  }
}

// ─── Sidebar collapse ────────────────────────────────────────
function applySidebarCollapsed(collapsed) {
  document.documentElement.setAttribute(
    'data-sidebar-collapsed',
    collapsed ? 'true' : 'false'
  );
  updateSidebarCollapseButtons();
}

function updateSidebarCollapseButtons() {
  const collapsed = Boolean(settings.sidebarCollapsed);
  [el.homeSidebarCollapseBtn, el.folderSidebarCollapseBtn].forEach(btn => {
    if (!btn) return;
    const label = collapsed ? msg('expandSidebar') : msg('collapseSidebar');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.setAttribute('aria-expanded', String(!collapsed));
  });
}

function toggleSidebarCollapsed() {
  settings.sidebarCollapsed = !settings.sidebarCollapsed;
  saveSettingsSilent();
  applySidebarCollapsed(settings.sidebarCollapsed);
}

// ─── Settings ────────────────────────────────────────────────
async function loadSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.sync.get(['markTabSettings']);
      settings = { ...DEFAULTS, ...(result.markTabSettings || {}) };
      // migrate legacy
      if (!result.markTabSettings) {
        const legacy = await chrome.storage.sync.get(['rainbowBookmarkSettings']);
        if (legacy.rainbowBookmarkSettings) {
          settings = { ...DEFAULTS, ...legacy.rainbowBookmarkSettings };
          delete settings.defaultEngine;
          await saveSettingsSilent();
        }
      }
    } else {
      settings = { ...DEFAULTS };
    }
  } catch { settings = { ...DEFAULTS }; }
}

async function saveSettingsSilent() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.sync.set({ markTabSettings: settings });
    }
  } catch {}
}

async function saveSettings() {
  await saveSettingsSilent();
  showToast(msg('settingsSaved'));
}

// ─── Bookmark Manager ────────────────────────────────────────
function flattenFolders(tree) {
  const folders = [];
  function traverse(node, depth = 0, parentPath = []) {
    if (node.children && !node.url) {
      const directBm = node.children.filter(c => c.url);
      const currentPath = [...parentPath.map(p => p.title), node.title || msg('untitled')];
      const pathIds = [...parentPath.map(p => p.id), node.id];
      const displayPath = currentPath.slice(2).filter(Boolean);
      folders.push({
        id: node.id, title: node.title || msg('untitled'), depth,
        displayDepth: Math.max(depth - 2, 0),
        path: currentPath, pathIds, displayPath: displayPath.length ? displayPath : [node.title || msg('untitled')],
        pathString: currentPath.join(' / '), bookmarks: directBm,
        bookmarkCount: countAllBookmarks(node), parentId: node.parentId,
        children: node.children.filter(c => c.children).map(c => c.id),
        isSystemFolder: depth <= 1
      });
      node.children.forEach(child => {
        if (child.children) traverse(child, depth + 1, [...parentPath, { id: node.id, title: node.title || msg('untitled') }]);
      });
    }
  }
  tree.forEach(root => traverse(root, 0, []));
  return folders;
}

function countAllBookmarks(folder) {
  let count = 0;
  if (folder.children) {
    folder.children.forEach(child => {
      if (child.url) count++;
      else if (child.children) count += countAllBookmarks(child);
    });
  }
  return count;
}

function getUserFolders(includeHidden = false) {
  return flatFolders.filter(f => !f.isSystemFolder && (includeHidden || isFolderVisible(f.id)));
}

function isFolderVisible(id) {
  return !settings.hiddenFolderIds.includes(id);
}

function toggleFolderVisibility(id) {
  const idx = settings.hiddenFolderIds.indexOf(id);
  if (idx > -1) settings.hiddenFolderIds.splice(idx, 1);
  else settings.hiddenFolderIds.push(id);
  saveSettingsSilent();
}

function isPinned(url) {
  return Boolean(url && settings.pinnedBookmarkUrls.includes(url));
}

function togglePin(url) {
  if (!url) return;
  const idx = settings.pinnedBookmarkUrls.indexOf(url);
  if (idx === -1) settings.pinnedBookmarkUrls.push(url);
  else settings.pinnedBookmarkUrls.splice(idx, 1);
  saveSettingsSilent();
  return idx === -1; // true = now pinned
}

function getPinnedBookmarks() {
  const seen = new Set();
  return allBookmarks.filter(b => {
    if (!b.url || seen.has(b.url) || !isPinned(b.url)) return false;
    seen.add(b.url);
    return true;
  });
}

// ─── Recent visits (MarkTab-opened bookmarks, MRU) ─────────────
function getRecentItems(count = 8) {
  const bookmarksByUrl = new Map();
  for (const b of allBookmarks) {
    if (b.url && !bookmarksByUrl.has(b.url)) bookmarksByUrl.set(b.url, b);
  }

  const times = settings.recentVisitTimes || {};
  const sources = settings.recentUrls
    .map(url => ({ url, lastVisitTime: times[url] || 0 }))
    .sort((a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0));

  const result = [];
  const seen = new Set();
  for (const item of sources) {
    if (result.length >= count) break;
    if (!item.url || seen.has(item.url)) continue;
    const bm = bookmarksByUrl.get(item.url);
    if (!bm) continue; // drop stale URLs that are no longer bookmarked
    seen.add(item.url);
    result.push({ ...bm, lastVisitTime: item.lastVisitTime || 0 });
  }
  return result;
}

function trackVisit(url) {
  if (!url) return;
  settings.recentUrls = [url, ...settings.recentUrls.filter(u => u !== url)].slice(0, 50);
  settings.recentVisitTimes = { ...(settings.recentVisitTimes || {}), [url]: Date.now() };
  saveSettingsSilent();
}

function searchBookmarks(query) {
  const q = query.toLowerCase().trim();
  if (!q) return { bookmarks: [], folders: [] };

  const scored = [];
  for (const b of allBookmarks) {
    const title = (b.title || '').toLowerCase();
    const url = (b.url || '').toLowerCase();
    const domain = getDomain(b.url || '').toLowerCase();
    let score = -1;
    if (title.includes(q)) score = title.startsWith(q) ? 3 : 2;
    else if (domain.includes(q)) score = 1;
    else if (url.includes(q)) score = 0;
    if (score >= 0) scored.push({ b, score });
  }
  scored.sort((a, b) => b.score - a.score);

  const folderResults = getUserFolders(true).filter(f =>
    f.title.toLowerCase().includes(q)
  );
  return {
    bookmarks: scored.map(s => s.b).slice(0, 12),
    folders: folderResults.slice(0, 6)
  };
}

async function loadBookmarks() {
  try {
    el.homeLoading.style.display = 'flex';
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      const tree = await chrome.bookmarks.getTree();
      bookmarkTree = tree;
      flatFolders = flattenFolders(tree);
      allBookmarks = [];
      flatFolders.forEach(f => { allBookmarks = allBookmarks.concat(f.bookmarks); });
      uncategorizedBookmarks = getUserFolders(true)
        .filter(f => f.isSystemFolder)
        .flatMap(f => f.bookmarks);
      renderHome();
      el.homeLoading.style.display = 'none';
    } else {
      showMockData();
    }
  } catch { showMockData(); }
}

// ─── Mock Data ──────────────────────────────────────────────
function showMockData() {
  const mockTree = [{
    id: '0', title: '', children: [{
      id: '1', title: 'Bookmarks Bar', children: [
        { id: 'b1', title: 'GitHub', url: 'https://github.com' },
        { id: 'b2', title: 'Notion', url: 'https://notion.so' },
        { id: 'b3', title: 'Figma', url: 'https://figma.com' },
        { id: 'b4', title: 'ChatGPT', url: 'https://chat.openai.com' },
        { id: 'b5', title: 'Claude', url: 'https://claude.ai' },
        { id: 'b6', title: 'Linear', url: 'https://linear.app' },
        { id: 'b7', title: 'Vercel', url: 'https://vercel.com' },
        {
          id: 'f1', title: 'Dev Tools', children: [
            { id: 'b8', title: 'MDN', url: 'https://developer.mozilla.org' },
            { id: 'b9', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
            { id: 'b10', title: 'Can I Use', url: 'https://caniuse.com' }
          ]
        },
        {
          id: 'f2', title: 'Design', children: [
            { id: 'b11', title: 'Dribbble', url: 'https://dribbble.com' },
            { id: 'b12', title: 'Awwwards', url: 'https://awwwards.com' }
          ]
        }
      ]
    }, {
      id: '2', title: 'Other Bookmarks', children: [
        { id: 'b13', title: 'YouTube', url: 'https://youtube.com' },
        { id: 'b14', title: 'Reddit', url: 'https://reddit.com' }
      ]
    }]
  }];
  bookmarkTree = mockTree;
  flatFolders = flattenFolders(mockTree);
  allBookmarks = [];
  flatFolders.forEach(f => { allBookmarks = allBookmarks.concat(f.bookmarks); });
  uncategorizedBookmarks = [];
  el.homeLoading.style.display = 'none';
  renderHome();
}

// ─── Home View ──────────────────────────────────────────────
function renderHome() {
  renderHomeSidebar();
  renderHomePinned();
  renderHomeRecent();
}

function renderHomeSidebar() {
  const folders = getUserFolders(false)
    .slice()
    .sort((a, b) => (b.bookmarkCount - a.bookmarkCount) || a.title.localeCompare(b.title, getUiLocale()));
  el.homeSidebarFolders.innerHTML = folders.map(folder => `
    <button class="home-sidebar-folder" type="button" data-folder-id="${escapeHtml(folder.id)}" title="${escapeHtml(folder.pathString)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="home-sidebar-folder-name">${escapeHtml(folder.title)}</span>
      <span class="home-sidebar-folder-count">${folder.bookmarkCount}</span>
    </button>
  `).join('');

  el.homeSidebarFolderTotal.textContent = String(getUserFolders(false).length);
  el.homeStatsBookmarks.textContent = String(allBookmarks.length);
  el.homeStatsFolders.textContent = String(getUserFolders(false).length);

  el.homeSidebarFolders.querySelectorAll('.home-sidebar-folder').forEach(btn => {
    btn.addEventListener('click', () => openFolderView(btn.dataset.folderId));
  });
}

function renderHomePinned() {
  const pinned = getPinnedBookmarks();
  const pinnedCountClass = `pinned-count-${Math.min(pinned.length, 8)}`;
  const contentStateClass = pinned.length > 1 ? 'has-multiple-pins' : pinned.length > 0 ? 'has-pinned-content' : 'is-empty';
  el.homePinnedGrid.className = `home-card-grid home-pinned-grid ${pinnedCountClass} ${contentStateClass}`;

  if (pinned.length === 0) {
    el.homePinnedGrid.innerHTML = createHomeEmptyState({
      icon: '<path d="M12 17v4"></path><path d="M6 17h12"></path><path d="m9 4 6 0 4 5-2.5 3 .9 4H6.6l.9-4L5 9z"></path>',
      title: msg('noPinnedBookmarksYet'),
      description: msg('pinnedEmptyDescription'),
      actionLabel: msg('searchAndPin'),
      action: 'search'
    });
    el.homePinnedGrid.querySelector('[data-home-empty-action="search"]')?.addEventListener('click', event => {
      openSearch(event.currentTarget);
    });
    return;
  }

  el.homePinnedGrid.innerHTML = pinned.map(b => createHomeCard(b)).join('');
  afterRenderCards(el.homePinnedGrid);
}

function renderHomeRecent() {
  if (!settings.homeShowRecent) { el.homeRecentGrid.innerHTML = ''; return; }
  const displayCount = Math.max(1, settings.homeRecentCount || 6);
  const allRecent = getRecentItems(displayCount + 1);
  if (!allRecent.length) {
    el.homeRecentGrid.className = 'home-recent-list';
    el.homeRecentGrid.innerHTML = createHomeEmptyState({
      icon: '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path>',
      title: msg('noRecentBookmarksYet'),
      description: msg('recentEmptyDescription')
    });
    const existing = el.homeRecentGrid.closest('.home-section')?.querySelector('.home-recent-view-all');
    if (existing) existing.remove();
    return;
  }
  const hasMore = allRecent.length > displayCount;
  const recent = allRecent.slice(0, displayCount);

  el.homeRecentGrid.className = 'home-recent-list';
  el.homeRecentGrid.innerHTML = `<div class="home-recent-surface">${recent.map(createRecentRow).join('')}</div>`;
  afterRenderRecent();

  const section = el.homeRecentGrid.closest('.home-section');
  const header = section?.querySelector('.section-header');
  if (!header) return;
  const existing = header.querySelector('.home-recent-view-all');
  if (hasMore) {
    if (!existing) {
      const btn = document.createElement('button');
      btn.className = 'home-recent-view-all';
      btn.textContent = msg('viewAll');
      btn.addEventListener('click', () => {
        const recentFull = getRecentItems(50);
        openFolderViewForBookmarks(recentFull, msg('recent'));
      });
      header.appendChild(btn);
    }
  } else if (existing) {
    existing.remove();
  }
}

function createRecentRow(bookmark) {
  const domain = getDomain(bookmark.url);
  const title = bookmark.title || msg('untitled');
  const initial = title.charAt(0).toUpperCase();
  const faviconUrl = getFaviconUrl(bookmark.url, 32);
  const timeLabel = formatRecentTime(bookmark.lastVisitTime);
  return `
    <a class="home-recent-item" href="${escapeHtml(bookmark.url)}" data-url="${escapeHtml(bookmark.url)}" title="${escapeHtml(title)}">
      <div class="home-recent-favicon">
        ${faviconUrl ? `<img class="home-recent-favicon-img" src="${escapeHtml(faviconUrl)}" alt="" loading="lazy" width="16" height="16">` : ''}
        <span class="home-recent-favicon-letter">${escapeHtml(initial)}</span>
      </div>
      <div class="home-recent-item-content">
        <div class="home-recent-item-title">${escapeHtml(title)}</div>
        <div class="home-recent-item-domain">${escapeHtml(domain)}</div>
      </div>
      ${timeLabel ? `<span class="home-recent-time">${escapeHtml(timeLabel)}</span>` : ''}
    </a>
  `;
}

function formatRecentTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return '';

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return msg('justNow');
  if (minutes < 60) return msg('minutesAgo', String(minutes));

  const hours = Math.floor(minutes / 60);
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startToday.getTime() - startDate.getTime()) / 86400000);

  if (dayDiff === 0) return msg('hoursAgo', String(hours));
  if (dayDiff === 1) return msg('yesterday');
  if (dayDiff > 1 && dayDiff < 7) return msg('daysAgo', String(dayDiff));

  // Older than a week: keep the real date, localized as "M月D日" / "Mar 5".
  const locale = getUiLocale().toLowerCase();
  if (locale.startsWith('zh')) return `${date.getMonth() + 1}月${date.getDate()}日`;
  return date.toLocaleDateString(getUiLocale(), { month: 'short', day: 'numeric' });
}

function afterRenderRecent() {
  el.homeRecentGrid.querySelectorAll('.home-recent-favicon-img').forEach(img => {
    const wrapper = img.closest('.home-recent-favicon');
    img.addEventListener('load', () => wrapper.classList.add('loaded'), { once: true });
    img.addEventListener('error', () => { wrapper.classList.remove('loaded'); img.remove(); }, { once: true });
    if (img.complete && img.naturalWidth > 0) wrapper.classList.add('loaded');
  });
  el.homeRecentGrid.querySelectorAll('.home-recent-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      trackVisit(item.dataset.url);
      window.location.href = item.href;
    });
  });
}

function createHomeEmptyState({ icon, title, description, actionLabel = '', action = '' }) {
  const actionMarkup = actionLabel
    ? `<button class="home-empty-action" type="button" data-home-empty-action="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>`
    : '';
  return `
    <div class="home-empty">
      <span class="home-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${icon}</svg>
      </span>
      <span class="home-empty-copy">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(description)}</span>
      </span>
      ${actionMarkup}
    </div>`;
}

function openFolderViewForBookmarks(bookmarks, title) {
  activeFolderId = '__recent';
  renderSidebar();
  renderFolderContentForBookmarks(bookmarks, title);
  showView('folder');
}

function createHomeCard(bookmark) {
  const domain = getDomain(bookmark.url);
  const title = bookmark.title || msg('untitled');
  const initial = title.charAt(0).toUpperCase();
  const faviconUrl = getFaviconUrl(bookmark.url, 64);
  const pinned = isPinned(bookmark.url);
  return `
    <a class="home-card" href="${escapeHtml(bookmark.url)}" data-url="${escapeHtml(bookmark.url)}" title="${escapeHtml(title)}">
      <div class="home-card-favicon">
        ${faviconUrl ? `<img class="home-card-favicon-img" src="${escapeHtml(faviconUrl)}" alt="" loading="lazy" width="24" height="24">` : ''}
        <span class="home-card-favicon-letter">${escapeHtml(initial)}</span>
      </div>
      <div class="home-card-copy">
        <span class="home-card-title">${escapeHtml(title)}</span>
        <span class="home-card-domain">${escapeHtml(domain)}</span>
      </div>
    </a>
  `;
}

function afterRenderCards(container) {
  container.querySelectorAll('.home-card-favicon-img').forEach(img => {
    const wrapper = img.closest('.home-card-favicon');
    img.addEventListener('load', () => wrapper.classList.add('loaded'), { once: true });
    img.addEventListener('error', () => { wrapper.classList.remove('loaded'); img.remove(); }, { once: true });
    if (img.complete && img.naturalWidth > 0) wrapper.classList.add('loaded');
  });
  container.querySelectorAll('.home-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      trackVisit(card.dataset.url);
      window.location.href = card.href;
    });
  });
}

// ─── Folder View ────────────────────────────────────────────
let activeFolderId = null;

function openFolderView(folderId) {
  activeFolderId = folderId;
  renderSidebar();
  renderFolderContent(folderId);
  showView('folder');
}

function renderSidebar() {
  const folders = getUserFolders(false);

  el.sidebarNav.innerHTML = folders.map(createSidebarFolderItem).join('');
  el.folderSidebarFolderTotal.textContent = String(folders.length);
  el.folderStatsBookmarks.textContent = String(allBookmarks.length);
  el.folderStatsFolders.textContent = String(folders.length);

  document.querySelectorAll('[data-folder-nav]').forEach(item => {
    item.classList.toggle('active', item.dataset.folderNav === 'recent' && activeFolderId === '__recent');
  });

  el.sidebarNav.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.folderId) {
        openFolderView(item.dataset.folderId);
      }
    });
  });
}

function createSidebarFolderItem(folder) {
  const isActive = activeFolderId === folder.id;
  const isHidden = !isFolderVisible(folder.id);
  return `
    <button class="home-sidebar-folder sidebar-nav-item ${isActive ? 'active' : ''} ${isHidden ? 'hidden' : ''}" data-folder-id="${escapeHtml(folder.id)}" title="${escapeHtml(folder.title)}">
      <svg class="sidebar-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="sidebar-folder-name">${escapeHtml(folder.title)}</span>
      <span class="sidebar-folder-count">${folder.bookmarkCount}</span>
    </button>
  `;
}

function renderFolderContent(folderId) {
  const folder = flatFolders.find(f => f.id === folderId);
  if (!folder) return;
  renderFolderContentForBookmarks(folder.bookmarks, folder.title, folder.displayPath.join(' / '));
}

function renderFolderContentForBookmarks(bookmarks, title, breadcrumb = '') {
  el.folderTitle.textContent = title;
  el.folderCount.textContent = bookmarkCountLabel(bookmarks.length);
  el.folderSearchInput.placeholder = msg('searchInFolder');

  if (!bookmarks.length) {
    el.folderBookmarksGrid.innerHTML = '';
    el.folderEmpty.style.display = 'flex';
    return;
  }
  el.folderEmpty.style.display = 'none';
  el.folderBookmarksGrid.innerHTML = bookmarks.map(b => createFolderCard(b)).join('');
  afterRenderFolderCards();
}

function createFolderCard(bookmark) {
  const domain = getDomain(bookmark.url);
  const title = bookmark.title || msg('untitled');
  const initial = title.charAt(0).toUpperCase();
  const faviconUrl = getFaviconUrl(bookmark.url, 64);
  const pinned = isPinned(bookmark.url);
  return `
    <div class="folder-card" data-url="${escapeHtml(bookmark.url)}">
      <button class="folder-card-pin ${pinned ? 'pinned' : ''}" data-url="${escapeHtml(bookmark.url)}" aria-label="${pinned ? msg('unpin') : msg('pin')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14" aria-hidden="true">
          <path d="M12 17v5"></path><path d="M5 17h14"></path>
          <path d="M15 3.6 20.4 9l-3 3 1.1 4H5.5l1.1-4-3-3L9 3.6"></path>
        </svg>
      </button>
      <a class="folder-card-link" href="${escapeHtml(bookmark.url)}" data-url="${escapeHtml(bookmark.url)}">
        <div class="folder-card-favicon">
          ${faviconUrl ? `<img class="folder-card-favicon-img" src="${escapeHtml(faviconUrl)}" alt="" loading="lazy" width="24" height="24">` : ''}
          <span class="folder-card-favicon-letter">${escapeHtml(initial)}</span>
        </div>
        <span class="folder-card-title">${escapeHtml(title)}</span>
        <span class="folder-card-domain">${escapeHtml(domain)}</span>
      </a>
    </div>
  `;
}

function afterRenderFolderCards() {
  el.folderBookmarksGrid.querySelectorAll('.folder-card-favicon-img').forEach(img => {
    const wrapper = img.closest('.folder-card-favicon');
    img.addEventListener('load', () => wrapper.classList.add('loaded'), { once: true });
    img.addEventListener('error', () => { wrapper.classList.remove('loaded'); img.remove(); }, { once: true });
    if (img.complete && img.naturalWidth > 0) wrapper.classList.add('loaded');
  });
  el.folderBookmarksGrid.querySelectorAll('.folder-card-link').forEach(link => {
    link.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      trackVisit(link.dataset.url);
      window.location.href = link.href;
    });
  });
  el.folderBookmarksGrid.querySelectorAll('.folder-card-pin').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      togglePin(btn.dataset.url);
      btn.classList.toggle('pinned');
      btn.setAttribute('aria-label', btn.classList.contains('pinned') ? msg('unpin') : msg('pin'));
      renderHome();
      showToast(btn.classList.contains('pinned') ? msg('pinned') : msg('unpinned'));
    });
  });
}

// ─── Search result favicon loading ────────────────────────
function setupSearchFavicons() {
  document.querySelectorAll('.search-result-favicon-img').forEach(img => {
    const wrapper = img.closest('.search-result-favicon');
    if (!wrapper) return;
    img.addEventListener('load', () => wrapper.classList.add('loaded'), { once: true });
    img.addEventListener('error', () => { wrapper.classList.remove('loaded'); img.remove(); }, { once: true });
    if (img.complete && img.naturalWidth > 0) wrapper.classList.add('loaded');
  });
}

// ─── Folder search filter ──────────────────────────────────
function filterFolderBookmarks(query) {
  const q = query.toLowerCase().trim();
  if (activeFolderId === '__recent') {
    const bookmarks = getRecentItems(100);
    const filtered = q ? bookmarks.filter(b =>
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.url && b.url.toLowerCase().includes(q))
    ) : bookmarks;
    renderFolderContentForBookmarks(filtered, msg('recent'));
    return;
  }
  const folder = flatFolders.find(f => f.id === activeFolderId);
  if (!folder) return;
  const bookmarks = q ? folder.bookmarks.filter(b =>
    (b.title && b.title.toLowerCase().includes(q)) ||
    (b.url && b.url.toLowerCase().includes(q))
  ) : folder.bookmarks;
  renderFolderContentForBookmarks(bookmarks, folder.title);
  if (!q) el.folderSearchInput.placeholder = msg('searchInFolder');
}

// ─── Search Panel (Spotlight Style) ─────────────────────────
let searchResultIndex = -1;
let searchResults = [];

function openSearch(origin) {
  searchReturnFocus = resolveFocusOrigin(origin, el.homeSearchInput);
  closeMobileDrawers();
  el.searchPanelOverlay.style.display = 'flex';
  el.searchPanelOverlay.setAttribute('aria-hidden', 'false');
  el.searchPanel.style.display = 'flex';
  el.searchPanelInput.value = '';
  el.searchPanelInput.focus();
  searchResultIndex = -1;
  searchResults = [];
  el.searchBookmarkItems.innerHTML = '';
  el.searchFolderItems.innerHTML = '';
  el.searchWebItem.innerHTML = '';
  el.searchEmpty.style.display = 'flex';
  el.searchEmpty.querySelector('p').textContent = msg('startTypingToSearch');
  updateBodyScrollLock();
}

function closeSearch() {
  blurFocusWithin(el.searchPanel);
  el.searchPanelOverlay.style.display = 'none';
  el.searchPanelOverlay.setAttribute('aria-hidden', 'true');
  el.searchPanel.style.display = 'none';
  updateBodyScrollLock();
  searchResultIndex = -1;
  searchResults = [];
  const returnFocus = resolveAccessibleReturnFocus(searchReturnFocus) || el.homeSearchInput;
  if (returnFocus === el.homeSearchInput) suppressSearchTriggerFocus = true;
  restoreFocus(returnFocus);
  searchReturnFocus = null;
}

function handleSearchInput() {
  const query = el.searchPanelInput.value;
  if (!query.trim()) {
    el.searchBookmarkItems.innerHTML = '';
    el.searchFolderItems.innerHTML = '';
    el.searchWebItem.innerHTML = '';
    el.searchEmpty.style.display = 'flex';
    el.searchEmpty.querySelector('p').textContent = msg('startTypingToSearch');
    return;
  }

  el.searchEmpty.style.display = 'none';
  const { bookmarks, folders } = searchBookmarks(query);

  // Render bookmark results
  if (bookmarks.length) {
    el.searchBookmarkItems.innerHTML = bookmarks.map((b, i) => createSearchBookmarkItem(b, query, i)).join('');
  } else {
    el.searchBookmarkItems.innerHTML = '';
  }

  // Render folder results
  if (folders.length) {
    el.searchFolderItems.innerHTML = folders.map((f, i) => createSearchFolderItem(f, query, bookmarks.length + i)).join('');
  } else {
    el.searchFolderItems.innerHTML = '';
  }

  // Setup favicon loading for search results
  setupSearchFavicons();

  // Web search item
  el.searchWebItem.innerHTML = `
    <button class="search-result-item search-web-item" data-index="${bookmarks.length + folders.length}" data-action="web">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <div class="search-result-content">
        <span class="search-result-title">${escapeHtml(msg('searchWebFor', query.trim()))}</span>
      </div>
    </button>
  `;

  // Collect all result items
  searchResults = [];
  el.searchPanelResults.querySelectorAll('.search-result-item').forEach(item => {
    searchResults.push(item);
  });

  // Auto-highlight first
  searchResultIndex = 0;
  updateSearchHighlight();

  // Update group visibility
  document.querySelectorAll('.search-group').forEach(g => {
    const items = g.querySelector('.search-panel-items');
    g.style.display = items && items.children.length ? 'block' : 'none';
  });
}

function createSearchBookmarkItem(bookmark, query, index) {
  const domain = getDomain(bookmark.url);
  const title = bookmark.title || msg('untitled');
  const initial = title.charAt(0).toUpperCase();
  const faviconUrl = getFaviconUrl(bookmark.url, 32);
  return `
    <button class="search-result-item" data-index="${index}" data-url="${escapeHtml(bookmark.url)}" data-action="bookmark">
      <div class="search-result-favicon">
        ${faviconUrl ? `<img class="search-result-favicon-img" src="${escapeHtml(faviconUrl)}" alt="" loading="lazy" width="16" height="16">` : ''}
        <span class="search-result-favicon-letter">${escapeHtml(initial)}</span>
      </div>
      <div class="search-result-content">
        <span class="search-result-title">${highlightMatch(title, query)}</span>
        <span class="search-result-domain">${highlightMatch(domain, query)}</span>
      </div>
    </button>
  `;
}

function createSearchFolderItem(folder, query, index) {
  return `
    <button class="search-result-item" data-index="${index}" data-folder-id="${escapeHtml(folder.id)}" data-action="folder">
      <div class="search-result-favicon search-result-folder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18" aria-hidden="true">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="search-result-content">
        <span class="search-result-title">${highlightMatch(folder.title, query)}</span>
        <span class="search-result-domain">${escapeHtml(bookmarkCountLabel(folder.bookmarkCount))}</span>
      </div>
    </button>
  `;
}

function updateSearchHighlight() {
  searchResults.forEach((item, i) => {
    item.classList.toggle('selected', i === searchResultIndex);
  });
  const active = searchResults[searchResultIndex];
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'auto' });
}

function navigateSearch(direction) {
  if (!searchResults.length) return;
  searchResultIndex = (searchResultIndex + direction + searchResults.length) % searchResults.length;
  updateSearchHighlight();
}

function activateSearchResult() {
  const item = searchResults[searchResultIndex];
  if (!item) return;
  const action = item.dataset.action;
  if (action === 'bookmark') {
    trackVisit(item.dataset.url);
    window.location.href = item.dataset.url;
  } else if (action === 'folder') {
    closeSearch();
    openFolderView(item.dataset.folderId);
  } else if (action === 'web') {
    performWebSearch(el.searchPanelInput.value);
  }
}

async function performWebSearch(query) {
  if (!query.trim()) return;
  if (typeof chrome !== 'undefined' && chrome.search?.query) {
    try {
      await chrome.search.query({ text: query, disposition: 'CURRENT_TAB' });
    } catch { showToast(msg('searchFailed')); }
  } else {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
}

function renderSettingsPanel() {
  const currentTheme = settings.theme;
  el.themeOptions.innerHTML = THEMES.map(theme => `
    <button class="theme-option ${theme.id === currentTheme ? 'active' : ''}" type="button" data-theme-id="${escapeHtml(theme.id)}">
      <span class="theme-option-name">${escapeHtml(msg(`theme${theme.name}`) || theme.name)}</span>
      <span class="theme-option-desc">${escapeHtml(theme.desc)}</span>
    </button>
  `).join('');

  el.settingsFolderList.innerHTML = getUserFolders(true)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, getUiLocale()))
    .map(folder => {
      const visible = isFolderVisible(folder.id);
      return `
        <div class="settings-folder-item">
          <span class="settings-folder-name">${escapeHtml(folder.title)}</span>
          <span class="settings-folder-count">${folder.bookmarkCount}</span>
          <button class="settings-folder-toggle" type="button" data-folder-id="${escapeHtml(folder.id)}">${escapeHtml(msg(visible ? 'hide' : 'show'))}</button>
        </div>
      `;
    }).join('');

  el.themeOptions.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeId);
      saveSettingsSilent();
      renderSettingsPanel();
    });
  });

  el.settingsFolderList.querySelectorAll('.settings-folder-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleFolderVisibility(btn.dataset.folderId);
      renderHome();
      renderSidebar();
      renderSettingsPanel();
      if (activeFolderId && !isFolderVisible(activeFolderId)) {
        returnHome();
      }
    });
  });
}

function openSettingsPanel(origin) {
  settingsReturnFocus = resolveFocusOrigin(origin);
  closeMobileDrawers();
  renderSettingsPanel();
  el.settingsPanelOverlay.style.display = 'flex';
  el.settingsPanelOverlay.setAttribute('aria-hidden', 'false');
  updateBodyScrollLock();
  requestAnimationFrame(() => el.settingsPanelClose.focus());
}

function closeSettingsPanel() {
  blurFocusWithin(el.settingsPanel);
  el.settingsPanelOverlay.style.display = 'none';
  el.settingsPanelOverlay.setAttribute('aria-hidden', 'true');
  updateBodyScrollLock();
  restoreFocus(settingsReturnFocus);
  settingsReturnFocus = null;
}

function isMobileLayout() {
  return window.innerWidth <= 1200;
}

function isDrawerOpen() {
  return isMobileLayout() && Boolean(el.homeSidebar?.classList.contains('open') || el.folderSidebar?.classList.contains('open'));
}

function syncDrawerAccessibility() {
  const drawerLayout = isMobileLayout();
  const pairs = [
    [el.homeSidebar, el.homeSidebarToggle],
    [el.folderSidebar, el.sidebarToggle]
  ];

  pairs.forEach(([sidebar, toggle]) => {
    if (!sidebar || !toggle) return;
    if (!drawerLayout) sidebar.classList.remove('open');
    const open = drawerLayout && sidebar.classList.contains('open');
    sidebar.inert = drawerLayout && !open;
    sidebar.setAttribute('aria-hidden', String(drawerLayout && !open));
    toggle.setAttribute('aria-expanded', String(open));
  });

  const homeOpen = drawerLayout && el.homeSidebar.classList.contains('open');
  const folderOpen = drawerLayout && el.folderSidebar.classList.contains('open');
  el.homeMain.inert = homeOpen;
  el.folderContent.inert = folderOpen;
  el.sidebarToggle.inert = folderOpen;

  const open = isDrawerOpen();
  el.mobileDrawerScrim.inert = !open;
  el.mobileDrawerScrim.tabIndex = open ? 0 : -1;
  el.mobileDrawerScrim.setAttribute('aria-hidden', String(!open));
}

function updateBodyScrollLock() {
  const modalOpen =
    el.settingsPanelOverlay.style.display === 'flex' ||
    el.searchPanelOverlay.style.display === 'flex';
  const shouldLock =
    modalOpen ||
    isDrawerOpen();
  el.homeView.inert = modalOpen;
  el.folderView.inert = modalOpen;
  document.body.classList.toggle('search-open', shouldLock);
  document.body.classList.toggle('drawer-open', isDrawerOpen());
}

function closeMobileDrawers({ restoreTrigger = false } = {}) {
  const returnFocus = drawerReturnFocus;
  blurFocusWithin(el.homeSidebar);
  blurFocusWithin(el.folderSidebar);
  el.homeSidebar?.classList.remove('open');
  el.folderSidebar?.classList.remove('open');
  drawerReturnFocus = null;
  syncDrawerAccessibility();
  updateBodyScrollLock();
  if (restoreTrigger) restoreFocus(returnFocus);
}

function toggleMobileDrawer(target, trigger) {
  if (!isMobileLayout() || !target) return;
  const shouldOpen = !target.classList.contains('open');
  if (!shouldOpen) {
    closeMobileDrawers({ restoreTrigger: true });
    return;
  }
  closeMobileDrawers();
  drawerReturnFocus = resolveFocusOrigin(trigger);
  target.classList.add('open');
  syncDrawerAccessibility();
  updateBodyScrollLock();
  requestAnimationFrame(() => getFocusableElements(target)[0]?.focus());
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

// ─── Theme Cycle ────────────────────────────────────────────
function cycleTheme() {
  const themeIds = THEMES.map(t => t.id);
  const current = settings.theme;
  const idx = themeIds.indexOf(current);
  const next = themeIds[(idx + 1) % themeIds.length];
  applyTheme(next);
  saveSettingsSilent();
  const names = { light: msg('themeLight'), dark: msg('themeDark'), system: msg('themeSystem') };
  showToast(msg('theme', names[next] || next));
}

// ─── View Manager ───────────────────────────────────────────
function returnHome() {
  renderHome();
  showView('home');
  closeMobileDrawers();
}

function showView(view) {
  el.homeView.style.display = view === 'home' ? '' : 'none';
  el.folderView.style.display = view === 'folder' ? '' : 'none';
  el.homeFab.style.display = window.innerWidth <= 768 && view === 'home' ? 'flex' : 'none';
  closeMobileDrawers();
}

// ─── Event Setup ────────────────────────────────────────────
function setupEvents() {
  if (el.homeSearchShortcut) {
    el.homeSearchShortcut.textContent = getShortcutHint();
  }

  // Home search: click triggers spotlight panel
  el.homeSearchInput.addEventListener('focus', e => {
    if (suppressSearchTriggerFocus) {
      suppressSearchTriggerFocus = false;
      return;
    }
    const trigger = e.target;
    e.target.blur();
    openSearch(trigger);
  });
  el.homeSearchInput.addEventListener('click', e => {
    if (el.searchPanelOverlay.style.display !== 'flex') openSearch(e.currentTarget);
  });
  el.homeSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      openSearch(e.currentTarget);
    }
  });

  // Folder search — inline filtering
  el.folderSearchInput.addEventListener('input', debounce(function() {
    filterFolderBookmarks(this.value.trim());
  }, 80));
  el.folderSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      el.folderSearchInput.value = '';
      filterFolderBookmarks('');
      el.folderSearchInput.blur();
    }
  });

  // Home FAB — cycle theme
  el.homeFab.addEventListener('click', cycleTheme);
  el.homeSidebarThemeBtn.addEventListener('click', cycleTheme);
  el.folderSidebarThemeBtn.addEventListener('click', cycleTheme);
  el.homeSidebarSettingsBtn.addEventListener('click', openSettingsPanel);
  el.folderSidebarSettingsBtn.addEventListener('click', openSettingsPanel);
  el.homeSidebarCollapseBtn?.addEventListener('click', toggleSidebarCollapsed);
  el.folderSidebarCollapseBtn?.addEventListener('click', toggleSidebarCollapsed);

  // Sidebar home button
  el.sidebarHomeBtn.addEventListener('click', returnHome);
  el.folderSidebarHomeBtn.addEventListener('click', returnHome);

  document.querySelectorAll('[data-home-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.homeNav;
      const map = {
        top: el.homeHero,
        pinned: $('homePinnedSection'),
        recent: $('homeRecentSection')
      };
      document.querySelectorAll('[data-home-nav]').forEach(btn => btn.classList.toggle('active', btn === item));
      map[target]?.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
      closeMobileDrawers();
    });
  });

  document.querySelectorAll('[data-folder-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.folderNav;
      if (target === 'recent') {
        activeFolderId = '__recent';
        renderFolderContentForBookmarks(getRecentItems(50), msg('recent'));
        renderSidebar();
        closeMobileDrawers();
        return;
      }
      returnHome();
      if (target === 'pinned') {
        requestAnimationFrame(() => $('homePinnedSection')?.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' }));
      }
    });
  });

  // Sidebar toggle (mobile)
  el.homeSidebarToggle?.addEventListener('click', () => {
    toggleMobileDrawer(el.homeSidebar, el.homeSidebarToggle);
  });

  el.sidebarToggle?.addEventListener('click', () => {
    toggleMobileDrawer(el.folderSidebar, el.sidebarToggle);
  });

  document.querySelectorAll('[data-folder-view-mode]').forEach(button => {
    button.addEventListener('click', () => {
      const listMode = button.dataset.folderViewMode === 'list';
      el.folderBookmarksGrid.classList.toggle('list-view', listMode);
      document.querySelectorAll('[data-folder-view-mode]').forEach(item => {
        item.classList.toggle('active', item === button);
      });
    });
  });

  el.folderContent?.addEventListener('click', () => {
    if (isMobileLayout()) closeMobileDrawers();
  });
  el.homeSections?.addEventListener('click', () => {
    if (isMobileLayout()) closeMobileDrawers();
  });
  el.mobileDrawerScrim?.addEventListener('click', () => closeMobileDrawers({ restoreTrigger: true }));

  // Search panel
  el.searchPanelInput.addEventListener('input', debounce(handleSearchInput, 60));
  el.searchPanelClose.addEventListener('click', closeSearch);
  el.searchPanelOverlay.addEventListener('click', closeSearch);
  el.settingsPanelClose.addEventListener('click', closeSettingsPanel);
  el.settingsPanelOverlay.addEventListener('click', e => {
    if (e.target === el.settingsPanelOverlay) closeSettingsPanel();
  });
  el.settingsPanel.addEventListener('click', e => e.stopPropagation());
  el.searchPanel.addEventListener('click', e => e.stopPropagation());
  window.addEventListener('resize', () => closeMobileDrawers());

  // Search result clicks (delegated)
  el.searchPanelResults.addEventListener('click', e => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    const idx = parseInt(item.dataset.index);
    if (!isNaN(idx)) { searchResultIndex = idx; activateSearchResult(); }
  });
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const isSearchOpen = el.searchPanel.style.display === 'flex';
    const isSettingsOpen = el.settingsPanelOverlay.style.display === 'flex';

    // Ctrl/Cmd + K always focuses the search box; "/" toggles the panel.
    if (!isSettingsOpen && (e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (isSearchOpen) el.searchPanelInput.focus();
      else openSearch();
      return;
    }

    if (!isSettingsOpen && e.key === '/' && !isInputFocused()) {
      e.preventDefault();
      if (isSearchOpen) closeSearch();
      else openSearch();
      return;
    }

    if (isSettingsOpen && e.key === 'Escape') {
      e.preventDefault();
      closeSettingsPanel();
      return;
    }

    if (isSettingsOpen && e.key === 'Tab') {
      trapFocus(el.settingsPanel, e);
      return;
    }

    if (isSearchOpen) {
      if (e.key === 'Tab') {
        trapFocus(el.searchPanel, e);
        return;
      }
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeSearch();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateSearch(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateSearch(-1);
          break;
        case 'Enter':
          if (e.shiftKey) {
            // Shift+Enter: web search
            performWebSearch(el.searchPanelInput.value);
          } else {
            e.preventDefault();
            activateSearchResult();
          }
          break;
      }
      return;
    }

    if (isDrawerOpen() && e.key === 'Escape') {
      e.preventDefault();
      closeMobileDrawers({ restoreTrigger: true });
      return;
    }

    if (isDrawerOpen() && e.key === 'Tab') {
      const openDrawer = el.homeSidebar.classList.contains('open') ? el.homeSidebar : el.folderSidebar;
      trapFocus(openDrawer, e);
    }
  });
}

function isInputFocused() {
  const active = document.activeElement;
  return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
}

// ─── Init ───────────────────────────────────────────────────
async function init() {
  localizeDocument();
  updateTime();
  setInterval(updateTime, 1000);

  await loadSettings();
  applyTheme(settings.theme);
  applySidebarCollapsed(settings.sidebarCollapsed);
  setupEvents();
  setupKeyboard();
  syncDrawerAccessibility();
  await loadBookmarks();
  showView('home');
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
