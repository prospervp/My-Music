/* Editor: trim, split into pieces, fade and change volume of audio and video files.
 * Saving uses FFmpeg (WebAssembly) on this device. Cuts are copied without re-encoding when possible,
 * so they're fast and keep the original quality. Nothing is uploaded unless you ask for it. */
'use strict';

const fmtPrecise = t => {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60), s = t - m * 60;
  const h = Math.floor(m / 60);
  const ss = s.toFixed(1).padStart(4, '0');
  return h ? `${h}:${String(m % 60).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* =========================================================================
 * Export engine
 * ========================================================================= */
const KNOWN_EXT = ['mp3', 'm4a', 'aac', 'wav', 'flac', 'ogg', 'oga', 'opus', 'weba', 'webm', 'mp4', 'm4v', 'mov', 'mkv', '3gp'];
const AUDIO_ENC = {
  mp3: ['-c:a', 'libmp3lame', '-q:a', '2'],
  ogg: ['-c:a', 'libvorbis', '-q:a', '6'], oga: ['-c:a', 'libvorbis', '-q:a', '6'],
  opus: ['-c:a', 'libopus', '-b:a', '160k'], weba: ['-c:a', 'libopus', '-b:a', '160k'],
  webm: ['-c:a', 'libopus', '-b:a', '160k'], mkv: ['-c:a', 'libopus', '-b:a', '160k'],
  flac: ['-c:a', 'flac'], wav: ['-c:a', 'pcm_s16le'],
};
const AAC_ENC = ['-c:a', 'aac', '-b:a', '192k'];
const VIDEO_ENC = {
  webm: ['-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '3M'],
  default: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20', '-pix_fmt', 'yuv420p'],
};
const EXT_MIME = {
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg', oga: 'audio/ogg',
  opus: 'audio/ogg', weba: 'audio/webm', mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', mkv: 'video/x-matroska', '3gp': 'video/3gpp',
};
const WASM_SIZE = 32129114;

function loadScriptOnce(src) {
  if (document.querySelector(`script[data-src="${src}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.dataset.src = src;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error('Couldn\'t load the editing tools. Check your connection and try again.')); };
    document.head.appendChild(s);
  });
}
async function fetchWithProgress(url, onFrac) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Couldn\'t download the editing tools (' + res.status + ')');
  let total = Number(res.headers.get('content-length')) || 0;
  if (res.headers.get('content-encoding') || total < WASM_SIZE / 2) total = WASM_SIZE;
  if (!res.body || !res.body.getReader) return URL.createObjectURL(await res.blob());
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onFrac(Math.min(0.99, got / total));
  }
  return URL.createObjectURL(new Blob(chunks, { type: 'application/wasm' }));
}

function extOfMedia(m, blob) {
  let ext = (m.fileName && m.fileName.includes('.')) ? m.fileName.split('.').pop().toLowerCase() : '';
  if (!KNOWN_EXT.includes(ext)) ext = extForMime(m.mime || (blob && blob.type) || '');
  if (!KNOWN_EXT.includes(ext)) ext = m.type === 'video' ? 'mp4' : 'm4a';
  return ext;
}

