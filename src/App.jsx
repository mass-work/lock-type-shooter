import { useEffect, useMemo, useRef, useState } from "react";

const ENGLISH_WORDS = [
  "OMNI",
  "TRACKBALL",
  "POINTER",
  "KEYBOARD",
  "GESTURE",
  "SCROLL",
  "MACRO",
  "DISPLAY",
  "SENSOR",
  "VECTOR",
  "TYPING",
  "LAYOUT",
  "CUSTOM",
  "SWITCH",
  "FIRMWARE",
  "MATRIX",
  "MOTION",
  "CURSOR",
  "ORBITAL",
  "CONTROL",
  "LAYER",
  "PROFILE",
  "PRECISION",
  "HAPTIC",
  "QUANTUM",
  "PAINTER",
  "VIAL",
  "QMK",
  "LOCKON",
  "DRAG",
  "AIM",
  "TARGET",
  "BOOST",
  "STRIKE",
  "BURST",
  "LASER",
  "SHIELD",
  "PULSE",
  "MISSION",
];

const JAPANESE_WORDS = [
  { prompt: "照準", reading: "しょうじゅん" },
  { prompt: "京都", reading: "きょうと" },
  { prompt: "東京", reading: "とうきょう" },
  { prompt: "入力", reading: "にゅうりょく" },
  { prompt: "射撃", reading: "しゃげき" },
  { prompt: "連続", reading: "れんぞく" },
  { prompt: "加速", reading: "かそく" },
  { prompt: "回避", reading: "かいひ" },
  { prompt: "宇宙", reading: "うちゅう" },
  { prompt: "隕石", reading: "いんせき" },
  { prompt: "防御", reading: "ぼうぎょ" },
  { prompt: "成功", reading: "せいこう" },
  { prompt: "集中", reading: "しゅうちゅう" },
  { prompt: "速度", reading: "そくど" },
  { prompt: "反応", reading: "はんのう" },
  { prompt: "制御", reading: "せいぎょ" },
  { prompt: "作戦", reading: "さくせん" },
  { prompt: "補足", reading: "ほそく" },
  { prompt: "突破", reading: "とっぱ" },
  { prompt: "信号", reading: "しんごう" },
  { prompt: "照射", reading: "しょうしゃ" },
  { prompt: "追跡", reading: "ついせき" },
  { prompt: "誘導", reading: "ゆうどう" },
  { prompt: "敵影", reading: "てきえい" },
  { prompt: "機雷", reading: "きらい" },
  { prompt: "軌道", reading: "きどう" },
  { prompt: "航路", reading: "こうろ" },
  { prompt: "発射", reading: "はっしゃ" },
  { prompt: "弾幕", reading: "だんまく" },
  { prompt: "爆発", reading: "ばくはつ" },
  { prompt: "回復", reading: "かいふく" },
  { prompt: "修復", reading: "しゅうふく" },
  { prompt: "解析", reading: "かいせき" },
  { prompt: "確認", reading: "かくにん" },
  { prompt: "監視", reading: "かんし" },
  { prompt: "警戒", reading: "けいかい" },
  { prompt: "緊急", reading: "きんきゅう" },
  { prompt: "脱出", reading: "だっしゅつ" },
  { prompt: "離脱", reading: "りだつ" },
  { prompt: "追撃", reading: "ついげき" },
  { prompt: "命中", reading: "めいちゅう" },
  { prompt: "偏差", reading: "へんさ" },
  { prompt: "視界", reading: "しかい" },
  { prompt: "照合", reading: "しょうごう" },
  { prompt: "起動", reading: "きどう" },
  { prompt: "停止", reading: "ていし" },
  { prompt: "再起", reading: "さいき" },
  { prompt: "遠隔", reading: "えんかく" },
  { prompt: "近接", reading: "きんせつ" },
  { prompt: "主砲", reading: "しゅほう" },
  { prompt: "副砲", reading: "ふくほう" },
  { prompt: "兵装", reading: "へいそう" },
  { prompt: "装甲", reading: "そうこう" },
  { prompt: "船体", reading: "せんたい" },
  { prompt: "艦橋", reading: "かんきょう" },
  { prompt: "推進", reading: "すいしん" },
  { prompt: "噴射", reading: "ふんしゃ" },
  { prompt: "姿勢", reading: "しせい" },
  { prompt: "同期", reading: "どうき" },
  { prompt: "遅延", reading: "ちえん" },
  { prompt: "補給", reading: "ほきゅう" },
  { prompt: "護衛", reading: "ごえい" },
  { prompt: "迎撃", reading: "げいげき" },
  { prompt: "偵察", reading: "ていさつ" },
  { prompt: "予測", reading: "よそく" },
  { prompt: "命令", reading: "めいれい" },
  { prompt: "連携", reading: "れんけい" },
  { prompt: "確保", reading: "かくほ" },
  { prompt: "圧縮", reading: "あっしゅく" },
  { prompt: "展開", reading: "てんかい" },
  { prompt: "反転", reading: "はんてん" },
  { prompt: "包囲", reading: "ほうい" },
  { prompt: "乱射", reading: "らんしゃ" },
  { prompt: "狙撃", reading: "そげき" },
  { prompt: "補正", reading: "ほせい" },
  { prompt: "低速", reading: "ていそく" },
  { prompt: "高速", reading: "こうそく" },
  { prompt: "精密", reading: "せいみつ" },
  { prompt: "瞬間", reading: "しゅんかん" },
  { prompt: "収束", reading: "しゅうそく" },
  { prompt: "放電", reading: "ほうでん" },
  { prompt: "雷撃", reading: "らいげき" },
  { prompt: "熱源", reading: "ねつげん" },
  { prompt: "走査", reading: "そうさ" },
  { prompt: "深度", reading: "しんど" },
  { prompt: "座標", reading: "ざひょう" },
  { prompt: "旋回", reading: "せんかい" },
  { prompt: "航行", reading: "こうこう" },
  { prompt: "探知", reading: "たんち" },
  { prompt: "受信", reading: "じゅしん" },
  { prompt: "送信", reading: "そうしん" },
  { prompt: "暗号", reading: "あんごう" },
  { prompt: "障壁", reading: "しょうへき" },
  { prompt: "重力", reading: "じゅうりょく" },
  { prompt: "真空", reading: "しんくう" },
  { prompt: "流星", reading: "りゅうせい" },
  { prompt: "銀河", reading: "ぎんが" },
  { prompt: "恒星", reading: "こうせい" },
  { prompt: "衛星", reading: "えいせい" },
  { prompt: "光学", reading: "こうがく" },
  { prompt: "量子", reading: "りょうし" },
  { prompt: "電磁", reading: "でんじ" },
  { prompt: "反射", reading: "はんしゃ" },
];

const LANGUAGE_CONFIG = {
  english: {
    label: "ENGLISH",
    shortLabel: "EN",
  },
  japanese: {
    label: "JAPANESE",
    shortLabel: "JP",
  },
};

const WORD_LENGTH_CYCLE = {
  cycleSize: 18,
  growthSpan: 13,
  burstSpan: 5,
  minLength: 3,
  maxLength: 10,
};

const MODE_CONFIG = {
  normal: {
    label: "NORMAL MODE",
    startEnemies: 1,
    maxEnemies: 4,
    maxAsteroids: 5,
    asteroid: true,
    enemyBaseInterval: 1540,
    enemyMinInterval: 680,
  },
  practice: {
    label: "PRACTICE MODE",
    startEnemies: 1,
    maxEnemies: 3,
    maxAsteroids: 2,
    asteroid: true,
    enemyBaseInterval: 1780,
    enemyMinInterval: 860,
  },
};

const NO_MISS_BONUS_RULES = {
  break: {
    step: 10,
    majorEvery: 30,
    baseScore: 900,
    scoreRamp: 240,
    majorScore: 760,
    special: 24,
    majorSpecial: 10,
    shield: 8,
    majorShield: 5,
    title: "NO MISS",
    unit: "BREAKS",
    floater: "NO MISS",
    detail: "NO-DAMAGE BREAK STREAK",
    color: "magenta",
  },
  typing: {
    step: 75,
    majorEvery: 225,
    baseScore: 650,
    scoreRamp: 180,
    majorScore: 550,
    special: 18,
    majorSpecial: 8,
    shield: 5,
    majorShield: 3,
    title: "CLEAN TYPE",
    unit: "KEYS",
    floater: "CLEAN TYPE",
    detail: "NO-MISS TYPING STREAK",
    color: "cyan",
  },
};

const BONUS_TIME_CONFIG = {
  firstMilestone: 100,
  milestoneStep: 200,
  maxMisses: 3,
  maxEnemies: 16,
  initialEnemies: 10,
  spawnInterval: 90,
  baseScore: 1200,
  scoreRamp: 420,
};

const initialStats = {
  score: 0,
  hp: 100,
  special: 0,
  combo: 0,
  maxCombo: 0,
  accuracy: 100,
  wpm: 0,
  averageLock: 0,
  breaks: 0,
  locks: 0,
  noMissBreaks: 0,
  noMissKeys: 0,
  nextNoMissBreakBonus: NO_MISS_BONUS_RULES.break.step,
  nextNoMissKeyBonus: NO_MISS_BONUS_RULES.typing.step,
  nextBonusTimeKey: BONUS_TIME_CONFIG.firstMilestone,
  bonusTimeActive: false,
  bonusTimeMisses: 0,
  bonusTimeMaxMisses: BONUS_TIME_CONFIG.maxMisses,
};

