/* My Media Player — a personal audio/video player that runs entirely in the browser.
 * Files you add are stored locally in the browser's IndexedDB; nothing is uploaded anywhere. */
'use strict';

/* =========================================================================
 * Icons
 * ========================================================================= */
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  playLine: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M5 5l10 7-10 7z"/><path d="M19 5v14"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M19 5L9 12l10 7z"/><path d="M5 5v14"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
  volume: '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  video: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 8l-6 4 6 4z"/></svg>',
  library: '<svg viewBox="0 0 24 24"><path d="M4 4v16M9 4v16"/><path d="M14 4l6 16"/></svg>',
  queue: '<svg viewBox="0 0 24 24"><path d="M3 6h13M3 12h13M3 18h8"/><path d="M17 15v6l5-3z"/></svg>',
  tagOff: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  chevUp: '<svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>',
  chevDown: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/></svg>',
  addList: '<svg viewBox="0 0 24 24"><path d="M3 6h12M3 12h12M3 18h7"/><path d="M18 14v8M14 18h8"/></svg>',
  playNext: '<svg viewBox="0 0 24 24"><path d="M3 6h12M3 12h8"/><path d="M15 12v8l6-4z"/></svg>',
  remove: '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  palette: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/></svg>',
  grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>',
};
const EQ = '<span class="eq"><i></i><i></i><i></i></span>';
const CATEGORY_COLORS = ['#e4572e', '#2e86ab', '#3bb273', '#f4a259', '#8e6bbf', '#e15a97', '#17a2a2', '#c8a31d', '#6c757d'];

/* =========================================================================
 * Small helpers
 * ========================================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
  : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}
function fmtLong(sec) {
  sec = Math.round(sec || 0);
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  if (h) return `${h} hr ${m} min`;
  if (sec < 60) return `${sec} sec`;
  return `${m} min`;
}
function fmtSize(b) {
  if (!b) return '0 MB';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return (b / 1024 ** i).toFixed(i >= 3 ? 1 : 0) + ' ' + u[i];
}
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Fisher–Yates shuffle (returns a new array). */
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =========================================================================
 * Storage (IndexedDB for library data + files, localStorage for small prefs)
 * ========================================================================= */
const DB_NAME = 'my-media-player';
const STORES = ['media', 'blobs', 'categories', 'playlists'];
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      for (const s of STORES) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function reqP(r) {
  return new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
}
const idbAll = store => reqP(db.transaction(store).objectStore(store).getAll());
const idbGet = (store, id) => reqP(db.transaction(store).objectStore(store).get(id));
/** Run several writes atomically. fn receives a function to get object stores. */
function idbWrite(stores, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(stores, 'readwrite');
    fn(name => t.objectStore(name));
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Transaction aborted'));
  });
}
const idbPut = (store, value) => idbWrite([store], s => s(store).put(value));

const PREF_DEFAULTS = { volume: 1, muted: false, repeat: 'off', shuffle: {}, sort: 'added', stageCollapsed: false };
let prefs = { ...PREF_DEFAULTS };
try { prefs = { ...PREF_DEFAULTS, ...JSON.parse(localStorage.getItem('mmp-prefs') || '{}') }; } catch { /* ignore */ }
function savePrefs() { try { localStorage.setItem('mmp-prefs', JSON.stringify(prefs)); } catch { /* ignore */ } }

/* =========================================================================
 * App state
 * ========================================================================= */
const state = {
  media: new Map(),       // id -> { id, name, fileName, type, mime, size, duration, added, categories: [] }
  categories: new Map(),  // id -> { id, name, color, created }
  playlists: new Map(),   // id -> { id, name, items: [mediaId], shuffle, created }
  view: { type: 'library' }, // library | uncategorized | queue | category(id) | playlist(id)
  search: '',
  typeFilter: 'all',      // all | audio | video
  selected: new Set(),
};
const player = {
  queue: [],       // play order (possibly shuffled)
  base: [],        // original order of the context that started playback
  index: -1,
  contextKey: null,
  contextLabel: '',
  url: null,
  loadToken: 0,
};
const video = $('#video');

/* =========================================================================
 * Views
 * ========================================================================= */
const viewKey = v => v.type === 'category' ? 'cat:' + v.id : v.type === 'playlist' ? 'pl:' + v.id : v.type;
function viewTitle(v = state.view) {
  switch (v.type) {
    case 'library': return 'All media';
    case 'uncategorized': return 'Uncategorized';
    case 'queue': return 'Now playing';
    case 'category': return state.categories.get(v.id)?.name ?? 'Category';
    case 'playlist': return state.playlists.get(v.id)?.name ?? 'Playlist';
  }
  return '';
}
function contextLabelFor(key) {
  if (!key) return '';
  if (key.startsWith('pl:')) return 'Playlist · ' + (state.playlists.get(key.slice(3))?.name ?? '');
  if (key.startsWith('cat:')) return 'Category · ' + (state.categories.get(key.slice(4))?.name ?? '');
  if (key === 'uncategorized') return 'Uncategorized';
  return 'Library';
}

function getShuffle(key) {
  if (!key) return false;
  if (key.startsWith('pl:')) return !!state.playlists.get(key.slice(3))?.shuffle;
  return !!prefs.shuffle[key];
}
function setShuffle(key, on) {
  if (!key) return;
  if (key.startsWith('pl:')) {
    const p = state.playlists.get(key.slice(3));
    if (p && p.shuffle !== on) { p.shuffle = on; idbPut('playlists', p); }
  } else {
    prefs.shuffle[key] = on; savePrefs();
  }
}

