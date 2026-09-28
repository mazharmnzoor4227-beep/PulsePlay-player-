# 🎵 Music Player App — Full Clone Prompt (Lark Player Style)

> Is prompt ko kisi bhi AI code generator (Claude, ChatGPT, Cursor, Bolt, v0, Flutter/React Native AI tool) me paste karke poora working app banwaya ja sakta hai. Sab kuch detail me diya hai — colors, screens, animations, buttons, sab.

---

## 1. App Overview

Ek **dark-themed local Music & Video Player app** banao jiska naam ho **"Tune Player"** (ya koi bhi custom naam). App ka kaam hai user ke phone me maujood **songs aur videos ko scan karke play karna**, playlists banana, aur ek polished **Now Playing screen** dena — bilkul Lark Player jaisa look, feel aur animation ke saath.

**Platform:** Android/iOS (Flutter ya React Native preferred, single codebase)
**Theme:** Pure dark mode (background near-black `#0A0A0A`, accent blue `#3B82F6` / bright sky-blue)
**Font:** Rounded, bold sans-serif for headers (similar to "Baloo"/"Poppins Bold"), regular sans-serif for body text.

---

## 2. Global Design System

- **Background:** `#0A0A0A` to `#121212` (pure dark)
- **Primary Accent:** Bright blue `#2E9DFF` (used for active tab pill, links, play button ring)
- **Secondary text:** `#9E9E9E` gray
- **Cards / rows:** Slightly lighter dark `#1C1C1E` with **rounded corners (16–20px radius)**
- **Pill-shaped tabs/buttons** everywhere (fully rounded ends) — active pill filled solid blue with white text, inactive pill = dark gray filled with light gray text
- **Icons:** Thin-outline white icons (search, sort, settings/equalizer)
- **Bottom safe area:** Mini player always docked at the very bottom, above device nav bar
- Corner radius consistency: big cards 20px, small chips/pills fully rounded (999px)
- Subtle **haptic feedback** on every tap (button press, tab switch, like)

---

## 3. Screen-by-Screen Breakdown

### 3.1 Home / Library Screen
**Top App Bar:**
- Left: small circular app mascot/logo icon + App name in bold rounded font
- Right: 3 icons — 🔍 Search, ⬇↑ Sort, ⚙ Settings (gear/equalizer-styled icon)

**Horizontal scrollable tab bar** (pill buttons, swipeable, snaps to position):
`Videos | Songs | Playlists | Folders | Artists | Albums`
- Active tab = solid blue pill with bold white text
- Inactive tabs = dark gray pill, light gray text
- Smooth horizontal scroll with **momentum + snapping animation**
- A thin vertical divider `|` between "Videos" and "Songs" (visually separates media type from library type)

**Content area (changes per tab):**
- **Songs tab:** list of tracks — leading square album-art thumbnail (rounded corners, fallback = music-note icon on dark tile), track title (blue, tappable/bold), subtitle = album/folder name (gray)
- **Empty state:** centered gray text "Song not found?" + blue pill button **"Scan folders"** that triggers a folder-scanning animation (progress spinner) and repopulates the list
- **Artists / Albums tabs:** rounded-square placeholder art on the left, name in bold, subtitle = track count icon + label, right-aligned count number (e.g., "1")
- **Playlists / Folders tabs:** similar row-card layout, tappable to drill into contents
- At bottom of a populated list: centered **"Shuffle All"** pill button above the mini player

**List item interactions:**
- Tap row → starts playback + opens mini player (does NOT auto-navigate to full player)
- Long-press row → opens bottom sheet with actions: Play, Add to playlist, Share, Delete, Rename, Properties
- Smooth **fade+slide-in** animation when list items load (staggered ~40ms delay per item)

---

### 3.2 Mini Player (Persistent Bottom Bar)
Always visible once a track is loaded, docked above the tab bar/nav:
- Left: small rounded album-art thumbnail (or default music-note icon tile)
- Center: Song title (bold) — **marquee/scrolling text animation** if title overflows
- Right: two icons — Shuffle/Repeat toggle icon, and a circular **Play/Pause button** (icon morphs between play▶ and pause⏸ with a smooth cross-fade/scale animation)
- Thin **progress line** along the very top edge of the mini player showing playback position
- Entire bar is tappable → **expands into Full Now Playing screen** with a smooth **slide-up / shared-element transition** (album art scales up from mini thumbnail to full screen)
- Swipe left/right on mini player = skip next/previous (optional nice-to-have)
- Swipe down while expanded = collapses back to mini player smoothly