const Exporter = {
  ff: null,
  loading: null,

  async load(onStatus) {
    if (this.ff) return this.ff;
    if (!this.loading) {
      this.loading = (async () => {
        const base = new URL('vendor/ffmpeg/', location.href).href;
        onStatus('Getting the editing tools ready…', 0);
        await loadScriptOnce(base + 'ffmpeg.js');
        const wasmURL = await fetchWithProgress(base + 'ffmpeg-core.wasm',
          f => onStatus(`Getting the editing tools ready (one-time 32 MB download)… ${Math.round(f * 100)}%`, f));
        onStatus('Starting the editing tools…', 1);
        const ff = new FFmpegWASM.FFmpeg();
        await ff.load({ coreURL: base + 'ffmpeg-core.js', wasmURL });
        URL.revokeObjectURL(wasmURL);
        this.ff = ff;
        return ff;
      })();
    }
    try { return await this.loading; } catch (e) { this.loading = null; throw e; }
  },

  /** Returns [{ blob, ext, mime, seg }]. */
  async run(m, blob, segs, opts, onStatus) {
    let ff;
    try {
      ff = await this.load(onStatus);
    } catch (e) {
      console.warn('Editing engine unavailable', e);
      if (m.type === 'audio') return this.runWav(blob, segs, opts, onStatus);
      throw e;
    }
    try {
      return await this.runFF(ff, m, blob, segs, opts, onStatus);
    } catch (e) {
      console.warn('FFmpeg export failed', e);
      if (m.type === 'audio') return this.runWav(blob, segs, opts, onStatus);
      throw e;
    }
  },

  args(inPath, out, seg, opts, type, ext) {
    const d = seg.end - seg.start;
    const a = ['-ss', seg.start.toFixed(3), '-i', inPath, '-t', d.toFixed(3)];
    const filters = [];
    if (opts.fadeIn > 0) filters.push(`afade=t=in:st=0:d=${Math.min(opts.fadeIn, d).toFixed(3)}`);
    if (opts.fadeOut > 0) filters.push(`afade=t=out:st=${Math.max(0, d - opts.fadeOut).toFixed(3)}:d=${Math.min(opts.fadeOut, d).toFixed(3)}`);
    if (Math.abs(opts.gain - 1) > 0.001) filters.push(`volume=${opts.gain.toFixed(2)}`);
    if (type === 'video') {
      a.push('-map', '0:v:0?', '-map', '0:a?');
      a.push(...(opts.precise ? (VIDEO_ENC[ext] || VIDEO_ENC.default) : ['-c:v', 'copy']));
    } else {
      a.push('-map', '0:a:0');
    }
    const exactVideo = type === 'video' && opts.precise;
    if (filters.length) a.push('-af', filters.join(','));
    // Exact video cuts re-encode the sound too, otherwise it would start at the previous key frame.
    if (filters.length || exactVideo) a.push(...(AUDIO_ENC[ext] || AAC_ENC));
    else a.push('-c:a', 'copy');
    if (!exactVideo) a.push('-avoid_negative_ts', 'make_zero');
    if (['mp4', 'm4a', 'm4v', 'mov', '3gp'].includes(ext)) a.push('-movflags', '+faststart');
    a.push('-y', out);
    return a;
  },

  async runFF(ff, m, blob, segs, opts, onStatus) {
    const ext = extOfMedia(m, blob);
    const inName = 'input.' + ext;
    let inPath = inName, mounted = false;
    try {
      await ff.createDir('/in').catch(() => {});
      await ff.mount('WORKERFS', { blobs: [{ name: inName, data: blob }] }, '/in');
      inPath = '/in/' + inName;
      mounted = true;
    } catch {
      onStatus('Reading the file…', 0);
      await ff.writeFile(inName, new Uint8Array(await blob.arrayBuffer()));
    }
    let cur = 0;
    const logs = [];
    const onLog = ({ message }) => { logs.push(message); if (logs.length > 30) logs.shift(); };
    const onProgress = ({ progress }) => {
      const p = clamp(Number(progress) || 0, 0, 1);
      onStatus(`Saving piece ${cur + 1} of ${segs.length}…`, (cur + p) / segs.length);
    };
    ff.on('log', onLog);
    ff.on('progress', onProgress);
    const results = [];
    try {
      for (cur = 0; cur < segs.length; cur++) {
        onStatus(`Saving piece ${cur + 1} of ${segs.length}…`, cur / segs.length);
        const out = `out${cur}.${ext}`;
        const code = await ff.exec(this.args(inPath, out, segs[cur], opts, m.type, ext));
        if (code !== 0) throw new Error('Editing failed. ' + logs.slice(-2).join(' '));
        const data = await ff.readFile(out);
        await ff.deleteFile(out).catch(() => {});
        if (!data || !data.length) throw new Error('Editing produced an empty file.');
        const mime = EXT_MIME[ext] || (m.type === 'video' ? 'video/' : 'audio/') + ext;
        results.push({ blob: new Blob([data], { type: mime }), ext, mime, seg: segs[cur] });
      }
    } finally {
      ff.off('log', onLog);
      ff.off('progress', onProgress);
      if (mounted) { await ff.unmount('/in').catch(() => {}); await ff.deleteDir('/in').catch(() => {}); }
      else await ff.deleteFile(inName).catch(() => {});
    }
    return results;
  },

  /** Fallback for audio when FFmpeg can't run: cut in the browser and save as WAV. */
  async runWav(blob, segs, opts, onStatus) {
    onStatus('Decoding audio…', 0);
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Ctx(2, 1, 44100);
    const ab = await ctx.decodeAudioData(await blob.arrayBuffer());
    const sr = ab.sampleRate;
    const chans = Math.min(2, ab.numberOfChannels);
    const results = [];
    for (let k = 0; k < segs.length; k++) {
      onStatus(`Saving piece ${k + 1} of ${segs.length}…`, k / segs.length);
      const seg = segs[k];
      const s0 = Math.floor(seg.start * sr), s1 = Math.min(ab.length, Math.floor(seg.end * sr));
      const n = Math.max(0, s1 - s0);
      const fi = Math.floor((opts.fadeIn || 0) * sr), fo = Math.floor((opts.fadeOut || 0) * sr);
      const channels = [];
      for (let c = 0; c < chans; c++) {
        const src = ab.getChannelData(c).subarray(s0, s1);
        const out = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          let g = opts.gain;
          if (fi && i < fi) g *= i / fi;
          if (fo && i > n - fo) g *= (n - i) / fo;
          out[i] = clamp(src[i] * g, -1, 1);
        }
        channels.push(out);
      }
      results.push({ blob: encodeWav(channels, sr), ext: 'wav', mime: 'audio/wav', seg });
      await new Promise(r => setTimeout(r, 0));
    }
    return results;
  },
};

function encodeWav(channels, sampleRate) {
  const nCh = channels.length, n = channels[0].length;
  const buf = new ArrayBuffer(44 + n * nCh * 2);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * nCh * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nCh, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * nCh * 2, true); v.setUint16(32, nCh * 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * nCh * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nCh; c++) {
      const s = channels[c][i];
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([buf], { type: 'audio/wav' });
}