/** All ids in the current view (before search / type filter), in display order. */
function viewBaseIds(v = state.view) {
  if (v.type === 'queue') return player.queue.filter(id => state.media.has(id));
  if (v.type === 'playlist') {
    const p = state.playlists.get(v.id);
    return p ? p.items.filter(id => state.media.has(id)) : [];
  }
  let items = [...state.media.values()];
  if (v.type === 'category') items = items.filter(m => m.categories.includes(v.id));
  if (v.type === 'uncategorized') items = items.filter(m => !m.categories.some(c => state.categories.has(c)));
  const sorters = {
    added: (a, b) => b.added - a.added,
    name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
    duration: (a, b) => (b.duration || 0) - (a.duration || 0),
  };
  items.sort(sorters[prefs.sort] || sorters.added);
  return items.map(m => m.id);
}
/** Ids actually shown (search + type filter applied). */
function viewItems() {
  const q = state.search.trim().toLowerCase();
  return viewBaseIds().filter(id => {
    const m = state.media.get(id);
    if (state.typeFilter !== 'all' && m.type !== state.typeFilter) return false;
    if (q) {
      const catNames = m.categories.map(c => state.categories.get(c)?.name ?? '').join(' ');
      if (!(m.name + ' ' + (m.fileName || '') + ' ' + catNames).toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function setView(v) {
  state.view = v;
  state.selected.clear();
  state.search = '';
  closeSidebar();
  render();
  $('#list').scrollTop = 0;
}

/* =========================================================================
 * Rendering
 * ========================================================================= */
function render() {
  renderSidebar();
  renderHeader();
  renderSelectionBar();
  renderList();
  updateControls();
}

function navItem({ active, icon, label, count, attrs = '', more = '' }) {
  return `<li>
    <button class="nav-item ${active ? 'active' : ''}" ${attrs}>
      ${icon}<span class="label">${esc(label)}</span><span class="count">${count ?? ''}</span>
    </button>${more}
  </li>`;
}

function renderSidebar() {
  const v = state.view;
  const all = [...state.media.values()];
  const uncategorized = all.filter(m => !m.categories.some(c => state.categories.has(c))).length;
  $('#navLibrary').innerHTML = [
    navItem({ active: v.type === 'library', icon: ICON.library, label: 'All media', count: all.length, attrs: 'data-view="library"' }),
    navItem({ active: v.type === 'uncategorized', icon: ICON.tagOff, label: 'Uncategorized', count: uncategorized, attrs: 'data-view="uncategorized"' }),
    navItem({ active: v.type === 'queue', icon: ICON.queue, label: 'Now playing', count: player.queue.length || '', attrs: 'data-view="queue"' }),
  ].join('');

  const cats = [...state.categories.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  $('#navCategories').innerHTML = cats.length ? cats.map(c => navItem({
    active: v.type === 'category' && v.id === c.id,
    icon: `<span class="dot" style="--c:${c.color}"></span>`,
    label: c.name,
    count: all.filter(m => m.categories.includes(c.id)).length,
    attrs: `data-view="category" data-id="${c.id}"`,
    more: `<button class="icon-btn small more" data-cat-menu="${c.id}" title="Category options" aria-label="Category options">${ICON.more}</button>`,
  })).join('') : '<li class="nav-empty">No categories yet</li>';

  const pls = [...state.playlists.values()].sort((a, b) => a.created - b.created);
  $('#navPlaylists').innerHTML = pls.length ? pls.map(p => navItem({
    active: v.type === 'playlist' && v.id === p.id,
    icon: ICON.list,
    label: p.name,
    count: p.items.filter(id => state.media.has(id)).length,
    attrs: `data-view="playlist" data-id="${p.id}"`,
    more: `<button class="icon-btn small more" data-pl-menu="${p.id}" title="Playlist options" aria-label="Playlist options">${ICON.more}</button>`,
  })).join('') : '<li class="nav-empty">No playlists yet</li>';
}

function renderHeader() {
  const v = state.view;
  const base = viewBaseIds();
  const totalDur = base.reduce((s, id) => s + (state.media.get(id).duration || 0), 0);
  const key = viewKey(v);
  const kicker = { library: 'Library', uncategorized: 'Library', queue: 'Queue', category: 'Category', playlist: 'Playlist' }[v.type];
  const shuffleOn = getShuffle(key);
  const hasItems = base.length > 0;

  let actions = '';
  if (v.type !== 'queue') {
    actions += `<button class="btn primary" data-act="play-all" ${hasItems ? '' : 'disabled'}>${ICON.play} Play</button>`;
    actions += `<button class="btn" data-act="shuffle-play" ${hasItems ? '' : 'disabled'}>${ICON.shuffle} Shuffle play</button>`;
    if (v.type === 'playlist') {
      actions += `<button class="btn" data-act="randomize" ${base.length > 1 ? '' : 'disabled'} title="Permanently put this playlist in a new random order">${ICON.shuffle} Randomize order</button>`;
    }
    actions += `<button class="btn" data-act="import">${ICON.upload} Add files</button>`;
    if (v.type === 'category' || v.type === 'playlist') {
      actions += `<button class="icon-btn" data-act="view-menu" title="More options" aria-label="More options">${ICON.more}</button>`;
    }
  } else if (hasItems) {
    actions += `<button class="btn" data-act="clear-queue">${ICON.remove} Clear queue</button>`;
  }

  const shuffleNote = (v.type === 'playlist' || v.type === 'category' || v.type === 'library' || v.type === 'uncategorized')
    ? ` · Shuffle ${shuffleOn ? '<b>on</b>' : 'off'}` : '';

  const showSort = v.type !== 'playlist' && v.type !== 'queue';
  $('#viewHeader').innerHTML = `
    <div class="vh-top">
      <button class="icon-btn menu-btn" data-act="open-sidebar" aria-label="Open menu">${ICON.menu}</button>
      <div class="vh-title">
        <div class="vh-kicker">${kicker}</div>
        <h1>${esc(viewTitle())}</h1>
        <div class="vh-sub">${plural(base.length, 'item')}${totalDur ? ' · ' + fmtLong(totalDur) : ''}${shuffleNote}</div>
      </div>
    </div>
    <div class="vh-actions">${actions}</div>
    ${hasItems ? `<div class="vh-tools">
      <label class="search">${ICON.search}<input type="search" id="searchInput" placeholder="Search" value="${esc(state.search)}" aria-label="Search"></label>
      <div class="seg" role="group" aria-label="Filter by type">
        ${['all', 'audio', 'video'].map(t => `<button data-filter="${t}" class="${state.typeFilter === t ? 'on' : ''}">${{ all: 'All', audio: 'Audio', video: 'Video' }[t]}</button>`).join('')}
      </div>
      ${showSort ? `<select class="sort" id="sortSelect" aria-label="Sort">
        <option value="added" ${prefs.sort === 'added' ? 'selected' : ''}>Recently added</option>
        <option value="name" ${prefs.sort === 'name' ? 'selected' : ''}>Name A–Z</option>
        <option value="duration" ${prefs.sort === 'duration' ? 'selected' : ''}>Longest first</option>
      </select>` : ''}
    </div>` : ''}`;
}

function renderSelectionBar() {
  const bar = $('#selectionBar');
  const n = state.selected.size;
  if (!n) { bar.hidden = true; bar.innerHTML = ''; return; }
  const v = state.view;
  bar.hidden = false;
  bar.innerHTML = `
    <span class="sel-count">${n} selected</span>
    <button class="btn" data-sel="playlist">${ICON.addList} Add to playlist</button>
    <button class="btn" data-sel="category">${ICON.tag} Categories</button>
    ${v.type === 'playlist' ? `<button class="btn" data-sel="remove">${ICON.remove} Remove from playlist</button>` : ''}
    ${v.type === 'queue' ? `<button class="btn" data-sel="unqueue">${ICON.remove} Remove from queue</button>` : ''}
    ${v.type !== 'queue' ? `<button class="btn danger" data-sel="delete">${ICON.trash} Delete</button>` : ''}
    <button class="icon-btn" data-sel="clear" title="Clear selection" aria-label="Clear selection">${ICON.remove}</button>`;
}

function emptyState() {
  const v = state.view;
  const anyMedia = state.media.size > 0;
  const filtered = viewBaseIds().length > 0; // items exist but filter hides them
  if (filtered) return `<div class="empty"><div class="empty-icon">${ICON.search}</div><h2>No matches</h2><p>Try a different search or filter.</p></div>`;
  const msgs = {
    library: ['Your library is empty', 'Add the audio and video files you\'ve made. Drag and drop them anywhere on this window, or use the button below.', true],
    uncategorized: anyMedia ? ['Everything is categorized', 'Nice and tidy.'] : ['Nothing here yet', 'Add some files to get started.', true],
    queue: ['Nothing in the queue', 'Play something from your library, a category or a playlist.'],
    category: ['This category is empty', 'Select items in your library and choose “Categories”, or add new files while viewing this category.', true],
    playlist: ['This playlist is empty', 'Select items in your library and choose “Add to playlist”, or add new files while viewing this playlist.', true],
  };
  const [title, text, showImport] = msgs[v.type];
  return `<div class="empty"><div class="empty-icon">${v.type === 'playlist' ? ICON.list : ICON.music}</div>
    <h2>${title}</h2><p>${text}</p>
    ${showImport ? `<button class="btn primary" data-act="import">${ICON.upload} Add files</button>` : ''}</div>`;
}

function renderList() {
  const list = $('#list');
  const ids = viewItems();
  if (!ids.length) { list.innerHTML = emptyState(); return; }
  const currentId = player.queue[player.index];
  const isPlaying = !video.paused;
  const reorderable = state.view.type === 'playlist';
  const allSelected = ids.every(id => state.selected.has(id));
  const head = `<div class="list-head">
      <label class="sel" title="Select all"><input type="checkbox" id="selectAll" ${allSelected ? 'checked' : ''} aria-label="Select all"></label>
      <span class="num">#</span><span class="kind"></span><span>Title</span><span class="dur">Time</span><span></span>
    </div>`;
  list.innerHTML = head + ids.map((id, i) => {
    const m = state.media.get(id);
    const playing = id === currentId;
    const sel = state.selected.has(id);
    const chips = m.categories.map(c => state.categories.get(c)).filter(Boolean)
      .map(c => `<span class="chip" style="--c:${c.color}">${esc(c.name)}</span>`).join('');
    const num = playing ? `<span class="${isPlaying ? 'playing-now' : ''}">${EQ}</span>` : (reorderable ? `<span class="drag-handle" title="Drag to reorder">${i + 1}</span>` : i + 1);
    return `<div class="row ${playing ? 'playing' : ''} ${sel ? 'selected' : ''}" data-id="${id}" ${state.view.type !== 'queue' ? 'draggable="true"' : ''}>
      <label class="sel"><input type="checkbox" ${sel ? 'checked' : ''} aria-label="Select ${esc(m.name)}"></label>
      <span class="num">${num}</span>
      <span class="kind" title="${m.type === 'video' ? 'Video' : 'Audio'}">${m.type === 'video' ? ICON.video : ICON.music}</span>
      <div class="title"><div class="name" title="${esc(m.name)}">${esc(m.name)}</div><div class="meta">${chips}</div></div>
      <span class="dur">${m.duration ? fmtTime(m.duration) : '–'}</span>
      <button class="icon-btn more" title="More options" aria-label="More options">${ICON.more}</button>
    </div>`;
  }).join('');
}

/** Light refresh of the "playing" highlight without rebuilding the whole list. */
function refreshPlayingRow() {
  renderList();
}

async function updateStorage() {
  const el = $('#storageInfo');
  let text = `${plural(state.media.size, 'file')}`;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      text += ` · ${fmtSize(usage)} used`;
      if (quota) text += ` of ${fmtSize(quota)}`;
    }
  } catch { /* ignore */ }
  el.textContent = text;
}

/* =========================================================================
 * Player controls
 * ========================================================================= */
function currentMedia() { return state.media.get(player.queue[player.index]); }

function setRangeFill(input) {
  const pct = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.setProperty('--p', pct + '%');
}

function updateControls() {
  const m = currentMedia();
  const playing = !video.paused && !!m;
  const playBtn = $('#playBtn');
  playBtn.innerHTML = playing ? ICON.pause : ICON.play;
  playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');

  const key = player.contextKey ?? viewKey(state.view);
  const sh = $('#shuffleBtn');
  sh.classList.toggle('on', getShuffle(key));
  sh.setAttribute('aria-pressed', getShuffle(key));
  sh.title = `Shuffle ${getShuffle(key) ? 'on' : 'off'} (S)`;

  const rp = $('#repeatBtn');
  rp.classList.toggle('on', prefs.repeat !== 'off');
  rp.innerHTML = `<span class="repeat-wrap">${ICON.repeat}${prefs.repeat === 'one' ? '<span class="repeat-one">1</span>' : ''}</span>`;
  rp.title = { off: 'Repeat off', all: 'Repeat all', one: 'Repeat one' }[prefs.repeat] + ' (R)';

  $('#prevBtn').disabled = !m;
  $('#nextBtn').disabled = !m;

  $('#npKind').innerHTML = m ? (m.type === 'video' ? ICON.video : ICON.music) : ICON.music;
  $('#npTitle').textContent = m ? m.name : 'Nothing playing';
  $('#npSub').textContent = m ? player.contextLabel : 'Pick something from your library';

  $('#muteBtn').innerHTML = (video.muted || video.volume === 0) ? ICON.mute : ICON.volume;
  const vb = $('#volumeBar');
  vb.value = Math.round((video.muted ? 0 : video.volume) * 100);
  setRangeFill(vb);

  const stage = $('#stage');
  stage.classList.toggle('playing', playing);
}

let seeking = false;
function updateTime() {
  const d = video.duration;
  $('#curTime').textContent = fmtTime(video.currentTime);
  $('#durTime').textContent = fmtTime(isFinite(d) ? d : currentMedia()?.duration);
  if (!seeking) {
    const bar = $('#seekBar');
    bar.value = isFinite(d) && d > 0 ? Math.round(video.currentTime / d * 1000) : 0;
    setRangeFill(bar);
  }
}

function showStage(m) {
  const stage = $('#stage');
  stage.hidden = !m;
  if (!m) return;
  stage.classList.toggle('audio', m.type !== 'video');
  stage.classList.toggle('collapsed', !!prefs.stageCollapsed);
  $('#collapseStageBtn').innerHTML = prefs.stageCollapsed ? ICON.chevDown : ICON.chevUp;
  $('#artTitle').textContent = m.name;
  $('#artSub').textContent = player.contextLabel;
}

/** Start playing a list of ids. If startId is given, playback begins there. */
function startQueue(ids, startId, key, { shuffle } = {}) {
  if (!ids.length) return;
  if (shuffle !== undefined) setShuffle(key, shuffle);
  const sh = getShuffle(key);
  player.base = ids.slice();
  player.contextKey = key;
  player.contextLabel = contextLabelFor(key);
  if (sh) {
    player.queue = startId ? [startId, ...shuffled(ids.filter(x => x !== startId))] : shuffled(ids);
  } else {
    player.queue = ids.slice();
  }
  player.index = startId ? Math.max(0, player.queue.indexOf(startId)) : 0;
  loadCurrent(true);
  renderSidebar();
  renderHeader();
}

async function loadCurrent(autoplay) {
  const token = ++player.loadToken;
  const m = currentMedia();
  if (!m) { stopPlayback(); return; }
  let rec;
  try { rec = await idbGet('blobs', m.id); } catch (e) { console.error(e); }
  if (token !== player.loadToken) return; // a newer request superseded this one
  if (!rec || !rec.blob) { toast(`Couldn't find the file for “${m.name}”`); return; }
  if (player.url) URL.revokeObjectURL(player.url);
  player.url = URL.createObjectURL(rec.blob);
  video.src = player.url;
  showStage(m);
  if (autoplay) {
    video.play().catch(err => {
      if (err.name === 'NotAllowedError') return; // browser wants a click first
      if (err.name !== 'AbortError') toast(`Can't play “${m.name}”. Your browser may not support this format.`);
    });
  }
  updateControls();
  updateMediaSession(m);
  refreshPlayingRow();
}

function stopPlayback() {
  player.loadToken++;
  video.pause();
  video.removeAttribute('src');
  video.load();
  if (player.url) { URL.revokeObjectURL(player.url); player.url = null; }
  player.queue = []; player.base = []; player.index = -1; player.contextKey = null; player.contextLabel = '';
  showStage(null);
  updateTime();
  render();
}

function togglePlay() {
  if (!currentMedia()) {
    // Nothing loaded yet: start the current view.
    const ids = viewItems();
    if (ids.length) startQueue(ids, null, viewKey(state.view));
    return;
  }
  if (video.paused) video.play().catch(() => {}); else video.pause();
}

function next(auto = false) {
  if (!player.queue.length) return;
  if (player.index < player.queue.length - 1) {
    player.index++;
    loadCurrent(true);
  } else if (prefs.repeat === 'all') {
    if (getShuffle(player.contextKey) && player.queue.length > 1) {
      // Reshuffle for the next round, avoiding an immediate repeat of the last track.
      const last = player.queue[player.index];
      let q = shuffled(player.queue);
      if (q[0] === last) q.push(q.shift());
      player.queue = q;
    }
    player.index = 0;
    loadCurrent(true);
  } else if (!auto) {
    toast('End of the list');
  }
}

function prev() {
  if (!player.queue.length) return;
  if (video.currentTime > 3 || player.index === 0) { video.currentTime = 0; return; }
  player.index--;
  loadCurrent(true);
}

function toggleShuffle() {
  const key = player.contextKey ?? viewKey(state.view);
  if (key === 'queue') return;
  const on = !getShuffle(key);
  setShuffle(key, on);
  if (player.contextKey === key && player.queue.length) {
    const cur = player.queue[player.index];
    if (on) {
      const rest = player.queue.filter(x => x !== cur);
      player.queue = [cur, ...shuffled(rest)];
      player.index = 0;
    } else {
      const extras = player.queue.filter(x => !player.base.includes(x)); // e.g. "play next" additions
      player.queue = [...player.base, ...extras];
      player.index = Math.max(0, player.queue.indexOf(cur));
    }
  }
  toast(`Shuffle ${on ? 'on' : 'off'}`);
  updateControls();
  renderHeader();
  if (state.view.type === 'queue') renderList();
}

function cycleRepeat() {
  prefs.repeat = { off: 'all', all: 'one', one: 'off' }[prefs.repeat] || 'off';
  savePrefs();
  toast({ off: 'Repeat off', all: 'Repeat all', one: 'Repeat one' }[prefs.repeat]);
  updateControls();
}

function playNext(ids) {
  ids = ids.filter(id => state.media.has(id));
  if (!ids.length) return;
  if (!currentMedia()) { startQueue(ids, null, viewKey(state.view)); return; }
  const cur = player.queue[player.index];
  const toInsert = ids.filter(id => id !== cur);
  player.queue = player.queue.filter(id => !toInsert.includes(id));
  player.index = player.queue.indexOf(cur);
  player.queue.splice(player.index + 1, 0, ...toInsert);
  toast(ids.length === 1 ? `“${state.media.get(ids[0]).name}” will play next` : `${ids.length} items will play next`);
  renderSidebar();
  if (state.view.type === 'queue') renderList();
}

function removeFromQueue(ids) {
  const cur = player.queue[player.index];
  if (ids.includes(cur)) {
    // Removing the current item: stop if it's the only one, else skip ahead.
    const remaining = player.queue.filter(id => !ids.includes(id));
    if (!remaining.length) { stopPlayback(); return; }
    let newIndex = 0;
    for (let i = player.index + 1; i < player.queue.length; i++) {
      if (!ids.includes(player.queue[i])) { newIndex = remaining.indexOf(player.queue[i]); break; }
    }
    player.queue = remaining;
    player.base = player.base.filter(id => !ids.includes(id));
    player.index = newIndex;
    loadCurrent(!video.paused);
  } else {
    player.queue = player.queue.filter(id => !ids.includes(id));
    player.base = player.base.filter(id => !ids.includes(id));
    player.index = player.queue.indexOf(cur);
  }
  render();
}

function updateMediaSession(m) {
  if (!('mediaSession' in navigator) || !m) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: m.name, artist: player.contextLabel, album: 'My Media' });
  } catch { /* ignore */ }
}
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  const set = (a, fn) => { try { ms.setActionHandler(a, fn); } catch { /* unsupported */ } };
  set('play', () => video.play());
  set('pause', () => video.pause());
  set('nexttrack', () => next());
  set('previoustrack', () => prev());
}

