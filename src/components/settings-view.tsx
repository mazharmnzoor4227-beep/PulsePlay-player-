import { cn } from "@/lib/cn";
import { formatPlaytime, useDict, usePlayer } from "@/lib/store";
import type { LangId, ThemeId, View } from "@/lib/types";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Clock,
  Cloud,
  EyeOff,
  Globe,
  Headphones,
  Moon,
  Palette,
  ShieldOff,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function Row({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left pressable first:rounded-t-[20px] last:rounded-b-[20px] hover:bg-surface-2/60"
    >
      <Icon className="size-5 shrink-0 text-muted" strokeWidth={1.6} />
      <span className="min-w-0 flex-1 text-[15px] text-fg">{label}</span>
      {value ? <span className="text-sm text-muted">{value}</span> : null}
      <ChevronRight className="size-4 text-subtle" />
    </button>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[20px] bg-surface">{children}</div>;
}

function Screen({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const popView = usePlayer((s) => s.popView);
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
      <h1 className="px-5 pt-2 font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-28">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const d = useDict();
  const view = usePlayer((s) => s.view);
  const pushView = usePlayer((s) => s.pushView);
  const playtimeSec = usePlayer((s) => s.playtimeSec);
  const settings = usePlayer((s) => s.settings);
  const hiddenIds = usePlayer((s) => s.hiddenIds);
  const deleted = usePlayer((s) => s.deleted);
  const sleepUntil = usePlayer((s) => s.sleepUntil);

  const sleepLabel = () => {
    if (!settings.sleepMinutes) return d.off;
    if (sleepUntil) {
      const left = Math.max(0, sleepUntil - Date.now());
      return `${Math.ceil(left / 60000)} ${d.minutes}`;
    }
    return `${settings.sleepMinutes} ${d.minutes}`;
  };

  const themeLabel: Record<ThemeId, string> = {
    classic: d.classic,
    midnight: d.midnight,
    dusk: d.dusk,
    light: d.light,
  };
  const langLabel: Record<LangId, string> = {
    en: d.english,
    es: d.spanish,
    hi: d.hindi,
  };

  if (view.name === "playtime") return <PlaytimePanel />;
  if (view.name === "theme") return <ThemePanel />;
  if (view.name === "sleep") return <SleepPanel />;
  if (view.name === "language") return <LanguagePanel />;
  if (view.name === "playback") return <PlaybackPanel />;
  if (view.name === "notify") return <NotifyPanel />;
  if (view.name === "backup") return <BackupPanel />;
  if (view.name === "hidden") return <HiddenPanel />;
  if (view.name === "deleted") return <DeletedPanel />;

  const go = (name: View["name"]) => pushView({ name } as View);

  return (
    <Screen title={d.settings}>
      <div className="flex flex-col gap-4">
        <Group>
          <Row
            icon={Clock}
            label={d.playtime}
            value={formatPlaytime(playtimeSec)}
            onClick={() => go("playtime")}
          />
          <Row icon={Cloud} label={d.backup} value={d.localReady} onClick={() => go("backup")} />
        </Group>
        <Group>
          <Row
            icon={Palette}
            label={d.theme}
            value={themeLabel[settings.theme]}
            onClick={() => go("theme")}
          />
          <Row icon={Moon} label={d.sleepTimer} value={sleepLabel()} onClick={() => go("sleep")} />
          <Row icon={ShieldOff} label={d.removeAds} value={d.adFree} onClick={() => go("playback")} />
        </Group>
        <Group>
          <Row
            icon={EyeOff}
            label={d.hiddenFiles}
            value={`${hiddenIds.length} ${d.files}`}
            onClick={() => go("hidden")}
          />
          <Row
            icon={Trash2}
            label={d.recentlyDeleted}
            value={`${deleted.length} ${deleted.length === 1 ? d.track : d.tracks}`}
            onClick={() => go("deleted")}
          />
          <Row icon={Headphones} label={d.playback} onClick={() => go("playback")} />
          <Row
            icon={Bell}
            label={d.notification}
            value={settings.notify ? d.notificationsOn : d.notificationsOff}
            onClick={() => go("notify")}
          />
          <Row
            icon={Globe}
            label={d.language}
            value={langLabel[settings.language]}
            onClick={() => go("language")}
          />
        </Group>
      </div>
    </Screen>
  );
}

function PlaytimePanel() {
  const d = useDict();
  const playtimeSec = usePlayer((s) => s.playtimeSec);
  return (
    <Screen title={d.playtime}>
      <div className="rounded-[20px] bg-surface p-6">
        <p className="text-sm text-muted">{d.totalPlayed}</p>
        <p className="mt-2 font-display text-4xl font-semibold tabular-nums">
          {formatPlaytime(playtimeSec)}
        </p>
      </div>
    </Screen>
  );
}

function Choice({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-[16px] px-4 py-3.5 text-left pressable",
        active ? "bg-accent text-accent-fg" : "bg-surface text-fg",
      )}
    >
      {label}
    </button>
  );
}

function ThemePanel() {
  const d = useDict();
  const theme = usePlayer((s) => s.settings.theme);
  const setTheme = usePlayer((s) => s.setTheme);
  const items: { id: ThemeId; label: string }[] = [
    { id: "classic", label: d.classic },
    { id: "midnight", label: d.midnight },
    { id: "dusk", label: d.dusk },
    { id: "light", label: d.light },
  ];
  return (
    <Screen title={d.theme}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <Choice key={it.id} active={theme === it.id} label={it.label} onClick={() => setTheme(it.id)} />
        ))}
      </div>
    </Screen>
  );
}