async function computePeaks(blob, buckets = 8000) {
  if (blob.size > 400 * 1024 * 1024) return null; // too big to decode comfortably on a phone
  try {
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    let ctx;
    try { ctx = new Ctx(1, 1, 8000); } catch { ctx = new Ctx(1, 1, 22050); }
    const ab = await ctx.decodeAudioData(await blob.arrayBuffer());
    const chans = [];
    for (let c = 0; c < Math.min(2, ab.numberOfChannels); c++) chans.push(ab.getChannelData(c));
    const len = chans[0].length;
    const n = Math.min(buckets, len);
    const peaks = new Float32Array(n);
    let max = 0;
    for (let b = 0; b < n; b++) {
      const from = Math.floor(b * len / n), to = Math.floor((b + 1) * len / n);
      let p = 0;
      for (const ch of chans) for (let i = from; i < to; i++) { const a = Math.abs(ch[i]); if (a > p) p = a; }
      peaks[b] = p;
      if (p > max) max = p;
    }
    if (max > 0) for (let b = 0; b < n; b++) peaks[b] /= max;
    return peaks;
  } catch (e) {
    console.warn('No waveform', e);
    return null;
  }
}

/* =========================================================================
 * Editor UI
 * ========================================================================= */
const edVideo = $('#edVideo');
const edCanvas = $('#edCanvas');
const edScroll = $('#edScroll');
const edPlayhead = document.createElement('div');
edPlayhead.className = 'ed-playhead';
edScroll.appendChild(edPlayhead);

