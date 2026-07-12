const BGM_LEVEL = 0.34;
const BGM_FADE_IN = 1.1;
const BGM_FADE_OUT = 0.24;

const AMBIENT_VOICES = [
  { frequency: 55, type: "sine", gain: 0.024, filterFrequency: 180, detune: -3 },
  { frequency: 110, type: "triangle", gain: 0.012, filterFrequency: 420, detune: 4 },
  { frequency: 164.81, type: "triangle", gain: 0.008, filterFrequency: 720, detune: -5 },
  { frequency: 329.63, type: "sine", gain: 0.0045, filterFrequency: 1500, detune: 6 },
  { frequency: 440, type: "sine", gain: 0.003, filterFrequency: 2200, detune: -8 },
];

function makeNoiseBuffer(ctx) {
  const length = Math.floor(ctx.sampleRate * 1.2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

export function createAudioEngine() {
  if (typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const ctx = new AudioContextClass();
  const master = ctx.createGain();
  const sfxBus = ctx.createGain();
  const musicBus = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();

  master.gain.value = 0.48;
  sfxBus.gain.value = 0.96;
  musicBus.gain.value = 0.0001;

  compressor.threshold.value = -22;
  compressor.knee.value = 10;
  compressor.ratio.value = 7;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.16;

  sfxBus.connect(master);
  musicBus.connect(master);
  master.connect(compressor);
  compressor.connect(ctx.destination);

  return {
    ctx,
    master,
    sfxBus,
    musicBus,
    noiseBuffer: makeNoiseBuffer(ctx),
    bgm: null,
  };
}

export async function resumeAudioEngine(engine) {
  if (!engine?.ctx || engine.ctx.state === "closed") return false;

  if (engine.ctx.state !== "running") {
    try {
      await engine.ctx.resume();
    } catch {
      return false;
    }
  }

  return engine.ctx.state === "running";
}

function rampGain(gain, start, peak, attack, duration, curve = "exp") {
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + attack);

  if (curve === "linear") {
    gain.gain.linearRampToValueAtTime(0.0001, start + duration);
  } else {
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  }
}

function disconnectOnEnd(source, nodes) {
  source.addEventListener("ended", () => {
    nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // The node may already have been disconnected during BGM shutdown.
      }
    });
  }, { once: true });
}

function tone(engine, frequency, duration, config = {}) {
  const { ctx, sfxBus } = engine;
  const start = ctx.currentTime + (config.delay ?? 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const destination = config.destination ?? sfxBus;
  let output = gain;
  const nodes = [osc, gain];

  osc.type = config.type ?? "sine";
  osc.frequency.setValueAtTime(Math.max(20, frequency), start);
  if (config.to) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, config.to), start + duration);
  }
  if (config.detune) {
    osc.detune.setValueAtTime(config.detune, start);
  }

  rampGain(gain, start, config.gain ?? 0.05, config.attack ?? 0.01, duration, config.curve);

  if (config.filterType) {
    const filter = ctx.createBiquadFilter();
    filter.type = config.filterType;
    filter.frequency.setValueAtTime(config.filterFrequency ?? 1200, start);
    if (config.filterTo) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, config.filterTo), start + duration);
    }
    filter.Q.value = config.q ?? 1.2;
    gain.connect(filter);
    output = filter;
    nodes.push(filter);
  }

  osc.connect(gain);
  output.connect(destination);
  disconnectOnEnd(osc, nodes);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

function noise(engine, duration, config = {}) {
  const { ctx, sfxBus, noiseBuffer } = engine;
  const start = ctx.currentTime + (config.delay ?? 0);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = noiseBuffer;
  filter.type = config.filterType ?? "bandpass";
  filter.frequency.setValueAtTime(config.frequency ?? 1200, start);
  if (config.to) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, config.to), start + duration);
  }
  filter.Q.value = config.q ?? 1.6;
  rampGain(gain, start, config.gain ?? 0.04, config.attack ?? 0.008, duration, config.curve);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(config.destination ?? sfxBus);
  disconnectOnEnd(source, [source, filter, gain]);
  source.start(start);
  source.stop(start + duration + 0.04);
}