/* =========================================================================
 * Importing files
 * ========================================================================= */
const MEDIA_EXT = /\.(mp3|m4a|aac|wav|flac|ogg|oga|opus|weba|webm|mp4|m4v|mov|mkv|3gp)$/i;
const VIDEO_EXT = /\.(mp4|m4v|mov|mkv|webm|3gp)$/i;

function probe(file) {
  return new Promise(resolve => {
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.muted = true;
    const url = URL.createObjectURL(file);
    let done = false;
    const finish = (duration, hasVideo, ok) => {
      if (done) return;
      done = true;
      URL.revokeObjectURL(url);
      el.removeAttribute('src');
      el.load();
      resolve({ duration: isFinite(duration) ? duration : 0, hasVideo, ok });
    };
    el.onloadedmetadata = () => finish(el.duration, el.videoWidth > 0, true);
    el.onerror = () => finish(0, null, false);
    setTimeout(() => finish(0, null, false), 10000);
    el.src = url;
  });
}

let persistRequested = false;
async function importFiles(fileList) {
  const files = [...fileList].filter(f => /^(audio|video)\//.test(f.type) || MEDIA_EXT.test(f.name));
  if (!files.length) { toast('No audio or video files found'); return; }
  if (!persistRequested && navigator.storage && navigator.storage.persist) {
    persistRequested = true;
    navigator.storage.persist().catch(() => {});
  }
  const v = state.view;
  const added = [];
  let unsupported = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    toast(`Adding ${i + 1} of ${files.length}…`, 0);
    const info = await probe(f);
    if (!info.ok) unsupported++;
    const type = info.hasVideo === null
      ? (f.type.startsWith('video/') || (VIDEO_EXT.test(f.name) && !f.type.startsWith('audio/')) ? 'video' : 'audio')
      : (info.hasVideo ? 'video' : 'audio');
    const m = {
      id: uid(),
      name: f.name.replace(/\.[^.]+$/, '') || f.name,
      fileName: f.name,
      type,
      mime: f.type,
      size: f.size,
      duration: info.duration,
      added: Date.now() + i, // keep import order stable when sorting by date
      categories: v.type === 'category' ? [v.id] : [],
    };
    try {
      await idbWrite(['media', 'blobs'], s => {
        s('blobs').put({ id: m.id, blob: f });
        s('media').put(m);
      });
      state.media.set(m.id, m);
      added.push(m.id);
    } catch (e) {
      console.error(e);
      toast(`Couldn't save “${f.name}”. Your disk or browser storage may be full.`);
      break;
    }
  }
  if (v.type === 'playlist' && added.length) {
    const p = state.playlists.get(v.id);
    if (p) { p.items.push(...added); await idbPut('playlists', p); }
  }
  render();
  updateStorage();
  if (added.length) {
    let msg = `Added ${plural(added.length, 'file')}`;
    if (v.type === 'category' || v.type === 'playlist') msg += ` to “${viewTitle()}”`;
    if (unsupported) msg += ` · ${unsupported} may not play in this browser`;
    toast(msg);
  }
}

