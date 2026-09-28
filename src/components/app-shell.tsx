import { DetailView } from "@/components/detail-view";
import { LibraryView } from "@/components/library-view";
import { MiniPlayer } from "@/components/mini-player";
import { NowPlaying } from "@/components/now-playing";
import { SearchView } from "@/components/search-view";
import { SettingsView } from "@/components/settings-view";
import { Sheets } from "@/components/sheets";
import { usePlayer } from "@/lib/store";
import { useEffect } from "react";
import type { Track } from "@/lib/types";
import { Toaster } from "sonner";

const DETAIL: Set<string> = new Set([
  "album",
  "artist",
  "folder",
  "playlist",
  "favorites",
]);

const SETTINGS: Set<string> = new Set([
  "settings",
  "playtime",
  "theme",
  "sleep",
  "language",
  "playback",
  "notify",
  "backup",
  "hidden",
  "deleted",
]);

export function AppShell() {
  const view = usePlayer((s) => s.view);
  const applyTheme = usePlayer((s) => s.applyTheme);
  const theme = usePlayer((s) => s.settings.theme);

  useEffect(() => {
    void usePlayer.persist.rehydrate();
    applyTheme();

    type NativeItem = { id: string; title: string; duration: number; folder: string; type: "song" | "video"; mime: string; uri: string };
    const refreshDeviceMedia = () => {
      const bridge = (window as Window & { PulsePlayNative?: { scanMedia: () => string } }).PulsePlayNative;
      if (!bridge) return;
      try {
        const items = JSON.parse(bridge.scanMedia()) as NativeItem[];
        const deviceTracks: Track[] = items.map((m, index) => ({
          id: m.id, title: m.title, artist: "On This Device", album: "On This Device", albumId: "device",
          duration: m.duration, folder: m.folder, type: m.type, year: new Date().getFullYear(), lyrics: "",
          style: "electronic", tempo: 110, keyMidi: 57, scale: "minor", seed: index + 1, source: "import", mime: m.mime, objectUrl: m.uri,
        }));
        const current = usePlayer.getState().tracks.filter((t) => !t.id.startsWith("device-"));
        usePlayer.setState({ tracks: [...deviceTracks, ...current] });
      } catch { /* Native bridge unavailable or permission not granted yet. */ }
    };
    (window as Window & { __pulsePlayRefreshMedia?: () => void }).__pulsePlayRefreshMedia = refreshDeviceMedia;
    const timer = window.setTimeout(refreshDeviceMedia, 500);
    return () => { window.clearTimeout(timer); delete (window as Window & { __pulsePlayRefreshMedia?: () => void }).__pulsePlayRefreshMedia; };
  }, [applyTheme]);

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <div className="pointer-events-none absolute inset-0 opacity-70 ambient-glow" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bg shadow-[var(--shadow-border)]">
        <div className="relative min-h-dvh">
          {view.name === "library" ? <LibraryView /> : null}
          {view.name === "search" ? <SearchView /> : null}
          {SETTINGS.has(view.name) ? <SettingsView /> : null}
          {DETAIL.has(view.name) ? <DetailView /> : null}
          <MiniPlayer />
          <NowPlaying />
          <Sheets />
        </div>
      </div>
      <Toaster
        theme={theme === "light" ? "light" : "dark"}
        position="top-center"
        toastOptions={{
          className: "font-sans !bg-surface !text-fg !border-border",
        }}
      />
    </div>
  );
}