const Editor = {
  m: null, blob: null, url: null, duration: 0,
  start: 0, end: 0, splits: [], names: [], keep: [],
  history: [], peaks: null, zoom: 1, drag: null, playUntil: null, raf: 0, openToken: 0, pushedState: false,

  isOpen() { return !$('#editor').hidden; },

  async open(id) {
    const m = state.media.get(id);
    if (!m) return;
    const token = ++this.openToken;
    if (!video.paused) video.pause();
    let blob;
    try {
      toast(m.source === 'drive' && !m.cached ? 'Downloading from Google Drive…' : 'Opening the editor…', 0);
      blob = await getMediaBlob(m);
    } catch (e) {
      if (e && e.needsAuth) toast('Connect to Google Drive to edit this file', 0, { label: 'Connect', onClick: () => Drive.connect().then(() => this.open(id)) });
      else toast(`Couldn't open “${m.name}”: ${e && e.message ? e.message : e}`, 6000);
      return;
    }
    if (token !== this.openToken) return;
    if (!blob) { toast('Couldn\'t find this file'); return; }
    $('#toast').hidden = true;

    this.m = m; this.blob = blob;
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(blob);
    this.peaks = null;
    edVideo.src = this.url;
    const dur = await this.readDuration();
    if (token !== this.openToken) return;
    this.duration = dur || m.duration || 0;
    if (!this.duration) { toast('This file can\'t be edited in this browser (unknown length).', 6000); this.teardown(); return; }
    if (!m.duration) { m.duration = this.duration; idbPut('media', m); }

    this.start = 0; this.end = this.duration; this.splits = []; this.names = []; this.keep = []; this.history = [];
    this.zoom = 1; this.playUntil = null;
    $('#edName').textContent = m.name;
    $('#edPreview').classList.toggle('audio', m.type !== 'video');
    $('#edPreciseRow').hidden = m.type !== 'video';
    $('#edFadeIn').value = 0; $('#edFadeOut').value = 0; $('#edGain').value = 100; $('#edGainOut').textContent = '100%';
    $('#edPrecise').checked = false; $('#edMakePlaylist').checked = false; $('#edReplace').checked = false;
    document.querySelector('.ed-options').open = false;
    const canUpload = Drive.configured() && Drive.cfg.allowUpload;
    $('#edUploadRow').hidden = !canUpload;
    $('#edUpload').checked = false;
    $('#editor').hidden = false;
    document.body.classList.add('editing');
    $('#edBody').scrollTop = 0;
    if (!this.pushedState) { try { history.pushState({ editor: true }, ''); this.pushedState = true; } catch { /* ignore */ } }
    this.layout();
    this.renderSegments();
    this.updateTime();
    computePeaks(blob).then(p => { if (token === this.openToken) { this.peaks = p; this.draw(); } });
  },

  readDuration() {
    return new Promise(resolve => {
      let done = false;
      const finish = d => { if (done) return; done = true; edVideo.onloadedmetadata = edVideo.ondurationchange = edVideo.onerror = null; resolve(isFinite(d) ? d : 0); };
      edVideo.onerror = () => finish(0);
      edVideo.onloadedmetadata = () => {
        if (isFinite(edVideo.duration) && edVideo.duration > 0) { finish(edVideo.duration); return; }
        // Some recordings (e.g. from a phone browser) don't store their length: seek to the end to find it.
        edVideo.ondurationchange = () => { if (isFinite(edVideo.duration)) { edVideo.currentTime = 0; finish(edVideo.duration); } };
        edVideo.currentTime = 1e9;
      };
      setTimeout(() => finish(edVideo.duration), 15000);
    });
  },

  async close(force = false) {
    if (!this.isOpen()) return;
    if (!force && this.history.length) {
      const ok = await confirmBox('Discard your changes?', 'You have cuts or trims that haven\'t been saved.', 'Discard');
      if (!ok) return;
    }
    this.teardown();
    if (this.pushedState) { this.pushedState = false; try { history.back(); } catch { /* ignore */ } }
  },
  teardown() {
    this.openToken++;
    edVideo.pause();
    cancelAnimationFrame(this.raf);
    edVideo.removeAttribute('src');
    edVideo.load();
    if (this.url) { URL.revokeObjectURL(this.url); this.url = null; }
    this.blob = null; this.m = null;
    $('#editor').hidden = true;
    document.body.classList.remove('editing');
  },

  /* ---------- model ---------- */
  segments() {
    const inner = this.splits.filter(s => s > this.start + 0.01 && s < this.end - 0.01);
    const pts = [this.start, ...inner, this.end];
    const count = pts.length - 1;
    return pts.slice(0, -1).map((s, i) => ({
      i, start: s, end: pts[i + 1],
      name: this.names[i] || (count === 1 ? `${this.m.name} (edited)` : `${this.m.name} – part ${i + 1}`),
      keep: this.keep[i] !== false,
    }));
  },
  snapshot() { return { start: this.start, end: this.end, splits: this.splits.slice(), names: this.names.slice(), keep: this.keep.slice() }; },
  pushHistory() { this.history.push(this.snapshot()); if (this.history.length > 100) this.history.shift(); },
  undo() {
    const s = this.history.pop();
    if (!s) { toast('Nothing to undo'); return; }
    Object.assign(this, s);
    this.changed();
  },
  reset() {
    if (!this.history.length && !this.splits.length) return;
    this.pushHistory();
    this.start = 0; this.end = this.duration; this.splits = []; this.names = []; this.keep = [];
    this.changed();
  },
  segIndexAt(t) { return this.segments().findIndex(s => t >= s.start && t < s.end); },
  splitAt(t) {
    if (t <= this.start + 0.05 || t >= this.end - 0.05) { toast('Move the playhead inside the part you\'re keeping, then split'); return; }
    if (this.splits.some(s => Math.abs(s - t) < 0.05)) { toast('There\'s already a cut here'); return; }
    this.pushHistory();
    const k = this.segIndexAt(t);
    this.splits.push(t);
    this.splits.sort((a, b) => a - b);
    this.names.splice(k + 1, 0, undefined);
    this.keep.splice(k + 1, 0, true);
    this.changed();
  },
  removeSplitAfter(i) {
    const segs = this.segments();
    if (i >= segs.length - 1) return;
    const t = segs[i].end;
    this.pushHistory();
    this.splits = this.splits.filter(s => Math.abs(s - t) > 1e-6);
    this.names.splice(i + 1, 1);
    this.keep.splice(i + 1, 1);
    this.changed();
  },
  setStart(t) {
    if (t >= this.end - 0.1) { toast('The start must be before the end'); return; }
    this.pushHistory(); this.start = Math.max(0, t); this.changed();
  },
  setEnd(t) {
    if (t <= this.start + 0.1) { toast('The end must be after the start'); return; }
    this.pushHistory(); this.end = Math.min(this.duration, t); this.changed();
  },
  changed() { this.draw(); this.renderSegments(); },

  /* ---------- timeline ---------- */
  width() { return Math.max(edScroll.clientWidth, 100) * this.zoom; },
  xOf(t) { return t / this.duration * this.width(); },
  tOf(x) { return clamp(x / this.width() * this.duration, 0, this.duration); },
  layout() { this.draw(); this.updatePlayhead(); },
  setZoom(z) {
    const maxZoom = Math.max(1, Math.floor(30000 / ((devicePixelRatio || 1) * Math.max(edScroll.clientWidth, 100))));
    z = clamp(z, 1, Math.min(64, maxZoom));
    if (z === this.zoom) return;
    this.zoom = z;
    $('#edZoomLabel').textContent = z + '×';
    this.draw();
    edScroll.scrollLeft = this.xOf(edVideo.currentTime) - edScroll.clientWidth / 2;
    this.updatePlayhead();
  },
  draw() {
    if (!this.m) return;
    const dpr = devicePixelRatio || 1;
    const W = this.width(), H = edScroll.clientHeight || 132;
    if (edCanvas.width !== Math.round(W * dpr) || edCanvas.height !== Math.round(H * dpr)) {
      edCanvas.width = Math.round(W * dpr); edCanvas.height = Math.round(H * dpr);
      edCanvas.style.width = W + 'px'; edCanvas.style.height = H + 'px';
    }
    const g = edCanvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue('--accent').trim() || '#d2502d';
    const text = css.getPropertyValue('--text').trim() || '#222';
    const muted = css.getPropertyValue('--muted').trim() || '#888';
    const line = css.getPropertyValue('--line').trim() || '#ddd';
    const rulerH = 18, top = rulerH + 4, bottom = H - 6, mid = (top + bottom) / 2, amp = (bottom - top) / 2;

    // Ruler
    g.fillStyle = muted; g.font = '10px system-ui, sans-serif'; g.textBaseline = 'top';
    const pxPerSec = W / this.duration;
    const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    const step = steps.find(s => s * pxPerSec >= 70) || 3600;
    g.strokeStyle = line; g.lineWidth = 1;
    for (let t = 0; t <= this.duration + 1e-9; t += step) {
      const x = Math.round(this.xOf(t)) + 0.5;
      g.beginPath(); g.moveTo(x, rulerH - 6); g.lineTo(x, rulerH); g.stroke();
      const label = step < 1 ? fmtPrecise(t) : fmtTime(t);
      if (x + 30 < W) g.fillText(label, x + 3, 2);
    }

    // Pieces background
    const segs = this.segments();
    segs.forEach((s, i) => {
      g.fillStyle = s.keep ? (i % 2 ? 'rgba(127,127,127,.10)' : 'rgba(127,127,127,.18)') : 'rgba(127,127,127,.04)';
      g.fillRect(this.xOf(s.start), top - 2, this.xOf(s.end) - this.xOf(s.start), bottom - top + 4);
    });

    // Waveform
    const keepAt = t => { const s = segs.find(z => t >= z.start && t < z.end); return s ? s.keep : null; };
    if (this.peaks) {
      const n = this.peaks.length;
      const barW = Math.max(1, Math.min(3, W / n));
      const gap = barW >= 2 ? 1 : 0;
      for (let x = 0; x < W; x += barW + gap) {
        const a = Math.floor(x / W * n), b = Math.max(a + 1, Math.floor((x + barW) / W * n));
        let p = 0;
        for (let i = a; i < b && i < n; i++) if (this.peaks[i] > p) p = this.peaks[i];
        const h = Math.max(1, p * amp);
        const k = keepAt(this.tOf(x));
        g.fillStyle = k === true ? text : muted;
        g.globalAlpha = k === true ? 0.75 : 0.3;
        g.fillRect(x, mid - h, barW, h * 2);
      }
      g.globalAlpha = 1;
    } else {
      g.fillStyle = muted; g.globalAlpha = 0.35;
      g.fillRect(0, mid - 1, W, 2);
      g.globalAlpha = 1;
    }

    // Trimmed-off areas
    g.fillStyle = 'rgba(0,0,0,.28)';
    g.fillRect(0, top - 2, this.xOf(this.start), bottom - top + 4);
    g.fillRect(this.xOf(this.end), top - 2, W - this.xOf(this.end), bottom - top + 4);

    // Cuts
    for (const s of segs.slice(1)) {
      const x = Math.round(this.xOf(s.start)) + 0.5;
      g.strokeStyle = accent; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, top - 2); g.lineTo(x, bottom + 2); g.stroke();
      g.fillStyle = accent;
      g.beginPath(); g.moveTo(x - 6, top - 4); g.lineTo(x + 6, top - 4); g.lineTo(x, top + 4); g.closePath(); g.fill();
      g.beginPath(); g.arc(x, bottom - 6, 6, 0, Math.PI * 2); g.fill();
    }

    // Trim handles
    const handle = (t, side) => {
      const x = this.xOf(t);
      const hx = side === 'start' ? x : x - 10;
      g.fillStyle = accent;
      g.beginPath();
      if (g.roundRect) g.roundRect(hx, top - 4, 10, bottom - top + 8, side === 'start' ? [4, 0, 0, 4] : [0, 4, 4, 0]);
      else g.rect(hx, top - 4, 10, bottom - top + 8);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,.85)';
      g.fillRect(hx + 4, mid - 8, 2, 16);
    };
    handle(this.start, 'start');
    handle(this.end, 'end');

    // Piece numbers
    if (segs.length > 1) {
      g.font = 'bold 11px system-ui, sans-serif'; g.textBaseline = 'bottom';
      segs.forEach((s, i) => {
        const w = this.xOf(s.end) - this.xOf(s.start);
        if (w < 22) return;
        g.fillStyle = s.keep ? accent : muted;
        g.fillText(String(i + 1), this.xOf(s.start) + 12, bottom);
      });
    }
  },
  updatePlayhead() {
    if (!this.m) return;
    const x = this.xOf(edVideo.currentTime || 0);
    edPlayhead.style.transform = `translateX(${x}px)`;
    if (!edVideo.paused && !this.drag) {
      const left = edScroll.scrollLeft, w = edScroll.clientWidth;
      if (x < left || x > left + w - 30) edScroll.scrollLeft = x - 40;
    }
  },
  updateTime() {
    const t = edVideo.currentTime || 0;
    $('#edTime').innerHTML = `${fmtPrecise(t)} <span>/ ${fmtPrecise(this.duration)}</span>`;
    const playing = !edVideo.paused;
    $('#edPlay').innerHTML = playing ? ICON.pause : ICON.play;
    $('#edPlay').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    this.updatePlayhead();
  },
  seek(t) {
    edVideo.currentTime = clamp(t, 0, this.duration);
    this.updateTime();
  },
  tick() {
    if (this.playUntil !== null && edVideo.currentTime >= this.playUntil) {
      edVideo.pause();
      edVideo.currentTime = this.playUntil;
      this.playUntil = null;
    }
    this.updateTime();
    if (!edVideo.paused) this.raf = requestAnimationFrame(() => this.tick());
  },
  togglePlay() {
    this.playUntil = null;
    if (edVideo.paused) {
      if (edVideo.currentTime >= this.duration - 0.05) edVideo.currentTime = 0;
      edVideo.play().catch(() => {});
    } else edVideo.pause();
  },
  playPiece(i) {
    const s = this.segments()[i];
    if (!s) return;
    edVideo.currentTime = s.start;
    this.playUntil = s.end;
    edVideo.play().catch(() => {});
  },

  /* ---------- pieces list ---------- */
  renderSegments() {
    if (!this.m) return;
    const segs = this.segments();
    const keepCount = segs.filter(s => s.keep).length;
    $('#edCount').textContent = segs.length > 1 ? `${segs.length} · ${keepCount} to save` : '';
    $('#edSave').textContent = keepCount > 1 ? `Save ${keepCount} pieces` : 'Save';
    const active = document.activeElement;
    if (active && active.closest && active.closest('#edSegments') && active.classList.contains('seg-name')) {
      // Don't rebuild while you're typing a name; just refresh times.
      segs.forEach(s => {
        const row = $(`#edSegments .piece[data-i="${s.i}"] .seg-time`);
        if (row) row.textContent = this.segTimeText(s);
      });
      return;
    }
    $('#edSegments').innerHTML = segs.map(s => `
      <div class="piece ${s.keep ? '' : 'skipped'}" data-i="${s.i}">
        <button class="icon-btn small seg-play" title="Play this piece" aria-label="Play piece ${s.i + 1}">${ICON.play}</button>
        <span class="seg-num">${s.i + 1}</span>
        <div class="seg-main">
          <input class="seg-name" value="${esc(s.name)}" aria-label="Name for piece ${s.i + 1}" maxlength="200">
          <div class="seg-time">${this.segTimeText(s)}</div>
        </div>
        <label class="seg-keep" title="Save this piece"><input type="checkbox" ${s.keep ? 'checked' : ''}> Keep</label>
        ${s.i < segs.length - 1 ? `<button class="icon-btn small seg-merge" title="Join with the next piece (remove this cut)" aria-label="Join with next piece">${ICON.remove}</button>` : '<span class="seg-merge-placeholder"></span>'}
      </div>`).join('');
  },
  segTimeText(s) { return `${fmtPrecise(s.start)} – ${fmtPrecise(s.end)} · ${(s.end - s.start).toFixed(1)} s`; },

  /* ---------- save ---------- */
  options() {
    return {
      fadeIn: Math.max(0, Number($('#edFadeIn').value) || 0),
      fadeOut: Math.max(0, Number($('#edFadeOut').value) || 0),
      gain: (Number($('#edGain').value) || 100) / 100,
      precise: this.m.type === 'video' && $('#edPrecise').checked,
    };
  },
  busy(text, frac) {
    $('#edBusy').hidden = text === null;
    if (text === null) return;
    $('#edBusyText').textContent = text;
    $('#edBusyBar').style.width = Math.round(clamp(frac || 0, 0, 1) * 100) + '%';
  },
  async save() {
    const m = this.m;
    if (!m) return;
    const segs = this.segments().filter(s => s.keep);
    const opts = this.options();
    if (!segs.length) { toast('Tick “Keep” on at least one piece'); return; }
    const untouched = segs.length === 1 && segs[0].start < 0.01 && Math.abs(segs[0].end - this.duration) < 0.01
      && !opts.fadeIn && !opts.fadeOut && Math.abs(opts.gain - 1) < 0.001;
    if (untouched) { toast('Nothing to save yet: trim, split or change the sound first', 4000); return; }

    const wantUpload = !$('#edUploadRow').hidden && $('#edUpload').checked;
    const auth = wantUpload ? Drive.connect() : null; // must start straight from the tap
    if (auth) auth.catch(() => {});
    const makePlaylist = $('#edMakePlaylist').checked;
    const replace = $('#edReplace').checked;
    edVideo.pause();

    let results;
    this.busy('Preparing…', 0);
    try {
      results = await Exporter.run(m, this.blob, segs, opts, (t, f) => this.busy(t, f));
    } catch (e) {
      console.error(e);
      this.busy(null);
      toast(`Couldn't save: ${e && e.message ? e.message : e}`, 8000);
      return;
    }

    this.busy('Adding to your library…', 1);
    const now = Date.now();
    const items = results.map((r, i) => ({
      id: uid(),
      name: r.seg.name.trim() || `${m.name} – part ${i + 1}`,
      fileName: `${(r.seg.name.trim() || m.name).replace(/[\\/:*?"<>|]+/g, '_')}.${r.ext}`,
      type: m.type, mime: r.mime, size: r.blob.size,
      duration: r.seg.end - r.seg.start,
      added: now + (results.length - i), // keeps pieces in order under "Recently added"
      categories: m.categories.filter(c => state.categories.has(c)),
      source: 'local', cached: true, editedFrom: m.id,
    }));
    try {
      await idbWrite(['media', 'blobs'], s => items.forEach((it, i) => { s('blobs').put({ id: it.id, blob: results[i].blob }); s('media').put(it); }));
    } catch (e) {
      this.busy(null);
      toast('Couldn\'t save. Your device storage may be full.', 8000);
      return;
    }
    items.forEach(it => state.media.set(it.id, it));
    const newIds = items.map(it => it.id);

    if (replace) {
      const changed = [];
      for (const p of state.playlists.values()) {
        const at = p.items.indexOf(m.id);
        if (at >= 0) { p.items.splice(at, 1, ...newIds.filter(id => !p.items.includes(id))); changed.push(p); }
      }
      if (changed.length) await idbWrite(['playlists'], s => changed.forEach(p => s('playlists').put(p)));
      await removeMediaRecords([m.id], { hideFromSync: true });
    }
    let playlist = null;
    if (makePlaylist) playlist = await createPlaylist(`${m.name} – pieces`, newIds);

    this.busy(null);
    this.teardown();
    if (this.pushedState) { this.pushedState = false; try { history.back(); } catch { /* ignore */ } }
    if (playlist) setView({ type: 'playlist', id: playlist.id }); else render();
    updateStorage();
    toast(items.length === 1 ? `Saved “${items[0].name}”` : `Saved ${items.length} pieces`, 4000);

    if (wantUpload) {
      try { await auth; await Drive.uploadItems(newIds, { alreadyConnected: true }); }
      catch (e) { Drive.handleError(e, () => Drive.uploadItems(newIds)); }
    }
  },
};

