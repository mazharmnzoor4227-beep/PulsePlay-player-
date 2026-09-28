import type { Track, Playlist } from "./types";

function t(partial: Omit<Track, "source">): Track {
  return { ...partial, source: "demo" };
}

export const DEMO_TRACKS: Track[] = [
  t({
    id: "voltage-bloom",
    title: "Voltage Bloom",
    artist: "Neon Harbor",
    album: "Night Circuits",
    albumId: "night-circuits",
    duration: 204,
    folder: "Internal storage/Music",
    type: "song",
    year: 2024,
    style: "electronic",
    tempo: 118,
    keyMidi: 57,
    scale: "minor",
    seed: 11,
    lyrics: `City glass holds a quieter spark
Wires dream in a hallway dark
I count the floors the current knows
Voltage bloom, then overflow

Hold the blue, let the grid unwind
Every pulse a borrowed sign
We are signals dressed as night
Burning low, then burning bright`,
  }),
  t({
    id: "afterglow-lane",
    title: "Afterglow Lane",
    artist: "Neon Harbor",
    album: "Night Circuits",
    albumId: "night-circuits",
    duration: 178,
    folder: "Internal storage/Music",
    type: "song",
    year: 2024,
    style: "synthwave",
    tempo: 102,
    keyMidi: 52,
    scale: "major",
    seed: 19,
    lyrics: `Afterglow lane, the lamps go slow
Chrome remembers every glow
I leave a map in the rearview rain
You find it later, you stay the same

Drive until the color thins
Night is a room we both live in`,
  }),
  t({
    id: "skyline-pulse",
    title: "Skyline Pulse",
    artist: "Neon Harbor",
    album: "Night Circuits",
    albumId: "night-circuits",
    duration: 221,
    folder: "Internal storage/Music",
    type: "song",
    year: 2024,
    style: "synthwave",
    tempo: 110,
    keyMidi: 55,
    scale: "minor",
    seed: 27,
    lyrics: `Pulse along the skyline seam
A metronome, a second dream
Rooftops keep the tempo true
I keep the beat I borrowed from you`,
  }),
  t({
    id: "salt-glass",
    title: "Salt Glass",
    artist: "Mira Vale",
    album: "Glass Harbor",
    albumId: "glass-harbor",
    duration: 252,
    folder: "Downloads",
    type: "song",
    year: 2023,
    style: "ambient",
    tempo: 72,
    keyMidi: 50,
    scale: "dorian",
    seed: 33,
    lyrics: `Salt glass, harbor breath
Tide writes letters then forgets
I hold a window to the sound
Everything returning round

If the water learns my name
Let it leave the vowels the same`,
  }),
  t({
    id: "quiet-beacon",
    title: "Quiet Beacon",
    artist: "Mira Vale",
    album: "Glass Harbor",
    albumId: "glass-harbor",
    duration: 216,
    folder: "Downloads",
    type: "song",
    year: 2023,
    style: "ambient",
    tempo: 68,
    keyMidi: 53,
    scale: "major",
    seed: 41,
    lyrics: `A quiet beacon, barely drawn
On the far edge of the dawn
No one calls, the light still stays
Counting ships, forgetting days`,
  }),
  t({
    id: "window-rain",
    title: "Window Rain",
    artist: "The Soft Delay",
    album: "After Hours",
    albumId: "after-hours",
    duration: 167,
    folder: "Internal storage/Music",
    type: "song",
    year: 2025,
    style: "lofi",
    tempo: 84,
    keyMidi: 48,
    scale: "major",
    seed: 48,
    lyrics: `Window rain, a slower clock
Kettle ticks, the record walks
I leave the chorus half-unsaid
You finish it inside your head

After hours, the room is kind
Every loop a softer mind`,
  }),
  t({
    id: "cassette-moon",
    title: "Cassette Moon",
    artist: "The Soft Delay",
    album: "After Hours",
    albumId: "after-hours",
    duration: 185,
    folder: "Internal storage/Music",
    type: "song",
    year: 2025,
    style: "lofi",
    tempo: 88,
    keyMidi: 50,
    scale: "dorian",
    seed: 55,
    lyrics: `Cassette moon in the kitchen light
Tape hiss holding up the night
I rewind the part we keep
Sleep is just a slower beat`,
  }),
  t({
    id: "last-train-home",
    title: "Last Train Home",
    artist: "The Soft Delay",
    album: "After Hours",
    albumId: "after-hours",
    duration: 198,
    folder: "Downloads",
    type: "song",
    year: 2025,
    style: "lofi",
    tempo: 80,
    keyMidi: 45,
    scale: "minor",
    seed: 62,
    lyrics: `Last train home, the seats run cold
Streetlamps copy stories told
I miss the stop, I let it slide
The city hums, I ride, I ride`,
  }),
  t({
    id: "folded-light",
    title: "Folded Light",
    artist: "Juniper Quartet",
    album: "Paper Moons",
    albumId: "paper-moons",
    duration: 232,
    folder: "Internal storage/Music",
    type: "song",
    year: 2022,
    style: "jazz",
    tempo: 96,
    keyMidi: 53,
    scale: "dorian",
    seed: 70,
    lyrics: `Folded light across the keys
Paper moons in minor threes
We leave a rest where talking was
The room agrees, the night because`,
  }),
  t({
    id: "ink-and-ivory",
    title: "Ink & Ivory",
    artist: "Juniper Quartet",
    album: "Paper Moons",
    albumId: "paper-moons",
    duration: 161,
    folder: "Internal storage/Music",
    type: "song",
    year: 2022,
    style: "piano",
    tempo: 74,
    keyMidi: 48,
    scale: "major",
    seed: 77,
    lyrics: `Ink and ivory, a quieter page
Pedal holds what we won't say
A single line, then none at all
The hall remembers how we fall`,
  }),
  t({
    id: "packet-garden",
    title: "Packet Garden",
    artist: "analog.kids",
    album: "Signal Bloom",
    albumId: "signal-bloom",
    duration: 189,
    folder: "Downloads",
    type: "song",
    year: 2026,
    style: "electronic",
    tempo: 124,
    keyMidi: 60,
    scale: "minor",
    seed: 84,
    lyrics: `Packet garden, blooming code
Little lights along the road
We plant a signal, watch it grow
Green and blue in overflow`,
  }),
  t({
    id: "drift-protocol",
    title: "Drift Protocol",
    artist: "analog.kids",
    album: "Signal Bloom",
    albumId: "signal-bloom",
    duration: 213,
    folder: "Downloads",
    type: "song",
    year: 2026,
    style: "electronic",
    tempo: 128,
    keyMidi: 57,
    scale: "minor",
    seed: 91,
    lyrics: `Drift protocol, we unhook time
A handshake made of parallel lines
If the buffer starts to glow
Let the garden overflow`,
  }),
  t({
    id: "tide-cache",
    title: "Tide Cache",
    artist: "Low Tide Radio",
    album: "Coastal Static",
    albumId: "coastal-static",
    duration: 241,
    folder: "Recordings",
    type: "song",
    year: 2024,
    style: "ambient",
    tempo: 70,
    keyMidi: 47,
    scale: "dorian",
    seed: 99,
    lyrics: `Tide cache under the pier
Static singing, almost clear
I save a wave I cannot keep
The radio talks me into sleep`,
  }),
  t({
    id: "static-lullaby",
    title: "Static Lullaby",
    artist: "Low Tide Radio",
    album: "Coastal Static",
    albumId: "coastal-static",
    duration: 202,
    folder: "Recordings",
    type: "song",
    year: 2024,
    style: "lofi",
    tempo: 76,
    keyMidi: 50,
    scale: "major",
    seed: 108,
    lyrics: `Static lullaby, a faded band
Salt in the speaker, sand in the hand
Turn the dial until it thins
Let the weather listen in`,
  }),
  t({
    id: "harbor-lights-visual",
    title: "Harbor Lights (Live Visual)",
    artist: "Mira Vale",
    album: "Glass Harbor",
    albumId: "glass-harbor",
    duration: 228,
    folder: "Downloads",
    type: "video",
    year: 2023,
    style: "ambient",
    tempo: 72,
    keyMidi: 50,
    scale: "dorian",
    seed: 120,
    lyrics: `Lights on the water, slow and wide
A live room breathing with the tide`,
  }),
  t({
    id: "night-circuit-visual",
    title: "Night Circuit Visualizer",
    artist: "Neon Harbor",
    album: "Night Circuits",
    albumId: "night-circuits",
    duration: 196,
    folder: "Internal storage/Music",
    type: "video",
    year: 2024,
    style: "synthwave",
    tempo: 112,
    keyMidi: 55,
    scale: "minor",
    seed: 128,
    lyrics: `Grid on glass, a moving score
The city plays us one time more`,
  }),
  t({
    id: "paper-moon-session",
    title: "Paper Moon Session",
    artist: "Juniper Quartet",
    album: "Paper Moons",
    albumId: "paper-moons",
    duration: 244,
    folder: "Recordings",
    type: "video",
    year: 2022,
    style: "jazz",
    tempo: 92,
    keyMidi: 53,
    scale: "dorian",
    seed: 136,
    lyrics: `Take one, lights low, the room leans in
Paper moons turning on a pin`,
  }),
  t({
    id: "coastal-frequency",
    title: "Coastal Frequency",
    artist: "Low Tide Radio",
    album: "Coastal Static",
    albumId: "coastal-static",
    duration: 218,
    folder: "Recordings",
    type: "video",
    year: 2024,
    style: "ambient",
    tempo: 66,
    keyMidi: 47,
    scale: "major",
    seed: 144,
    lyrics: `A frequency the shoreline knows
Tune until the weather shows`,
  }),
];