/* =========================================================================
 * Library editing
 * ========================================================================= */
async function renameMedia(id) {
  const m = state.media.get(id);
  const name = await promptText('Rename', m.name);
  if (!name || name === m.name) return;
  m.name = name;
  await idbPut('media', m);
  render();
  if (currentMedia() === m) { updateControls(); showStage(m); updateMediaSession(m); }
}

async function deleteMedia(ids) {
  ids = ids.filter(id => state.media.has(id));
  if (!ids.length) return;
  const what = ids.length === 1 ? `“${state.media.get(ids[0]).name}”` : plural(ids.length, 'item');
  const ok = await confirmBox('Delete from library?', `${what} will be removed from your library, every category and every playlist. Your original files on disk are not affected.`, 'Delete');
  if (!ok) return;
  const changedPlaylists = [];
  for (const p of state.playlists.values()) {
    const before = p.items.length;
    p.items = p.items.filter(id => !ids.includes(id));
    if (p.items.length !== before) changedPlaylists.push(p);
  }
  await idbWrite(['media', 'blobs', 'playlists'], s => {
    for (const id of ids) { s('media').delete(id); s('blobs').delete(id); }
    for (const p of changedPlaylists) s('playlists').put(p);
  });
  if (player.queue.some(id => ids.includes(id))) removeFromQueue(ids);
  for (const id of ids) { state.media.delete(id); state.selected.delete(id); }
  render();
  updateStorage();
  toast(`Deleted ${what}`);
}

