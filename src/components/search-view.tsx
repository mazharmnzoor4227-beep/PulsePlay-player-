import { TrackRow } from "@/components/track-row";
import { cn } from "@/lib/cn";
import { useDict, usePlayer, useVisibleTracks } from "@/lib/store";
import type { LibraryTab } from "@/lib/types";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";

const SITES = [
  { id: "yt", label: "YouTube" },
  { id: "ig", label: "Instagram" },
  { id: "fb", label: "Facebook" },
  { id: "sc", label: "SoundCloud" },
  { id: "x", label: "X" },
] as const;

export function SearchView() {
  const d = useDict();
  const popView = usePlayer((s) => s.popView);
  const query = usePlayer((s) => s.searchQuery);
  const setSearch = usePlayer((s) => s.setSearch);
  const tab = usePlayer((s) => s.tab);
  const setTab = usePlayer((s) => s.setTab);
  const tracks = useVisibleTracks();
  const setSheet = usePlayer((s) => s.setSheet);
  const [site, setSite] = useState<string | null>(null);

  const labels: Record<LibraryTab, string> = {
    videos: d.videos,
    songs: d.songs,
    playlists: d.playlists,
    folders: d.folders,
    artists: d.artists,
    albums: d.albums,
  };

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    const pool =
      tab === "videos"
        ? tracks.filter((t) => t.type === "video")
        : tab === "songs"
          ? tracks.filter((t) => t.type === "song")
          : tracks;
    if (!q) return pool;
    return pool.filter((t) =>
      [t.title, t.artist, t.album, t.folder].some((x) => x.toLowerCase().includes(q)),
    );
  }, [tracks, tab, q]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-1 px-2 pt-3">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full pressable"
          aria-label={d.done}
          onClick={popView}
        >
          <ArrowLeft className="size-5" />
        </button>
        <label className="relative mr-3 flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute right-3 size-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={d.searchPlaceholder}
            className="h-11 w-full rounded-full bg-surface pr-10 pl-4 text-sm text-fg outline-none placeholder:text-subtle"
          />
        </label>
      </header>

      <div className="scroll-hide mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
        {(Object.keys(labels) as LibraryTab[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold pressable",
              tab === id ? "bg-accent text-accent-fg" : "bg-pill-idle text-muted",
            )}
          >
            {labels[id]}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-36">
        <p className="px-3 pt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {d.sites}
        </p>
        <div className="mt-3 flex justify-between px-3">
          {SITES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="flex w-14 flex-col items-center gap-1.5 pressable"
              onClick={() => {
                setSite(s.label);
                setSheet("sites");
              }}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-fg">
                {s.label.slice(0, 1)}
              </span>
              <span className="truncate text-[10px] text-muted">{s.label}</span>
            </button>
          ))}
        </div>
        {site ? (
          <p className="px-4 pt-3 text-xs text-subtle">
            {d.importHint} {site}.
          </p>
        ) : null}

        <div className="mt-4">
          {q && results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">{d.noResults}</p>
          ) : (
            results.map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                list={results.map((x) => x.id)}
                subtitle={t.artist}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
