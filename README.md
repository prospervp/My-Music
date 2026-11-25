# My Media Player

A personal app for the audio and video files you make. Play them, organize them into categories and playlists, shuffle, connect a Google Drive folder, and **edit and split** your recordings into smaller pieces. It works on your phone (installable from the home screen) and on a computer, and keeps working offline.

Your files stay on your device and in your own Google Drive. Nothing goes through anyone else's server.

---

## 1. Put it online (one time)

To install an app on a phone, the browser needs to load it from a secure web address (`https://…`). Pick **one** of these free options:

**Option A: GitHub Pages (needs the repository to be public)**
1. On GitHub, open this repository → **Settings → General**, scroll to **Danger Zone → Change visibility** and make it **Public**. The code contains no passwords or personal data, and your files and settings are never stored in the repository.
2. **Settings → Pages** → under *Build and deployment* choose **Deploy from a branch**, pick the branch with this code and the **/ (root)** folder → **Save**.
3. After a minute or two your app is at **`https://<your-github-name>.github.io/My-Music/`**.

> To keep the repository private, GitHub Pages needs a paid GitHub plan. Instead you can use **Netlify** or **Cloudflare Pages**: both are free, can connect to a private GitHub repository, and need no build step (publish directory: the repository root).

## 2. Install it on your phone

- **Android (Chrome):** open your app's address and tap **Install app** in the menu (☰), or Chrome's own **⋮ → Install app**.
- **iPhone / iPad (Safari):** open the address, tap **Share** → **Add to Home Screen** → **Add**.

The app opens full-screen from your home screen, and lock-screen and headphone controls work for playback.

## 3. Connect your Google Drive folder (one time, about 5 minutes)

Google requires every app that reads Drive to have its own **Client ID**. Because this is your personal app, you create your own, for free:

1. On a computer, go to **console.cloud.google.com** and create a project (any name).
2. **APIs & Services → Library** → search **Google Drive API** → **Enable**.
3. **Google Auth Platform** (called *OAuth consent screen* in older layouts) → **Get started** → app name *My Media*, your email, audience **External**. Under **Audience → Test users**, **add your own Google account**.
4. **Clients** (or *Credentials*) → **Create client** → type **Web application**. Under **Authorized JavaScript origins** add your app's origin, e.g. `https://<your-github-name>.github.io` (no path, no trailing slash). The app's Google Drive settings screen shows the exact value to paste.
5. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
6. In the app, tap **Google Drive** (bottom of the menu), paste the **folder link** (in Drive: right-click the folder → **Share → Copy link**) and the **Client ID**, then **Save & connect**.

The first time, Google warns that the app "hasn't been verified". That's normal for a personal app that only you use: tap **Continue**.

**How Drive works in the app**
- **Sync now** brings in every audio and video file in the folder. **Subfolders become categories** (you can turn this off).
- Files **download to your phone the first time you play them**, then play offline. **Download all** saves everything ahead of time (handy before a trip). **Remove offline copy** frees space.
- Files you add, rename or delete in Drive show up after the next sync. The app never changes or deletes anything in your Drive.
- If you tick **Allow saving edited files back to this folder**, edited pieces can be uploaded to the folder. This needs full Drive permission, so leave it off if you only want to listen.
- Google sign-ins last about an hour. When one runs out, the app shows a **Connect** button.

## 4. Edit and split

Open any item's **⋯** menu → **Edit & split…**

- **Trim:** drag the orange handles at either end of the timeline, or move the playhead and tap **Start here** / **End here**.
- **Split into pieces:** move the playhead and tap **Split here** as many times as you like. Each piece gets its own name, a ▶ preview button and a **Keep** checkbox (untick it to drop that part). **✕** joins a piece with the next one.
- **Zoom** with + / − for precise cuts. **−.1 / +.1** nudge the playhead by a tenth of a second.
- **Sound options:** fade in, fade out, and volume (up to 300%).
- **Exact video cuts:** by default video is cut instantly with no quality loss, but cuts snap to the nearest *key frame* (usually within a second or two). Tick this for frame-accurate cuts. It's slower because the video is re-encoded on your device.
- **When saving:** put the pieces in a new playlist, replace the original in your library and playlists, or also save to your Drive folder.

Edits are always saved as **new items**. The original file is never changed. The first save downloads the editing engine (32 MB, one time). After that, editing works offline.

## Everyday use

| Feature | How |
|---|---|
| Add files | **Add files**, or drag files onto the window (computer) |
| Categories | **+** next to *Categories*; select items → **Categories**, or drag items onto a category |
| Playlists | **+** next to *Playlists*; select items → **Add to playlist**; drag rows to reorder |
| Shuffle | **Shuffle play** plays in random order (each playlist remembers its shuffle setting). **Randomize order** permanently re-orders a playlist |
| Queue | *Now playing* shows what's next; **⋯ → Play next** |
| Save a copy | **⋯ → Save to device** (on phones this opens the share sheet → *Save to Files*) |

**Keyboard (computer):** Space play/pause · ←/→ seek · N/P next/previous · S shuffle · R repeat · M mute · F fullscreen · / search.
**In the editor:** Space play · ←/→ nudge 0.1 s (Shift: 1 s) · S split · [ start · ] end · +/− zoom · Ctrl+Z undo.

## Good to know

- Your library lives in the app's storage on each device. Your phone and your computer each have their own library, and Google Drive is the easy way to share files between them.
- Clearing the browser's site data for the app (or uninstalling it) removes its library, including local files that were never in Drive. Keep backups of important files.
- Very long videos (hundreds of MB) may be too big to edit on a phone because of memory limits. A computer handles them better.
- Some formats (certain `.mkv`/`.mov` files) don't play in every browser. MP4 and MP3 are the safest.

## Files

| File | What it is |
|---|---|
| `index.html`, `styles.css` | Page and look (light and dark mode follow your system) |
| `app.js` | Player, library, categories, playlists, shuffle, install button |
| `drive.js` | Google Drive connection, sync, downloads and uploads |
| `editor.js` | Trim / split / fade editor and export |
| `sw.js`, `manifest.webmanifest`, `icons/` | What makes it an installable, offline-capable app |
| `vendor/ffmpeg/` | Editing engine (ffmpeg.wasm), loaded only when you save an edit |