/* ----- Categories ----- */
async function createCategory(name) {
  name = name ?? await promptText('New category', '', 'e.g. Demos, Live, Vlogs');
  if (!name) return null;
  const c = { id: uid(), name, color: CATEGORY_COLORS[state.categories.size % CATEGORY_COLORS.length], created: Date.now() };
  state.categories.set(c.id, c);
  await idbPut('categories', c);
  renderSidebar();
  return c;
}
async function renameCategory(id) {
  const c = state.categories.get(id);
  const name = await promptText('Rename category', c.name);
  if (!name || name === c.name) return;
  c.name = name;
  await idbPut('categories', c);
  render();
}
async function recolorCategory(id) {
  const c = state.categories.get(id);
  const i = CATEGORY_COLORS.indexOf(c.color);
  c.color = CATEGORY_COLORS[(i + 1) % CATEGORY_COLORS.length];
  await idbPut('categories', c);
  render();
}
async function deleteCategory(id) {
  const c = state.categories.get(id);
  const ok = await confirmBox('Delete category?', `“${c.name}” will be deleted. The files in it stay in your library.`, 'Delete');
  if (!ok) return;
  const changed = [...state.media.values()].filter(m => m.categories.includes(id));
  changed.forEach(m => { m.categories = m.categories.filter(x => x !== id); });
  await idbWrite(['categories', 'media'], s => {
    s('categories').delete(id);
    changed.forEach(m => s('media').put(m));
  });
  state.categories.delete(id);
  delete prefs.shuffle['cat:' + id]; savePrefs();
  if (state.view.type === 'category' && state.view.id === id) setView({ type: 'library' }); else render();
}

/* ----- Playlists ----- */
async function createPlaylist(name, items = []) {
  name = name ?? await promptText('New playlist', '', 'e.g. Workout mix');
  if (!name) return null;
  const p = { id: uid(), name, items: [...new Set(items)], shuffle: false, created: Date.now() };
  state.playlists.set(p.id, p);
  await idbPut('playlists', p);
  renderSidebar();
  return p;
}
async function renamePlaylist(id) {
  const p = state.playlists.get(id);
  const name = await promptText('Rename playlist', p.name);
  if (!name || name === p.name) return;
  p.name = name;
  await idbPut('playlists', p);
  if (player.contextKey === 'pl:' + id) player.contextLabel = contextLabelFor(player.contextKey);
  render();
}
async function deletePlaylist(id) {
  const p = state.playlists.get(id);
  const ok = await confirmBox('Delete playlist?', `“${p.name}” will be deleted. The files in it stay in your library.`, 'Delete');
  if (!ok) return;
  await idbWrite(['playlists'], s => s('playlists').delete(id));
  state.playlists.delete(id);
  if (state.view.type === 'playlist' && state.view.id === id) setView({ type: 'library' }); else render();
}
async function randomizePlaylist(id) {
  const p = state.playlists.get(id);
  if (!p || p.items.length < 2) return;
  const before = p.items.join();
  do { p.items = shuffled(p.items); } while (p.items.join() === before);
  await idbPut('playlists', p);
  if (player.contextKey === 'pl:' + id && !p.shuffle) {
    // Keep playing the current track, but continue in the new order.
    const cur = player.queue[player.index];
    player.base = p.items.filter(x => state.media.has(x));
    player.queue = player.base.slice();
    player.index = Math.max(0, player.queue.indexOf(cur));
  }
  render();
  toast('Playlist order randomized');
}
async function removeFromPlaylist(id, ids) {
  const p = state.playlists.get(id);
  p.items = p.items.filter(x => !ids.includes(x));
  await idbPut('playlists', p);
  ids.forEach(x => state.selected.delete(x));
  render();
  toast(`Removed ${plural(ids.length, 'item')} from “${p.name}”`);
}
async function moveInPlaylist(plId, id, targetId, after) {
  const p = state.playlists.get(plId);
  if (id === targetId) return;
  const items = p.items.filter(x => x !== id);
  let at = items.indexOf(targetId);
  if (at < 0) return;
  if (after) at++;
  items.splice(at, 0, id);
  p.items = items;
  await idbPut('playlists', p);
  if (player.contextKey === 'pl:' + plId && !p.shuffle) {
    const cur = player.queue[player.index];
    player.base = p.items.filter(x => state.media.has(x));
    player.queue = player.base.slice();
    player.index = Math.max(0, player.queue.indexOf(cur));
  }
  renderList();
}
async function stepInPlaylist(plId, id, dir) {
  const p = state.playlists.get(plId);
  const visible = p.items.filter(x => state.media.has(x));
  const i = visible.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= visible.length) return;
  await moveInPlaylist(plId, id, visible[j], dir > 0);
}