/* ---------- wiring ---------- */
$('#edClose').innerHTML = ICON.back;
$('#edZoomIn').innerHTML = ICON.plus;
$('#edZoomOut').innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>';
$('#edSetStart').innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 4v16"/><path d="M10 12h10M16 8l4 4-4 4"/></svg><span>Start here</span>';
$('#edSplit').innerHTML = `${ICON.scissors}<span>Split here</span>`;
$('#edSetEnd').innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 4v16"/><path d="M14 12H4M8 8l-4 4 4 4"/></svg><span>End here</span>';
$('#edUndo').innerHTML = `${ICON.undo}<span>Undo</span>`;
$('#edReset').innerHTML = '<span>Reset</span>';

$('#edClose').addEventListener('click', () => Editor.close());
$('#edSave').addEventListener('click', () => Editor.save());
$('#edPlay').addEventListener('click', () => Editor.togglePlay());
$('#edZoomIn').addEventListener('click', () => Editor.setZoom(Editor.zoom * 2));
$('#edZoomOut').addEventListener('click', () => Editor.setZoom(Editor.zoom / 2));
$('#edSetStart').addEventListener('click', () => Editor.setStart(edVideo.currentTime));
$('#edSetEnd').addEventListener('click', () => Editor.setEnd(edVideo.currentTime));
$('#edSplit').addEventListener('click', () => Editor.splitAt(edVideo.currentTime));
$('#edUndo').addEventListener('click', () => Editor.undo());
$('#edReset').addEventListener('click', () => Editor.reset());
document.querySelector('.ed-transport').addEventListener('click', e => {
  const b = e.target.closest('[data-nudge]');
  if (b) Editor.seek(edVideo.currentTime + Number(b.dataset.nudge));
});
$('#edGain').addEventListener('input', e => { $('#edGainOut').textContent = e.target.value + '%'; setRangeFill(e.target); });
edVideo.addEventListener('play', () => { cancelAnimationFrame(Editor.raf); Editor.tick(); });
edVideo.addEventListener('pause', () => Editor.updateTime());
edVideo.addEventListener('seeked', () => Editor.updateTime());
edVideo.addEventListener('click', () => Editor.togglePlay());

