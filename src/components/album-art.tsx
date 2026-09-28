import { cn } from "@/lib/cn";
import { Music } from "lucide-react";
import { useId } from "react";

const ART: Record<string, { bg: string; ink: string }> = {
  "night-circuits": { bg: "#0b1220", ink: "#3ec6ff" },
  "glass-harbor": { bg: "#0a1618", ink: "#7fd3c7" },
  "after-hours": { bg: "#1a100c", ink: "#e8a56a" },
  "paper-moons": { bg: "#12141c", ink: "#efe6d2" },
  "signal-bloom": { bg: "#081018", ink: "#4aa8ff" },
  "coastal-static": { bg: "#0c1214", ink: "#9bb7c4" },
  imported: { bg: "#141416", ink: "#2e9dff" },
};

function Pattern({ id, gid }: { id: string; gid: string }) {
  switch (id) {
    case "night-circuits":
      return (
        <>
          <rect width="200" height="200" fill={`url(#${gid}-nc)`} />
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1={20 + i * 22}
              y1="200"
              x2={100 + i * 8}
              y2="40"
              stroke="currentColor"
              strokeOpacity={0.28}
              strokeWidth="1"
            />
          ))}
          <circle cx="142" cy="62" r="22" fill="currentColor" opacity="0.85" />
          <circle cx="58" cy="128" r="10" fill="currentColor" opacity="0.5" />
          <circle cx="108" cy="168" r="4" fill="currentColor" />
        </>
      );
    case "glass-harbor":
      return (
        <>
          <rect width="200" height="200" fill={`url(#${gid}-gh)`} />
          <ellipse cx="70" cy="90" rx="70" ry="46" fill="currentColor" opacity="0.18" />
          <ellipse cx="140" cy="110" rx="56" ry="40" fill="currentColor" opacity="0.28" />
          <ellipse cx="100" cy="150" rx="90" ry="18" fill="currentColor" opacity="0.12" />
          <circle cx="150" cy="48" r="16" fill="currentColor" opacity="0.7" />
        </>
      );
    case "after-hours":
      return (
        <>
          <rect width="200" height="200" fill={`url(#${gid}-ah)`} />
          <circle cx="100" cy="108" r="72" fill="none" stroke="currentColor" strokeOpacity="0.2" />
          <circle cx="100" cy="108" r="52" fill="none" stroke="currentColor" strokeOpacity="0.28" />
          <circle cx="100" cy="108" r="32" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <circle cx="100" cy="108" r="10" fill="currentColor" />
          <path d="M148 48a28 28 0 1 1-28 10" fill="none" stroke="currentColor" strokeWidth="6" />
        </>
      );
    case "paper-moons":
      return (
        <>
          <rect width="200" height="200" fill={`url(#${gid}-pm)`} />
          <circle cx="128" cy="78" r="54" fill="currentColor" opacity="0.92" />
          <circle cx="150" cy="70" r="44" fill="#12141c" />
          <polygon points="24,170 92,88 110,170" fill="currentColor" opacity="0.22" />
          <polygon points="80,180 160,120 190,180" fill="currentColor" opacity="0.14" />
        </>
      );
    case "signal-bloom":
      return (
        <>
          <rect width="200" height="200" fill={`url(#${gid}-sb)`} />
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="100"
              rx="18"
              ry="62"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.55"
              transform={`rotate(${i * 22.5} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="14" fill="currentColor" />
        </>
      );
    case "coastal-static":
      return (
        <>
          <rect width="200" height="200" fill={`url(#${gid}-cs)`} />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={i}
              x="0"
              y={18 + i * 12}
              width="200"
              height="2"
              fill="currentColor"
              opacity={0.08 + (i % 3) * 0.06}
            />
          ))}
          <path
            d="M0 120 C 40 90, 80 150, 120 110 S 180 80, 200 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.7"
          />
        </>
      );
    default:
      return (
        <>
          <rect width="200" height="200" fill="#141416" />
          <circle cx="100" cy="100" r="36" fill="currentColor" opacity="0.25" />
        </>
      );
  }
}

export function AlbumArt({
  albumId,
  className,
  playing = false,
}: {
  albumId: string;
  className?: string;
  playing?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const art = ART[albumId] ?? ART.imported!;
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface text-accent shadow-[var(--shadow-border)]",
        className,
      )}
      style={{ color: art.ink, background: art.bg }}
    >
      <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
        <defs>
          <radialGradient id={`${uid}-nc`} cx="70%" cy="30%">
            <stop offset="0%" stopColor="#16345a" />
            <stop offset="100%" stopColor="#0b1220" />
          </radialGradient>
          <radialGradient id={`${uid}-gh`} cx="40%" cy="40%">
            <stop offset="0%" stopColor="#163a3c" />
            <stop offset="100%" stopColor="#0a1618" />
          </radialGradient>
          <radialGradient id={`${uid}-ah`} cx="50%" cy="55%">
            <stop offset="0%" stopColor="#3a2218" />
            <stop offset="100%" stopColor="#1a100c" />
          </radialGradient>
          <radialGradient id={`${uid}-pm`} cx="60%" cy="35%">
            <stop offset="0%" stopColor="#2a3044" />
            <stop offset="100%" stopColor="#12141c" />
          </radialGradient>
          <radialGradient id={`${uid}-sb`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#12304a" />
            <stop offset="100%" stopColor="#081018" />
          </radialGradient>
          <linearGradient id={`${uid}-cs`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2a30" />
            <stop offset="100%" stopColor="#0c1214" />
          </linearGradient>
        </defs>
        <Pattern id={albumId} gid={uid} />
      </svg>
      {playing ? (
        <div className="absolute inset-x-0 bottom-1.5 flex h-5 items-end justify-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="eq-bar w-0.5 rounded-full bg-accent-fg/90"
              style={{ height: 14, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FallbackTile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-surface-2 text-muted",
        className,
      )}
    >
      <Music className="size-5" strokeWidth={1.5} />
    </div>
  );
}
