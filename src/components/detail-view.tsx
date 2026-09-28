import { AlbumArt } from "@/components/album-art";
import { TrackRow } from "@/components/track-row";
import { ALBUM_META } from "@/lib/catalog";
import { useDict, usePlayer, useVisibleTracks } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export function DetailView() {
  const d = useDict();
  const view = usePlayer((s) => s.view);
  const popView = usePlayer((s) => s.popView);
  const tracks = useVisibleTracks();
  const playlists = usePlayer((s) => s.playlists);
  const likedIds = usePlayer((s) => s.likedIds);
  const shuffleAll = usePlayer((s) => s.shuffleAll);
  const removeFromPlaylist = usePlayer((s) => s.removeFromPlaylist);
  const setSheet = usePlayer((s) => s.setSheet);

  let title = "";
  let subtitle = "";
  let albumId = "imported";
  let list: typeof tracks = [];

  if (view.name === "album") {
    list = tracks.filter((t) => t.albumId === view.id);
    title = ALBUM_META[view.id]?.title ?? list[0]?.album ?? d.unknownAlbum;
    subtitle = ALBUM_META[view.id]?.artist ?? list[0]?.artist ?? "";
    albumId = view.id;
  } else if (view.name === "artist") {
    list = tracks.filter((t) => t.artist === view.id);
    title = view.id;
    subtitle = `${list.length} ${list.length === 1 ? d.track : d.tracks}`;
    albumId = list[0]?.albumId ?? "imported";
  } else if (view.name === "folder") {
    list = tracks.filter((t) => t.folder === view.id);
    title = view.id.split("/").pop() ?? view.id;
    subtitle = view.id;
    albumId = list[0]?.albumId ?? "imported";
  } else if (view.name === "playlist") {
    const pl = playlists.find((p) => p.id === view.id);
    title = pl?.name ?? d.playlists;
    const ids = new Set(pl?.trackIds ?? []);
    list = tracks.filter((t) => ids.has(t.id));
    subtitle = `${list.length} ${list.length === 1 ? d.track : d.tracks}`;
    albumId = list[0]?.albumId ?? "imported";
  } else if (view.name === "favorites") {
    title = d.favorites;
    const ids = new Set(likedIds);
    list = tracks.filter((t) => ids.has(t.id));
    subtitle = `${list.length} ${list.length === 1 ? d.track : d.tracks}`;
    albumId = list[0]?.albumId ?? "imported";
  }

  const ids = list.map((t) => t.id);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-1 px-2 pt-3">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full pressable"
          onClick={popView}
        >
          <ArrowLeft className="size-5" />
        </button>
      </header>
      <div className="flex items-end gap-4 px-5 pb-4">
        <AlbumArt albumId={albumId} className="size-24 rounded-[20px]" />
        <div className="min-w-0 pb-1">
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-36">
        {list.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            {view.name === "favorites" ? d.noFavorites : d.emptyPlaylist}
          </p>
        ) : (
          list.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} list={ids} />
          ))
        )}
        {list.length > 0 ? (
          <div className="flex justify-center gap-2 pt-4">
            <button
              type="button"
              className="pressable rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg"
              onClick={() => void shuffleAll(ids)}
            >
              {d.shuffleAll}
            </button>
            {view.name === "playlist" ? (
              <button
                type="button"
                className="pressable rounded-full bg-surface px-5 py-2.5 text-sm font-semibold"
                onClick={() => setSheet("add-playlist", view.id)}
              >
                {d.addSongs}
              </button>
            ) : null}
          </div>
        ) : view.name === "playlist" ? (
          <div className="flex justify-center">
            <button
              type="button"
              className="pressable rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg"
              onClick={() => setSheet("add-playlist", view.id)}
            >
              {d.addSongs}
            </button>
          </div>
        ) : null}
        {view.name === "playlist" && list.length > 0
          ? list.map((t) => (
              <button
                key={`rm-${t.id}`}
                type="button"
                className="sr-only"
                onClick={() => removeFromPlaylist(view.id, t.id)}
              >
                {d.removeFromPlaylist}
              </button>
            ))
          : null}
      </div>
    </div>
  );
}
