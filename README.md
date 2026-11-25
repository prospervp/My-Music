# My Media Player

A personal player for the audio and video files you make. It runs entirely in your web browser. There is nothing to install, no account to create, and your files are never uploaded anywhere.

## How to start it

1. Download this folder (on GitHub: **Code → Download ZIP**, then unzip it).
2. Double-click **`index.html`**. It opens in your browser.
   - Works best in **Chrome**, **Edge** or **Firefox**.
3. Bookmark the page so you can come back to it.

## What it does

| Feature | How |
|---|---|
| **Add your files** | Click **Add files**, or drag files from your computer onto the window. Supports MP3, WAV, M4A, AAC, FLAC, OGG, Opus, MP4, WebM, MOV and more. Your browser decides which formats it can play. |
| **Play audio & video** | Click any item to play it. Videos show at the top; double-click a video (or press **F**) for fullscreen. |
| **Categories** | Click **+** next to *Categories*. To file items, select them with the checkboxes and choose **Categories**, or drag them onto a category in the sidebar. An item can be in several categories. |
| **Playlists** | Click **+** next to *Playlists*. Add items with **Add to playlist**, by dragging them onto a playlist, or by adding new files while the playlist is open. Drag rows to reorder them. |
| **Randomize** | **Shuffle play** plays a playlist in a random order and leaves the saved order alone. **Randomize order** permanently re-orders the playlist. Every playlist remembers its own shuffle on/off setting. |
| **Queue** | *Now playing* shows what's coming up. Use **Play next** from any item's **⋯** menu to slot it in. |
| **Repeat** | Off → repeat all → repeat one. |
| **Search & filter** | Search by name or category, and filter to just Audio or just Video. |

### Keyboard shortcuts

| Key | Action |
|---|---|
| Space | Play / pause |
| ← / → | Back / forward 5 seconds |
| N / P | Next / previous |
| S | Shuffle on/off |
| R | Change repeat mode |
| M | Mute |
| F | Fullscreen video |
| / | Search |

## Good to know

- **Where are my files kept?** The app saves a copy of each file in your browser's own storage on this computer. Your original files are never changed. Deleting an item in the app does not delete the original.
- **Storage space.** The bottom of the sidebar shows how much space the app is using. Browsers usually allow a large share of free disk space.
- **Each browser has its own library.** A library you build in Chrome won't appear in Firefox or on another computer.
- **Don't clear site data.** Clearing your browser's "cookies and site data" for this page removes the library, so keep your original files backed up.
- **A file won't play?** Some formats (for example certain `.mkv` or `.mov` files) aren't supported by every browser. Converting them to MP4 or MP3 usually fixes it.

## Files

- `index.html` – the page
- `styles.css` – the look (light and dark mode follow your system setting)
- `app.js` – the player, library, categories, playlists and shuffle logic