$('#edSegments').addEventListener('click', e => {
  const row = e.target.closest('.piece');
  if (!row) return;
  const i = Number(row.dataset.i);
  if (e.target.closest('.seg-play')) { Editor.playPiece(i); return; }
  if (e.target.closest('.seg-merge')) { Editor.removeSplitAfter(i); return; }
  if (e.target.closest('.seg-keep') || e.target.closest('.seg-name')) return;
  const s = Editor.segments()[i];
  if (s) Editor.seek(s.start);
});
$('#edSegments').addEventListener('change', e => {
  if (!e.target.closest('.seg-keep')) return;
  const i = Number(e.target.closest('.piece').dataset.i);
  Editor.pushHistory();
  Editor.keep[i] = e.target.checked;
  Editor.changed();
});
$('#edSegments').addEventListener('input', e => {
  if (!e.target.classList.contains('seg-name')) return;
  const i = Number(e.target.closest('.piece').dataset.i);
  Editor.names[i] = e.target.value;
});
$('#edSegments').addEventListener('focusout', () => setTimeout(() => {
  if (!document.activeElement || !document.activeElement.classList.contains('seg-name')) Editor.renderSegments();
}, 0));

// Timeline gestures: drag handles/cuts, tap or drag to move the playhead, swipe to scroll when zoomed in.
edCanvas.addEventListener('pointerdown', e => {
  if (!Editor.m) return;
  const rect = edCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const tol = e.pointerType === 'touch' ? 22 : 10;
  const cands = [{ kind: 'start', x: Editor.xOf(Editor.start) + 5 }, { kind: 'end', x: Editor.xOf(Editor.end) - 5 }];
  Editor.splits.forEach((s, i) => { if (s > Editor.start && s < Editor.end) cands.push({ kind: 'split', i, x: Editor.xOf(s) }); });
  let best = null;
  for (const c of cands) { const d = Math.abs(c.x - x); if (d <= tol && (!best || d < best.d)) best = { ...c, d }; }
  Editor.drag = best
    ? { kind: best.kind, i: best.i, startX: e.clientX, moved: false }
    : { kind: Editor.zoom > 1 ? 'pending' : 'scrub', startX: e.clientX, scroll0: edScroll.scrollLeft, moved: false };
  if (!best && Editor.zoom === 1) Editor.seek(Editor.tOf(x));
  edCanvas.setPointerCapture(e.pointerId);
  e.preventDefault();
});
edCanvas.addEventListener('pointermove', e => {
  const d = Editor.drag;
  if (!d) {
    // Hover cursor feedback (mouse)
    if (Editor.m && e.pointerType === 'mouse') {
      const x = e.clientX - edCanvas.getBoundingClientRect().left;
      const near = [Editor.start, Editor.end, ...Editor.splits].some(t => Math.abs(Editor.xOf(t) - x) < 10);
      edCanvas.style.cursor = near ? 'ew-resize' : 'pointer';
    }
    return;
  }
  const dx = e.clientX - d.startX;
  if (!d.moved && Math.abs(dx) < 4) return;
  if (!d.moved && ['start', 'end', 'split'].includes(d.kind)) Editor.pushHistory();
  d.moved = true;
  const t = Editor.tOf(e.clientX - edCanvas.getBoundingClientRect().left);
  if (d.kind === 'pending') d.kind = 'pan';
  if (d.kind === 'pan') { edScroll.scrollLeft = d.scroll0 - dx; return; }
  if (d.kind === 'scrub') { Editor.seek(t); return; }
  if (d.kind === 'start') Editor.start = Math.min(t, Editor.end - 0.1);
  if (d.kind === 'end') Editor.end = Math.max(t, Editor.start + 0.1);
  if (d.kind === 'split') Editor.splits[d.i] = clamp(t, Editor.start + 0.05, Editor.end - 0.05);
  Editor.seek(d.kind === 'split' ? Editor.splits[d.i] : d.kind === 'start' ? Editor.start : Editor.end);
  if (!Editor._rafDraw) Editor._rafDraw = requestAnimationFrame(() => { Editor._rafDraw = 0; Editor.draw(); Editor.renderSegments(); });
});
const endDrag = e => {
  const d = Editor.drag;
  if (!d) return;
  Editor.drag = null;
  if (d.kind === 'pending' && !d.moved) Editor.seek(Editor.tOf(e.clientX - edCanvas.getBoundingClientRect().left));
  if (d.kind === 'split') {
    Editor.splits.sort((a, b) => a - b);
    Editor.splits = Editor.splits.filter((s, i, arr) => i === 0 || s - arr[i - 1] > 0.05);
  }
  if (['start', 'end', 'split'].includes(d.kind)) Editor.changed();
};
edCanvas.addEventListener('pointerup', endDrag);
edCanvas.addEventListener('pointercancel', endDrag);

