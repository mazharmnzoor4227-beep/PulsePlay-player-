import { AlbumArt } from "@/components/album-art";
import { cn } from "@/lib/cn";
import { formatTime, useDict, usePlayer } from "@/lib/store";
import type { Track } from "@/lib/types";
import { MoreVertical, Play } from "lucide-react";
import { useRef } from "react";

export function TrackRow({
  track,
  index,
  list,
  subtitle,
}: {
  track: Track;
  index: number;
  list?: string[];
  subtitle?: string;
}) {
  const d = useDict();
  const playTrack = usePlayer((s) => s.playTrack);
  const setSheet = usePlayer((s) => s.setSheet);
  const currentId = usePlayer((s) => s.currentId);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const active = currentId === track.id;
  const timer = useRef<number | null>(null);

  const onDown = () => {
    timer.current = window.setTimeout(() => {
      setSheet("track-actions", track.id);
      timer.current = null;
    }, 460);
  };
  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <div
      className={cn(
        "row-enter pressable flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left",
        active && "bg-surface",
      )}
      style={{ "--i": Math.min(index, 16) } as React.CSSProperties}
      onPointerDown={onDown}
      onPointerUp={clear}
      onPointerLeave={clear}
      onContextMenu={(e) => {
        e.preventDefault();
        setSheet("track-actions", track.id);
      }}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3"
        onClick={() => void playTrack(track.id, list)}
      >
        <AlbumArt
          albumId={track.albumId}
          playing={active && isPlaying}
          className="size-12 shrink-0 rounded-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-accent">
            {track.title}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className="truncate">{subtitle ?? track.album}</span>
            <span className="text-subtle">·</span>
            <span className="tabular-nums">{formatTime(track.duration)}</span>
          </span>
        </span>
        {active && isPlaying ? (
          <Play className="size-3.5 shrink-0 fill-accent text-accent" />
        ) : null}
      </button>
      <button
        type="button"
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted pressable"
        aria-label={d.properties}
        onClick={(e) => {
          e.stopPropagation();
          setSheet("track-actions", track.id);
        }}
      >
        <MoreVertical className="size-4" />
      </button>
    </div>
  );
}
