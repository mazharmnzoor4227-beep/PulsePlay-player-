import { cn } from "@/lib/cn";
import { formatTime, useCurrentTrack, useDict, usePlayer, useVisibleTracks } from "@/lib/store";
import type { EqPreset } from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Info,
  ListMusic,
  Pencil,
  Share2,
  ShieldOff,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Sheets() {
  const sheet = usePlayer((s) => s.sheet);
  const setSheet = usePlayer((s) => s.setSheet);
  const close = () => setSheet(null);

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 z-50 bg-overlay transition-opacity duration-[250ms]",
          sheet ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-50 max-h-[78%] overflow-y-auto rounded-t-[24px] bg-bg-elevated px-4 pt-3 pb-8 shadow-[var(--shadow-border)] transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          sheet ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-2" />
        {sheet === "track-actions" || sheet === "now-menu" ? <TrackActions /> : null}
        {sheet === "equalizer" ? <Equalizer /> : null}
        {sheet === "lyrics" ? <Lyrics /> : null}
        {sheet === "queue" ? <Queue /> : null}
        {sheet === "create-playlist" ? <CreatePlaylist /> : null}
        {sheet === "add-playlist" ? <AddToPlaylist /> : null}
        {sheet === "rename" ? <RenameSheet /> : null}
        {sheet === "properties" ? <Properties /> : null}
        {sheet === "sites" ? <SitesHelp /> : null}
      </div>
    </>
  );
}