/* ----- Multi-item dialogs ----- */
async function playlistDialog(ids) {
  const body = document.createElement('div');
  const pls = [...state.playlists.values()].sort((a, b) => a.created - b.created);
  body.innerHTML = `
    <div class="check-list">
      ${pls.length ? pls.map(p => {
        const n = ids.filter(id => p.items.includes(id)).length;
        return `<label><input type="checkbox" data-id="${p.id}" ${n === ids.length ? 'checked' : ''} data-mixed="${n > 0 && n < ids.length}"> ${esc(p.name)}</label>`;
      }).join('') : '<div class="hint">You don\'t have any playlists yet. Create one below.</div>'}
    </div>
    <label class="modal-label" for="newPlName">New playlist</label>
    <input class="field" id="newPlName" placeholder="Playlist name (optional)" autocomplete="off">`;
  body.querySelectorAll('[data-mixed="true"]').forEach(cb => { cb.indeterminate = true; });
  body.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => { cb.dataset.touched = '1'; }));
  const ok = await openModal(ids.length === 1 ? `Add “${state.media.get(ids[0]).name}” to playlists` : `Add ${ids.length} items to playlists`, body, 'Save');
  if (!ok) return;
  const changed = [];
  body.querySelectorAll('input[data-touched]').forEach(cb => {
    const p = state.playlists.get(cb.dataset.id);
    if (cb.checked) p.items.push(...ids.filter(id => !p.items.includes(id)));
    else p.items = p.items.filter(id => !ids.includes(id));
    changed.push(p);
  });
  if (changed.length) await idbWrite(['playlists'], s => changed.forEach(p => s('playlists').put(p)));
  const newName = $('#newPlName', body).value.trim();
  let created = null;
  if (newName) created = await createPlaylist(newName, ids);
  render();
  if (created) toast(`Created “${created.name}” with ${plural(ids.length, 'item')}`);
  else if (changed.length) toast('Playlists updated');
}

async function categoryDialog(ids) {
  const body = document.createElement('div');
  const cats = [...state.categories.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  body.innerHTML = `
    <div class="check-list">
      ${cats.length ? cats.map(c => {
        const n = ids.filter(id => state.media.get(id).categories.includes(c.id)).length;
        return `<label><input type="checkbox" data-id="${c.id}" ${n === ids.length ? 'checked' : ''} data-mixed="${n > 0 && n < ids.length}"><span class="dot" style="--c:${c.color}"></span> ${esc(c.name)}</label>`;
      }).join('') : '<div class="hint">You don\'t have any categories yet. Create one below.</div>'}
    </div>
    <label class="modal-label" for="newCatName">New category</label>
    <input class="field" id="newCatName" placeholder="Category name (optional)" autocomplete="off">`;
  body.querySelectorAll('[data-mixed="true"]').forEach(cb => { cb.indeterminate = true; });
  body.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => { cb.dataset.touched = '1'; }));
  const ok = await openModal(ids.length === 1 ? `Categories for “${state.media.get(ids[0]).name}”` : `Categories for ${ids.length} items`, body, 'Save');
  if (!ok) return;
  const changes = [];
  body.querySelectorAll('input[data-touched]').forEach(cb => changes.push([cb.dataset.id, cb.checked]));
  const newName = $('#newCatName', body).value.trim();
  if (newName) {
    const c = await createCategory(newName);
    if (c) changes.push([c.id, true]);
  }
  if (!changes.length) return;
  const items = ids.map(id => state.media.get(id));
  for (const m of items) {
    for (const [catId, on] of changes) {
      const has = m.categories.includes(catId);
      if (on && !has) m.categories.push(catId);
      if (!on && has) m.categories = m.categories.filter(x => x !== catId);
    }
  }
  await idbWrite(['media'], s => items.forEach(m => s('media').put(m)));
  render();
  toast('Categories updated');
}

/* =========================================================================
 * UI primitives: modal, menu, toast
 * ========================================================================= */
const modal = $('#modal');
function openModal(title, content, okLabel = 'Save', danger = false) {
  return new Promise(resolve => {
    $('#modalTitle').textContent = title;
    const body = $('#modalBody');
    body.innerHTML = '';
    if (typeof content === 'string') body.innerHTML = content; else body.appendChild(content);
    const ok = $('#modalOk');
    ok.textContent = okLabel;
    ok.classList.toggle('danger', danger);
    modal.returnValue = '';
    modal.addEventListener('close', () => resolve(modal.returnValue === 'ok'), { once: true });
    modal.showModal();
    const first = body.querySelector('input.field, input');
    if (first) { first.focus(); if (first.select) first.select(); } else ok.focus();
  });
}
async function promptText(title, value = '', placeholder = '') {
  const input = document.createElement('input');
  input.className = 'field';
  input.value = value;
  input.placeholder = placeholder;
  input.required = true;
  input.autocomplete = 'off';
  input.maxLength = 200;
  const ok = await openModal(title, input, value ? 'Save' : 'Create');
  return ok ? input.value.trim() || null : null;
}
function confirmBox(title, message, okLabel = 'OK') {
  return openModal(title, `<p class="modal-msg">${esc(message)}</p>`, okLabel, true);
}

const menu = $('#menu');
function showMenu(anchor, items) {
  menu.innerHTML = items.map((it, i) => it === '-' ? '<hr>'
    : `<button role="menuitem" data-i="${i}" class="${it.danger ? 'danger' : ''}">${it.icon || ''}<span>${esc(it.label)}</span></button>`).join('');
  menu.hidden = false;
  const r = anchor.getBoundingClientRect();
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  let left = Math.min(r.right - mw, window.innerWidth - mw - 8);
  left = Math.max(8, left);
  let top = r.bottom + 4;
  if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.onclick = e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    hideMenu();
    items[+b.dataset.i].action();
  };
  menu.querySelector('button')?.focus();
}
function hideMenu() { menu.hidden = true; menu.onclick = null; }

let toastTimer;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

/* =========================================================================
 * Event wiring
 * ========================================================================= */
function openSidebar() { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); }
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); }

function rowMenuItems(id) {
  const v = state.view;
  const items = [
    { label: 'Play', icon: ICON.playLine, action: () => playRow(id) },
    { label: 'Play next', icon: ICON.playNext, action: () => playNext([id]) },
    '-',
    { label: 'Add to playlist…', icon: ICON.addList, action: () => playlistDialog([id]) },
    { label: 'Categories…', icon: ICON.tag, action: () => categoryDialog([id]) },
    { label: 'Rename…', icon: ICON.edit, action: () => renameMedia(id) },
  ];
  if (v.type === 'playlist') {
    items.push('-',
      { label: 'Move up', icon: ICON.chevUp, action: () => stepInPlaylist(v.id, id, -1) },
      { label: 'Move down', icon: ICON.chevDown, action: () => stepInPlaylist(v.id, id, 1) },
      { label: 'Remove from playlist', icon: ICON.remove, action: () => removeFromPlaylist(v.id, [id]) });
  }
  if (v.type === 'queue') {
    items.push('-', { label: 'Remove from queue', icon: ICON.remove, action: () => removeFromQueue([id]) });
  } else {
    items.push('-', { label: 'Delete from library', icon: ICON.trash, danger: true, action: () => deleteMedia([id]) });
  }
  return items;
}

function playRow(id) {
  if (state.view.type === 'queue') {
    player.index = player.queue.indexOf(id);
    loadCurrent(true);
    return;
  }
  if (player.queue[player.index] === id && player.contextKey === viewKey(state.view)) {
    togglePlay();
    return;
  }
  startQueue(viewItems(), id, viewKey(state.view));
}

