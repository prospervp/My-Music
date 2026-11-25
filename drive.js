/* Google Drive: connect one folder, list its audio/video files, download them on demand,
 * and (optionally) save edited files back to it.
 * Uses Google Identity Services for sign-in and the Drive v3 REST API. Nothing goes through
 * any server but Google's; the access token stays on this device. */
'use strict';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const SCOPE_READ = 'https://www.googleapis.com/auth/drive.readonly';
const SCOPE_FULL = 'https://www.googleapis.com/auth/drive';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

function driveError(message, extra = {}) { return Object.assign(new Error(message), extra); }

/** Pull a folder ID out of a Drive link (or accept a bare ID). */
function parseFolderId(input) {
  input = (input || '').trim();
  let m = input.match(/\/folders\/([\w-]{10,})/) || input.match(/[?&]id=([\w-]{10,})/);
  if (m) return m[1];
  if (/^[\w-]{10,}$/.test(input)) return input;
  return null;
}

const Drive = {
  cfg: { clientId: '', folderId: '', folderName: '', subfolders: true, allowUpload: false, lastSync: 0 },
  token: null,          // { value, exp, scope }
  client: null,
  clientKey: '',
  pending: null,
  gisPromise: null,
  syncing: false,
  downloads: new Map(), // media id -> Promise<Blob>

  /* ---------- setup & sign-in ---------- */
  init() {
    try { Object.assign(this.cfg, JSON.parse(localStorage.getItem('mmp-drive') || '{}')); } catch { /* ignore */ }
    try {
      const t = JSON.parse(localStorage.getItem('mmp-drive-token') || 'null');
      if (t && t.exp > Date.now()) this.token = t;
    } catch { /* ignore */ }
    if (this.configured()) this.loadGis().catch(() => {}); // preload so sign-in can open straight from a tap
    renderSidebar();
  },
  saveCfg() { try { localStorage.setItem('mmp-drive', JSON.stringify(this.cfg)); } catch { /* ignore */ } },
  saveToken() {
    try {
      if (this.token) localStorage.setItem('mmp-drive-token', JSON.stringify(this.token));
      else localStorage.removeItem('mmp-drive-token');
    } catch { /* ignore */ }
  },
  configured() { return !!(this.cfg.clientId && this.cfg.folderId); },
  scope() { return this.cfg.allowUpload ? SCOPE_FULL : SCOPE_READ; },
  hasScope(scope) {
    if (!this.token) return false;
    const granted = (this.token.scope || '').split(' ');
    return granted.includes(scope) || (scope === SCOPE_READ && granted.includes(SCOPE_FULL));
  },
  tokenValid(scope = this.scope()) { return !!this.token && this.token.exp > Date.now() + 60000 && this.hasScope(scope); },

  loadGis() {
    if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
    if (!this.gisPromise) {
      this.gisPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => { this.gisPromise = null; reject(driveError('Couldn\'t reach Google. Check your internet connection.')); };
        document.head.appendChild(s);
      });
    }
    return this.gisPromise;
  },
  ensureClient() {
    if (!(window.google && google.accounts && google.accounts.oauth2)) return false;
    const key = this.cfg.clientId + '|' + this.scope();
    if (this.client && this.clientKey === key) return true;
    this.client = google.accounts.oauth2.initTokenClient({
      client_id: this.cfg.clientId,
      scope: this.scope(),
      callback: resp => {
        const p = this.pending; this.pending = null;
        if (resp.error) { p && p.reject(driveError(resp.error_description || resp.error)); return; }
        this.token = { value: resp.access_token, exp: Date.now() + (Number(resp.expires_in) || 3600) * 1000, scope: resp.scope || this.scope() };
        this.saveToken();
        p && p.resolve();
      },
      error_callback: err => {
        const p = this.pending; this.pending = null;
        if (!p) return;
        if (err && err.type === 'popup_closed') p.reject(driveError('cancelled', { cancelled: true }));
        else if (err && err.type === 'popup_failed_to_open') p.reject(driveError('The Google sign-in window was blocked.', { needsAuth: true }));
        else p.reject(driveError((err && err.message) || 'Google sign-in failed.'));
      },
    });
    this.clientKey = key;
    return true;
  },
  /** Make sure we have a valid token. Call this straight from a tap: it may open Google's sign-in window. */
  connect() {
    if (!this.configured()) { this.openSettings(); return Promise.reject(driveError('cancelled', { cancelled: true })); }
    if (this.tokenValid()) return Promise.resolve();
    const go = () => new Promise((resolve, reject) => {
      if (this.pending) this.pending.reject(driveError('cancelled', { cancelled: true }));
      this.pending = { resolve, reject };
      try { this.client.requestAccessToken({ prompt: '' }); } catch (e) { this.pending = null; reject(e); }
    });
    if (this.ensureClient()) return go();
    return this.loadGis().then(() => { this.ensureClient(); return go(); });
  },
  disconnect() {
    if (this.token && window.google && google.accounts && google.accounts.oauth2) {
      try { google.accounts.oauth2.revoke(this.token.value, () => {}); } catch { /* ignore */ }
    }
    this.token = null;
    this.saveToken();
  },
  /** Show a helpful message for an error; offer a Connect button when sign-in is needed. */
  handleError(e, retry) {
    if (!e || e.cancelled) return;
    console.error(e);
    if (e.needsAuth) {
      toast(e.message && e.message !== 'auth' ? e.message : 'Connect to Google Drive to continue', 0, {
        label: 'Connect',
        onClick: () => this.connect().then(() => (retry ? retry() : this.sync())).catch(err => this.handleError(err, retry)),
      });
    } else {
      toast(e.message || String(e), 6000);
    }
  },

  /* ---------- API ---------- */
  async api(url, opts = {}, scope = this.scope()) {
    if (!this.tokenValid(scope)) throw driveError('auth', { needsAuth: true });
    const res = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + this.token.value } });
    if (res.ok) return res;
    let msg = `Google Drive error ${res.status}`;
    let reason = '';
    try {
      const body = await res.json();
      if (body.error) { msg = body.error.message || msg; reason = (body.error.errors && body.error.errors[0] && body.error.errors[0].reason) || ''; }
    } catch { /* not JSON */ }
    if (res.status === 401 || reason === 'insufficientPermissions' || /insufficient.*scope/i.test(msg)) {
      if (res.status === 401) { this.token = null; this.saveToken(); }
      throw driveError('auth', { needsAuth: true });
    }
    if (res.status === 404) msg = 'Not found in Google Drive. Check the folder link in Google Drive settings.';
    throw driveError(msg, { status: res.status });
  },
  async json(path) { return (await this.api(DRIVE_API + path)).json(); },

  async listChildren(folderId) {
    const out = [];
    let pageToken = '';
    do {
      const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,size,modifiedTime,videoMediaMetadata(durationMillis))');
      const r = await this.json(`/files?q=${q}&fields=${fields}&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true${pageToken ? '&pageToken=' + pageToken : ''}`);
      out.push(...(r.files || []));
      pageToken = r.nextPageToken || '';
    } while (pageToken);
    return out;
  },
  /** All media files in the folder and its subfolders. `top` is the first-level subfolder a file sits in. */
  async listTree() {
    const queue = [{ id: this.cfg.folderId, top: null, depth: 0 }];
    const found = [];
    while (queue.length) {
      const { id, top, depth } = queue.shift();
      for (const f of await this.listChildren(id)) {
        if (f.mimeType === FOLDER_MIME) {
          if (depth < 5) queue.push({ id: f.id, top: top || { id: f.id, name: f.name }, depth: depth + 1 });
        } else if (/^(audio|video)\//.test(f.mimeType || '') || MEDIA_EXT.test(f.name)) {
          found.push({ f, top });
        }
      }
    }
    return found;
  },

  async ensureCategory(folder) {
    let c = [...state.categories.values()].find(x => x.driveFolderId === folder.id)
      || [...state.categories.values()].find(x => !x.driveFolderId && x.name.toLowerCase() === folder.name.toLowerCase());
    if (!c) c = await createCategory(folder.name);
    if (c.driveFolderId !== folder.id || c.name !== folder.name) {
      c.driveFolderId = folder.id;
      if (c.name !== folder.name) c.name = folder.name; // follow renames in Drive
      await idbPut('categories', c);
    }
    return c;
  },

  /* ---------- sync ---------- */
  async sync() {
    if (this.syncing) return;
    this.syncing = true;
    toast('Syncing with Google Drive…', 0);
    try {
      const folder = await this.json(`/files/${this.cfg.folderId}?fields=id,name,mimeType&supportsAllDrives=true`);
      if (folder.mimeType !== FOLDER_MIME) throw driveError('That Google Drive link is a file, not a folder.');
      this.cfg.folderName = folder.name;
      const files = await this.listTree();

      const byDrive = new Map();
      for (const m of state.media.values()) if (m.driveId) byDrive.set(m.driveId, m);
      const hidden = new Set(prefs.driveHidden || []);
      const seen = new Set();
      const toPut = [];
      const dropBlobs = [];
      let added = 0;
      let order = 0;
      for (const { f, top } of files) {
        if (hidden.has(f.id)) continue;
        seen.add(f.id);
        const catId = this.cfg.subfolders && top ? (await this.ensureCategory(top)).id : null;
        const base = f.name.replace(/\.[^.]+$/, '') || f.name;
        let m = byDrive.get(f.id);
        if (!m) {
          m = {
            id: uid(), name: base, fileName: f.name, driveName: f.name,
            type: (f.mimeType || '').startsWith('video/') || (VIDEO_EXT.test(f.name) && !(f.mimeType || '').startsWith('audio/')) ? 'video' : 'audio',
            mime: f.mimeType || '', size: Number(f.size) || 0,
            duration: f.videoMediaMetadata && f.videoMediaMetadata.durationMillis ? Number(f.videoMediaMetadata.durationMillis) / 1000 : 0,
            added: Date.now() + order++, categories: catId ? [catId] : [],
            source: 'drive', driveId: f.id, modified: f.modifiedTime, cached: false,
          };
          state.media.set(m.id, m);
          toPut.push(m);
          added++;
          continue;
        }
        let changed = false;
        if (m.driveName !== f.name) {
          const oldBase = (m.driveName || '').replace(/\.[^.]+$/, '');
          if (!m.driveName || m.name === oldBase) m.name = base; // only follow renames you haven't overridden
          m.driveName = f.name; m.fileName = f.name; changed = true;
        }
        if (f.modifiedTime && m.modified !== f.modifiedTime) {
          if (m.modified && m.cached) { m.cached = false; dropBlobs.push(m.id); } // file changed in Drive: re-download next time
          m.modified = f.modifiedTime; m.size = Number(f.size) || m.size; changed = true;
        }
        if (catId && !m.categories.includes(catId)) { m.categories.push(catId); changed = true; }
        if (changed) toPut.push(m);
      }
      if (toPut.length || dropBlobs.length) {
        await idbWrite(['media', 'blobs'], s => {
          toPut.forEach(m => s('media').put(m));
          dropBlobs.forEach(id => s('blobs').delete(id));
        });
      }
      const gone = [...byDrive.values()].filter(m => m.source === 'drive' && !seen.has(m.driveId) && !hidden.has(m.driveId)).map(m => m.id);
      if (gone.length) await removeMediaRecords(gone);

      this.cfg.lastSync = Date.now();
      this.saveCfg();
      render();
      updateStorage();
      const parts = [`${plural(seen.size, 'file')} in “${folder.name}”`];
      if (added) parts.push(`${added} new`);
      if (gone.length) parts.push(`${gone.length} removed`);
      toast('Synced · ' + parts.join(' · '), 4000);
    } finally {
      this.syncing = false;
    }
  },

  /* ---------- files ---------- */
  download(m, { quiet = false } = {}) {
    if (this.downloads.has(m.id)) return this.downloads.get(m.id);
    const p = (async () => {
      setDownloadProgress(m.id, 0);
      try {
        const res = await this.api(`${DRIVE_API}/files/${m.driveId}?alt=media&supportsAllDrives=true`, {}, SCOPE_READ);
        const total = Number(res.headers.get('content-length')) || m.size || 0;
        const type = m.mime || res.headers.get('content-type') || '';
        let blob;
        if (res.body && res.body.getReader) {
          const reader = res.body.getReader();
          const chunks = [];
          let got = 0, lastPct = -1;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            got += value.length;
            const pct = total ? Math.min(99, Math.floor(got / total * 100)) : 0;
            if (pct !== lastPct) { lastPct = pct; setDownloadProgress(m.id, pct); }
          }
          blob = new Blob(chunks, { type });
        } else {
          blob = await res.blob();
        }
        if (!m.duration || !m.mime) {
          const info = await probe(blob);
          if (info.duration) m.duration = info.duration;
          if (info.hasVideo !== null) m.type = info.hasVideo ? 'video' : 'audio';
        }
        m.cached = true;
        await idbWrite(['blobs', 'media'], s => { s('blobs').put({ id: m.id, blob }); s('media').put(m); });
        updateStorage();
        if (!quiet) renderSidebar();
        return blob;
      } finally {
        this.downloads.delete(m.id);
        setDownloadProgress(m.id, null);
      }
    })();
    this.downloads.set(m.id, p);
    return p;
  },
  downloadAll(ids) {
    const todo = ids.map(id => state.media.get(id)).filter(m => m && m.source === 'drive' && !m.cached);
    if (!todo.length) { toast('Everything here is already saved on this device'); return; }
    this.connect().then(async () => {
      for (let i = 0; i < todo.length; i++) {
        toast(`Downloading ${i + 1} of ${todo.length}…`, 0);
        await this.download(todo[i], { quiet: true });
      }
      renderList();
      toast(`${plural(todo.length, 'file')} saved for offline use`);
    }).catch(e => this.handleError(e, () => this.downloadAll(ids)));
  },
  async removeOffline(m) {
    await idbWrite(['blobs', 'media'], s => { s('blobs').delete(m.id); m.cached = false; s('media').put(m); });
    renderList();
    updateStorage();
    toast('Offline copy removed. It will download again when you play it.');
  },

  async upload(blob, name, mime) {
    const init = await this.api(`${DRIVE_UPLOAD}/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,mimeType,size,modifiedTime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ name, parents: [this.cfg.folderId], mimeType: mime || undefined }),
    }, SCOPE_FULL);
    const location = init.headers.get('Location');
    if (!location) throw driveError('Google Drive didn\'t accept the upload.');
    const res = await fetch(location, { method: 'PUT', headers: { 'Content-Type': mime || 'application/octet-stream' }, body: blob });
    if (!res.ok) throw driveError(`Upload failed (${res.status})`);
    return res.json();
  },
  /** Upload library items to the folder; they then count as Drive files (so sync won't duplicate them). */
  async uploadItems(ids, { alreadyConnected = false } = {}) {
    if (!this.cfg.allowUpload) { toast('Turn on “Allow saving to this folder” in Google Drive settings first'); return; }
    try {
      if (!alreadyConnected) await this.connect();
      for (let i = 0; i < ids.length; i++) {
        const m = state.media.get(ids[i]);
        if (!m || m.source === 'drive') continue;
        toast(`Uploading ${i + 1} of ${ids.length} to Google Drive…`, 0);
        const blob = await getMediaBlob(m);
        const r = await this.upload(blob, m.fileName || m.name, m.mime || blob.type);
        Object.assign(m, { source: 'drive', driveId: r.id, driveName: r.name, fileName: r.name, modified: r.modifiedTime, cached: true });
        await idbPut('media', m);
      }
      render();
      toast(`Saved ${plural(ids.length, 'file')} to “${this.cfg.folderName || 'Google Drive'}”`);
    } catch (e) {
      this.handleError(e, () => this.uploadItems(ids, { alreadyConnected: true }));
    }
  },

  /* ---------- settings ---------- */
  async openSettings() {
    const c = this.cfg;
    const body = document.createElement('div');
    body.className = 'drive-settings';
    body.innerHTML = `
      <p class="modal-msg">Connect one Google Drive folder. Its audio and video files show up in your library and download to this device the first time you play them.</p>
      <label class="modal-label" for="dsFolder">Folder link</label>
      <input class="field" id="dsFolder" placeholder="https://drive.google.com/drive/folders/…" autocomplete="off" value="${esc(c.folderId ? 'https://drive.google.com/drive/folders/' + c.folderId : '')}">
      <label class="modal-label" for="dsClient">Google Client ID</label>
      <input class="field" id="dsClient" placeholder="123456-abc.apps.googleusercontent.com" autocomplete="off" spellcheck="false" value="${esc(c.clientId)}">
      <details class="ds-help">
        <summary>How do I get a Client ID? (one-time, about 5 minutes)</summary>
        <ol class="steps">
          <li>On a computer, go to <b>console.cloud.google.com</b> and create a project (any name).</li>
          <li>Open <b>APIs &amp; Services → Library</b>, find <b>Google Drive API</b> and click <b>Enable</b>.</li>
          <li>Open <b>Google Auth Platform</b> (or <b>OAuth consent screen</b>). Choose <b>External</b>, fill in the app name and your email, and under <b>Audience → Test users</b> add your own Google account.</li>
          <li>Open <b>Clients</b> (or <b>Credentials</b>) → <b>Create client</b> → type <b>Web application</b>. Under <b>Authorized JavaScript origins</b> add:<br><code>${esc(location.origin)}</code></li>
          <li>Copy the <b>Client ID</b> and paste it above.</li>
        </ol>
        <p class="modal-msg">The first time you connect, Google will say the app isn't verified. That's expected for a personal app: tap <b>Continue</b>.</p>
      </details>
      <label class="ed-check"><input type="checkbox" id="dsSub" ${c.subfolders ? 'checked' : ''}> Turn subfolders into categories</label>
      <label class="ed-check"><input type="checkbox" id="dsUpload" ${c.allowUpload ? 'checked' : ''}> Allow saving edited files back to this folder</label>
      ${this.token ? `<p class="modal-msg ds-status">Connected${c.folderName ? ` to “${esc(c.folderName)}”` : ''}. <button type="button" class="linklike" id="dsDisconnect">Disconnect</button></p>` : ''}`;
    body.addEventListener('click', e => {
      if (e.target.id === 'dsDisconnect') { this.disconnect(); e.target.parentElement.textContent = 'Disconnected.'; }
    });
    const ok = await openModal('Google Drive', body, 'Save & connect');
    if (!ok) return;
    const clientId = $('#dsClient', body).value.trim();
    const folderId = parseFolderId($('#dsFolder', body).value);
    if (!clientId || !folderId) {
      toast(!folderId ? 'Paste the link to a Google Drive folder' : 'Paste your Google Client ID', 5000);
      return;
    }
    if (!/\.apps\.googleusercontent\.com$/.test(clientId)) {
      toast('That Client ID doesn\'t look right. It should end in .apps.googleusercontent.com', 6000);
      return;
    }
    const folderChanged = folderId !== c.folderId;
    if (clientId !== c.clientId) this.disconnect();
    Object.assign(c, { clientId, folderId, subfolders: $('#dsSub', body).checked, allowUpload: $('#dsUpload', body).checked });
    if (folderChanged) { c.folderName = ''; c.lastSync = 0; }
    this.saveCfg();
    renderSidebar();
    this.connect()
      .then(() => this.sync())
      .then(() => setView({ type: 'drive' }))
      .catch(e => this.handleError(e));
  },
};