---

### 3.3 Now Playing (Full Player) Screen
**Layout top to bottom:**
1. Optional banner ad slot at top (skip for real clone — replace with nothing or your own promo banner)
2. **Song Title** — large bold white text, left-aligned
3. Row: 🤍 Heart/Favorite icon (toggles filled red/pink heart with a **bounce/scale pop animation** on tap) + ⋮ three-dot menu (opens bottom sheet: Add to playlist, Share, Set as ringtone, Delete, Song info, Equalizer)
4. Large empty/art space in middle (album art area — shows big square art or animated equalizer bars when no art)
5. **Seek bar:**
   - Full-width draggable slider, thin blue filled progress track on dark gray background
   - Current time (left) and total duration (right) below the bar in small gray text
   - Dragging the thumb shows a live time tooltip; smooth animated fill
6. **Main transport controls row** (large, centered, evenly spaced):
   - ⏮ Previous (rewind icon)
   - ⏯ **Center Play/Pause** — biggest button, filled circle press-state animation (scale down slightly on tap, ripple effect), icon smoothly morphs play↔pause
   - ⏭ Next (fast-forward icon)
7. **Bottom utility row:**
   - Left: 🎚 Equalizer / sound-settings icon → opens Equalizer bottom sheet (bass/treble sliders + presets)
   - Center: **"Lyrics"** pill button with speech-bubble icon → opens synced/unsynced lyrics view (slides up from bottom)
   - Right: ☰ Queue/Playlist icon (opens "Up Next" queue as a bottom sheet, drag-to-reorder) + small 🔁 repeat-mode icon (cycles: repeat-off → repeat-all → repeat-one, icon changes each tap)

**Transition animations:**
- Screen enters via slide-up from mini player with shared album-art element transition
- Track change = crossfade album art + slide title text horizontally (like a carousel) when swiping left/right between tracks on the art area
- Background subtly tints/blurs based on dominant color of album art (optional polish)

---

### 3.4 Search Screen
- Top: back arrow ← + search input pill: **"Search my music & video"** placeholder, magnifying-glass icon right side, live-filtering as you type with debounce animation
- Below input: same category tab row (Videos/Songs/Playlists/Folders...) still visible/scrollable
- **"Sites" section:** horizontal row of circular platform icons (YouTube, Instagram, Facebook, SoundCloud, X/Twitter) with labels underneath — tapping opens an in-app browser/downloader flow for that platform (optional advanced feature)
- Results appear as the same row-list style as Home, with matched text bolded/highlighted
- Mini player stays docked at bottom throughout

---

### 3.5 Settings Screen
- Top: back arrow ← + large bold "Settings" header (big title style, not centered — left aligned, oversized font)
- Grouped card sections (each group = one rounded dark card containing multiple rows, small gap between groups):

**Group 1:**
- Playtime — icon(clock/play) — right-aligned value (e.g. "17s") + chevron ›
- Backup & restore — cloud icon — right value "Log in" + chevron ›

**Group 2:**
- Theme — icon — value "Classic / Medium" + chevron
- Sleep timer — clock icon — value "Off" + chevron
- Remove ads — "AD" badge icon — value "49% OFF" (highlighted) + chevron

**Group 3:**
- Hidden files — crossed-eye icon — value "35 files" + chevron
- Recently deleted — trash icon — value "1 file" + chevron
- Playback settings — headphones icon — chevron only
- Notification settings — bell icon — chevron only
- Language — globe icon — value "English" + chevron

- Each row: icon (left, outline style) + label (white) + value/subtext (gray, right-aligned) + chevron `›` (light gray)
- Tap any row → smooth slide-left transition into a detail sub-screen (or opens inline bottom sheet for simple toggles like Sleep Timer/Theme picker)
- Rows have a subtle press-highlight (row background lightens briefly on tap)

---

## 4. Required Animations (Very Important — "Smooth" Requirement)

