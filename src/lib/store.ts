import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import { DEMO_PLAYLISTS, DEMO_TRACKS } from "./catalog";
import { dictionaries, type Dict } from "./i18n";
import { engine } from "./player-engine";
import { haptic } from "./haptic";
import { idbDelete, idbGet, idbPut } from "./idb";
import type {
  EqState,
  LangId,
  LibraryTab,
  Playlist,
  RepeatMode,
  SettingsState,
  SheetKind,
  ThemeId,
  Track,
  View,
} from "./types";

type SortKey = "title" | "artist" | "duration" | "recent";

type PlayerStore = {
  tracks: Track[];
  playlists: Playlist[];
  likedIds: string[];
  hiddenIds: string[];
  deleted: Track[];
  queue: string[];
  queueIndex: number;
  currentId: string | null;
  isPlaying: boolean;
  currentTime: number;
  shuffle: boolean;
  repeat: RepeatMode;
  tab: LibraryTab;
  view: View;
  viewStack: View[];
  nowPlayingOpen: boolean;
  sheet: SheetKind;
  sheetTrackId: string | null;
  renameTarget: { kind: "track" | "playlist"; id: string } | null;
  searchQuery: string;
  sort: SortKey;
  scanning: boolean;
  playtimeSec: number;
  sleepUntil: number | null;
  settings: SettingsState;
  eq: EqState;
  hydrated: boolean;

  t: () => Dict;
  visibleTracks: () => Track[];
  current: () => Track | null;
  pushView: (v: View) => void;
  popView: () => void;
  setTab: (tab: LibraryTab) => void;
  setSearch: (q: string) => void;
  setSort: (s: SortKey) => void;
  setSheet: (s: SheetKind, trackId?: string | null) => void;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  playTrack: (id: string, list?: string[]) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (t: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLike: (id?: string) => void;
  shuffleAll: (ids?: string[]) => Promise<void>;
  createPlaylist: (name: string, trackIds?: string[]) => void;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderQueue: (from: number, to: number) => void;
  renameTrack: (id: string, title: string) => void;
  hideTrack: (id: string) => void;
  unhideTrack: (id: string) => void;
  deleteTrack: (id: string) => void;
  restoreTrack: (id: string) => void;
  purgeTrack: (id: string) => void;
  setTheme: (theme: ThemeId) => void;
  setLang: (lang: LangId) => void;
  setSleep: (minutes: number | null) => void;
  setVolume: (v: number) => void;
  setEq: (partial: Partial<EqState>) => void;
  setEqPreset: (preset: EqState["preset"]) => void;
  setNotify: (on: boolean) => void;
  setCrossfade: (on: boolean) => void;
  importFiles: (files: FileList | File[]) => Promise<number>;
  scanDemo: () => Promise<void>;
  exportBackup: () => void;
  importBackup: (json: string) => void;
  applyTheme: () => void;
  tickPlaytime: (dt: number) => void;
  checkSleep: () => void;
};

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function applyThemeToDom(theme: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
}

let sleepTimer: number | null = null;
let playtimeClock: number | null = null;
let lastTick = 0;

function bindEngine(get: () => PlayerStore, set: (p: Partial<PlayerStore>) => void) {
  engine.setListeners(
    (t) => {
      set({ currentTime: t });
    },
    () => {
      void get().next();
    },
  );
}

export const usePlayer = create<PlayerStore>()(
  persist(
    (set, get) => {
      const visibleTracks = () => {
        const { tracks, hiddenIds, deleted } = get();
        const deletedIds = new Set(deleted.map((d) => d.id));
        return tracks.filter((t) => !hiddenIds.includes(t.id) && !deletedIds.has(t.id));
      };

      const current = () => {
        const { currentId, tracks, deleted } = get();
        return (
          tracks.find((t) => t.id === currentId) ??
          deleted.find((t) => t.id === currentId) ??
          null
        );
      };

      const startPlaytime = () => {
        if (typeof window === "undefined") return;
        if (playtimeClock != null) return;
        lastTick = performance.now();
        const loop = (now: number) => {
          const s = get();
          if (s.isPlaying) {
            const dt = (now - lastTick) / 1000;
            if (dt > 0 && dt < 2) set({ playtimeSec: s.playtimeSec + dt });
            s.checkSleep();
          }
          lastTick = now;
          playtimeClock = requestAnimationFrame(loop);
        };
        playtimeClock = requestAnimationFrame(loop);
      };

      return {
        tracks: DEMO_TRACKS,
        playlists: DEMO_PLAYLISTS,
        likedIds: ["window-rain", "voltage-bloom"],
        hiddenIds: [],
        deleted: [],
        queue: [],
        queueIndex: -1,
        currentId: null,
        isPlaying: false,
        currentTime: 0,
        shuffle: false,
        repeat: "off",
        tab: "songs",
        view: { name: "library" },
        viewStack: [],
        nowPlayingOpen: false,
        sheet: null,
        sheetTrackId: null,
        renameTarget: null,
        searchQuery: "",
        sort: "title",
        scanning: false,
        playtimeSec: 17,
        sleepUntil: null,
        settings: {
          theme: "classic",
          language: "en",
          sleepMinutes: null,
          notify: false,
          volume: 0.85,
          crossfade: true,
        },
        eq: { bass: 2, mid: 0, treble: 1, preset: "normal" },
        hydrated: false,

        t: () => dictionaries[get().settings.language],
        visibleTracks,
        current,

        pushView: (v) => {
          haptic();
          const { view, viewStack } = get();
          set({ view: v, viewStack: [...viewStack, view] });
        },
        popView: () => {
          haptic();
          const { viewStack } = get();
          const prev = viewStack[viewStack.length - 1] ?? { name: "library" as const };
          set({ view: prev, viewStack: viewStack.slice(0, -1) });
        },
        setTab: (tab) => {
          haptic();
          set({ tab });
        },
        setSearch: (searchQuery) => set({ searchQuery }),
        setSort: (sort) => {
          haptic();
          set({ sort });
        },
        setSheet: (sheet, trackId) => {
          if (sheet) haptic();
          set({
            sheet,
            sheetTrackId: trackId === undefined ? get().sheetTrackId : trackId,
          });
        },
        openNowPlaying: () => {
          haptic();
          set({ nowPlayingOpen: true });
        },
        closeNowPlaying: () => set({ nowPlayingOpen: false }),

        playTrack: async (id, list) => {
          haptic(12);
          bindEngine(get, set);
          const state = get();
          const track = state.tracks.find((x) => x.id === id);
          if (!track) return;
          const source =
            list && list.length ? list : visibleTracks().map((x) => x.id);
          const base = source.includes(id) ? source : [id, ...source];
          let queue = base;
          let queueIndex = base.indexOf(id);
          if (state.shuffle) {
            const rest = shuffleArr(base.filter((x) => x !== id));
            queue = [id, ...rest];
            queueIndex = 0;
          }
          set({
            queue,
            queueIndex,
            currentId: id,
            currentTime: 0,
            isPlaying: true,
          });
          await engine.load(track, 0);
          engine.setVolume(state.settings.volume);
          engine.applyEq(state.eq);
          await engine.play();
          startPlaytime();
          if (state.settings.notify && typeof Notification !== "undefined") {
            if (Notification.permission === "granted") {
              try {
                new Notification(track.title, { body: track.artist, silent: true });
              } catch {
                /* ignore */
              }
            }
          }
        },

        togglePlay: async () => {
          haptic();
          bindEngine(get, set);
          const s = get();
          if (!s.currentId) {
            const first = visibleTracks()[0];
            if (first) await get().playTrack(first.id);
            return;
          }
          if (s.isPlaying) {
            engine.pause();
            set({ isPlaying: false });
          } else {
            engine.setVolume(s.settings.volume);
            engine.applyEq(s.eq);
            await engine.play();
            set({ isPlaying: true });
            startPlaytime();
          }
        },

        seek: async (t) => {
          await engine.seek(t);
          set({ currentTime: t });
        },

        next: async () => {
          const s = get();
          const { queue, queueIndex, repeat, currentId } = s;
          if (!queue.length) return;
          if (repeat === "one" && currentId) {
            await get().playTrack(currentId, queue);
            return;
          }
          const last = queueIndex >= queue.length - 1;
          if (last) {
            if (repeat === "all") {
              await get().playTrack(queue[0]!, queue);
            } else {
              engine.stop();
              set({ isPlaying: false, currentTime: 0 });
            }
            return;
          }
          await get().playTrack(queue[queueIndex + 1]!, queue);
        },

        prev: async () => {
          const s = get();
          if (s.currentTime > 3) {
            await get().seek(0);
            return;
          }
          const { queue, queueIndex } = s;
          if (queueIndex <= 0) {
            await get().seek(0);
            return;
          }
          await get().playTrack(queue[queueIndex - 1]!, queue);
        },

        toggleShuffle: () => {
          haptic();
          const s = get();
          const shuffle = !s.shuffle;
          if (!s.currentId || !s.queue.length) {
            set({ shuffle });
            return;
          }
          if (shuffle) {
            const rest = shuffleArr(s.queue.filter((id) => id !== s.currentId));
            set({ shuffle, queue: [s.currentId, ...rest], queueIndex: 0 });
          } else {
            set({ shuffle });
          }
        },

        cycleRepeat: () => {
          haptic();
          const order: RepeatMode[] = ["off", "all", "one"];
          const i = order.indexOf(get().repeat);
          set({ repeat: order[(i + 1) % order.length]! });
        },

        toggleLike: (id) => {
          haptic(14);
          const target = id ?? get().currentId;
          if (!target) return;
          const likedIds = get().likedIds.includes(target)
            ? get().likedIds.filter((x) => x !== target)
            : [...get().likedIds, target];
          set({ likedIds });
        },

        shuffleAll: async (ids) => {
          const list = ids ?? visibleTracks().map((t) => t.id);
          if (!list.length) return;
          const shuffled = shuffleArr(list);
          set({ shuffle: true });
          await get().playTrack(shuffled[0]!, shuffled);
        },

        createPlaylist: (name, trackIds = []) => {
          haptic();
          const id = `pl-${Date.now()}`;
          set({
            playlists: [
              ...get().playlists,
              { id, name: name.trim() || "Playlist", trackIds, createdAt: Date.now() },
            ],
            sheet: null,
          });
        },
        renamePlaylist: (id, name) => {
          set({
            playlists: get().playlists.map((p) => (p.id === id ? { ...p, name } : p)),
            renameTarget: null,
            sheet: null,
          });
        },
        deletePlaylist: (id) => {
          set({ playlists: get().playlists.filter((p) => p.id !== id) });
        },
        addToPlaylist: (playlistId, trackId) => {
          set({
            playlists: get().playlists.map((p) =>
              p.id === playlistId && !p.trackIds.includes(trackId)
                ? { ...p, trackIds: [...p.trackIds, trackId] }
                : p,
            ),
          });
        },
        removeFromPlaylist: (playlistId, trackId) => {
          set({
            playlists: get().playlists.map((p) =>
              p.id === playlistId
                ? { ...p, trackIds: p.trackIds.filter((x) => x !== trackId) }
                : p,
            ),
          });
        },
        reorderQueue: (from, to) => {
          const queue = [...get().queue];
          const [item] = queue.splice(from, 1);
          if (!item) return;
          queue.splice(to, 0, item);
          const currentId = get().currentId;
          set({ queue, queueIndex: Math.max(0, queue.indexOf(currentId ?? item)) });
        },
        renameTrack: (id, title) => {
          set({
            tracks: get().tracks.map((t) => (t.id === id ? { ...t, title } : t)),
            renameTarget: null,
            sheet: null,
          });
        },
        hideTrack: (id) => {
          const hiddenIds = get().hiddenIds.includes(id)
            ? get().hiddenIds
            : [...get().hiddenIds, id];
          set({ hiddenIds, sheet: null });
          if (get().currentId === id) void get().next();
        },
        unhideTrack: (id) => {
          set({ hiddenIds: get().hiddenIds.filter((x) => x !== id) });
        },
        deleteTrack: (id) => {
          const track = get().tracks.find((t) => t.id === id);
          if (!track) return;
          set({
            tracks: get().tracks.filter((t) => t.id !== id),
            deleted: [{ ...track }, ...get().deleted],
            playlists: get().playlists.map((p) => ({
              ...p,
              trackIds: p.trackIds.filter((x) => x !== id),
            })),
            sheet: null,
          });
          if (get().currentId === id) void get().next();
        },
        restoreTrack: (id) => {
          const track = get().deleted.find((t) => t.id === id);
          if (!track) return;
          set({
            deleted: get().deleted.filter((t) => t.id !== id),
            tracks: [...get().tracks, track],
          });
        },
        purgeTrack: (id) => {
          set({ deleted: get().deleted.filter((t) => t.id !== id) });
          void idbDelete(id);
        },
        setTheme: (theme) => {
          haptic();
          set({ settings: { ...get().settings, theme } });
          applyThemeToDom(theme);
        },
        setLang: (language) => {
          haptic();
          set({ settings: { ...get().settings, language } });
        },
        setSleep: (minutes) => {
          haptic();
          if (sleepTimer != null) window.clearTimeout(sleepTimer);
          if (!minutes) {
            set({ sleepUntil: null, settings: { ...get().settings, sleepMinutes: null } });
            return;
          }
          const sleepUntil = Date.now() + minutes * 60_000;
          set({ sleepUntil, settings: { ...get().settings, sleepMinutes: minutes } });
          sleepTimer = window.setTimeout(() => {
            engine.pause();
            set({
              isPlaying: false,
              sleepUntil: null,
              settings: { ...get().settings, sleepMinutes: null },
            });
          }, minutes * 60_000);
        },
        setVolume: (volume) => {
          engine.setVolume(volume);
          set({ settings: { ...get().settings, volume } });
        },
        setEq: (partial) => {
          const eq = { ...get().eq, ...partial, preset: "normal" as const };
          engine.applyEq(eq);
          set({ eq });
        },
        setEqPreset: (preset) => {
          haptic();
          const eq = engine.applyPreset(preset);
          set({ eq });
        },
        setNotify: (notify) => {
          set({ settings: { ...get().settings, notify } });
          if (notify && typeof Notification !== "undefined" && Notification.permission === "default") {
            void Notification.requestPermission();
          }
        },
        setCrossfade: (crossfade) => {
          set({ settings: { ...get().settings, crossfade } });
        },

        importFiles: async (files) => {
          const list = Array.from(files);
          let added = 0;
          const newTracks: Track[] = [];
          for (const file of list) {
            const isAudio = file.type.startsWith("audio");
            const isVideo = file.type.startsWith("video");
            if (!isAudio && !isVideo) continue;
            const id = `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            await idbPut(id, file);
            const objectUrl = URL.createObjectURL(file);
            const duration = await new Promise<number>((resolve) => {
              const el = document.createElement(isVideo ? "video" : "audio");
              el.preload = "metadata";
              el.src = objectUrl;
              el.onloadedmetadata = () =>
                resolve(Number.isFinite(el.duration) ? el.duration : 180);
              el.onerror = () => resolve(180);
            });
            const base = file.name.replace(/\.[^.]+$/, "");
            newTracks.push({
              id,
              title: base,
              artist: "Imported",
              album: "On This Device",
              albumId: "imported",
              duration,
              folder: "Imported",
              type: isVideo ? "video" : "song",
              year: new Date().getFullYear(),
              lyrics: "",
              style: "electronic",
              tempo: 110,
              keyMidi: 57,
              scale: "minor",
              seed: Math.floor(Math.random() * 999),
              source: "import",
              mime: file.type,
              objectUrl,
            });
            added += 1;
          }
          if (newTracks.length) set({ tracks: [...newTracks, ...get().tracks] });
          return added;
        },

        scanDemo: async () => {
          set({ scanning: true });
          await new Promise((r) => setTimeout(r, 900));
          const existing = new Set(get().tracks.map((t) => t.id));
          const restored = DEMO_TRACKS.filter(
            (d) => !existing.has(d.id) && !get().deleted.some((x) => x.id === d.id),
          );
          set({
            tracks: [...get().tracks, ...restored],
            scanning: false,
          });
        },

        exportBackup: () => {
          const s = get();
          const payload = {
            playlists: s.playlists,
            likedIds: s.likedIds,
            hiddenIds: s.hiddenIds,
            settings: s.settings,
            eq: s.eq,
            playtimeSec: s.playtimeSec,
          };
          const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
          });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "tune-player-backup.json";
          a.click();
        },
        importBackup: (json) => {
          try {
            const data = JSON.parse(json) as Partial<PlayerStore>;
            set({
              playlists: data.playlists ?? get().playlists,
              likedIds: data.likedIds ?? get().likedIds,
              hiddenIds: data.hiddenIds ?? get().hiddenIds,
              settings: { ...get().settings, ...data.settings },
              eq: data.eq ?? get().eq,
              playtimeSec: data.playtimeSec ?? get().playtimeSec,
            });
            applyThemeToDom(get().settings.theme);
          } catch {
            /* ignore */
          }
        },
        applyTheme: () => applyThemeToDom(get().settings.theme),
        tickPlaytime: (dt) => set({ playtimeSec: get().playtimeSec + dt }),
        checkSleep: () => {
          const until = get().sleepUntil;
          if (until && Date.now() >= until && get().isPlaying) {
            engine.pause();
            set({
              isPlaying: false,
              sleepUntil: null,
              settings: { ...get().settings, sleepMinutes: null },
            });
          }
        },
      };
    },
    {
      name: "tune-player-v1",
      skipHydration: true,
      partialize: (s) => ({
        playlists: s.playlists,
        likedIds: s.likedIds,
        hiddenIds: s.hiddenIds,
        deleted: s.deleted.map(({ objectUrl: _o, ...rest }) => rest),
        tracks: s.tracks
          .filter((t) => t.source === "import")
          .map(({ objectUrl: _o, ...rest }) => rest),
        settings: s.settings,
        eq: s.eq,
        playtimeSec: s.playtimeSec,
        shuffle: s.shuffle,
        repeat: s.repeat,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PlayerStore>;
        const imported = (p.tracks ?? []).filter((t) => t.source === "import");
        const demoIds = new Set(DEMO_TRACKS.map((t) => t.id));
        const demo = DEMO_TRACKS.filter(
          (d) => !(p.deleted ?? []).some((x) => x.id === d.id),
        );
        const extraDemo = current.tracks.filter(
          (t) => t.source === "demo" && !demoIds.has(t.id),
        );
        return {
          ...current,
          ...p,
          tracks: [...imported, ...demo, ...extraDemo],
          playlists: p.playlists?.length ? p.playlists : current.playlists,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyThemeToDom(state.settings.theme);
        engine.setVolume(state.settings.volume);
        engine.applyEq(state.eq);
        window.setTimeout(() => {
          void (async () => {
            const restored: Track[] = [];
            for (const t of state.tracks) {
              if (t.source !== "import") continue;
              const blob = await idbGet(t.id);
              if (blob) restored.push({ ...t, objectUrl: URL.createObjectURL(blob) });
            }
            if (restored.length) {
              usePlayer.setState({
                tracks: state.tracks.map((t) => restored.find((r) => r.id === t.id) ?? t),
              });
            }
            usePlayer.setState({ hydrated: true });
          })();
        }, 0);
      },
    },
  ),
);

export function useDict() {
  const lang = usePlayer((s) => s.settings.language);
  return dictionaries[lang];
}

export function useVisibleTracks() {
  const tracks = usePlayer((s) => s.tracks);
  const hiddenIds = usePlayer((s) => s.hiddenIds);
  const deleted = usePlayer((s) => s.deleted);
  return useMemo(() => {
    const deletedIds = new Set(deleted.map((d) => d.id));
    return tracks.filter((t) => !hiddenIds.includes(t.id) && !deletedIds.has(t.id));
  }, [tracks, hiddenIds, deleted]);
}

export function useCurrentTrack() {
  const currentId = usePlayer((s) => s.currentId);
  const tracks = usePlayer((s) => s.tracks);
  const deleted = usePlayer((s) => s.deleted);
  return useMemo(
    () =>
      tracks.find((t) => t.id === currentId) ??
      deleted.find((t) => t.id === currentId) ??
      null,
    [currentId, tracks, deleted],
  );
}

export function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatPlaytime(sec: number) {
  if (sec < 60) return `${Math.floor(sec)}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${Math.floor(sec % 60)}s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}
