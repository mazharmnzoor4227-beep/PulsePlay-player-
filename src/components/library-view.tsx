import { AlbumArt } from "@/components/album-art";
import { TrackRow } from "@/components/track-row";
import { cn } from "@/lib/cn";
import { ALBUM_META } from "@/lib/catalog";
import { useDict, usePlayer, useVisibleTracks } from "@/lib/store";
import type { LibraryTab, Track } from "@/lib/types";
import {
  ArrowUpDown,
  ChevronRight,
  Folder,
  Heart,
  ListMusic,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useRef } from "react";

const TABS: LibraryTab[] = [
  "videos",
  "songs",
  "playlists",
  "folders",
  "artists",
  "albums",
];

function sortTracks(tracks: Track[], sort: string) {
  const a = [...tracks];
  if (sort === "title") a.sort((x, y) => x.title.localeCompare(y.title));
  if (sort === "artist") a.sort((x, y) => x.artist.localeCompare(y.artist));
  if (sort === "duration") a.sort((x, y) => x.duration - y.duration);
  if (sort === "recent") a.reverse();
  return a;
}

export function LibraryView() {
  const d = useDict();
  const tab = usePlayer((s) => s.tab);
  const setTab = usePlayer((s) => s.setTab);
  const pushView = usePlayer((s) => s.pushView);
  const setSheet = usePlayer((s) => s.setSheet);
  const setSort = usePlayer((s) => s.setSort);
  const sort = usePlayer((s) => s.sort);
  const shuffleAll = usePlayer((s) => s.shuffleAll);
  const scanning = usePlayer((s) => s.scanning);
  const scanDemo = usePlayer((s) => s.scanDemo);
  const importFiles = usePlayer((s) => s.importFiles);
  const playlists = usePlayer((s) => s.playlists);
  const likedIds = usePlayer((s) => s.likedIds);
  const tracks = useVisibleTracks();
  const fileRef = useRef<HTMLInputElement>(null);

  const labels: Record<LibraryTab, string> = {
    videos: d.videos,
    songs: d.songs,
    playlists: d.playlists,
    folders: d.folders,
    artists: d.artists,
    albums: d.albums,
  };

  const songs = useMemo(
    () => sortTracks(tracks.filter((t) => t.type === "song"), sort),
    [tracks, sort],
  );
  const videos = useMemo(
    () => sortTracks(tracks.filter((t) => t.type === "video"), sort),
    [tracks, sort],
  );

  const groups = useMemo(() => {
    if (tab === "artists") {
      const map = new Map<string, Track[]>();
      for (const t of tracks) {
        const list = map.get(t.artist) ?? [];
        list.push(t);
        map.set(t.artist, list);
      }
      return [...map.entries()].map(([name, list]) => ({
        key: name,
        title: name,
        subtitle: `${list.length} ${list.length === 1 ? d.track : d.tracks}`,
        count: list.length,
        albumId: list[0]?.albumId ?? "imported",
        onOpen: () => pushView({ name: "artist", id: name }),
      }));
    }
    if (tab === "albums") {
      const map = new Map<string, Track[]>();
      for (const t of tracks) {
        const list = map.get(t.albumId) ?? [];
        list.push(t);
        map.set(t.albumId, list);
      }
      return [...map.entries()].map(([id, list]) => ({
        key: id,
        title: ALBUM_META[id]?.title ?? list[0]?.album ?? d.unknownAlbum,
        subtitle: list[0]?.artist ?? "",
        count: list.length,
        albumId: id,
        onOpen: () => pushView({ name: "album", id }),
      }));
    }
    if (tab === "folders") {
      const map = new Map<string, Track[]>();
      for (const t of tracks) {
        const list = map.get(t.folder) ?? [];
        list.push(t);
        map.set(t.folder, list);
      }
      return [...map.entries()].map(([name, list]) => ({
        key: name,
        title: name.split("/").pop() ?? name,
        subtitle: name,
        count: list.length,
        albumId: list[0]?.albumId ?? "imported",
        onOpen: () => pushView({ name: "folder", id: name }),
      }));
    }
    return [];
  }, [tab, tracks, d, pushView]);

  const listIds =
    tab === "videos"
      ? videos.map((t) => t.id)
      : tab === "songs"
        ? songs.map((t) => t.id)
        : tracks.map((t) => t.id);

  const empty = tab === "videos" ? videos.length === 0 : tab === "songs" ? songs.length === 0 : false;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-fg">
            <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
              <path
                d="M14.2 8.4v10.3c0 1.5-1.2 2.4-2.6 2.4-1.5 0-2.6-.9-2.6-2.2s1.1-2.2 2.5-2.2c.4 0 .7.1 1 .2V10.4l9.3-2.1v9.6c0 1.5-1.2 2.4-2.6 2.4-1.5 0-2.6-.9-2.6-2.2s1.1-2.2 2.5-2.2c.4 0 .7.1 1 .2V8.4L14.2 10V8.4z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="truncate font-display text-xl font-semibold tracking-tight">
            {d.appName}
          </h1>
        </div>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full text-fg pressable"
          aria-label={d.search}
          onClick={() => pushView({ name: "search" })}
        >
          <Search className="size-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full text-fg pressable"
          aria-label={d.sort}
          onClick={() => {
            const order = ["title", "artist", "duration", "recent"] as const;
            const i = order.indexOf(sort as (typeof order)[number]);
            setSort(order[(i + 1) % order.length]!);
          }}
        >
          <ArrowUpDown className="size-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full text-fg pressable"
          aria-label={d.settings}
          onClick={() => pushView({ name: "settings" })}
        >
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </button>
      </header>

      <div className="scroll-hide flex gap-2 overflow-x-auto px-4 pb-3 pt-1 snap-x">
        {TABS.map((id, i) => (
          <div key={id} className="flex shrink-0 items-center gap-2 snap-start">
            {i === 1 ? <span className="h-5 w-px bg-border" /> : null}
            <button
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold pressable",
                tab === id
                  ? "bg-accent text-accent-fg"
                  : "bg-pill-idle text-muted",
              )}
            >
              {labels[id]}
            </button>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-36">
        {scanning ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
            <div className="size-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p>{d.scanning}</p>
          </div>
        ) : null}

        {!scanning && tab === "songs" ? (
          empty ? (
            <EmptyScan
              title={d.songNotFound}
              onScan={() => {
                fileRef.current?.click();
                void scanDemo();
              }}
            />
          ) : (
            songs.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} list={listIds} />
            ))
          )
        ) : null}

        {!scanning && tab === "videos" ? (
          empty ? (
            <EmptyScan
              title={d.videoNotFound}
              onScan={() => {
                fileRef.current?.click();
                void scanDemo();
              }}
            />
          ) : (
            videos.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} list={listIds} />
            ))
          )
        ) : null}

        {!scanning && tab === "playlists" ? (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="pressable flex items-center gap-3 rounded-2xl px-2 py-2 text-left"
              onClick={() => pushView({ name: "favorites" })}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-heart/15 text-heart">
                <Heart className="size-5 fill-heart" />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{d.favorites}</span>
                <span className="text-xs text-muted">
                  {likedIds.length} {likedIds.length === 1 ? d.track : d.tracks}
                </span>
              </span>
              <span className="text-sm tabular-nums text-muted">{likedIds.length}</span>
            </button>
            {playlists.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="row-enter pressable flex items-center gap-3 rounded-2xl px-2 py-2 text-left"
                style={{ "--i": i } as React.CSSProperties}
                onClick={() => pushView({ name: "playlist", id: p.id })}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-accent">
                  <ListMusic className="size-5" />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="text-xs text-muted">
                    {p.trackIds.length} {p.trackIds.length === 1 ? d.track : d.tracks}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted">{p.trackIds.length}</span>
                <ChevronRight className="size-4 text-subtle" />
              </button>
            ))}
            <button
              type="button"
              className="pressable mx-auto mt-4 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-medium"
              onClick={() => setSheet("create-playlist")}
            >
              <Plus className="size-4" />
              {d.createPlaylist}
            </button>
          </div>
        ) : null}

        {!scanning && (tab === "artists" || tab === "albums" || tab === "folders")
          ? groups.map((g, i) => (
              <button
                key={g.key}
                type="button"
                className="row-enter pressable flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left"
                style={{ "--i": i } as React.CSSProperties}
                onClick={g.onOpen}
              >
                {tab === "folders" ? (
                  <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-accent">
                    <Folder className="size-5" />
                  </div>
                ) : (
                  <AlbumArt albumId={g.albumId} className="size-12 rounded-xl" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{g.title}</span>
                  <span className="text-xs text-muted">{g.subtitle}</span>
                </span>
                <span className="text-sm tabular-nums text-muted">{g.count}</span>
              </button>
            ))
          : null}

        {!scanning && !empty && (tab === "songs" || tab === "videos") ? (
          <div className="flex justify-center pt-4">
            <button
              type="button"
              className="pressable rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-fg"
              onClick={() => void shuffleAll(listIds)}
            >
              {d.shuffleAll}
            </button>
          </div>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="audio/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void importFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function EmptyScan({ title, onScan }: { title: string; onScan: () => void }) {
  const d = useDict();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-muted">{title}</p>
      <button
        type="button"
        onClick={onScan}
        className="pressable rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg"
      >
        {d.scanFolders}
      </button>
      <p className="max-w-[240px] text-xs text-subtle">{d.importHint}</p>
    </div>
  );
}
