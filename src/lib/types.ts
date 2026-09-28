export type MediaType = "song" | "video";
export type RepeatMode = "off" | "all" | "one";
export type LibraryTab =
  | "videos"
  | "songs"
  | "playlists"
  | "folders"
  | "artists"
  | "albums";
export type StyleId =
  | "lofi"
  | "ambient"
  | "electronic"
  | "piano"
  | "synthwave"
  | "jazz";
export type ThemeId = "classic" | "midnight" | "dusk" | "light";
export type LangId = "en" | "es" | "hi";
export type EqPreset =
  | "normal"
  | "bass"
  | "treble"
  | "vocal"
  | "electronic"
  | "acoustic"
  | "flat";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  duration: number;
  folder: string;
  type: MediaType;
  year: number;
  lyrics: string;
  style: StyleId;
  tempo: number;
  keyMidi: number;
  scale: "major" | "minor" | "dorian";
  seed: number;
  source: "demo" | "import";
  mime?: string;
  objectUrl?: string;
};

export type Playlist = {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
};

export type EqState = {
  bass: number;
  mid: number;
  treble: number;
  preset: EqPreset;
};

export type SettingsState = {
  theme: ThemeId;
  language: LangId;
  sleepMinutes: number | null;
  notify: boolean;
  volume: number;
  crossfade: boolean;
};

export type View =
  | { name: "library" }
  | { name: "search" }
  | { name: "settings" }
  | { name: "album"; id: string }
  | { name: "artist"; id: string }
  | { name: "folder"; id: string }
  | { name: "playlist"; id: string }
  | { name: "favorites" }
  | { name: "hidden" }
  | { name: "deleted" }
  | { name: "playtime" }
  | { name: "theme" }
  | { name: "sleep" }
  | { name: "language" }
  | { name: "playback" }
  | { name: "notify" }
  | { name: "backup" };

export type SheetKind =
  | "track-actions"
  | "now-menu"
  | "equalizer"
  | "lyrics"
  | "queue"
  | "add-playlist"
  | "create-playlist"
  | "rename"
  | "properties"
  | "sites"
  | null;
