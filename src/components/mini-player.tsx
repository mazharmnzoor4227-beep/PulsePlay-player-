import { AlbumArt } from "@/components/album-art";
import { IconSwap } from "@/components/icon-swap";
import { Marquee } from "@/components/marquee";
import { cn } from "@/lib/cn";
import { useCurrentTrack, useDict, usePlayer } from "@/lib/store";
import { Pause, Play, Repeat, Repeat1, Shuffle } from "lucide-react";
import { useRef } from "react";

export function MiniPlayer() {
  const d = useDict();
  const track = useCurrentTrack();
  const isPlaying = usePlayer((s) => s.isPlaying);
  const currentTime = usePlayer((s) => s.currentTime);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const openNowPlaying = usePlayer((s) => s.openNowPlaying);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const startX = useRef<number | null>(null);

  if (!track || nowPlayingOpen) return null;
  const pct = track.duration ? Math.min(100, (currentTime / track.duration) * 100) : 0;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 safe-bottom"
    >
      <div
        className="pointer-events-auto relative overflow-hidden rounded-[22px] bg-surface shadow-[var(--shadow-border)]"
        onClick={openNowPlaying}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (dx > 56) void prev();
          else if (dx < -56) void next();
        }}
      >
        <div className="absolute inset-x-0 top-0 h-0.5 bg-surface-2">
          <div
            className="h-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <AlbumArt
            albumId={track.albumId}
            playing={isPlaying}
            className="size-11 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <Marquee text={track.title} className="text-sm font-semibold text-fg" />
            <div className="truncate text-xs text-muted">{track.artist}</div>
          </div>
          <button
            type="button"
            className={cn(
              "flex size-11 items-center justify-center rounded-full pressable",
              shuffle || repeat !== "off" ? "text-accent" : "text-muted",
            )}
            aria-label={shuffle ? d.shuffle : repeat === "one" ? d.repeatOne : d.repeatAll}
            onClick={(e) => {
              e.stopPropagation();
              if (repeat !== "off") cycleRepeat();
              else toggleShuffle();
            }}
          >
            {repeat === "one" ? (
              <Repeat1 className="size-4" />
            ) : repeat === "all" ? (
              <Repeat className="size-4" />
            ) : (
              <Shuffle className="size-4" />
            )}
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg pressable"
            aria-label={isPlaying ? d.pause : d.play}
            onClick={(e) => {
              e.stopPropagation();
              void togglePlay();
            }}
          >
            <IconSwap
              active={isPlaying}
              On={Pause}
              Off={Play}
              className="size-5 [&>span:last-child>svg]:ml-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