export function playSfx(engine, name, options = {}) {
  if (!engine) return;

  const amount = options.amount ?? 1;

  switch (name) {
    case "start":
      tone(engine, 130, 0.34, { to: 65, type: "sawtooth", gain: 0.055, filterType: "lowpass", filterFrequency: 540, filterTo: 180 });
      tone(engine, 330, 0.12, { to: 660, type: "square", gain: 0.042, delay: 0.03, filterType: "bandpass", filterFrequency: 980, q: 4 });
      tone(engine, 660, 0.18, { to: 1320, type: "triangle", gain: 0.048, delay: 0.14 });
      noise(engine, 0.22, { filterType: "highpass", frequency: 1800, to: 4200, gain: 0.025, delay: 0.08 });
      break;
    case "lock":
      tone(engine, 360, 0.08, { to: 720, type: "square", gain: 0.04, filterType: "bandpass", filterFrequency: 1200, q: 6 });
      tone(engine, 960, 0.09, { to: 1440, type: "triangle", gain: 0.038, delay: 0.055 });
      noise(engine, 0.06, { filterType: "bandpass", frequency: 2600, gain: 0.018 });
      break;
    case "unlock":
      tone(engine, 500, 0.13, { to: 180, type: "triangle", gain: 0.032, filterType: "lowpass", filterFrequency: 900 });
      break;
    case "type":
      tone(engine, 900 + Math.min(420, amount * 14), 0.045, {
        to: 1320 + Math.min(360, amount * 10),
        type: "triangle",
        gain: 0.018,
        filterType: "bandpass",
        filterFrequency: 1800,
        q: 5,
      });
      break;
    case "break":
      tone(engine, 1180, 0.13, { to: 210, type: "sawtooth", gain: 0.072, filterType: "bandpass", filterFrequency: 1600, filterTo: 520, q: 5 });
      tone(engine, 78, 0.24, { to: 38, type: "sine", gain: 0.09, delay: 0.035 });
      tone(engine, 520, 0.1, { to: 1800, type: "triangle", gain: 0.044, delay: 0.055 });
      noise(engine, 0.27, { filterType: "lowpass", frequency: 980, to: 260, gain: 0.07, delay: 0.025 });
      break;
    case "chain":
      tone(engine, 440, 0.08, { to: 880, type: "square", gain: 0.036, filterType: "bandpass", filterFrequency: 1500, q: 5 });
      tone(engine, 660, 0.09, { to: 1320, type: "triangle", gain: 0.04, delay: 0.07 });
      tone(engine, 990, 0.12, { to: 1980, type: "sine", gain: 0.038, delay: 0.14 });
      noise(engine, 0.12, { filterType: "highpass", frequency: 3200, gain: 0.018, delay: 0.05 });
      break;
    case "miss":
      tone(engine, 170, 0.24, { to: 48, type: "sawtooth", gain: 0.074, filterType: "lowpass", filterFrequency: 460 });
      noise(engine, 0.22, { filterType: "lowpass", frequency: 520, gain: 0.06 });
      break;
    case "deny":
      tone(engine, 210, 0.08, { to: 120, type: "square", gain: 0.038 });
      tone(engine, 150, 0.1, { to: 80, type: "sawtooth", gain: 0.03, delay: 0.065 });
      break;
    case "ready":
      tone(engine, 220, 0.18, { to: 880, type: "sawtooth", gain: 0.045, filterType: "bandpass", filterFrequency: 1200, q: 4 });
      tone(engine, 440, 0.2, { to: 1760, type: "triangle", gain: 0.046, delay: 0.09 });
      noise(engine, 0.22, { filterType: "highpass", frequency: 2800, gain: 0.028, delay: 0.09 });
      break;
    case "bonus":
      tone(engine, 330, 0.12, { to: 660, type: "square", gain: 0.046, filterType: "bandpass", filterFrequency: 1100, q: 4 });
      tone(engine, 660, 0.15, { to: 1320, type: "triangle", gain: 0.044, delay: 0.08 });
      tone(engine, options.major ? 1480 : 980, 0.26, { to: options.major ? 2600 : 1680, type: "sine", gain: options.major ? 0.052 : 0.038, delay: 0.17 });
      if (options.major) noise(engine, 0.3, { filterType: "highpass", frequency: 3000, gain: 0.034, delay: 0.04 });
      break;
    case "rush":
      tone(engine, 82, 0.32, { to: 55, type: "sawtooth", gain: 0.08, filterType: "lowpass", filterFrequency: 420 });
      tone(engine, 360, 0.22, { to: 1440, type: "sawtooth", gain: 0.058, delay: 0.05, filterType: "bandpass", filterFrequency: 1200, q: 4 });
      noise(engine, 0.35, { filterType: "highpass", frequency: 2600, to: 5200, gain: 0.04, delay: 0.04 });
      break;
    case "rushEnd":
      tone(engine, 520, 0.18, { to: 150, type: "triangle", gain: 0.046 });
      tone(engine, 220, 0.24, { to: 60, type: "sawtooth", gain: 0.04, delay: 0.08 });
      break;
    case "overdrive":
      tone(engine, 65, 0.5, { to: 32, type: "sawtooth", gain: 0.1, filterType: "lowpass", filterFrequency: 520 });
      tone(engine, 360, 0.48, { to: 2400, type: "sawtooth", gain: 0.075, delay: 0.05, filterType: "bandpass", filterFrequency: 1400, filterTo: 3400, q: 3 });
      tone(engine, 980, 0.38, { to: 3200, type: "triangle", gain: 0.054, delay: 0.12 });
      noise(engine, 0.52, { filterType: "highpass", frequency: 1500, to: 6200, gain: 0.075 });
      break;
    default:
      break;
  }
}