function TrackActions() {
  const d = useDict();
  const id = usePlayer((s) => s.sheetTrackId);
  const tracks = usePlayer((s) => s.tracks);
  const track = tracks.find((t) => t.id === id);
  const playTrack = usePlayer((s) => s.playTrack);
  const toggleLike = usePlayer((s) => s.toggleLike);
  const liked = usePlayer((s) => (id ? s.likedIds.includes(id) : false));
  const setSheet = usePlayer((s) => s.setSheet);
  const deleteTrack = usePlayer((s) => s.deleteTrack);
  const hideTrack = usePlayer((s) => s.hideTrack);
  const queue = usePlayer((s) => s.queue);
  if (!track) return null;

  const share = async () => {
    const text = `${track.title} — ${track.artist}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: track.title, text });
        toast(d.shared);
      } else {
        await navigator.clipboard.writeText(text);
        toast(d.copied);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      toast(d.copied);
    }
    setSheet(null);
  };

  const items = [
    { icon: ListMusic, label: d.play, onClick: () => void playTrack(track.id, queue.length ? queue : undefined) },
    { icon: Heart, label: d.favorite, onClick: () => toggleLike(track.id) },
    { icon: ListMusic, label: d.addToPlaylist, onClick: () => setSheet("add-playlist", track.id) },
    { icon: Share2, label: d.share, onClick: () => void share() },
    { icon: Pencil, label: d.rename, onClick: () => {
      usePlayer.setState({ renameTarget: { kind: "track", id: track.id } });
      setSheet("rename");
    }},
    { icon: ShieldOff, label: d.hide, onClick: () => hideTrack(track.id) },
    { icon: Smartphone, label: d.setRingtone, onClick: () => toast(d.ringtoneBody) },
    { icon: Info, label: d.properties, onClick: () => setSheet("properties", track.id) },
    { icon: Trash2, label: d.delete, danger: true, onClick: () => {
      deleteTrack(track.id);
      toast(d.deleted);
    }},
  ];

  return (
    <div>
      <p className="mb-2 px-1 text-sm font-semibold">{track.title}</p>
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          onClick={it.onClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left pressable",
            it.danger ? "text-heart" : "text-fg",
          )}
        >
          <it.icon className="size-5 text-muted" />
          <span>{it.label}{it.label === d.favorite && liked ? " ·" : ""}</span>
        </button>
      ))}
    </div>
  );
}

function Equalizer() {
  const d = useDict();
  const eq = usePlayer((s) => s.eq);
  const setEq = usePlayer((s) => s.setEq);
  const setEqPreset = usePlayer((s) => s.setEqPreset);
  const presets: EqPreset[] = [
    "normal",
    "bass",
    "treble",
    "vocal",
    "electronic",
    "acoustic",
    "flat",
  ];
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold">{d.equalizer}</h2>
      <div className="scroll-hide mb-5 flex gap-2 overflow-x-auto">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setEqPreset(p)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium capitalize pressable",
              eq.preset === p ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {p === "bass" ? d.bass : p === "treble" ? d.treble : p}
          </button>
        ))}
      </div>
      {[
        ["bass", d.bass, eq.bass] as const,
        ["mid", d.mid, eq.mid] as const,
        ["treble", d.treble, eq.treble] as const,
      ].map(([key, label, val]) => (
        <label key={key} className="mb-4 block">
          <div className="mb-1 flex justify-between text-sm">
            <span>{label}</span>
            <span className="tabular-nums text-muted">{val > 0 ? "+" : ""}{val} dB</span>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={val}
            onChange={(e) => setEq({ [key]: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </label>
      ))}
    </div>
  );
}

function Lyrics() {
  const d = useDict();
  const track = useCurrentTrack();
  const lines = (track?.lyrics ?? "").split("\n").filter(Boolean);
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold">{d.lyrics}</h2>
      {lines.length === 0 ? (
        <p className="text-sm text-muted">{d.noLyrics}</p>
      ) : (
        <div className="space-y-3 pb-4">
          {lines.map((line, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-fg">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Queue() {
  const d = useDict();
  const queue = usePlayer((s) => s.queue);
  const tracks = usePlayer((s) => s.tracks);
  const queueIndex = usePlayer((s) => s.queueIndex);
  const playTrack = usePlayer((s) => s.playTrack);
  const reorderQueue = usePlayer((s) => s.reorderQueue);
  const items = queue
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div>
      <h2 className="mb-3 font-display text-xl font-semibold">{d.queue}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{d.emptyQueue}</p>
      ) : (
        items.map((t, i) => (
          <div key={`${t.id}-${i}`} className="flex items-center gap-2">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left"
              onClick={() => void playTrack(t.id, queue)}
            >
              <span className="w-5 text-xs tabular-nums text-muted">{i + 1}</span>
              <span className={cn("truncate text-sm", i === queueIndex && "text-accent")}>
                {t.title}
              </span>
            </button>
            <div className="flex">
              <button
                type="button"
                className="flex size-9 items-center justify-center text-muted disabled:opacity-30"
                disabled={i === 0}
                aria-label="Move up"
                onClick={() => reorderQueue(i, i - 1)}
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center text-muted disabled:opacity-30"
                disabled={i === items.length - 1}
                aria-label="Move down"
                onClick={() => reorderQueue(i, i + 1)}
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CreatePlaylist() {
  const d = useDict();
  const create = usePlayer((s) => s.createPlaylist);
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create(name);
        toast(d.created);
      }}
    >
      <h2 className="mb-3 font-display text-xl font-semibold">{d.createPlaylist}</h2>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={d.playlistName}
        className="h-12 w-full rounded-2xl bg-surface px-4 text-fg outline-none"
      />
      <button
        type="submit"
        className="mt-4 w-full rounded-full bg-accent py-3 font-semibold text-accent-fg pressable"
      >
        {d.create}
      </button>
    </form>
  );
}

function AddToPlaylist() {
  const d = useDict();
  const playlists = usePlayer((s) => s.playlists);
  const id = usePlayer((s) => s.sheetTrackId);
  const add = usePlayer((s) => s.addToPlaylist);
  const view = usePlayer((s) => s.view);
  const tracks = useVisibleTracks();
  const create = usePlayer((s) => s.createPlaylist);

  if (view.name === "playlist" && id && playlists.some((p) => p.id === id)) {
    const pl = playlists.find((p) => p.id === id)!;
    const have = new Set(pl.trackIds);
    return (
      <div>
        <h2 className="mb-3 font-display text-xl font-semibold">{d.addSongs}</h2>
        {tracks
          .filter((t) => !have.has(t.id))
          .map((t) => (
            <button
              key={t.id}
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left pressable"
              onClick={() => {
                add(pl.id, t.id);
                toast(d.addedPlaylist);
              }}
            >
              <span className="truncate">{t.title}</span>
              <span className="text-sm text-accent">{d.create}</span>
            </button>
          ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 font-display text-xl font-semibold">{d.addToPlaylist}</h2>
      {playlists.map((p) => (
        <button
          key={p.id}
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left pressable"
          onClick={() => {
            if (id) {
              add(p.id, id);
              toast(d.addedPlaylist);
              usePlayer.getState().setSheet(null);
            }
          }}
        >
          <span>{p.name}</span>
          <span className="text-xs text-muted">{p.trackIds.length}</span>
        </button>
      ))}
      <button
        type="button"
        className="mt-2 w-full rounded-full bg-surface py-3 text-sm font-medium"
        onClick={() => {
          if (id) {
            create("New playlist", [id]);
            toast(d.created);
          }
        }}
      >
        {d.createPlaylist}
      </button>
    </div>
  );
}

function RenameSheet() {
  const d = useDict();
  const target = usePlayer((s) => s.renameTarget);
  const tracks = usePlayer((s) => s.tracks);
  const playlists = usePlayer((s) => s.playlists);
  const renameTrack = usePlayer((s) => s.renameTrack);
  const renamePlaylist = usePlayer((s) => s.renamePlaylist);
  const current =
    target?.kind === "track"
      ? tracks.find((t) => t.id === target.id)?.title
      : playlists.find((p) => p.id === target?.id)?.name;
  const [val, setVal] = useState(current ?? "");
  useEffect(() => setVal(current ?? ""), [current]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!target) return;
        if (target.kind === "track") renameTrack(target.id, val);
        else renamePlaylist(target.id, val);
        toast(d.renamed);
      }}
    >
      <h2 className="mb-3 font-display text-xl font-semibold">{d.rename}</h2>
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-12 w-full rounded-2xl bg-surface px-4 outline-none"
      />
      <button
        type="submit"
        className="mt-4 w-full rounded-full bg-accent py-3 font-semibold text-accent-fg"
      >
        {d.save}
      </button>
    </form>
  );
}

function Properties() {
  const d = useDict();
  const id = usePlayer((s) => s.sheetTrackId);
  const tracks = usePlayer((s) => s.tracks);
  const track = tracks.find((t) => t.id === id);
  if (!track) return null;
  const rows = [
    [d.sortTitle, track.title],
    [d.sortArtist, track.artist],
    ["Album", track.album],
    [d.folder, track.folder],
    [d.duration, formatTime(track.duration)],
    [d.year, String(track.year)],
    [d.format, track.source === "import" ? (track.mime ?? "file") : d.synth],
  ];
  return (
    <div>
      <h2 className="mb-3 font-display text-xl font-semibold">{d.properties}</h2>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2 text-sm">
          <span className="text-muted">{k}</span>
          <span className="truncate text-right">{v}</span>
        </div>
      ))}
    </div>
  );
}

function SitesHelp() {
  const d = useDict();
  const importFiles = usePlayer((s) => s.importFiles);
  return (
    <div>
      <h2 className="mb-2 font-display text-xl font-semibold">{d.sites}</h2>
      <p className="text-sm leading-relaxed text-muted">{d.importHint}</p>
      <label className="mt-4 block rounded-full bg-accent py-3 text-center font-semibold text-accent-fg pressable">
        {d.scanFolders}
        <input
          type="file"
          accept="audio/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void importFiles(e.target.files);
          }}
        />
      </label>
    </div>
  );
}
