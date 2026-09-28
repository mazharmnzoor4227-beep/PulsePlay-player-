# PulsePlay UI and Performance Redesign

## Goal
Rework the existing PulsePlay Android/WebView player so it matches the user-provided reference video's visual language more closely and feels smooth on-device, while keeping the app focused and lightweight.

## Locked interaction behavior
- Tapping a song or video row starts playback only.
- Tapping a media row must **not** automatically open the full-screen Now Playing panel.
- The compact mini-player remains visible at the bottom while media is active.
- The full-screen Now Playing view opens only when the user explicitly taps the mini-player or swipes it upward.
- The full-screen player closes with a downward swipe or the existing close affordance.

## Visual direction
- Keep a clean, dark, premium music-player aesthetic inspired by the provided reference video.
- Use a near-black background with restrained elevated surfaces.
- Keep PulsePlay's neon-blue accent as the primary brand accent so it remains consistent with the app icon.
- Use compact horizontal category pills for Videos, Songs, Playlists, Folders, Artists, and Albums.
- Keep rows simple and readable: artwork, title, secondary metadata, overflow control.
- Use a slim floating mini-player near the bottom rather than a large persistent card.
- Full-screen Now Playing should emphasize artwork, title/artist, progress, previous/play/next, and only essential secondary controls.
- Avoid decorative gradients, large glow effects, heavy shadows, or unnecessary cards that add visual or rendering cost.

## Motion and gestures
- Use only transform and opacity for major transitions where possible.
- Use a short spring-like ease for mini-player/full-player transitions.
- Do not animate every list item on every render.
- Keep button press feedback subtle and fast.
- Full-screen player should animate from bottom to top and reverse smoothly on dismissal.
- Respect reduced-motion preferences.

## Performance work
The current code updates playback time through requestAnimationFrame and also updates playtime state continuously. This causes avoidable React/Zustand work in a WebView.

Changes:
- Throttle visible playback progress updates to a low, UI-appropriate frequency instead of updating React state every animation frame.
- Update playtime counters around once per second instead of every frame.
- Keep raw media playback in the audio/video element without forcing React renders for each frame.
- Stop/unmount expensive visualizer work whenever it is not visible.
- Avoid continuous canvas drawing when the full player is closed.
- Remove or limit staggered row-entry animation for long media lists.
- Keep selectors narrow so unrelated store changes do not rerender large views.
- Avoid unnecessary persistence writes for rapidly changing playback-only state.
- Preserve hardware-friendly transform/opacity animations.

## Media library behavior
- Keep Android MediaStore scanning for local songs and videos.
- Do not remove device auto-detection.
- Preserve Songs, Videos, Playlists, Folders, Artists, and Albums browsing.
- Keep existing playback, favorites, queue, repeat, shuffle, equalizer/settings functionality unless a specific existing implementation is proven to cause the lag.

## Components to update
- `src/components/library-view.tsx`: reference-style header/tabs/list spacing and reduced list animation cost.
- `src/components/track-row.tsx`: lighter row rendering and playback-only tap behavior.
- `src/components/mini-player.tsx`: slimmer reference-style mini-player; explicit tap/swipe-up opens full player.
- `src/components/now-playing.tsx`: reference-style full-screen player and optimized transition lifecycle.
- `src/components/visualizer.tsx`: pause/unmount drawing when not visible; reduce rendering pressure if retained.
- `src/lib/player-engine.ts`: throttle UI time callbacks without reducing actual playback timing accuracy.
- `src/lib/store.ts`: reduce high-frequency state updates and persistence churn.
- `src/styles.css`: simplify heavy effects and use lightweight motion primitives.

## Non-goals
- No new social features, streaming services, account system, cloud sync, or recommendation engine.
- No major package/framework migration.
- No unnecessary new screens.
- No extra visual effects that could reintroduce lag.

## Error handling
- Media that cannot be read or played should fail gracefully without freezing the UI.
- Permission denial should leave the app usable and allow retrying media access later.
- The player must not open an empty full-screen panel when no track is active.

## Verification
Before calling the work complete:
1. Run the web production build successfully.
2. Run the Android debug APK build successfully in GitHub Actions.
3. Verify the built APK contains the Android web assets.
4. Confirm tapping a media row starts playback without opening full-screen Now Playing.
5. Confirm mini-player tap/swipe-up opens full-screen Now Playing.
6. Confirm swipe-down closes full-screen Now Playing.
7. Confirm Songs/Videos still populate from device MediaStore permissions.
8. Check that hidden visualizer/animation loops are not running unnecessarily.
9. Confirm UI keeps the PulsePlay dark + neon-blue branding while following the reference layout.