export const DEMO_PLAYLISTS: Playlist[] = [
  {
    id: "late-night",
    name: "Late Night",
    trackIds: [
      "window-rain",
      "cassette-moon",
      "salt-glass",
      "static-lullaby",
      "last-train-home",
    ],
    createdAt: 1,
  },
  {
    id: "focus-drive",
    name: "Focus Drive",
    trackIds: [
      "voltage-bloom",
      "packet-garden",
      "skyline-pulse",
      "drift-protocol",
      "afterglow-lane",
    ],
    createdAt: 2,
  },
  {
    id: "harbor-hours",
    name: "Harbor Hours",
    trackIds: [
      "salt-glass",
      "quiet-beacon",
      "tide-cache",
      "folded-light",
      "ink-and-ivory",
    ],
    createdAt: 3,
  },
];

export const ALBUM_META: Record<
  string,
  { title: string; artist: string; year: number }
> = {
  "night-circuits": { title: "Night Circuits", artist: "Neon Harbor", year: 2024 },
  "glass-harbor": { title: "Glass Harbor", artist: "Mira Vale", year: 2023 },
  "after-hours": { title: "After Hours", artist: "The Soft Delay", year: 2025 },
  "paper-moons": { title: "Paper Moons", artist: "Juniper Quartet", year: 2022 },
  "signal-bloom": { title: "Signal Bloom", artist: "analog.kids", year: 2026 },
  "coastal-static": { title: "Coastal Static", artist: "Low Tide Radio", year: 2024 },
  imported: { title: "On This Device", artist: "Imported", year: 2026 },
};