const RANKS = [
  { name: "S+", threshold: 26000, label: "ACE VECTOR" },
  { name: "S", threshold: 19000, label: "ZERO MISSILE" },
  { name: "A", threshold: 12500, label: "CLEAN BREAKER" },
  { name: "B", threshold: 7600, label: "FIELD LOCKER" },
  { name: "C", threshold: 3200, label: "ROOKIE PILOT" },
  { name: "D", threshold: 0, label: "BOOT SEQUENCE" },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => Math.random() * (max - min) + min;
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const getPlayfieldBottom = (height) => height - Math.min(170, height * 0.22);

function getNoMissBonus(kind, milestone) {
  const rule = NO_MISS_BONUS_RULES[kind];
  const tier = Math.max(1, Math.floor(milestone / rule.step));
  const major = milestone % rule.majorEvery === 0;
  const amount = rule.baseScore + (tier - 1) * rule.scoreRamp + (major ? rule.majorScore : 0);

  return { rule, amount, major };
}

function getBonusTimeReward(milestone) {
  const tier = Math.max(1, Math.floor((milestone - BONUS_TIME_CONFIG.firstMilestone) / BONUS_TIME_CONFIG.milestoneStep) + 1);
  return BONUS_TIME_CONFIG.baseScore + (tier - 1) * BONUS_TIME_CONFIG.scoreRamp;
}

const ROMAJI_MAP = {
  きゃ: ["kya"],
  きゅ: ["kyu"],
  きょ: ["kyo"],
  しゃ: ["sha", "sya"],
  しゅ: ["shu", "syu"],
  しょ: ["sho", "syo"],
  ちゃ: ["cha", "tya", "cya"],
  ちゅ: ["chu", "tyu", "cyu"],
  ちょ: ["cho", "tyo", "cyo"],
  にゃ: ["nya"],
  にゅ: ["nyu"],
  にょ: ["nyo"],
  ひゃ: ["hya"],
  ひゅ: ["hyu"],
  ひょ: ["hyo"],
  みゃ: ["mya"],
  みゅ: ["myu"],
  みょ: ["myo"],
  りゃ: ["rya"],
  りゅ: ["ryu"],
  りょ: ["ryo"],
  ぎゃ: ["gya"],
  ぎゅ: ["gyu"],
  ぎょ: ["gyo"],
  じゃ: ["ja", "jya", "zya"],
  じゅ: ["ju", "jyu", "zyu"],
  じょ: ["jo", "jyo", "zyo"],
  びゃ: ["bya"],
  びゅ: ["byu"],
  びょ: ["byo"],
  ぴゃ: ["pya"],
  ぴゅ: ["pyu"],
  ぴょ: ["pyo"],
  ふぁ: ["fa"],
  ふぃ: ["fi"],
  ふぇ: ["fe"],
  ふぉ: ["fo"],
  うぃ: ["wi"],
  うぇ: ["we"],
  あ: ["a"],
  い: ["i"],
  う: ["u"],
  え: ["e"],
  お: ["o"],
  か: ["ka"],
  き: ["ki"],
  く: ["ku"],
  け: ["ke"],
  こ: ["ko"],
  さ: ["sa"],
  し: ["shi", "si"],
  す: ["su"],
  せ: ["se"],
  そ: ["so"],
  た: ["ta"],
  ち: ["chi", "ti"],
  つ: ["tsu", "tu"],
  て: ["te"],
  と: ["to"],
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["fu", "hu"],
  へ: ["he"],
  ほ: ["ho"],
  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  ら: ["ra"],
  り: ["ri"],
  る: ["ru"],
  れ: ["re"],
  ろ: ["ro"],
  わ: ["wa"],
  を: ["wo", "o"],
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["ji", "zi"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["ji", "di"],
  づ: ["zu", "du"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],
  ー: ["-"],
};

function uniqueOptions(values) {
  return [...new Set(values)].slice(0, 96);
}

function buildRomajiOptions(reading) {
  const build = (index) => {
    if (index >= reading.length) return [""];

    const char = reading[index];
    if (char === "っ") {
      return build(index + 1).flatMap((rest) => {
        const head = rest[0];
        return head && /[bcdfghjklmpqrstvwxyz]/.test(head) ? [head + rest, `xtsu${rest}`, `ltsu${rest}`] : [`xtsu${rest}`, `ltsu${rest}`];
      });
    }

    if (char === "ん") {
      return build(index + 1).flatMap((rest) => {
        const next = rest[0];
        const needsApostrophe = next && /^[aiueoyn]/.test(next);
        return needsApostrophe ? [`n'${rest}`, `nn${rest}`, `xn${rest}`] : [`n${rest}`, `nn${rest}`, `xn${rest}`];
      });
    }

    const pair = reading.slice(index, index + 2);
    const pairOptions = ROMAJI_MAP[pair];
    if (pairOptions) {
      return pairOptions.flatMap((part) => build(index + 2).map((rest) => part + rest));
    }

    const options = ROMAJI_MAP[char] ?? [char];
    return options.flatMap((part) => build(index + 1).map((rest) => part + rest));
  };

  return uniqueOptions(build(0));
}

function getEnemyPacing(breaks = 0) {
  const safeBreaks = Math.max(0, breaks);
  const cycle = WORD_LENGTH_CYCLE.cycleSize;
  const phase = safeBreaks % cycle;
  const loop = Math.floor(safeBreaks / cycle);
  const inBurst = phase >= WORD_LENGTH_CYCLE.growthSpan;
  const burstPhase = inBurst ? phase - WORD_LENGTH_CYCLE.growthSpan : 0;
  const growthRatio = inBurst ? 0 : clamp(phase / (WORD_LENGTH_CYCLE.growthSpan - 1), 0, 1);
  const longTarget = Math.round(
    WORD_LENGTH_CYCLE.minLength + (WORD_LENGTH_CYCLE.maxLength - WORD_LENGTH_CYCLE.minLength) * growthRatio,
  );
  const shortBurstTarget = WORD_LENGTH_CYCLE.minLength + Math.min(2, Math.floor(burstPhase / 2));
  const targetLength = inBurst ? shortBurstTarget : longTarget;
  const loopBoost = loop * 0.05;
  const burstBoost = inBurst ? 0.22 + (burstPhase / Math.max(1, WORD_LENGTH_CYCLE.burstSpan - 1)) * 0.13 : 0;

  return {
    targetLength,
    lengthTolerance: inBurst ? 1 : 2 + Math.min(1, Math.floor(loop / 2)),
    speedMultiplier: 1 + loopBoost + burstBoost,
    spawnIntervalMultiplier: 1 - Math.min(0.42, loopBoost * 0.82 + burstBoost * 0.62),
  };
}

const JAPANESE_WORD_ENTRIES = JAPANESE_WORDS.map((item) => {
  const answerOptions = buildRomajiOptions(item.reading);
  return {
    prompt: item.prompt,
    reading: item.reading,
    answerOptions,
    minInputLength: Math.min(...answerOptions.map((option) => option.length)),
    language: "japanese",
  };
});

const ENGLISH_WORD_ENTRIES = ENGLISH_WORDS.map((word) => ({
  prompt: word,
  reading: word,
  answerOptions: [word.toLowerCase()],
  minInputLength: word.length,
  language: "english",
}));

function createWordEntry(language, breaks = 0) {
  const pacing = getEnemyPacing(breaks);
  const pool = language === "japanese" ? JAPANESE_WORD_ENTRIES : ENGLISH_WORD_ENTRIES;
  const candidates = pool.filter(
    (item) => Math.abs(item.minInputLength - pacing.targetLength) <= pacing.lengthTolerance,
  );
  const pickFrom = candidates.length ? candidates : pool;
  const picked = pickFrom[Math.floor(Math.random() * pickFrom.length)];

  return {
    prompt: picked.prompt,
    reading: picked.reading,
    answerOptions: picked.answerOptions,
    language,
  };
}

function getRank(stats) {
  if (stats.breaks === 0) return RANKS[RANKS.length - 1];

  const accuracyBonus = Math.max(0, stats.accuracy - 80) * 45;
  const speedBonus = Math.min(2600, stats.wpm * 18);
  const comboBonus = Math.min(5200, stats.maxCombo * 155);
  const clearBonus = Math.min(3600, stats.breaks * 55);
  const rating = stats.score + accuracyBonus + speedBonus + comboBonus + clearBonus;

  return RANKS.find((rank) => rating >= rank.threshold) ?? RANKS[RANKS.length - 1];
}

function getShareUrl(result) {
  const { rank, stats } = result;
  const text = [
    "LOCK TYPE SHOOTER の結果",
    `スコア：${stats.score.toLocaleString()}点`,
    `ランク：${rank.name}（${rank.label}）`,
    `最大コンボ：${stats.maxCombo}`,
    `正確率：${stats.accuracy}% / WPM：${stats.wpm}`,
    "#LockTypeShooter",
  ].join("\n");

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

function blurActiveControl() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, [contenteditable='true']"));
}

function makeGameState(mode = "normal", language = "english") {
  return {
    mode,
    language,
    running: false,
    over: false,
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.max(1, Math.min(1.5, window.devicePixelRatio || 1)),
    stars: [],
    enemies: [],
    asteroids: [],
    particles: [],
    floaters: [],
    shots: [],
    surges: [],
    lockedId: null,
    typedText: "",
    pointer: { x: window.innerWidth / 2, y: Math.min(window.innerHeight * 0.72, getPlayfieldBottom(window.innerHeight) - 8) },
    score: 0,
    hp: 100,
    special: 0,
    overdriveAnnounced: false,
    combo: 0,
    maxCombo: 0,
    breaks: 0,
    locks: 0,
    totalKeys: 0,
    correctKeys: 0,
    startAt: 0,
    lastFrame: performance.now(),
    lastHudSync: 0,
    lastEnemy: 0,
    lastAsteroid: 0,
    lastBonusEnemy: 0,
    nextId: 1,
    shake: 0,
    lockTimes: [],
    noMissBreaks: 0,
    noMissKeys: 0,
    nextNoMissBreakBonus: NO_MISS_BONUS_RULES.break.step,
    nextNoMissKeyBonus: NO_MISS_BONUS_RULES.typing.step,
    nextBonusTimeKey: BONUS_TIME_CONFIG.firstMilestone,
    bonusTimeActive: false,
    bonusTimeMisses: 0,
    bonusTimeLevel: 0,
  };
}

function App() {
  const canvasRef = useRef(null);
  const stateRef = useRef(makeGameState("normal"));
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const soundEnabledRef = useRef(true);

  const [phase, setPhase] = useState("title");
  const [mode, setMode] = useState("normal");
  const [language, setLanguage] = useState("english");
  const [stats, setStats] = useState(initialStats);
  const [target, setTarget] = useState(null);
  const [notice, setNotice] = useState(null);
  const [comboPop, setComboPop] = useState(null);
  const [bonusBanner, setBonusBanner] = useState(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentModeConfig = useMemo(() => MODE_CONFIG[mode], [mode]);

  const makeNoiseBuffer = (ctx) => {
    const length = Math.floor(ctx.sampleRate * 0.45);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  const getAudioEngine = (force = false) => {
    if (!force && !soundEnabledRef.current) return null;
    if (typeof window === "undefined") return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioRef.current) {
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      master.gain.value = 0.24;
      master.connect(compressor);
      compressor.connect(ctx.destination);
      audioRef.current = {
        ctx,
        master,
        noiseBuffer: makeNoiseBuffer(ctx),
      };
    }

    const engine = audioRef.current;
    if (engine.ctx.state === "suspended") {
      void engine.ctx.resume();
    }

    return engine;
  };

  const playSfx = (name, options = {}) => {
    const engine = getAudioEngine();
    if (!engine) return;

    const { ctx, master, noiseBuffer } = engine;
    const now = ctx.currentTime;
    const amount = options.amount ?? 1;

    const tone = (frequency, duration, config = {}) => {
      const start = now + (config.delay ?? 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = config.type ?? "sine";
      osc.frequency.setValueAtTime(Math.max(20, frequency), start);
      if (config.to) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, config.to), start + duration);
      }
      if (config.detune) {
        osc.detune.setValueAtTime(config.detune, start);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(config.gain ?? 0.05, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    };

    const noise = (duration, config = {}) => {
      const start = now + (config.delay ?? 0);
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = noiseBuffer;
      filter.type = config.filterType ?? "bandpass";
      filter.frequency.setValueAtTime(config.frequency ?? 1200, start);
      filter.Q.value = config.q ?? 1.6;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(config.gain ?? 0.04, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(start);
      source.stop(start + duration + 0.03);
    };

    switch (name) {
      case "start":
        tone(220, 0.14, { to: 440, type: "triangle", gain: 0.045 });
        tone(330, 0.18, { to: 660, type: "sine", gain: 0.034, delay: 0.08 });
        break;
      case "lock":
        tone(520, 0.08, { to: 980, type: "square", gain: 0.034 });
        tone(1040, 0.06, { to: 780, type: "sine", gain: 0.028, delay: 0.05 });
        break;
      case "unlock":
        tone(440, 0.1, { to: 240, type: "triangle", gain: 0.03 });
        break;
      case "type":
        tone(780 + Math.min(260, amount * 12), 0.035, { to: 1180 + Math.min(220, amount * 10), type: "triangle", gain: 0.018 });
        break;
      case "break":
        tone(160, 0.16, { to: 70, type: "sawtooth", gain: 0.05 });
        tone(620, 0.12, { to: 1320, type: "triangle", gain: 0.042 });
        noise(0.16, { frequency: 1600, gain: 0.035 });
        break;
      case "chain":
        tone(540, 0.08, { to: 820, type: "triangle", gain: 0.032 });
        tone(720, 0.08, { to: 1080, type: "triangle", gain: 0.032, delay: 0.07 });
        tone(920, 0.1, { to: 1460, type: "sine", gain: 0.034, delay: 0.14 });
        break;
      case "miss":
        tone(190, 0.2, { to: 64, type: "sawtooth", gain: 0.052 });
        noise(0.18, { filterType: "lowpass", frequency: 720, gain: 0.04 });
        break;
      case "deny":
        tone(220, 0.08, { to: 160, type: "square", gain: 0.026 });
        tone(170, 0.08, { to: 120, type: "square", gain: 0.024, delay: 0.07 });
        break;
      case "ready":
        tone(440, 0.14, { to: 660, type: "sine", gain: 0.034 });
        tone(660, 0.16, { to: 990, type: "triangle", gain: 0.035, delay: 0.08 });
        tone(990, 0.2, { to: 1320, type: "sine", gain: 0.034, delay: 0.16 });
        break;
      case "bonus":
        tone(520, 0.1, { to: 780, type: "triangle", gain: 0.038 });
        tone(780, 0.12, { to: 1170, type: "triangle", gain: 0.038, delay: 0.08 });
        tone(options.major ? 1320 : 980, 0.22, { to: options.major ? 1980 : 1480, type: "sine", gain: options.major ? 0.046 : 0.034, delay: 0.16 });
        if (options.major) noise(0.24, { frequency: 2600, gain: 0.03, delay: 0.04 });
        break;
      case "rush":
        tone(260, 0.12, { to: 520, type: "sawtooth", gain: 0.044 });
        tone(520, 0.18, { to: 1560, type: "triangle", gain: 0.046, delay: 0.07 });
        noise(0.22, { frequency: 3000, gain: 0.026, delay: 0.04 });
        break;
      case "rushEnd":
        tone(520, 0.12, { to: 220, type: "triangle", gain: 0.034 });
        tone(260, 0.16, { to: 110, type: "sine", gain: 0.028, delay: 0.08 });
        break;
      case "overdrive":
        tone(90, 0.34, { to: 48, type: "sawtooth", gain: 0.064 });
        tone(420, 0.42, { to: 1800, type: "triangle", gain: 0.052 });
        tone(820, 0.34, { to: 2400, type: "sine", gain: 0.04, delay: 0.1 });
        noise(0.32, { frequency: 2200, gain: 0.05 });
        break;
      default:
        break;
    }
  };

  const toggleSound = () => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);

    if (next) {
      getAudioEngine(true);
      window.setTimeout(() => playSfx("start"), 0);
    } else if (audioRef.current?.ctx?.state === "running") {
      void audioRef.current.ctx.suspend();
    }
  };

  const showNotice = (text, type = "info") => {
    setNotice({ text, type, id: Math.random() });
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(null), 760);
  };

  const showBonus = (title, detail, amount, type = "break", major = false) => {
    setBonusBanner({ title, detail, amount, type, major, id: Math.random() });
    playSfx("bonus", { major });
    window.clearTimeout(showBonus.timer);
    showBonus.timer = window.setTimeout(() => setBonusBanner(null), major ? 1900 : 1500);
  };

  const triggerDamage = () => {
    setDamageFlash(true);
    window.setTimeout(() => setDamageFlash(false), 80);
  };

  const chargeSpecial = (amount) => {
    const s = stateRef.current;
    const wasReady = s.special >= 100;
    s.special = clamp(s.special + amount, 0, 100);

    if (!wasReady && s.special >= 100 && !s.overdriveAnnounced) {
      s.overdriveAnnounced = true;
      s.shake = Math.max(s.shake, 14);
      playSfx("ready");
      showNotice("OVERDRIVE READY", "good");
    }
  };

  const isBonusTimeActive = (now = performance.now()) => {
    const s = stateRef.current;
    return s.running && !s.over && s.bonusTimeActive;
  };

  const endBonusTime = (message = "BONUS TIME COMPLETE", type = "good") => {
    const s = stateRef.current;
    if (!s.bonusTimeActive) return;

    s.bonusTimeActive = false;
    s.bonusTimeMisses = 0;
    s.bonusTimeLevel = 0;
    s.lastBonusEnemy = 0;
    s.enemies = s.enemies.filter((enemy) => !enemy.bonusTarget);
    playSfx(type === "bad" ? "rushEnd" : "chain");
    showNotice(message, type);
    syncHud();
  };

  const startBonusTime = (milestone, x, y) => {
    const s = stateRef.current;
    const tier = Math.max(1, Math.floor((milestone - BONUS_TIME_CONFIG.firstMilestone) / BONUS_TIME_CONFIG.milestoneStep) + 1);
    const reward = getBonusTimeReward(milestone);

    s.score += reward;
    s.bonusTimeActive = true;
    s.bonusTimeMisses = 0;
    s.bonusTimeLevel = tier;
    s.lastBonusEnemy = 0;
    s.lockedId = null;
    s.typedText = "";
    s.asteroids = [];
    s.shake = Math.max(s.shake, 34);

    addMilestoneSurge(x, y, "typing", true);
    addParticles(x, y, 70, "magenta");
    addParticles(s.pointer.x, s.pointer.y, 58, "cyan");
    showBonus(`BONUS TIME ${milestone}`, "CLICK-BREAK RUSH / ENDS ON MISSES", reward, "typing", true);
    playSfx("rush");
    showNotice("BONUS TIME START", "good");

    for (let i = 0; i < BONUS_TIME_CONFIG.initialEnemies; i += 1) {
      spawnEnemy({ bonus: true });
    }

    syncHud();
  };

  const awardPendingBonusTime = (x, y) => {
    const s = stateRef.current;

    while (s.noMissKeys >= s.nextBonusTimeKey) {
      const milestone = s.nextBonusTimeKey;
      startBonusTime(milestone, x, y);
      s.nextBonusTimeKey += BONUS_TIME_CONFIG.milestoneStep;
    }
  };

  const registerBonusMiss = (label = "RUSH MISS") => {
    const s = stateRef.current;
    if (!isBonusTimeActive()) return false;

    s.bonusTimeMisses += 1;
    s.combo = 0;
    s.shake = Math.max(s.shake, 10);
    triggerDamage();
    playSfx("deny");

    if (s.bonusTimeMisses >= BONUS_TIME_CONFIG.maxMisses) {
      endBonusTime("BONUS TIME FAILED", "bad");
    } else {
      showNotice(`${label} ${s.bonusTimeMisses}/${BONUS_TIME_CONFIG.maxMisses}`, "bad");
      syncHud();
    }

    return true;
  };

  const computeStats = () => {
    const s = stateRef.current;
    const elapsedMin = s.startAt ? Math.max(0.01, (performance.now() - s.startAt) / 60000) : 0.01;
    const accuracy = s.totalKeys ? Math.round((s.correctKeys / s.totalKeys) * 100) : 100;
    const wpm = Math.round((s.correctKeys / 5) / elapsedMin);
    const averageLock = s.lockTimes.length
      ? s.lockTimes.reduce((sum, value) => sum + value, 0) / s.lockTimes.length / 1000
      : 0;

    return {
      score: Math.floor(s.score),
      hp: Math.round(s.hp),
      special: Math.round(s.special),
      combo: s.combo,
      maxCombo: s.maxCombo,
      accuracy,
      wpm,
      averageLock,
      breaks: s.breaks,
      locks: s.locks,
      noMissBreaks: s.noMissBreaks,
      noMissKeys: s.noMissKeys,
      nextNoMissBreakBonus: s.nextNoMissBreakBonus,
      nextNoMissKeyBonus: s.nextNoMissKeyBonus,
      nextBonusTimeKey: s.nextBonusTimeKey,
      bonusTimeActive: isBonusTimeActive(),
      bonusTimeMisses: s.bonusTimeMisses,
      bonusTimeMaxMisses: BONUS_TIME_CONFIG.maxMisses,
    };
  };

  const syncHud = () => {
    setStats(computeStats());

    const s = stateRef.current;
    const enemy = s.enemies.find((item) => item.id === s.lockedId);
    if (!enemy) {
      setTarget(null);
      return;
    }

    setTarget({
      id: enemy.id,
      name: `TARGET_${String(enemy.id).padStart(2, "0")}`,
      prompt: enemy.prompt,
      reading: enemy.reading,
      answer: enemy.answerOptions.find((option) => option.startsWith(s.typedText)) ?? enemy.answerOptions[0],
      answerOptions: enemy.answerOptions,
      typedText: s.typedText,
      language: enemy.language,
    });
  };

  const createStars = () => {
    const s = stateRef.current;
    s.stars = Array.from({ length: 115 }, () => ({
      x: random(0, s.width),
      y: random(0, s.height),
      size: random(0.5, 2.1),
      velocity: random(12, 72),
      alpha: random(0.25, 0.9),
    }));
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas) return;

    s.width = window.innerWidth;
    s.height = window.innerHeight;
    s.dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
    s.pointer.x = clamp(s.pointer.x, 0, s.width);
    s.pointer.y = clamp(s.pointer.y, 0, getPlayfieldBottom(s.height) - 8);

    canvas.width = s.width * s.dpr;
    canvas.height = s.height * s.dpr;
    canvas.style.width = `${s.width}px`;
    canvas.style.height = `${s.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    createStars();
  };

  const projectDepth = (lane, depth, bob = 0) => {
    const s = stateRef.current;
    const horizon = s.height * 0.22;
    const floor = getPlayfieldBottom(s.height);
    const eased = depth ** 1.58;
    const scale = 0.38 + depth * 1.12;
    const spread = s.width * (0.42 - depth * 0.15);

    return {
      x: s.width / 2 + lane * spread,
      y: horizon + (floor - horizon) * eased + bob * scale,
      scale,
    };
  };

  const pickLane = (wide = false) => {
    const lanes = wide ? [-0.95, -0.68, -0.38, 0.38, 0.68, 0.95] : [-0.82, -0.52, -0.24, 0.24, 0.52, 0.82];
    const base = lanes[Math.floor(Math.random() * lanes.length)];
    return clamp(base + random(-0.08, 0.08), -0.98, 0.98);
  };

  const getMinimumSpawnDistance = (scale = 1) => Math.max(96, 112 * scale);

  const findSpawnPlacement = (wide = false, depthMin = 0.02, depthMax = 0.16) => {
    const s = stateRef.current;
    let fallback = null;

    for (let i = 0; i < 24; i += 1) {
      const lane = pickLane(wide);
      const depth = random(depthMin, depthMax);
      const projected = projectDepth(lane, depth);
      const minDistance = getMinimumSpawnDistance(projected.scale);
      const clear = [...s.enemies, ...s.asteroids].every((item) => {
        if (Math.abs((item.depth ?? 0) - depth) > 0.24) return true;
        return distance(projected.x, projected.y, item.x, item.y) > minDistance + (item.radius ?? 0) * 0.55;
      });

      fallback = { lane, depth, projected };
      if (clear) return fallback;
    }

    return fallback;
  };

  const getActiveEnemyLimit = () => {
    const s = stateRef.current;
    const cfg = MODE_CONFIG[s.mode];
    if (isBonusTimeActive()) return BONUS_TIME_CONFIG.maxEnemies;
    return Math.min(cfg.maxEnemies, cfg.startEnemies + Math.floor(s.breaks / 4));
  };

  const spawnEnemy = ({ bonus = false } = {}) => {
    const s = stateRef.current;
    if (s.enemies.length >= getActiveEnemyLimit()) return;

    const word = createWordEntry(s.language, s.breaks);
    const pacing = getEnemyPacing(s.breaks);
    const placement = findSpawnPlacement(bonus, 0.01, bonus ? 0.18 : 0.1);
    if (!placement) return;
    const { lane, depth, projected } = placement;
    const speed = bonus
      ? random(0.068, 0.112)
      : (random(0.056, 0.084) + Math.min(0.032, s.breaks * 0.001)) * pacing.speedMultiplier;
    const inputLength = Math.min(...word.answerOptions.map((option) => option.length));
    const baseRadius = bonus ? 23 + random(0, 8) : 25 + Math.min(18, inputLength * 0.9);

    s.enemies.push({
      id: s.nextId++,
      ...word,
      lane,
      depth,
      depthSpeed: speed,
      x: projected.x,
      y: projected.y,
      vx: random(-0.055, 0.055),
      vy: speed,
      scale: projected.scale,
      baseRadius,
      radius: baseRadius * projected.scale,
      hpRate: 1,
      born: performance.now(),
      phase: random(0, Math.PI * 2),
      drift: random(0.7, 1.6),
      bonusTarget: bonus,
      shake: 0,
      dead: false,
    });
  };

  const spawnAsteroid = () => {
    const s = stateRef.current;
    const cfg = MODE_CONFIG[s.mode];
    if (!cfg.asteroid || s.asteroids.length >= cfg.maxAsteroids) return;

    const baseRadius = random(32, 62);
    const placement = findSpawnPlacement(true, 0.03, 0.16);
    if (!placement) return;
    const { lane, depth, projected } = placement;
    const crossDirection = lane > 0 ? random(-0.34, -0.08) : random(0.08, 0.34);
    const depthSpeed = random(0.06, 0.18);
    s.asteroids.push({
      lane,
      depth,
      depthSpeed,
      x: projected.x,
      y: projected.y,
      vx: crossDirection + random(-0.06, 0.06),
      vy: 0,
      scale: projected.scale,
      baseRadius,
      radius: baseRadius * projected.scale,
      hitRadius: baseRadius * projected.scale * 0.68,
      phase: random(0, Math.PI * 2),
      wobble: random(0.01, 0.06),
      rotation: random(0, Math.PI * 2),
      rotationVelocity: random(-2.8, 2.8),
      trail: [],
      dead: false,
      points: Array.from({ length: 8 }, (_, index) => ({
        angle: (index * Math.PI * 2) / 8,
        radiusRate: random(0.72, 1.18),
      })),
    });
  };

  const addParticles = (x, y, count, color) => {
    const s = stateRef.current;
    const budget = Math.max(0, 260 - s.particles.length);
    const actualCount = Math.min(count, budget, 70);

    for (let i = 0; i < actualCount; i += 1) {
      const angle = random(0, Math.PI * 2);
      const velocity = random(60, 265);
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: random(0.25, 0.88),
        maxLife: 0.88,
        size: random(1.5, 4),
        color,
      });
    }
  };

  const addFloater = (text, x, y, color = "orange") => {
    stateRef.current.floaters.push({
      text,
      x,
      y,
      life: 0.75,
      maxLife: 0.75,
      color,
    });
  };

  const addMilestoneSurge = (x, y, type = "break", major = false) => {
    const s = stateRef.current;
    const color = type === "typing" ? "cyan" : "magenta";

    if (s.surges.length > 4) s.surges.shift();
    s.surges.push({
      x,
      y,
      type,
      major,
      life: major ? 1.15 : 0.82,
      maxLife: major ? 1.15 : 0.82,
      spin: random(-0.6, 0.6),
    });

    const rayCount = major ? 7 : 4;
    for (let i = 0; i < rayCount; i += 1) {
      const angle = (i / rayCount) * Math.PI * 2 + random(-0.18, 0.18);
      const spread = major ? random(120, 230) : random(70, 150);
      s.shots.push({
        x: s.pointer.x,
        y: s.pointer.y,
        tx: x + Math.cos(angle) * spread,
        ty: y + Math.sin(angle) * spread,
        life: major ? 0.34 : 0.24,
        maxLife: major ? 0.34 : 0.24,
        color,
      });
    }

    if (s.shots.length > 30) {
      s.shots.splice(0, s.shots.length - 30);
    }
  };

  const awardNoMissBonus = (kind, milestone, x, y) => {
    const s = stateRef.current;
    const { rule, amount, major } = getNoMissBonus(kind, milestone);
    const title = `${major ? "PRISM " : ""}${rule.title} ${milestone} ${rule.unit}`;

    s.score += amount;
    chargeSpecial(rule.special + (major ? rule.majorSpecial : 0));
    s.hp = clamp(s.hp + rule.shield + (major ? rule.majorShield : 0), 0, 100);
    s.shake = Math.max(s.shake, major ? 36 : 22);

    addMilestoneSurge(x, y, kind, major);
    addParticles(x, y, major ? 118 : 72, rule.color);
    addParticles(s.pointer.x, s.pointer.y, major ? 76 : 44, kind === "typing" ? "cyan" : "magenta");
    addFloater(`${rule.floater} ${milestone} +${amount}`, x, y - (major ? 118 : 84), rule.color);
    showBonus(title, rule.detail, amount, kind, major);
  };

  const awardPendingNoMissBonuses = (kind, x, y) => {
    const s = stateRef.current;
    const rule = NO_MISS_BONUS_RULES[kind];
    const countKey = kind === "break" ? "noMissBreaks" : "noMissKeys";
    const nextKey = kind === "break" ? "nextNoMissBreakBonus" : "nextNoMissKeyBonus";

    while (s[countKey] >= s[nextKey]) {
      const milestone = s[nextKey];
      awardNoMissBonus(kind, milestone, x, y);
      s[nextKey] += rule.step;
    }
  };

  const hitTestEnemy = (x, y) => {
    const s = stateRef.current;
    return [...s.enemies]
      .sort((a, b) => distance(s.pointer.x, s.pointer.y, a.x, a.y) - distance(s.pointer.x, s.pointer.y, b.x, b.y))
      .find((enemy) => distance(x, y, enemy.x, enemy.y) < enemy.radius + 34);
  };

  const lockEnemy = (enemy) => {
    const s = stateRef.current;
    if (!s.running || s.over) return;

    if (isBonusTimeActive()) {
      breakEnemy(enemy, { bonusClick: true });
      return;
    }

    s.lockedId = enemy.id;
    s.typedText = "";
    s.locks += 1;
    s.lockTimes.push(performance.now() - enemy.born);

    addParticles(enemy.x, enemy.y, 12, "cyan");
    playSfx("lock");
    showNotice("LOCKED", "good");
    syncHud();
  };

  const unlock = () => {
    const s = stateRef.current;
    s.lockedId = null;
    s.typedText = "";
    playSfx("unlock");
    showNotice("UNLOCKED");
    syncHud();
  };

  const endTraining = (title, message) => {
    const s = stateRef.current;
    s.over = true;
    s.lockedId = null;
    const finalStats = computeStats();
    const rank = getRank(finalStats);

    setResult({
      title,
      message,
      stats: finalStats,
      rank,
    });
    setPhase("result");
    syncHud();
  };

  const registerMiss = (damage = 4) => {
    const s = stateRef.current;

    s.totalKeys += 1;
    s.combo = 0;
    s.noMissBreaks = 0;
    s.noMissKeys = 0;
    s.nextNoMissBreakBonus = NO_MISS_BONUS_RULES.break.step;
    s.nextNoMissKeyBonus = NO_MISS_BONUS_RULES.typing.step;
    s.nextBonusTimeKey = BONUS_TIME_CONFIG.firstMilestone;
    s.bonusTimeActive = false;
    s.bonusTimeMisses = 0;
    s.bonusTimeLevel = 0;
    s.hp = clamp(s.hp - damage, 0, 100);
    s.shake = 12;

    const enemy = s.enemies.find((item) => item.id === s.lockedId);
    if (enemy) enemy.shake = 8;

    triggerDamage();
    playSfx("miss");
    showNotice("MISS", "bad");

    if (s.hp <= 0) {
      endTraining("TRAINING FAILED", "Shield is down. Keep the cursor stable and type cleanly.");
      return;
    }

    syncHud();
  };

  const breakEnemy = (enemy, options = {}) => {
    const s = stateRef.current;
    const bestAnswerLength = Math.min(...enemy.answerOptions.map((option) => option.length));
    const clickRush = options.bonusClick || enemy.bonusTarget;
    const bonus = clickRush
      ? 85 + Math.min(260, s.combo * 14) + s.bonusTimeLevel * 18
      : 110 + bestAnswerLength * 9 + Math.min(360, s.combo * 24);

    s.score += bonus;
    s.combo += 1;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    s.breaks += 1;
    s.noMissBreaks += 1;
    if (!clickRush) {
      chargeSpecial(16 + Math.min(20, s.combo * 2));
    }

    awardPendingNoMissBonuses("break", enemy.x, enemy.y);
    s.lockedId = null;
    s.typedText = "";

    s.shots.push({
      x: s.pointer.x,
      y: s.pointer.y,
      tx: enemy.x,
      ty: enemy.y,
      life: 0.18,
      maxLife: 0.18,
    });

    addParticles(enemy.x, enemy.y, 40, "orange");
    addFloater(`+${bonus}`, enemy.x, enemy.y - 44, clickRush ? "magenta" : "cyan");
    addFloater(clickRush ? "RUSH BREAK" : "BREAK", enemy.x, enemy.y - 20, "orange");
    playSfx("break");
    s.enemies = s.enemies.filter((item) => item.id !== enemy.id);

    if (s.combo > 0 && s.combo % 5 === 0) {
      const chainBonus = 240 + s.combo * 36;
      s.score += chainBonus;
      chargeSpecial(18);
      addFloater(`CHAIN BONUS +${chainBonus}`, enemy.x, enemy.y - 72, "orange");
      playSfx("chain");
      setComboPop(`CHAIN ${s.combo} / +${chainBonus}`);
      window.setTimeout(() => setComboPop(null), 420);
    } else if (s.combo >= 3) {
      setComboPop(`${s.combo} COMBO`);
      window.setTimeout(() => setComboPop(null), 260);
    }

    syncHud();
  };

  const typeKey = (key) => {
    const s = stateRef.current;
    if (!s.running || s.over) return;

    const enemy = s.enemies.find((item) => item.id === s.lockedId);
    if (!enemy) return;

    const char = key.toLowerCase();
    if (!/^[a-z0-9'-]$/.test(char)) return;

    s.totalKeys += 1;

    const nextText = `${s.typedText}${char}`;
    const matches = enemy.answerOptions.filter((option) => option.startsWith(nextText));

    if (matches.length > 0) {
      s.correctKeys += 1;
      s.noMissKeys += 1;
      s.typedText = nextText;
      chargeSpecial(0.85);
      s.score += 6 + Math.min(34, s.combo * 1.4);
      playSfx("type", { amount: s.combo });

      awardPendingNoMissBonuses("typing", enemy.x, enemy.y);
      const currentAnswer = matches.find((option) => option.length >= nextText.length) ?? matches[0];
      enemy.hpRate = 1 - nextText.length / currentAnswer.length;
      enemy.shake = 4;

      addParticles(enemy.x + random(-8, 8), enemy.y + random(-8, 8), 5, "cyan");

      if (matches.some((option) => option === nextText)) {
        breakEnemy(enemy);
        awardPendingBonusTime(enemy.x, enemy.y);
      } else {
        syncHud();
      }
    } else {
      registerMiss(3);
    }
  };

  const activateSpecial = () => {
    const s = stateRef.current;
    if (!s.running || s.over) return;
    if (s.special < 100) {
      playSfx("deny");
      showNotice("OVERDRIVE NOT READY", "bad");
      return;
    }

    const targets = [...s.enemies];
    const hazards = [...s.asteroids];
    if (!targets.length && !hazards.length) {
      playSfx("deny");
      showNotice("NO TARGETS", "bad");
      return;
    }

    const targetScore = targets.reduce((sum, enemy) => {
      const bestAnswerLength = Math.min(...enemy.answerOptions.map((option) => option.length));
      return sum + 220 + bestAnswerLength * 16;
    }, 0);
    const hazardScore = hazards.length * 110;
    const bonus = targetScore + hazardScore + Math.max(0, s.combo) * 70;

    [...targets, ...hazards].forEach((item) => {
      addParticles(item.x, item.y, 48, item.answerOptions ? "orange" : "red");
      addFloater("OVERDRIVE", item.x, item.y - 18, "orange");
    });

    s.score += bonus;
    s.combo += targets.length;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    s.breaks += targets.length;
    s.noMissBreaks += targets.length;
    if (targets.length) {
      awardPendingNoMissBonuses("break", s.pointer.x, s.pointer.y - 72);
    }
    s.enemies = [];
    s.asteroids = [];
    s.lockedId = null;
    s.typedText = "";
    s.special = 0;
    s.overdriveAnnounced = false;
    s.shake = 22;

    playSfx("overdrive");
    setComboPop(`OVERDRIVE +${bonus}`);
    window.setTimeout(() => setComboPop(null), 560);
    showNotice("OVERDRIVE CLEAR", "good");
    syncHud();
  };

  const startTraining = (nextMode = "normal", nextLanguage = language) => {
    blurActiveControl();
    getAudioEngine();
    playSfx("start");
    setMode(nextMode);
    setLanguage(nextLanguage);
    stateRef.current = makeGameState(nextMode, nextLanguage);
    resizeCanvas();

    const s = stateRef.current;
    s.running = true;
    s.over = false;
    s.startAt = performance.now();
    s.lastFrame = performance.now();
    s.lastEnemy = performance.now();
    s.lastAsteroid = performance.now();

    spawnEnemy();

    setPhase("game");
    setResult(null);
    setTarget(null);
    showNotice("TRAINING START", "good");
    syncHud();
  };

  const drawShip = (ctx, x, y, rotation, player = false, visualScale = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const scale = (player ? 1 : 0.86) * visualScale;
    ctx.scale(scale, scale);

    ctx.strokeStyle = player ? "rgba(233,251,255,.96)" : "rgba(255,59,92,.96)";
    ctx.lineWidth = 2;
    ctx.shadowColor = player ? "rgba(0,242,254,.85)" : "rgba(255,59,92,.55)";
    ctx.shadowBlur = player ? 16 : 11;

    if (player) {
      ctx.fillStyle = "rgba(0,242,254,.38)";
      ctx.beginPath();
      ctx.moveTo(-9, 16);
      ctx.lineTo(0, 34 + random(0, 9));
      ctx.lineTo(9, 16);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(17, 16);
    ctx.lineTo(5, 9);
    ctx.lineTo(-5, 9);
    ctx.lineTo(-17, 16);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = player ? "rgba(0,242,254,.98)" : "rgba(255,138,42,.98)";
    ctx.beginPath();
    ctx.moveTo(-9, 4);
    ctx.lineTo(-14, 12);
    ctx.moveTo(9, 4);
    ctx.lineTo(14, 12);
    ctx.stroke();

    ctx.restore();
  };

  const drawEnemy = (ctx, enemy, now) => {
    const s = stateRef.current;
    const locked = s.lockedId === enemy.id;
    const rush = enemy.bonusTarget;
    const hovered = distance(s.pointer.x, s.pointer.y, enemy.x, enemy.y) < enemy.radius + 38;
    const pulse = Math.sin(now * 0.006 + enemy.phase) * 0.5 + 0.5;
    const x = enemy.x + (enemy.shake ? random(-enemy.shake, enemy.shake) : 0);
    const y = enemy.y + (enemy.shake ? random(-enemy.shake, enemy.shake) : 0);
    const glow = rush
      ? "rgba(255,209,102,.7)"
      : locked
        ? "rgba(255,79,193,.62)"
        : hovered
          ? "rgba(100,224,255,.5)"
          : "rgba(255,79,193,.28)";

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.scale, enemy.scale);
    ctx.globalAlpha = 0.42 + pulse * 0.22;
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.shadowColor = rush ? "rgba(255,209,102,.9)" : locked ? "rgba(255,79,193,.95)" : "rgba(100,224,255,.65)";
    ctx.shadowBlur = rush ? 26 : locked ? 28 : 18;
    ctx.beginPath();
    ctx.ellipse(0, 0, enemy.baseRadius + 34, enemy.baseRadius + 18, now * 0.001 + enemy.phase, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, enemy.baseRadius + 10 + pulse * 8, 0, Math.PI * 2);
    ctx.strokeStyle = locked ? "rgba(255,177,59,.7)" : "rgba(100,224,255,.38)";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.scale, enemy.scale);

    const coreGradient = ctx.createRadialGradient(0, 0, 1, 0, 0, enemy.baseRadius + 26);
    coreGradient.addColorStop(0, locked || rush ? "rgba(255,255,255,.95)" : "rgba(255,140,255,.92)");
    coreGradient.addColorStop(0.22, rush ? "rgba(255,209,102,.92)" : locked ? "rgba(255,177,59,.92)" : "rgba(255,79,193,.78)");
    coreGradient.addColorStop(0.58, "rgba(100,224,255,.26)");
    coreGradient.addColorStop(1, "rgba(100,224,255,0)");

    ctx.fillStyle = coreGradient;
    ctx.shadowColor = rush ? "rgba(255,209,102,.95)" : locked ? "rgba(255,177,59,.95)" : "rgba(255,79,193,.75)";
    ctx.shadowBlur = rush ? 30 : locked ? 30 : 22;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.baseRadius + 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = rush ? "rgba(255,240,168,.98)" : locked ? "rgba(255,138,42,.98)" : hovered ? "rgba(100,224,255,.98)" : "rgba(100,224,255,.6)";
    ctx.lineWidth = locked ? 2.6 : 1.45;

    const size = enemy.baseRadius + 16 + pulse * 3;
    const corner = 10;
    [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(sx * size, sy * (size - corner));
      ctx.lineTo(sx * size, sy * size);
      ctx.lineTo(sx * (size - corner), sy * size);
      ctx.stroke();
    });

    ctx.save();
    ctx.rotate(now * 0.0018 + enemy.phase);
    ctx.strokeStyle = rush ? "rgba(255,240,168,.86)" : locked ? "rgba(255,177,59,.82)" : "rgba(255,79,193,.58)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.baseRadius + 24, Math.PI * 0.08, Math.PI * 0.82);
    ctx.arc(0, 0, enemy.baseRadius + 24, Math.PI * 1.08, Math.PI * 1.82);
    ctx.stroke();

    ctx.strokeStyle = "rgba(100,224,255,.55)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, enemy.baseRadius + 32, enemy.baseRadius + 12, Math.PI * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(-now * 0.0024 + enemy.phase);
    [
      [0, -1],
      [0.86, 0.5],
      [-0.86, 0.5],
    ].forEach(([dx, dy]) => {
      const px = dx * (enemy.baseRadius + 18);
      const py = dy * (enemy.baseRadius + 18);
      ctx.fillStyle = rush ? "rgba(255,240,168,.95)" : locked ? "rgba(255,177,59,.95)" : "rgba(100,224,255,.88)";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fillRect(px - 5, py - 5, 10, 10);
    });
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(3, 8, 18, .78)";
    ctx.strokeStyle = "rgba(236,251,255,.42)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.baseRadius * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (locked) {
      const activeAnswer = enemy.answerOptions.find((option) => option.startsWith(s.typedText)) ?? enemy.answerOptions[0];
      const lockProgress = activeAnswer ? s.typedText.length / activeAnswer.length : 0;

      ctx.beginPath();
      ctx.arc(0, 0, enemy.baseRadius + 27, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lockProgress);
      ctx.strokeStyle = "rgba(101,240,200,.96)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo((s.pointer.x - x) / enemy.scale, (s.pointer.y - y) / enemy.scale);
      ctx.strokeStyle = "rgba(255,138,42,.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();

    const labelText = rush ? "CLICK" : enemy.prompt;
    const labelSize = locked || rush ? 18 : clamp(13 + enemy.depth * 5, 13, 18);
    const labelY = y + Math.max(38, enemy.radius + 24);
    const labelFont =
      enemy.language === "japanese"
        ? `900 ${labelSize}px Inter, ui-sans-serif, system-ui, sans-serif`
        : `900 ${labelSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;

    ctx.save();
    ctx.font = labelFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const plateWidth = Math.min(s.width - 28, Math.max(72, ctx.measureText(labelText).width + 28));
    const plateHeight = labelSize + 15;
    const labelX = clamp(x, plateWidth / 2 + 14, s.width - plateWidth / 2 - 14);
    ctx.globalAlpha = locked || rush ? 0.98 : 0.82;
    ctx.fillStyle = rush ? "rgba(24, 14, 4, .9)" : locked ? "rgba(12, 10, 18, .9)" : "rgba(3, 8, 18, .74)";
    ctx.strokeStyle = rush ? "rgba(255,240,168,.82)" : locked ? "rgba(255,177,59,.78)" : "rgba(100,224,255,.34)";
    ctx.lineWidth = 1;
    ctx.shadowColor = rush ? "rgba(255,209,102,.52)" : locked ? "rgba(255,177,59,.42)" : "rgba(100,224,255,.2)";
    ctx.shadowBlur = locked || rush ? 18 : 10;
    ctx.fillRect(labelX - plateWidth / 2, labelY - plateHeight / 2, plateWidth, plateHeight);
    ctx.strokeRect(labelX - plateWidth / 2, labelY - plateHeight / 2, plateWidth, plateHeight);
    ctx.shadowBlur = 0;
    ctx.fillStyle = rush ? "rgba(255,240,168,.98)" : locked ? "rgba(255,209,102,.98)" : "rgba(233,251,255,.9)";
    ctx.fillText(labelText, labelX, labelY + 0.5);
    ctx.restore();
  };

  const drawAsteroid = (ctx, asteroid) => {
    ctx.save();
    ctx.globalAlpha = 0.82;
    if (asteroid.trail.length > 1) {
      ctx.beginPath();
      asteroid.trail.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = "rgba(255, 177, 59, .26)";
      ctx.lineWidth = Math.max(2, asteroid.radius * 0.08);
      ctx.stroke();
    }

    asteroid.trail.forEach((point, index) => {
      const alpha = (index + 1) / asteroid.trail.length;
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(2, asteroid.radius * 0.26 * alpha), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 177, 59, ${0.16 * alpha})`;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    ctx.scale(asteroid.scale, asteroid.scale);

    ctx.beginPath();
    asteroid.points.forEach((point, index) => {
      const x = Math.cos(point.angle) * asteroid.baseRadius * point.radiusRate;
      const y = Math.sin(point.angle) * asteroid.baseRadius * point.radiusRate;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fillStyle = "rgba(70,60,58,.72)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,177,59,.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, asteroid.baseRadius * 0.68, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,65,109,.48)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, asteroid.baseRadius + 12, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,209,102,.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  };

  const drawArenaGrid = (ctx, now) => {
    const s = stateRef.current;
    const horizon = s.height * 0.34;
    const floor = getPlayfieldBottom(s.height) + 18;
    const centerX = s.width / 2;
    const pulse = Math.sin(now * 0.0015) * 0.5 + 0.5;

    ctx.save();
    const tunnelGradient = ctx.createRadialGradient(centerX, horizon + 48, 20, centerX, horizon + 48, s.width * 0.42);
    tunnelGradient.addColorStop(0, "rgba(255,79,193,.2)");
    tunnelGradient.addColorStop(0.42, "rgba(100,224,255,.08)");
    tunnelGradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = tunnelGradient;
    ctx.fillRect(0, 0, s.width, s.height);

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "rgba(100,224,255,.2)";
    ctx.lineWidth = 1;

    for (let i = -10; i <= 10; i += 1) {
      const endX = centerX + i * s.width * 0.065;
      ctx.beginPath();
      ctx.moveTo(centerX + i * 16, horizon);
      ctx.lineTo(endX, floor);
      ctx.stroke();
    }

    for (let i = 0; i < 18; i += 1) {
      const t = (i + ((now * 0.00016) % 1)) / 18;
      const y = horizon + (floor - horizon) * t ** 1.85;
      const half = s.width * (0.04 + t * 0.49);
      ctx.globalAlpha = 0.1 + t * 0.34;
      ctx.beginPath();
      ctx.moveTo(centerX - half, y);
      ctx.lineTo(centerX + half, y);
      ctx.stroke();
    }

    [-0.82, -0.52, -0.24, 0.24, 0.52, 0.82].forEach((lane, index) => {
      const start = projectDepth(lane, 0.02);
      const end = projectDepth(lane, 1);
      ctx.globalAlpha = 0.16 + (index % 2) * 0.08;
      ctx.strokeStyle = index % 2 ? "rgba(255,79,193,.34)" : "rgba(100,224,255,.34)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    for (let i = 0; i < 14; i += 1) {
      const side = i % 2 ? 1 : -1;
      const t = ((now * 0.00023 + i * 0.13) % 1);
      const y = horizon + (floor - horizon) * t;
      const x = centerX + side * (s.width * (0.24 + t * 0.28));
      ctx.globalAlpha = 0.14 + t * 0.38;
      ctx.strokeStyle = i % 3 ? "rgba(100,224,255,.58)" : "rgba(255,79,193,.5)";
      ctx.lineWidth = 2 + t * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - side * (60 + t * 160), y + 18 + t * 36);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.32 + pulse * 0.12;
    ctx.strokeStyle = "rgba(255,79,193,.34)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, horizon + 56, s.width * 0.15, 38, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(100,224,255,.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(centerX, horizon + 84, s.width * 0.24, 62, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  const drawCrosshair = (ctx) => {
    const s = stateRef.current;
    const { x, y } = s.pointer;
    const pulse = Math.sin(performance.now() * 0.006) * 0.5 + 0.5;

    ctx.save();
    ctx.strokeStyle = "rgba(233,251,255,.36)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,138,42,.75)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 28 + pulse * 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,79,193,.34)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 42 + pulse * 14, -Math.PI * 0.25, Math.PI * 1.1);
    ctx.strokeStyle = "rgba(100,224,255,.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  const drawMilestoneSurges = (ctx, dt) => {
    const s = stateRef.current;

    s.surges.forEach((surge) => {
      surge.life -= dt;
      const progress = 1 - Math.max(0, surge.life / surge.maxLife);
      const alpha = Math.max(0, surge.life / surge.maxLife);
      const mainColor = surge.type === "typing" ? "rgba(100,224,255," : "rgba(255,79,193,";
      const accentColor = surge.type === "typing" ? "rgba(106,255,189," : "rgba(255,209,102,";

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(surge.x, surge.y);
      ctx.rotate(surge.spin + progress * (surge.major ? 1.8 : 1.1));

      for (let i = 0; i < (surge.major ? 4 : 3); i += 1) {
        const radius = (surge.major ? 78 : 54) + progress * (surge.major ? 360 : 230) + i * 32;
        ctx.globalAlpha = alpha * (0.48 - i * 0.09);
        ctx.strokeStyle = `${i % 2 ? accentColor : mainColor}${0.86 - i * 0.14})`;
        ctx.lineWidth = surge.major ? 4 - i * 0.4 : 2.7 - i * 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI * (0.08 + i * 0.12), Math.PI * (1.86 - i * 0.07));
        ctx.stroke();
      }

      const bladeCount = surge.major ? 12 : 8;
      for (let i = 0; i < bladeCount; i += 1) {
        const angle = (Math.PI * 2 * i) / bladeCount;
        const inner = 30 + progress * 50;
        const outer = (surge.major ? 250 : 155) + progress * 170;
        ctx.globalAlpha = alpha * (surge.major ? 0.32 : 0.22);
        ctx.strokeStyle = `${i % 2 ? accentColor : mainColor}${0.74})`;
        ctx.lineWidth = i % 3 === 0 ? 2.4 : 1.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }

      ctx.restore();

      if (surge.major) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha * 0.18;
        ctx.strokeStyle = `${accentColor}0.9)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(s.width / 2, s.height * 0.5, s.width * (0.2 + progress * 0.34), 48 + progress * 120, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });

    s.surges = s.surges.filter((surge) => surge.life > 0);
  };

  const drawLaserShots = (ctx, dt) => {
    const s = stateRef.current;
    s.shots.forEach((shot) => {
      shot.life -= dt;
      const shotColor =
        shot.color === "cyan"
          ? "rgba(100,224,255,.95)"
          : shot.color === "magenta"
            ? "rgba(255,79,193,.95)"
            : "rgba(255,138,42,.95)";
      const glowColor =
        shot.color === "cyan"
          ? "rgba(100,224,255,.9)"
          : shot.color === "magenta"
            ? "rgba(255,79,193,.9)"
            : "rgba(255,138,42,.9)";
      ctx.save();
      ctx.globalAlpha = Math.max(0, shot.life / shot.maxLife);
      ctx.strokeStyle = shotColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(shot.x, shot.y);
      ctx.lineTo(shot.tx, shot.ty);
      ctx.stroke();
      ctx.restore();
    });
    s.shots = s.shots.filter((shot) => shot.life > 0);
  };

  const drawParticles = (ctx, dt) => {
    const s = stateRef.current;

    s.particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 80 * dt;
      particle.life -= dt;

      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle =
        particle.color === "orange"
          ? "rgba(255,138,42,.96)"
          : particle.color === "red"
            ? "rgba(255,59,92,.96)"
            : particle.color === "magenta"
              ? "rgba(255,63,183,.96)"
              : "rgba(0,242,254,.96)";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    s.particles = s.particles.filter((particle) => particle.life > 0);
  };

  const drawFloaters = (ctx, dt) => {
    const s = stateRef.current;

    s.floaters.forEach((floater) => {
      floater.y -= 38 * dt;
      floater.life -= dt;

      ctx.save();
      ctx.globalAlpha = Math.max(0, floater.life / floater.maxLife);
      ctx.fillStyle =
        floater.color === "orange"
          ? "rgba(255,138,42,.96)"
          : floater.color === "magenta"
            ? "rgba(255,63,183,.96)"
            : "rgba(0,242,254,.96)";
      ctx.font = "900 18px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(floater.text, floater.x, floater.y);
      ctx.restore();
    });

    s.floaters = s.floaters.filter((floater) => floater.life > 0);
  };

  const updateWorld = (now, dt) => {
    const s = stateRef.current;
    const cfg = MODE_CONFIG[s.mode];

    const pacing = getEnemyPacing(s.breaks);
    const enemyInterval = Math.max(
      cfg.enemyMinInterval * 0.82,
      (cfg.enemyBaseInterval - s.breaks * 10) * pacing.spawnIntervalMultiplier,
    );

    if (!s.running || s.over) return;

    const bonusActive = isBonusTimeActive(now);

    if (bonusActive && now - s.lastBonusEnemy > BONUS_TIME_CONFIG.spawnInterval) {
      spawnEnemy({ bonus: true });
      s.lastBonusEnemy = now;
    } else if (!bonusActive && now - s.lastEnemy > enemyInterval) {
      spawnEnemy();
      s.lastEnemy = now;
    }

    if (!bonusActive && cfg.asteroid && now - s.lastAsteroid > Math.max(980, 2400 - s.breaks * 8)) {
      spawnAsteroid();
      s.lastAsteroid = now;
    }

    s.enemies.forEach((enemy) => {
      enemy.depth += enemy.depthSpeed * dt * 2.25;
      enemy.lane += enemy.vx * dt + Math.sin(now * 0.0018 * enemy.drift + enemy.phase) * 0.015 * dt;
      enemy.lane = clamp(enemy.lane, -0.95, 0.95);

      const projected = projectDepth(enemy.lane, enemy.depth, Math.sin(now * 0.004 + enemy.phase) * 5);
      enemy.x = projected.x;
      enemy.y = projected.y;
      enemy.scale = projected.scale;
      enemy.radius = enemy.baseRadius * projected.scale;

      if (enemy.shake) enemy.shake = Math.max(0, enemy.shake - 42 * dt);

      if (enemy.depth > 1.04) {
        if (s.lockedId === enemy.id) {
          s.lockedId = null;
          s.typedText = "";
        }
        enemy.dead = true;
        if (bonusActive || enemy.bonusTarget) {
          registerBonusMiss("ESCAPED");
        } else {
          registerMiss(8);
        }
      }
    });

    s.enemies = s.enemies.filter((enemy) => !enemy.dead);

    s.asteroids.forEach((asteroid) => {
      asteroid.depth += asteroid.depthSpeed * dt * 2.65;
      asteroid.lane += asteroid.vx * dt + Math.sin(now * 0.0012 + asteroid.phase) * asteroid.wobble * dt;
      asteroid.lane = clamp(asteroid.lane, -1.16, 1.16);
      const projected = projectDepth(asteroid.lane, asteroid.depth);
      asteroid.x = projected.x;
      asteroid.y = projected.y;
      asteroid.scale = projected.scale;
      asteroid.radius = asteroid.baseRadius * projected.scale;
      asteroid.hitRadius = asteroid.radius * 0.68;
      asteroid.rotation += asteroid.rotationVelocity * dt;
      asteroid.trail.push({ x: asteroid.x, y: asteroid.y });
      if (asteroid.trail.length > 9) asteroid.trail.shift();

      if (asteroid.depth > 0.46 && distance(asteroid.x, asteroid.y, s.pointer.x, s.pointer.y) < asteroid.hitRadius + 8) {
        asteroid.dead = true;
        addParticles(s.pointer.x, s.pointer.y, 22, "red");
        registerMiss(16);
      }

      if (asteroid.depth > 1.08 || asteroid.x < -180 || asteroid.x > s.width + 180) {
        asteroid.dead = true;
      }
    });

    s.asteroids = s.asteroids.filter((asteroid) => !asteroid.dead);
  };

  const renderFrame = (now) => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dt = Math.min(0.033, (now - s.lastFrame) / 1000);
    s.lastFrame = now;

    ctx.save();

    if (s.shake > 0) {
      ctx.translate(random(-s.shake, s.shake), random(-s.shake, s.shake));
      s.shake *= 0.88;
    }

    ctx.clearRect(-50, -50, s.width + 100, s.height + 100);

    s.stars.forEach((star) => {
      star.y += star.velocity * dt * (s.running ? 1.6 : 0.45);
      if (star.y > s.height) {
        star.y = -6;
        star.x = random(0, s.width);
      }

      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = "#fff";
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;

    drawArenaGrid(ctx, now);
    updateWorld(now, dt);

    [...s.asteroids].sort((a, b) => a.depth - b.depth).forEach((asteroid) => drawAsteroid(ctx, asteroid));
    [...s.enemies].sort((a, b) => a.depth - b.depth).forEach((enemy) => drawEnemy(ctx, enemy, now));

    drawMilestoneSurges(ctx, dt);
    drawLaserShots(ctx, dt);
    drawParticles(ctx, dt);
    drawFloaters(ctx, dt);
    drawShip(ctx, s.pointer.x, s.pointer.y, (s.pointer.x - s.width / 2) * 0.0008, true);
    drawCrosshair(ctx);

    ctx.restore();

    if (s.running && !s.over && now - s.lastHudSync > 120) {
      s.lastHudSync = now;
      setStats(computeStats());
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  };

  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(renderFrame);

    const handleResize = () => resizeCanvas();
    const handleMouseMove = (event) => {
      const s = stateRef.current;
      s.pointer.x = event.clientX;
      s.pointer.y = clamp(event.clientY, 0, getPlayfieldBottom(s.height) - 8);
    };
    const handleMouseDown = (event) => {
      const s = stateRef.current;
      if (isEditableTarget(event.target)) return;
      if (!s.running || s.over) return;
      if (event.clientY > getPlayfieldBottom(s.height)) return;

      const enemy = hitTestEnemy(event.clientX, event.clientY);
      if (enemy) lockEnemy(enemy);
      else if (isBonusTimeActive()) registerBonusMiss("EMPTY");
      else {
        playSfx("deny");
        showNotice("NO TARGET", "bad");
      }
    };
    const handleKeyDown = (event) => {
      if (isEditableTarget(event.target)) return;

      const plainKey = !event.ctrlKey && !event.metaKey && !event.altKey;

      if (event.key === "F2") {
        event.preventDefault();
        startTraining(stateRef.current.mode, stateRef.current.language);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        unlock();
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        activateSpecial();
        return;
      }

      if (plainKey && event.key.length === 1) {
        event.preventDefault();
        typeKey(event.key);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeAnswer = target?.answer ?? "";
  const typed = target?.typedText ?? "";
  const next = activeAnswer.slice(typed.length, typed.length + 1);
  const rest = activeAnswer.slice(typed.length + 1);
  const progress = activeAnswer ? Math.round((typed.length / activeAnswer.length) * 100) : 0;
  const bonusTimeActive = stats.bonusTimeActive;
  const dockProgress = bonusTimeActive
    ? Math.max(0, Math.min(100, Math.round(((stats.bonusTimeMaxMisses - stats.bonusTimeMisses) / stats.bonusTimeMaxMisses) * 100)))
    : progress;

  return (
    <main className="gameShell">
      <canvas ref={canvasRef} className="gameCanvas" />
      <div className="cockpitFrame" aria-hidden="true">
        <span className="corner topLeft" />
        <span className="corner topRight" />
        <span className="corner bottomLeft" />
        <span className="corner bottomRight" />
        <span className="scanLine" />
      </div>
      <div className="waveBanner">
        <span>
          {bonusTimeActive
            ? `BONUS TIME / MISS ${stats.bonusTimeMisses}/${stats.bonusTimeMaxMisses}`
            : phase === "game"
              ? `ACTIVE LIMIT ${getActiveEnemyLimit()} / RUSH @ ${stats.nextBonusTimeKey}`
              : "SIMULATION READY"}
        </span>
      </div>

      <header className="hud">
        <section className="logoPanel">
          <div className="logoMain">LOCK TYPE SHOOTER</div>
          <div className="logoSub">
            {LANGUAGE_CONFIG[language].shortLabel} / DESKTOP SHOOTING TRAINER
          </div>
        </section>

        <section className="stats">
          <HudValue label="SCORE" value={String(stats.score).padStart(6, "0")} />
          <HudValue label="COMBO" value={stats.combo} tone="orange" />
          <HudValue label="ACC" value={`${stats.accuracy}%`} />
          <HudValue label="WPM" value={stats.wpm} />
          <HudValue label="LOCK" value={stats.averageLock.toFixed(2)} />
          <HudValue label="NM BREAK" value={`${stats.noMissBreaks}/${stats.nextNoMissBreakBonus}`} tone="bonus" />
          <HudValue label="NM TYPE" value={`${stats.noMissKeys}/${stats.nextNoMissKeyBonus}`} tone="bonus" />
          <HudValue
            label="RUSH"
            value={bonusTimeActive ? `${stats.bonusTimeMisses}/${stats.bonusTimeMaxMisses}` : `@${stats.nextBonusTimeKey}`}
            tone={bonusTimeActive ? "rush" : "bonus"}
          />
        </section>

        <section className={`shieldPanel ${stats.special >= 100 ? "overdriveReady" : ""}`}>
          <span className="hudLabel">SHIELD</span>
          <div className="shieldBar">
            <div
              className={`shieldFill ${stats.hp < 30 ? "critical" : ""}`}
              style={{ width: `${stats.hp}%` }}
            />
          </div>
          <span className="hudLabel specialLabel">OVERDRIVE</span>
          <span className="overdriveValue">{stats.special >= 100 ? "READY / SPACE" : `${stats.special}%`}</span>
          <div className="specialBar">
            <div
              className={`specialFill ${stats.special >= 100 ? "ready" : ""}`}
              style={{ width: `${stats.special}%` }}
            />
          </div>
        </section>
      </header>

      <button className={`soundToggle ${soundEnabled ? "on" : "off"}`} type="button" onClick={toggleSound}>
        SFX {soundEnabled ? "ON" : "OFF"}
      </button>

      <section className={`targetPanel ${target ? "locked" : "idle"} ${bonusTimeActive ? "bonusMode" : ""}`}>
        <div className="targetTop">
          <span className="lockBadge">{bonusTimeActive ? "BONUS TIME" : target ? "LOCKED" : "NO LOCK"}</span>
          <span className="targetName">
            {bonusTimeActive
              ? `CLICK TARGETS TO BREAK / MISS ${stats.bonusTimeMisses}/${stats.bonusTimeMaxMisses}`
              : target
                ? `${target.name} / ${activeAnswer.length} KEYS / ${target.language.toUpperCase()}`
                : "CLICK A TARGET TO START TYPING"}
          </span>
        </div>

        {target?.language === "japanese" && (
          <div className="jpPrompt">
            <strong>{target.prompt}</strong>
            <span>{target.reading}</span>
          </div>
        )}

        <div className="wordDisplay">
          {bonusTimeActive ? (
            <span className="bonusTimeText">CLICK BREAK RUSH</span>
          ) : target ? (
            <>
              {target.language === "english" && <span className="promptGhost">{target.prompt}</span>}
              <span className="typed">{typed.toUpperCase()}</span>
              <span className="next">{next.toUpperCase() || " "}</span>
              <span className="rest">{rest.toUpperCase()}</span>
            </>
          ) : (
            <span className="idleText">STANDBY</span>
          )}
        </div>

        <div className="progressRow">
          <div className="progressBar">
            <div className="progressFill" style={{ width: `${dockProgress}%` }} />
          </div>
          <span>
            {bonusTimeActive
              ? `MISS ${stats.bonusTimeMisses}/${stats.bonusTimeMaxMisses}`
              : `${progress}%`}
          </span>
        </div>
      </section>

      {phase === "title" && (
        <Overlay>
          <div className="kicker">MOUSE / TRACKBALL × KEYBOARD</div>
          <h1 className="title">
            LOCK
            <br />
            TYPE
            <br />
            SHOOTER
          </h1>
          <p className="description">
            上から接近するターゲットをマウスやトラックボールで捕捉し、クリックでロック。
            <br />
            英語と日本語ローマ字入力を切り替え、隕石を避けながら精度と連続撃破でランクを伸ばす。
          </p>
          <div className="languageSwitch" aria-label="Typing language">
            {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
              <button
                className={language === key ? "active" : ""}
                key={key}
                onClick={() => setLanguage(key)}
              >
                {config.label}
              </button>
            ))}
          </div>
          <div className="buttonRow">
            <button onClick={() => startTraining("normal", language)}>START TRAINING</button>
            <button className="orangeButton" onClick={() => startTraining("practice", language)}>
              PRACTICE MODE
            </button>
          </div>
          <div className="keyHints">
            <span>Mouse: aim</span>
            <span>Click: lock</span>
            <span>Keyboard: type</span>
            <span>ESC: unlock</span>
            <span>Space: overdrive</span>
            <span>F2: restart</span>
          </div>
        </Overlay>
      )}

      {phase === "result" && result && (
        <Overlay>
          <div className="kicker">TRAINING RESULT</div>
          <h1 className="title small">{result.title}</h1>
          <p className="description">{result.message}</p>

          <div className="rankPlate">
            <span>RANK</span>
            <strong>{result.rank.name}</strong>
            <em>{result.rank.label}</em>
          </div>

          <div className="resultGrid">
            <Metric label="SCORE" value={result.stats.score.toLocaleString()} />
            <Metric label="RANK" value={result.rank.name} />
            <Metric label="MAX COMBO" value={result.stats.maxCombo} />
            <Metric label="ACCURACY" value={`${result.stats.accuracy}%`} />
            <Metric label="WPM" value={result.stats.wpm} />
            <Metric label="AVG LOCK" value={`${result.stats.averageLock.toFixed(2)}s`} />
            <Metric label="NO MISS BREAK" value={result.stats.noMissBreaks} />
            <Metric label="NO MISS TYPE" value={result.stats.noMissKeys} />
            <Metric label="BREAKS" value={result.stats.breaks} />
          </div>

          <div className="buttonRow">
            <button onClick={() => startTraining(stateRef.current.mode, stateRef.current.language)}>RETRY</button>
            <a className="shareButton" href={getShareUrl(result)} target="_blank" rel="noreferrer">
              POST TO X
            </a>
          </div>
        </Overlay>
      )}

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}
      {bonusTimeActive && (
        <div className="bonusTimeCallout">
          BONUS TIME / MISS {stats.bonusTimeMisses}/{stats.bonusTimeMaxMisses}
        </div>
      )}
      {stats.special >= 100 && phase === "game" && <div className="overdriveCallout">OVERDRIVE READY / SPACE</div>}
      {bonusBanner && (
        <div className={`bonusBanner ${bonusBanner.type} ${bonusBanner.major ? "major" : ""}`}>
          <span>{bonusBanner.title}</span>
          <strong>+{bonusBanner.amount.toLocaleString()}</strong>
          <em>{bonusBanner.detail}</em>
        </div>
      )}
      {damageFlash && <div className="damageFlash" />}
      {comboPop && <div className="comboPop">{comboPop}</div>}
      <div className="modeTag">
        {currentModeConfig.label} / {LANGUAGE_CONFIG[language].label}
      </div>
    </main>
  );
}

function HudValue({ label, value, tone = "" }) {
  return (
    <div className={`hudItem ${tone}`}>
      <span className="hudLabel">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Overlay({ children }) {
  return (
    <section className="overlay">
      <div className="menuCard">{children}</div>
    </section>
  );
}

export default App;
