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

  master.gain.value = 0.36;
  sfxBus.gain.value = 0.86;
  musicBus.gain.value = 0.16;

  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.18;

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

function tone(engine, frequency, duration, config = {}) {
  const { ctx, sfxBus } = engine;
  const start = ctx.currentTime + (config.delay ?? 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const destination = config.destination ?? sfxBus;
  let output = gain;

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
  }

  osc.connect(gain);
  output.connect(destination);
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

function musicTone(engine, time, frequency, duration, config = {}) {
  const { ctx, musicBus } = engine;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = config.type ?? "sawtooth";
  osc.frequency.setValueAtTime(frequency, time);
  if (config.to) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, config.to), time + duration);
  }
  filter.type = config.filterType ?? "lowpass";
  filter.frequency.setValueAtTime(config.filterFrequency ?? 680, time);
  filter.Q.value = config.q ?? 1.2;
  rampGain(gain, time, config.gain ?? 0.03, config.attack ?? 0.008, duration, "linear");
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(musicBus);
  osc.start(time);
  osc.stop(time + duration + 0.03);
}

function musicNoise(engine, time, duration, config = {}) {
  const { ctx, musicBus, noiseBuffer } = engine;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = noiseBuffer;
  filter.type = config.filterType ?? "highpass";
  filter.frequency.setValueAtTime(config.frequency ?? 5200, time);
  filter.Q.value = config.q ?? 0.8;
  rampGain(gain, time, config.gain ?? 0.012, 0.004, duration, "linear");
  source.connect(filter);
  filter.connect(gain);
  gain.connect(musicBus);
  source.start(time);
  source.stop(time + duration + 0.02);
}

function scheduleBgmStep(engine, time, step) {
  const bass = [55, 0, 55, 82.41, 55, 0, 98, 82.41, 55, 0, 73.42, 82.41, 65.41, 0, 98, 82.41];
  const arp = [440, 523.25, 659.25, 880, 659.25, 523.25, 440, 392];
  const bassNote = bass[step % bass.length];

  if (step % 8 === 0) {
    musicTone(engine, time, 70, 0.16, { to: 42, type: "sine", gain: 0.052, filterFrequency: 220 });
  }

  if (bassNote) {
    musicTone(engine, time, bassNote, 0.14, {
      type: "sawtooth",
      gain: step % 4 === 0 ? 0.045 : 0.034,
      filterFrequency: 360,
      q: 1.5,
    });
  }

  if (step % 2 === 1) {
    musicNoise(engine, time, 0.035, { gain: 0.01 + (step % 4 === 1 ? 0.004 : 0), frequency: 5200 });
  }

  if (step % 4 === 2 || step % 8 === 6) {
    musicTone(engine, time + 0.01, arp[(step / 2) % arp.length], 0.08, {
      type: "triangle",
      gain: 0.018,
      filterType: "bandpass",
      filterFrequency: 1600,
      q: 4,
    });
  }
}

export function startBgm(engine) {
  if (!engine || engine.bgm?.active) return;

  const { ctx, musicBus } = engine;
  const bgm = {
    active: true,
    step: 0,
    nextTime: ctx.currentTime + 0.06,
    timer: null,
  };

  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), ctx.currentTime);
  musicBus.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.45);

  const schedule = () => {
    if (!bgm.active) return;
    while (bgm.nextTime < ctx.currentTime + 0.22) {
      scheduleBgmStep(engine, bgm.nextTime, bgm.step);
      bgm.step = (bgm.step + 1) % 32;
      bgm.nextTime += 0.145;
    }
  };

  engine.bgm = bgm;
  schedule();
  bgm.timer = window.setInterval(schedule, 70);
}

export function stopBgm(engine) {
  if (!engine?.bgm) return;

  const { ctx, musicBus } = engine;
  engine.bgm.active = false;
  window.clearInterval(engine.bgm.timer);
  engine.bgm = null;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), ctx.currentTime);
  musicBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
}