new ResizeObserver(() => { if (Editor.isOpen()) Editor.layout(); }).observe(edScroll);
window.addEventListener('popstate', () => {
  if (Editor.isOpen()) {
    Editor.pushedState = false;
    if (Editor.history.length) {
      // Keep the editor open and ask first.
      try { history.pushState({ editor: true }, ''); Editor.pushedState = true; } catch { /* ignore */ }
      Editor.close();
    } else {
      Editor.teardown();
    }
  }
});
document.addEventListener('keydown', e => {
  if (!Editor.isOpen() || modal.open) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if ((tag === 'input' && !['checkbox', 'range'].includes(e.target.type)) || tag === 'textarea') return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); Editor.undo(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  switch (e.key) {
    case ' ': if (tag === 'button') return; e.preventDefault(); Editor.togglePlay(); break;
    case 'ArrowLeft': e.preventDefault(); Editor.seek(edVideo.currentTime - (e.shiftKey ? 1 : 0.1)); break;
    case 'ArrowRight': e.preventDefault(); Editor.seek(edVideo.currentTime + (e.shiftKey ? 1 : 0.1)); break;
    case 's': case 'S': Editor.splitAt(edVideo.currentTime); break;
    case '[': Editor.setStart(edVideo.currentTime); break;
    case ']': Editor.setEnd(edVideo.currentTime); break;
    case '+': case '=': Editor.setZoom(Editor.zoom * 2); break;
    case '-': Editor.setZoom(Editor.zoom / 2); break;
    case 'Escape': Editor.close(); break;
  }
});