| Interaction | Animation |
|---|---|
| Tab switch (Songs/Playlists/etc.) | Pill background slides/morphs to new position, text color cross-fades, ~250ms ease-out |
| List loading | Staggered fade + slight upward slide per row |
| Mini player → Full player | Shared-element expand (thumbnail grows to full art), slide-up sheet, spring physics |
| Play/Pause icon | Morph animation (not a hard swap) — icon path morph or cross-fade+scale |
| Heart/Like button | Scale-bounce (1 → 1.3 → 1) with color fill animation |
| Seek bar drag | Real-time smooth fill, thumb grows slightly while dragging |
| Song change (swipe) | Horizontal carousel swipe with parallax on art + title |
| Bottom sheets (menu, lyrics, queue, equalizer) | Slide up from bottom with rounded top corners, dim overlay fades in behind it |
| Button press (all buttons) | Slight scale-down (0.95x) + light ripple/opacity feedback |
| Screen navigation | Standard slide transitions (push right-to-left, pop reverse), Settings sub-pages included |

Use spring-based animation curves (not linear) — e.g. `Curves.easeOutCubic` / Framer Motion spring — everywhere for a "premium" native feel.

---

## 5. Core Functional Requirements (Every Button Must Actually Work)

1. **Media scanning:** Read local audio/video files from device storage, group into Songs/Videos/Albums/Artists/Folders automatically.
2. **Playback engine:** Real audio player (e.g. `just_audio`/`ExoPlayer` for Flutter/Android, or `react-native-track-player`) — play, pause, seek, next, previous, shuffle, repeat (off/all/one) must all be functionally wired, not just UI.
3. **Persistent mini player:** Reflects real playback state app-wide (title, progress, play/pause icon) on every screen.
4. **Favorites/Likes:** Persist liked songs locally (local DB — SQLite/Hive/AsyncStorage) and show them in a "Favorites" filtered view.
5. **Playlists:** Create/rename/delete playlist, add/remove songs, reorder via drag.
6. **Search:** Real-time filter across scanned library by title/artist/album.
7. **Settings that work:** Sleep timer actually stops playback after chosen time; Theme switch actually changes accent/light-dark; Language switch actually changes app locale strings; Hidden files actually hides selected tracks from library; Recently deleted acts as a trash/recovery bin.
8. **Lyrics panel:** Fetch or allow manually-added lyrics text, scrollable, optionally auto-scroll synced to timestamp.
9. **Queue management:** "Up Next" reorderable list reflecting actual play queue.
10. **Equalizer:** Bass/Treble/preset sliders that actually apply audio effects if platform supports it (or at least persist user selection).

---

## 6. Suggested Tech Stack

- **Framework:** Flutter (best for smooth 60fps animations + single codebase for Android/iOS)
- **State management:** Riverpod or Provider
- **Local DB:** Hive or SQLite (drift)
- **Audio engine:** `just_audio` + `audio_service` (for background playback + notification controls)
- **Animations:** Flutter's built-in `AnimatedContainer`, `Hero` (for mini→full player transition), `implicit animations`, or `flutter_animate` package for quick smooth effects

*(If React Native preferred instead: use `react-native-track-player`, `react-native-reanimated` for smooth animations, and `react-navigation` shared-element transitions.)*

---

## 7. Final Instruction to Paste to Your AI Code Builder

> "Build a complete, fully working cross-platform music & video player app named **[YOUR APP NAME]** exactly matching the specification above — dark theme, pill-shaped scrollable category tabs (Videos/Songs/Playlists/Folders/Artists/Albums), a persistent animated mini-player that expands into a full Now Playing screen with working seek bar, play/pause/next/previous/shuffle/repeat/favorite/lyrics/queue/equalizer, a Settings screen with grouped rows exactly as listed, and a Search screen with live filtering. Every button must be functionally wired to real local audio playback (not just static UI). Use smooth spring-based animations for all transitions, tab switches, icon morphs, and button presses as detailed in the Animations table. Persist favorites, playlists, and settings locally."

---

Is poore document ko copy-paste karke aap kisi bhi AI app-builder (Claude ke naye artifact/app-building tools, Cursor, Bolt.new, ya Flutter/React Native developer) ko de sakte ho — isse wo bilkul isi jaisa, smooth animations aur working buttons ke saath poora app bana dega.
