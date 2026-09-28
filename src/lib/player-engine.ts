import type { EqState, StyleId, Track } from "./types";

type TimeCb = (t: number) => void;
type EndedCb = () => void;

const SCALES: Record<Track["scale"], number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

function midiToHz(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function hash(n: number) {
  let x = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const PRESETS: Record<EqState["preset"], Omit<EqState, "preset">> = {
  normal: { bass: 2, mid: 0, treble: 1 },
  bass: { bass: 8, mid: -1, treble: -1 },
  treble: { bass: -1, mid: 1, treble: 7 },
  vocal: { bass: -2, mid: 5, treble: 3 },
  electronic: { bass: 5, mid: 1, treble: 4 },
  acoustic: { bass: 1, mid: 3, treble: 2 },
  flat: { bass: 0, mid: 0, treble: 0 },
};

class PlayerEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private comp: DynamicsCompressorNode | null = null;
  private bass: BiquadFilterNode | null = null;
  private mid: BiquadFilterNode | null = null;
  private treble: BiquadFilterNode | null = null;
  analyser: AnalyserNode | null = null;

  private audioEl: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private videoEl: HTMLVideoElement | null = null;

  private track: Track | null = null;
  private playing = false;
  private trackTime = 0;
  private startedAt = 0;
  private ctxOffset = 0;
  private timer: number | null = null;
  private raf: number | null = null;
  private nextStepTime = 0;
  private step = 0;
  private nodes = new Set<AudioScheduledSourceNode>();
  private volume = 0.85;
  private eq: EqState = { bass: 2, mid: 0, treble: 1, preset: "normal" };

  private onTime: TimeCb | null = null;
  private onEnded: EndedCb | null = null;

  setListeners(time: TimeCb, ended: EndedCb) {
    this.onTime = time;
    this.onEnded = ended;
  }

  getAnalyser() {
    return this.analyser;
  }

  getVideoEl() {
    return this.videoEl;
  }

  isPlaying() {
    return this.playing;
  }

  currentTime() {
    if (!this.playing || !this.ctx) return this.trackTime;
    if (this.track?.objectUrl && this.audioEl) return this.audioEl.currentTime;
    return this.trackTime + (this.ctx.currentTime - this.ctxOffset);
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = this.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.01;
    comp.release.value = 0.18;
    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 140;
    const mid = ctx.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1000;
    mid.Q.value = 0.8;
    const treble = ctx.createBiquadFilter();
    treble.type = "highshelf";
    treble.frequency.value = 3800;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;

    bass.connect(mid);
    mid.connect(treble);
    treble.connect(comp);
    comp.connect(analyser);
    analyser.connect(master);
    master.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.comp = comp;
    this.bass = bass;
    this.mid = mid;
    this.treble = treble;
    this.analyser = analyser;
    this.applyEq(this.eq);

    this.audioEl = new Audio();
    this.audioEl.crossOrigin = "anonymous";
    this.audioEl.preload = "auto";
    this.audioEl.addEventListener("timeupdate", () => {
      if (this.track?.objectUrl && this.playing) {
        this.trackTime = this.audioEl!.currentTime;
        this.onTime?.(this.trackTime);
        if (this.track.duration && this.trackTime >= this.track.duration - 0.05) {
          this.handleEnded();
        }
      }
    });
    this.audioEl.addEventListener("ended", () => this.handleEnded());

    try {
      this.mediaSource = ctx.createMediaElementSource(this.audioEl);
      this.mediaSource.connect(bass);
    } catch {
      this.mediaSource = null;
    }

    this.videoEl = document.createElement("video");
    this.videoEl.playsInline = true;
    this.videoEl.preload = "auto";

    return ctx;
  }

  applyEq(eq: EqState) {
    this.eq = eq;
    if (!this.bass || !this.mid || !this.treble) return;
    this.bass.gain.value = eq.bass;
    this.mid.gain.value = eq.mid;
    this.treble.gain.value = eq.treble;
  }

  applyPreset(preset: EqState["preset"]): EqState {
    const next = { ...PRESETS[preset], preset };
    this.applyEq(next);
    return next;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master) {
      this.master.gain.setTargetAtTime(v, this.ctx?.currentTime ?? 0, 0.04);
    }
    if (this.videoEl) this.videoEl.volume = v;
  }

  async load(track: Track, at = 0) {
    this.ensure();
    this.stopNodes();
    this.stopScheduler();
    this.track = track;
    this.trackTime = Math.max(0, at);
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.removeAttribute("src");
    }
    if (track.objectUrl && this.audioEl) {
      const isVideo = (track.mime ?? "").startsWith("video");
      if (isVideo && this.videoEl) {
        this.videoEl.src = track.objectUrl;
        this.videoEl.currentTime = at;
        this.videoEl.volume = this.volume;
      } else {
        this.audioEl.src = track.objectUrl;
        this.audioEl.currentTime = at;
      }
    }
  }

  async play() {
    const ctx = this.ensure();
    await ctx.resume();
    if (!this.track) return;
    this.playing = true;
    if (this.track.objectUrl) {
      const isVideo = (this.track.mime ?? "").startsWith("video");
      try {
        if (isVideo && this.videoEl) {
          this.videoEl.currentTime = this.trackTime;
          await this.videoEl.play();
        } else if (this.audioEl) {
          this.audioEl.currentTime = this.trackTime;
          await this.audioEl.play();
        }
      } catch {
        /* autoplay */
      }
      this.tickMedia();
      return;
    }
    this.ctxOffset = ctx.currentTime;
    this.startedAt = this.trackTime;
    const spb = 60 / this.track.tempo;
    const stepDur = spb / 2;
    this.step = Math.floor(this.trackTime / stepDur);
    this.nextStepTime = ctx.currentTime + 0.04;
    this.startScheduler();
    this.tickSynth();
  }

  pause() {
    if (!this.playing) return;
    this.trackTime = this.currentTime();
    this.playing = false;
    this.stopScheduler();
    this.stopNodes();
    this.audioEl?.pause();
    this.videoEl?.pause();
    this.onTime?.(this.trackTime);
  }

  async seek(t: number) {
    const was = this.playing;
    const dur = this.track?.duration ?? 0;
    const clamped = Math.max(0, Math.min(dur, t));
    if (was) this.pause();
    this.trackTime = clamped;
    if (this.audioEl && this.track?.objectUrl) this.audioEl.currentTime = clamped;
    if (this.videoEl && this.track?.objectUrl) this.videoEl.currentTime = clamped;
    this.onTime?.(clamped);
    if (was) await this.play();
  }

  stop() {
    this.pause();
    this.trackTime = 0;
    this.onTime?.(0);
  }

  private handleEnded() {
    if (!this.playing) return;
    this.playing = false;
    this.stopScheduler();
    this.stopNodes();
    this.trackTime = 0;
    this.onEnded?.();
  }

  private startScheduler() {
    this.stopScheduler();
    const loop = () => {
      if (!this.playing || !this.ctx || !this.track) return;
      const ctx = this.ctx;
      const track = this.track;
      const spb = 60 / track.tempo;
      const stepDur = spb / 2;
      const swing = track.style === "lofi" || track.style === "jazz";
      while (this.nextStepTime < ctx.currentTime + 0.12) {
        const elapsed = this.startedAt + (this.nextStepTime - this.ctxOffset);
        if (elapsed >= track.duration) {
          this.handleEnded();
          return;
        }
        this.scheduleStep(this.step, this.nextStepTime, track);
        const odd = this.step % 2 === 1;
        this.nextStepTime += stepDur * (swing ? (odd ? 1.16 : 0.84) : 1);
        this.step += 1;
      }
    };
    loop();
    this.timer = window.setInterval(loop, 25);
  }

  private stopScheduler() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.raf != null) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  private tickSynth() {
    const step = () => {
      if (!this.playing || this.track?.objectUrl) return;
      const t = this.currentTime();
      if (this.track && t >= this.track.duration) {
        this.handleEnded();
        return;
      }
      this.onTime?.(t);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private tickMedia() {
    const step = () => {
      if (!this.playing || !this.track?.objectUrl) return;
      const el =
        (this.track.mime ?? "").startsWith("video") && this.videoEl
          ? this.videoEl
          : this.audioEl;
      const t = el?.currentTime ?? 0;
      this.trackTime = t;
      this.onTime?.(t);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private stopNodes() {
    const now = this.ctx?.currentTime ?? 0;
    for (const n of this.nodes) {
      try {
        n.stop(now);
      } catch {
        /* already stopped */
      }
    }
    this.nodes.clear();
  }

  private out() {
    return this.bass!;
  }

  private trackNode(node: AudioScheduledSourceNode) {
    this.nodes.add(node);
    node.onended = () => this.nodes.delete(node);
  }

  private envGain(time: number, dur: number, peak: number, attack = 0.01, release = 0.08) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(attack + 0.02, dur - release));
    return g;
  }

  private kick(time: number, gain: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = this.envGain(time, 0.28, gain, 0.001, 0.12);
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
    osc.connect(g);
    g.connect(this.out());
    osc.start(time);
    osc.stop(time + 0.3);
    this.trackNode(osc);
  }

  private snare(time: number, gain: number) {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    const g = this.envGain(time, 0.16, gain, 0.002, 0.08);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.out());
    src.start(time);
    src.stop(time + 0.18);
    this.trackNode(src);

    const tone = ctx.createOscillator();
    tone.type = "triangle";
    tone.frequency.value = 180;
    const tg = this.envGain(time, 0.1, gain * 0.4, 0.001, 0.06);
    tone.connect(tg);
    tg.connect(this.out());
    tone.start(time);
    tone.stop(time + 0.12);
    this.trackNode(tone);
  }

  private hat(time: number, gain: number, open = false) {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const dur = open ? 0.14 : 0.045;
    const g = this.envGain(time, dur, gain, 0.001, open ? 0.08 : 0.02);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.out());
    src.start(time);
    src.stop(time + dur + 0.02);
    this.trackNode(src);
  }

  private bassNote(midi: number, time: number, dur: number, gain: number, style: StyleId) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = style === "piano" || style === "jazz" ? "triangle" : "sawtooth";
    osc.frequency.value = midiToHz(midi);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(style === "electronic" ? 900 : 420, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + dur * 0.8);
    const g = this.envGain(time, dur, gain, 0.01, 0.08);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.out());
    osc.start(time);
    osc.stop(time + dur + 0.02);
    this.trackNode(osc);
  }

  private pad(midis: number[], time: number, dur: number, gain: number) {
    const ctx = this.ctx!;
    for (const midi of midis) {
      for (const detune of [-8, 0, 9]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = midiToHz(midi);
        osc.detune.value = detune;
        const g = this.envGain(time, dur, gain, 0.08, 0.16);
        osc.connect(g);
        g.connect(this.out());
        osc.start(time);
        osc.stop(time + dur + 0.04);
        this.trackNode(osc);
      }
    }
  }

  private lead(midi: number, time: number, dur: number, gain: number, style: StyleId) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = style === "piano" ? "triangle" : style === "synthwave" ? "sawtooth" : "square";
    osc.frequency.value = midiToHz(midi);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = style === "piano" ? 2400 : 1600;
    const g = this.envGain(time, dur, gain, 0.008, 0.06);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.out());
    osc.start(time);
    osc.stop(time + dur + 0.02);
    this.trackNode(osc);
  }

  private chordTones(root: number, scale: number[], seventh: boolean) {
    const notes = [0, 2, 4];
    if (seventh) notes.push(6);
    return notes.map((deg) => {
      const oct = Math.floor(deg / scale.length);
      return root + scale[deg % scale.length]! + oct * 12;
    });
  }

  private scheduleStep(step: number, time: number, track: Track) {
    const pat = step % 16;
    const bar = Math.floor(step / 16);
    const scale = SCALES[track.scale];
    const prog = [0, 4, 5, 3];
    const chordDeg = prog[Math.floor(pat / 4) % 4]!;
    const root = track.keyMidi + scale[chordDeg % scale.length]! + Math.floor(chordDeg / scale.length) * 12;
    const tones = this.chordTones(root, scale, track.style === "jazz");
    const h = (salt: number) => hash(track.seed * 17 + step * 13 + salt);
    const spb = 60 / track.tempo;
    const eighth = spb / 2;
    const style = track.style;
    const intro = bar < 1;

    if (style !== "ambient" && style !== "piano" && !intro) {
      const kickHits =
        style === "electronic" || style === "synthwave"
          ? [0, 4, 8, 12]
          : style === "jazz"
            ? [0, 10]
            : [0, 6, 10];
      if (kickHits.includes(pat)) this.kick(time, 0.55);
      if (pat === 4 || pat === 12) this.snare(time, style === "lofi" ? 0.28 : 0.34);
      if (pat % 2 === 0) this.hat(time, 0.1, pat % 8 === 6);
      if (style === "jazz" && pat % 2 === 1) this.hat(time, 0.06, true);
    }

    if (pat % 4 === 0) {
      const padGain =
        style === "ambient" ? 0.07 : style === "piano" ? 0.045 : 0.04;
      this.pad(
        tones.map((n) => n + 12),
        time,
        eighth * 4 * 0.95,
        padGain,
      );
    }

    if (pat % 2 === 0) {
      const walk = style === "jazz" ? tones[pat % tones.length]! : tones[0]!;
      const bassMidi = (style === "jazz" ? walk : root) - 12;
      this.bassNote(bassMidi, time, eighth * (style === "lofi" ? 1.6 : 1.8), 0.22, style);
    }

    const leadChance = style === "ambient" ? 0.22 : style === "piano" ? 0.45 : 0.38;
    if (h(3) > 1 - leadChance) {
      const deg = Math.floor(h(7) * scale.length);
      const oct = h(9) > 0.55 ? 24 : 12;
      this.lead(track.keyMidi + scale[deg]! + oct, time, eighth * (0.7 + h(4)), 0.09, style);
    }

    if (style === "lofi" && h(21) > 0.82) {
      const ctx = this.ctx!;
      const buffer = ctx.createBuffer(1, 64, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = 0.04;
      src.connect(g);
      g.connect(this.out());
      src.start(time);
      src.stop(time + 0.01);
      this.trackNode(src);
    }
  }
}

export const engine = new PlayerEngine();
