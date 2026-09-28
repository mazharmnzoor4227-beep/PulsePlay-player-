import { AlbumArt } from "@/components/album-art";
import { IconSwap } from "@/components/icon-swap";
import { Visualizer } from "@/components/visualizer";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptic";
import { formatTime, useCurrentTrack, useDict, usePlayer } from "@/lib/store";
import {
  ChevronDown,
  Heart,
  ListMusic,
  MoreVertical,
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function NowPlaying() {
  const d = useDict();
  const open = usePlayer((s) => s.nowPlayingOpen);
  const close = usePlayer((s) => s.closeNowPlaying);
  const track = useCurrentTrack();
  const isPlaying = usePlayer((s) => s.isPlaying);
  const currentTime = usePlayer((s) => s.currentTime);
  const likedIds = usePlayer((s) => s.likedIds);
  const repeat = usePlayer((s) => s.repeat);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const seek = usePlayer((s) => s.seek);
  const toggleLike = usePlayer((s) => s.toggleLike);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const setSheet = usePlayer((s) => s.setSheet);
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal] = useState(0);
  const [heartPop, setHeartPop] = useState(false);
  const startY = useRef<number | null>(null);
  const artStartX = useRef<number | null>(null);
  const liked = track ? likedIds.includes(track.id) : false;
  const dur = track?.duration ?? 0;
  const shown = dragging ? dragVal : currentTime;
  const pct = dur ? Math.min(100, (shown / dur) * 100) : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === " ") {
        e.preventDefault();
        void togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, togglePlay]);

  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex flex-col bg-bg px-5 pt-3 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        open ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("input,button")) return;
        startY.current = e.clientY;
      }}
      onPointerUp={(e) => {
        if (startY.current == null) return;
        const dy = e.clientY - startY.current;
        startY.current = null;
        if (dy > 72) close();
      }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full text-fg pressable"
          aria-label={d.done}
          onClick={close}
        >
          <ChevronDown className="size-6" />
        </button>
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {d.nowPlaying}
        </div>
        <div className="size-11" />
      </div>

      {track ? (
        <>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-fg">
            {track.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "flex size-11 items-center justify-center rounded-full pressable",
                liked ? "text-heart" : "text-muted",
                heartPop && "heart-pop",
              )}
              aria-label={d.favorite}
              onClick={() => {
                setHeartPop(true);
                window.setTimeout(() => setHeartPop(false), 420);
                toggleLike(track.id);
              }}
            >
              <Heart className={cn("size-6", liked && "fill-heart")} />
            </button>
            <div className="min-w-0 flex-1 text-sm text-muted">{track.artist}</div>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full text-muted pressable"
              aria-label={d.songInfo}
              onClick={() => setSheet("now-menu", track.id)}
            >
              <MoreVertical className="size-5" />
            </button>
          </div>

          <div
            className="relative mx-auto mt-4 aspect-square w-full max-w-[360px] overflow-hidden rounded-[28px] shadow-[var(--shadow-border)]"
            onPointerDown={(e) => {
              artStartX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (artStartX.current == null) return;
              const dx = e.clientX - artStartX.current;
              artStartX.current = null;
              if (dx > 48) void prev();
              else if (dx < -48) void next();
            }}
          >
            {track.type === "video" ? (
              <Visualizer hue={track.albumId === "night-circuits" ? 205 : 175} />
            ) : (
              <AlbumArt albumId={track.albumId} playing={isPlaying} className="size-full" />
            )}
          </div>

          <div className="mt-6">
            <input
              type="range"
              min={0}
              max={dur || 1}
              step={0.1}
              value={shown}
              aria-label="Seek"
              className={cn(
                "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-accent",
                "[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent",
                dragging && "[&::-webkit-slider-thumb]:size-4",
              )}
              style={{
                background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-surface-2) ${pct}%)`,
              }}
              onPointerDown={() => setDragging(true)}
              onPointerUp={() => setDragging(false)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setDragVal(v);
                void seek(v);
                haptic(4);
              }}
            />
            <div className="mt-1.5 flex justify-between text-xs tabular-nums text-muted">
              <span>{formatTime(shown)}</span>
              <span>{formatTime(dur)}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-8">
            <button
              type="button"
              className="flex size-14 items-center justify-center rounded-full text-fg pressable"
              aria-label={d.previous}
              onClick={() => void prev()}
            >
              <SkipBack className="size-8 fill-fg" />
            </button>
            <button
              type="button"
              className="flex size-[72px] items-center justify-center rounded-full bg-fg text-bg pressable"
              aria-label={isPlaying ? d.pause : d.play}
              onClick={() => void togglePlay()}
            >
              <IconSwap
                active={isPlaying}
                On={Pause}
                Off={Play}
                className="size-8 [&>span:last-child>svg]:ml-0.5"
              />
            </button>
            <button
              type="button"
              className="flex size-14 items-center justify-center rounded-full text-fg pressable"
              aria-label={d.next}
              onClick={() => void next()}
            >
              <SkipForward className="size-8 fill-fg" />
            </button>
          </div>

          <div className="mt-auto mb-6 flex items-center justify-between px-1">
            <button
              type="button"
              className="flex size-12 items-center justify-center rounded-full text-muted pressable"
              aria-label={d.equalizer}
              onClick={() => setSheet("equalizer")}
            >
              <SlidersHorizontal className="size-5" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-medium text-fg pressable"
              onClick={() => setSheet("lyrics")}
            >
              {d.lyrics}
            </button>
            <div className="flex items-center">
              <button
                type="button"
                className="flex size-12 items-center justify-center rounded-full text-muted pressable"
                aria-label={d.queue}
                onClick={() => setSheet("queue")}
              >
                <ListMusic className="size-5" />
              </button>
              <button
                type="button"
                className={cn(
                  "flex size-12 items-center justify-center rounded-full pressable",
                  repeat === "off" ? "text-muted" : "text-accent",
                )}
                aria-label={repeat === "one" ? d.repeatOne : repeat === "all" ? d.repeatAll : d.repeatOff}
                onClick={cycleRepeat}
              >
                {repeat === "one" ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