function SleepPanel() {
  const d = useDict();
  const minutes = usePlayer((s) => s.settings.sleepMinutes);
  const setSleep = usePlayer((s) => s.setSleep);
  const opts = [null, 5, 10, 15, 30, 45, 60] as const;
  return (
    <Screen title={d.sleepTimer}>
      <div className="flex flex-col gap-2">
        {opts.map((m) => (
          <Choice
            key={String(m)}
            active={minutes === m}
            label={m == null ? d.off : `${m} ${d.minutes}`}
            onClick={() => setSleep(m)}
          />
        ))}
      </div>
    </Screen>
  );
}

function LanguagePanel() {
  const d = useDict();
  const lang = usePlayer((s) => s.settings.language);
  const setLang = usePlayer((s) => s.setLang);
  const items: { id: LangId; label: string }[] = [
    { id: "en", label: d.english },
    { id: "es", label: d.spanish },
    { id: "hi", label: d.hindi },
  ];
  return (
    <Screen title={d.language}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <Choice key={it.id} active={lang === it.id} label={it.label} onClick={() => setLang(it.id)} />
        ))}
      </div>
    </Screen>
  );
}

function PlaybackPanel() {
  const d = useDict();
  const volume = usePlayer((s) => s.settings.volume);
  const setVolume = usePlayer((s) => s.setVolume);
  const crossfade = usePlayer((s) => s.settings.crossfade);
  const setCrossfade = usePlayer((s) => s.setCrossfade);
  return (
    <Screen title={d.playback}>
      <div className="rounded-[20px] bg-surface p-5">
        <p className="text-sm text-muted">{d.volume}</p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mt-3 w-full accent-accent"
        />
        <button
          type="button"
          onClick={() => setCrossfade(!crossfade)}
          className="mt-5 flex w-full items-center justify-between"
        >
          <span>{d.crossfade}</span>
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              crossfade ? "bg-accent" : "bg-surface-2",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-accent-fg transition-transform",
                crossfade ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </span>
        </button>
        <p className="mt-6 text-sm text-muted">{d.adFree}</p>
        <p className="mt-1 text-sm text-subtle">{d.adFreeBody}</p>
      </div>
    </Screen>
  );
}

function NotifyPanel() {
  const d = useDict();
  const notify = usePlayer((s) => s.settings.notify);
  const setNotify = usePlayer((s) => s.setNotify);
  return (
    <Screen title={d.notification}>
      <button
        type="button"
        onClick={() => setNotify(!notify)}
        className="flex w-full items-center justify-between rounded-[20px] bg-surface px-5 py-4"
      >
        <span>{notify ? d.notificationsOn : d.notificationsOff}</span>
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            notify ? "bg-accent" : "bg-surface-2",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-accent-fg transition-transform",
              notify ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    </Screen>
  );
}

function BackupPanel() {
  const d = useDict();
  const exportBackup = usePlayer((s) => s.exportBackup);
  const importBackup = usePlayer((s) => s.importBackup);
  return (
    <Screen title={d.backup}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={exportBackup}
          className="rounded-[16px] bg-accent px-4 py-3.5 font-medium text-accent-fg pressable"
        >
          {d.backupExport}
        </button>
        <label className="rounded-[16px] bg-surface px-4 py-3.5 text-center font-medium pressable">
          {d.backupImport}
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              importBackup(await file.text());
            }}
          />
        </label>
      </div>
    </Screen>
  );
}

function HiddenPanel() {
  const d = useDict();
  const hiddenIds = usePlayer((s) => s.hiddenIds);
  const tracks = usePlayer((s) => s.tracks);
  const unhide = usePlayer((s) => s.unhideTrack);
  const hidden = tracks.filter((t) => hiddenIds.includes(t.id));
  return (
    <Screen title={d.hiddenFiles}>
      {hidden.length === 0 ? (
        <p className="text-sm text-muted">{d.emptyHidden}</p>
      ) : (
        hidden.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => unhide(t.id)}
            className="mb-2 flex w-full items-center justify-between rounded-[16px] bg-surface px-4 py-3"
          >
            <span className="truncate">{t.title}</span>
            <span className="text-sm text-accent">{d.unhide}</span>
          </button>
        ))
      )}
    </Screen>
  );
}

function DeletedPanel() {
  const d = useDict();
  const deleted = usePlayer((s) => s.deleted);
  const restore = usePlayer((s) => s.restoreTrack);
  const purge = usePlayer((s) => s.purgeTrack);
  return (
    <Screen title={d.recentlyDeleted}>
      {deleted.length === 0 ? (
        <p className="text-sm text-muted">{d.emptyTrash}</p>
      ) : (
        deleted.map((t) => (
          <div
            key={t.id}
            className="mb-2 flex items-center gap-2 rounded-[16px] bg-surface px-4 py-3"
          >
            <span className="min-w-0 flex-1 truncate">{t.title}</span>
            <button type="button" className="text-sm text-accent" onClick={() => restore(t.id)}>
              {d.restore}
            </button>
            <button type="button" className="text-sm text-heart" onClick={() => purge(t.id)}>
              {d.deleteForever}
            </button>
          </div>
        ))
      )}
    </Screen>
  );
}