function createAmbientVoice(engine, config, index) {
  const { ctx, musicBus } = engine;
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const gainLfo = ctx.createOscillator();
  const gainDepth = ctx.createGain();
  const filterLfo = ctx.createOscillator();
  const filterDepth = ctx.createGain();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.frequency, start);
  osc.detune.setValueAtTime(config.detune, start);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(config.filterFrequency, start);
  filter.Q.setValueAtTime(0.7, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(config.gain, start + BGM_FADE_IN + index * 0.12);

  gainLfo.type = "sine";
  gainLfo.frequency.setValueAtTime(0.055 + index * 0.009, start);
  gainDepth.gain.setValueAtTime(0, start);
  gainDepth.gain.linearRampToValueAtTime(config.gain * 0.18, start + BGM_FADE_IN);
  gainLfo.connect(gainDepth);
  gainDepth.connect(gain.gain);

  filterLfo.type = "sine";
  filterLfo.frequency.setValueAtTime(0.027 + index * 0.006, start);
  filterDepth.gain.setValueAtTime(config.filterFrequency * 0.14, start);
  filterLfo.connect(filterDepth);
  filterDepth.connect(filter.frequency);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(musicBus);

  osc.start(start);
  gainLfo.start(start);
  filterLfo.start(start);

  return {
    sources: [osc, gainLfo, filterLfo],
    gain,
    modulationGains: [gainDepth, filterDepth],
    nodes: [osc, filter, gain, gainLfo, gainDepth, filterLfo, filterDepth],
  };
}

export function startBgm(engine) {
  if (!engine || engine.bgm?.active || engine.ctx.state !== "running") return;

  const { ctx, musicBus } = engine;
  const bgm = {
    active: true,
    voices: [],
  };

  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), ctx.currentTime);
  musicBus.gain.linearRampToValueAtTime(BGM_LEVEL, ctx.currentTime + BGM_FADE_IN);

  engine.bgm = bgm;
  bgm.voices = AMBIENT_VOICES.map((voice, index) => createAmbientVoice(engine, voice, index));
}

export function stopBgm(engine) {
  if (!engine?.bgm) return;

  const { ctx, musicBus } = engine;
  const bgm = engine.bgm;
  const now = ctx.currentTime;
  const stopAt = now + BGM_FADE_OUT + 0.04;

  bgm.active = false;
  engine.bgm = null;

  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), now);
  musicBus.gain.linearRampToValueAtTime(0.0001, now + BGM_FADE_OUT);

  bgm.voices.forEach((voice) => {
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), now);
    voice.gain.gain.linearRampToValueAtTime(0.0001, now + BGM_FADE_OUT);
    voice.modulationGains.forEach((modulationGain) => {
      modulationGain.gain.cancelScheduledValues(now);
      modulationGain.gain.setValueAtTime(modulationGain.gain.value, now);
      modulationGain.gain.linearRampToValueAtTime(0, now + BGM_FADE_OUT);
    });

    let ended = 0;
    const disconnectVoice = () => {
      ended += 1;
      if (ended !== voice.sources.length) return;
      voice.nodes.forEach((node) => {
        try {
          node.disconnect();
        } catch {
          // A previous shutdown may already have disconnected this node.
        }
      });
    };

    voice.sources.forEach((source) => {
      source.addEventListener("ended", disconnectVoice, { once: true });
      try {
        source.stop(stopAt);
      } catch {
        disconnectVoice();
      }
    });
  });
}