// Sidebar
$('#sidebar').addEventListener('click', e => {
  const catMenu = e.target.closest('[data-cat-menu]');
  if (catMenu) {
    const id = catMenu.dataset.catMenu;
    showMenu(catMenu, [
      { label: 'Rename…', icon: ICON.edit, action: () => renameCategory(id) },
      { label: 'Change color', icon: ICON.palette, action: () => recolorCategory(id) },
      '-',
      { label: 'Delete category', icon: ICON.trash, danger: true, action: () => deleteCategory(id) },
    ]);
    return;
  }
  const plMenu = e.target.closest('[data-pl-menu]');
  if (plMenu) {
    const id = plMenu.dataset.plMenu;
    showMenu(plMenu, playlistMenuItems(id));
    return;
  }
  const item = e.target.closest('[data-view]');
  if (item) {
    const type = item.dataset.view;
    setView(item.dataset.id ? { type, id: item.dataset.id } : { type });
  }
});
$('#addCategoryBtn').innerHTML = ICON.plus;
$('#addPlaylistBtn').innerHTML = ICON.plus;
$('#addCategoryBtn').addEventListener('click', async () => {
  const c = await createCategory();
  if (c) setView({ type: 'category', id: c.id });
});
$('#addPlaylistBtn').addEventListener('click', async () => {
  const p = await createPlaylist();
  if (p) setView({ type: 'playlist', id: p.id });
});
$('#scrim').addEventListener('click', closeSidebar);

function playlistMenuItems(id) {
  return [
    { label: 'Play', icon: ICON.playLine, action: () => startQueue(viewBaseIds({ type: 'playlist', id }), null, 'pl:' + id) },
    { label: 'Shuffle play', icon: ICON.shuffle, action: () => startQueue(viewBaseIds({ type: 'playlist', id }), null, 'pl:' + id, { shuffle: true }) },
    { label: 'Randomize order', icon: ICON.shuffle, action: () => randomizePlaylist(id) },
    '-',
    { label: 'Rename…', icon: ICON.edit, action: () => renamePlaylist(id) },
    { label: 'Delete playlist', icon: ICON.trash, danger: true, action: () => deletePlaylist(id) },
  ];
}

// Drag list rows onto sidebar playlists / categories
$('#sidebar').addEventListener('dragover', e => {
  const t = e.target.closest('[data-view="playlist"], [data-view="category"]');
  if (!t || !dragIds.length) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  document.querySelectorAll('.nav-item.drop-target').forEach(n => n !== t && n.classList.remove('drop-target'));
  t.classList.add('drop-target');
});
$('#sidebar').addEventListener('dragleave', e => {
  const t = e.target.closest('.nav-item');
  if (t && !t.contains(e.relatedTarget)) t.classList.remove('drop-target');
});
$('#sidebar').addEventListener('drop', async e => {
  const t = e.target.closest('[data-view="playlist"], [data-view="category"]');
  document.querySelectorAll('.nav-item.drop-target').forEach(n => n.classList.remove('drop-target'));
  if (!t || !dragIds.length) return;
  e.preventDefault();
  e.stopPropagation();
  const ids = dragIds.slice();
  if (t.dataset.view === 'playlist') {
    const p = state.playlists.get(t.dataset.id);
    const add = ids.filter(id => !p.items.includes(id));
    p.items.push(...add);
    await idbPut('playlists', p);
    toast(add.length ? `Added ${plural(add.length, 'item')} to “${p.name}”` : `Already in “${p.name}”`);
  } else {
    const c = state.categories.get(t.dataset.id);
    const items = ids.map(id => state.media.get(id)).filter(m => !m.categories.includes(c.id));
    items.forEach(m => m.categories.push(c.id));
    await idbWrite(['media'], s => items.forEach(m => s('media').put(m)));
    toast(items.length ? `Added ${plural(items.length, 'item')} to “${c.name}”` : `Already in “${c.name}”`);
  }
  render();
});

// Header
$('#viewHeader').addEventListener('click', e => {
  const btn = e.target.closest('[data-act], [data-filter]');
  if (!btn) return;
  if (btn.dataset.filter) {
    state.typeFilter = btn.dataset.filter;
    renderHeader(); renderList();
    return;
  }
  handleAction(btn.dataset.act, btn);
});
$('#viewHeader').addEventListener('input', e => {
  if (e.target.id === 'searchInput') { state.search = e.target.value; renderList(); }
});
$('#viewHeader').addEventListener('change', e => {
  if (e.target.id === 'sortSelect') { prefs.sort = e.target.value; savePrefs(); renderList(); }
});

function handleAction(act, btn) {
  const v = state.view;
  const key = viewKey(v);
  switch (act) {
    case 'play-all': startQueue(viewItems(), null, key, { shuffle: false }); break;
    case 'shuffle-play': startQueue(viewItems(), null, key, { shuffle: true }); break;
    case 'randomize': randomizePlaylist(v.id); break;
    case 'import': $('#fileInput').click(); break;
    case 'open-sidebar': openSidebar(); break;
    case 'clear-queue': stopPlayback(); break;
    case 'view-menu':
      if (v.type === 'playlist') showMenu(btn, playlistMenuItems(v.id).slice(3));
      else if (v.type === 'category') showMenu(btn, [
        { label: 'Rename…', icon: ICON.edit, action: () => renameCategory(v.id) },
        { label: 'Change color', icon: ICON.palette, action: () => recolorCategory(v.id) },
        '-',
        { label: 'Delete category', icon: ICON.trash, danger: true, action: () => deleteCategory(v.id) },
      ]);
      break;
  }
}

// Selection bar
$('#selectionBar').addEventListener('click', e => {
  const b = e.target.closest('[data-sel]');
  if (!b) return;
  const ids = viewItems().filter(id => state.selected.has(id));
  switch (b.dataset.sel) {
    case 'playlist': playlistDialog(ids); break;
    case 'category': categoryDialog(ids); break;
    case 'remove': removeFromPlaylist(state.view.id, ids); break;
    case 'unqueue': state.selected.clear(); removeFromQueue(ids); break;
    case 'delete': deleteMedia(ids); break;
    case 'clear': state.selected.clear(); renderSelectionBar(); renderList(); break;
  }
});

// Track list
const list = $('#list');
list.addEventListener('click', e => {
  if (e.target.closest('[data-act]')) { handleAction(e.target.closest('[data-act]').dataset.act); return; }
  if (e.target.id === 'selectAll') {
    const ids = viewItems();
    if (e.target.checked) ids.forEach(id => state.selected.add(id)); else ids.forEach(id => state.selected.delete(id));
    renderSelectionBar(); renderList();
    return;
  }
  const row = e.target.closest('.row');
  if (!row) return;
  const id = row.dataset.id;
  if (e.target.closest('.sel')) {
    if (e.target.tagName !== 'INPUT') return; // label click forwards to the checkbox
    if (e.target.checked) state.selected.add(id); else state.selected.delete(id);
    row.classList.toggle('selected', e.target.checked);
    renderSelectionBar();
    const sa = $('#selectAll');
    if (sa) sa.checked = viewItems().every(x => state.selected.has(x));
    return;
  }
  if (e.target.closest('.more')) { showMenu(e.target.closest('.more'), rowMenuItems(id)); return; }
  playRow(id);
});
list.addEventListener('contextmenu', e => {
  const row = e.target.closest('.row');
  if (!row) return;
  e.preventDefault();
  showMenu(row.querySelector('.more'), rowMenuItems(row.dataset.id));
});

// Drag & drop: reorder within a playlist, or drop rows on sidebar items
let dragIds = [];
let dragId = null;
list.addEventListener('dragstart', e => {
  const row = e.target.closest('.row');
  if (!row) return;
  dragId = row.dataset.id;
  dragIds = state.selected.has(dragId) ? viewItems().filter(id => state.selected.has(id)) : [dragId];
  row.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'copyMove';
  e.dataTransfer.setData('text/plain', dragIds.map(id => state.media.get(id).name).join('\n'));
});
list.addEventListener('dragend', () => {
  dragIds = []; dragId = null;
  list.querySelectorAll('.dragging, .drop-before, .drop-after').forEach(r => r.classList.remove('dragging', 'drop-before', 'drop-after'));
});
list.addEventListener('dragover', e => {
  if (!dragId || state.view.type !== 'playlist' || dragIds.length !== 1) return;
  const row = e.target.closest('.row');
  if (!row || row.dataset.id === dragId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const r = row.getBoundingClientRect();
  const after = e.clientY > r.top + r.height / 2;
  list.querySelectorAll('.drop-before, .drop-after').forEach(x => x.classList.remove('drop-before', 'drop-after'));
  row.classList.add(after ? 'drop-after' : 'drop-before');
});
list.addEventListener('drop', e => {
  if (!dragId || state.view.type !== 'playlist') return;
  const row = e.target.closest('.row');
  if (!row) return;
  e.preventDefault();
  e.stopPropagation();
  const r = row.getBoundingClientRect();
  moveInPlaylist(state.view.id, dragId, row.dataset.id, e.clientY > r.top + r.height / 2);
});

// File import: button + drag files from the computer
$('#fileInput').addEventListener('change', e => {
  const files = e.target.files;
  if (files && files.length) importFiles(files);
  e.target.value = '';
});
let dragDepth = 0;
const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
window.addEventListener('dragenter', e => { if (!hasFiles(e)) return; dragDepth++; $('#dropOverlay').hidden = false; });
window.addEventListener('dragleave', e => { if (!hasFiles(e)) return; if (--dragDepth <= 0) { dragDepth = 0; $('#dropOverlay').hidden = true; } });
window.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
window.addEventListener('drop', e => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  $('#dropOverlay').hidden = true;
  importFiles(e.dataTransfer.files);
});

// Player bar
$('#playBtn').addEventListener('click', togglePlay);
$('#nextBtn').addEventListener('click', () => next());
$('#prevBtn').addEventListener('click', prev);
$('#shuffleBtn').addEventListener('click', toggleShuffle);
$('#repeatBtn').addEventListener('click', cycleRepeat);
$('#prevBtn').innerHTML = ICON.prev;
$('#nextBtn').innerHTML = ICON.next;
$('#shuffleBtn').innerHTML = ICON.shuffle;
$('#fullscreenBtn').innerHTML = ICON.fullscreen;

const seekBar = $('#seekBar');
seekBar.addEventListener('input', () => {
  seeking = true;
  setRangeFill(seekBar);
  if (isFinite(video.duration)) $('#curTime').textContent = fmtTime(seekBar.value / 1000 * video.duration);
});
seekBar.addEventListener('change', () => {
  if (isFinite(video.duration)) video.currentTime = seekBar.value / 1000 * video.duration;
  seeking = false;
});

const volumeBar = $('#volumeBar');
volumeBar.addEventListener('input', () => {
  video.volume = volumeBar.value / 100;
  video.muted = video.volume === 0;
});
$('#muteBtn').addEventListener('click', () => {
  if (video.muted || video.volume === 0) { video.muted = false; if (video.volume === 0) video.volume = 0.5; }
  else video.muted = true;
});

$('#fullscreenBtn').addEventListener('click', toggleFullscreen);
function toggleFullscreen() {
  const m = currentMedia();
  if (!m || m.type !== 'video') return;
  if (document.fullscreenElement) document.exitFullscreen();
  else if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
  else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
}
$('#collapseStageBtn').addEventListener('click', () => {
  prefs.stageCollapsed = !prefs.stageCollapsed;
  savePrefs();
  showStage(currentMedia());
});
video.addEventListener('click', togglePlay);
video.addEventListener('dblclick', toggleFullscreen);

// Media element events
video.addEventListener('play', () => { updateControls(); refreshPlayingRow(); });
video.addEventListener('pause', () => { updateControls(); refreshPlayingRow(); });
video.addEventListener('timeupdate', updateTime);
video.addEventListener('durationchange', updateTime);
video.addEventListener('volumechange', () => {
  prefs.volume = video.volume; prefs.muted = video.muted; savePrefs();
  updateControls();
});
video.addEventListener('loadedmetadata', () => {
  // Fill in a missing duration (some formats don't report it on import).
  const m = currentMedia();
  if (m && !m.duration && isFinite(video.duration) && video.duration > 0) {
    m.duration = video.duration;
    idbPut('media', m);
    renderHeader(); renderList();
  }
});
video.addEventListener('ended', () => {
  if (prefs.repeat === 'one') { video.currentTime = 0; video.play().catch(() => {}); return; }
  next(true);
});
video.addEventListener('error', () => {
  const m = currentMedia();
  if (m && video.getAttribute('src')) toast(`Can't play “${m.name}”. Your browser may not support this format.`);
});

// Global: close menus, keyboard shortcuts
document.addEventListener('mousedown', e => { if (!menu.hidden && !menu.contains(e.target)) hideMenu(); });
window.addEventListener('resize', hideMenu);
list.addEventListener('scroll', hideMenu);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !menu.hidden) { hideMenu(); return; }
  if (modal.open) return;
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' && !['range', 'checkbox'].includes(e.target.type) || tag === 'textarea' || tag === 'select';
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  switch (e.key) {
    case ' ':
      if (tag === 'button') return; // let buttons handle space themselves
      e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': if (tag === 'input') return; e.preventDefault(); if (currentMedia()) video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); break;
    case 'ArrowLeft': if (tag === 'input') return; e.preventDefault(); if (currentMedia()) video.currentTime = Math.max(0, video.currentTime - 5); break;
    case 'n': case 'N': next(); break;
    case 'p': case 'P': prev(); break;
    case 's': case 'S': toggleShuffle(); break;
    case 'r': case 'R': cycleRepeat(); break;
    case 'm': case 'M': video.muted = !video.muted; break;
    case 'f': case 'F': toggleFullscreen(); break;
    case '/': { const s = $('#searchInput'); if (s) { e.preventDefault(); s.focus(); } break; }
  }
});

/* =========================================================================
 * Start up
 * ========================================================================= */
(async function init() {
  video.volume = Math.min(1, Math.max(0, prefs.volume));
  video.muted = !!prefs.muted;
  try {
    db = await openDB();
    const [media, cats, pls] = await Promise.all([idbAll('media'), idbAll('categories'), idbAll('playlists')]);
    media.forEach(m => { m.categories = m.categories || []; state.media.set(m.id, m); });
    cats.forEach(c => state.categories.set(c.id, c));
    pls.forEach(p => { p.items = p.items || []; state.playlists.set(p.id, p); });
  } catch (err) {
    console.error(err);
    toast('Your browser blocked local storage, so files can\'t be saved. Try Chrome, Edge or Firefox.', 0);
  }
  render();
  updateTime();
  updateStorage();
})();
