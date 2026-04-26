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

const MODE_CONFIG = {
  normal: {
    label: "NORMAL MODE",
    startEnemies: 1,
    maxEnemies: 4,
    maxAsteroids: 6,
    asteroid: true,
    enemyBaseInterval: 1420,
    enemyMinInterval: 560,
  },
  practice: {
    label: "PRACTICE MODE",
    startEnemies: 1,
    maxEnemies: 3,
    maxAsteroids: 2,
    asteroid: true,
    enemyBaseInterval: 1650,
    enemyMinInterval: 720,
  },
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

function createWordEntry(language, breaks = 0) {
  if (language === "japanese") {
    const item = JAPANESE_WORDS[Math.floor(Math.random() * JAPANESE_WORDS.length)];
    return {
      prompt: item.prompt,
      reading: item.reading,
      answerOptions: buildRomajiOptions(item.reading),
      language,
    };
  }

  const base = ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)];
  const prompt =
    breaks > 14 && Math.random() < 0.32
      ? `${base}${ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)].slice(0, 3)}`
      : base;

  return {
    prompt,
    reading: prompt,
    answerOptions: [prompt.toLowerCase()],
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
  const pageUrl = window.location.origin + window.location.pathname;
  const text = [
    "LOCK TYPE SHOOTER result",
    `SCORE ${stats.score.toLocaleString()} / RANK ${rank.name} (${rank.label})`,
    `MAX COMBO ${stats.maxCombo} / ACC ${stats.accuracy}% / WPM ${stats.wpm}`,
    "#LockTypeShooter",
  ].join("\n");

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
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
    dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
    stars: [],
    enemies: [],
    asteroids: [],
    particles: [],
    floaters: [],
    shots: [],
    lockedId: null,
    typedText: "",
    pointer: { x: window.innerWidth / 2, y: window.innerHeight * 0.72 },
    score: 0,
    hp: 100,
    special: 0,
    combo: 0,
    maxCombo: 0,
    breaks: 0,
    locks: 0,
    totalKeys: 0,
    correctKeys: 0,
    startAt: 0,
    lastFrame: performance.now(),
    lastEnemy: 0,
    lastAsteroid: 0,
    nextId: 1,
    shake: 0,
    lockTimes: [],
  };
}

function App() {
  const canvasRef = useRef(null);
  const stateRef = useRef(makeGameState("normal"));
  const animationRef = useRef(null);

  const [phase, setPhase] = useState("title");
  const [mode, setMode] = useState("normal");
  const [language, setLanguage] = useState("english");
  const [stats, setStats] = useState(initialStats);
  const [target, setTarget] = useState(null);
  const [notice, setNotice] = useState(null);
  const [comboPop, setComboPop] = useState(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [result, setResult] = useState(null);

  const currentModeConfig = useMemo(() => MODE_CONFIG[mode], [mode]);

  const showNotice = (text, type = "info") => {
    setNotice({ text, type, id: Math.random() });
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(null), 760);
  };

  const triggerDamage = () => {
    setDamageFlash(true);
    window.setTimeout(() => setDamageFlash(false), 80);
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
    s.stars = Array.from({ length: 170 }, () => ({
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
    s.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

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
    const horizon = s.height * 0.34;
    const floor = s.height * 0.84;
    const eased = depth ** 1.58;
    const scale = 0.38 + depth * 1.12;
    const spread = s.width * (0.2 + depth * 0.32);

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
    return Math.min(cfg.maxEnemies, cfg.startEnemies + Math.floor(s.breaks / 4));
  };

  const spawnEnemy = () => {
    const s = stateRef.current;
    if (s.enemies.length >= getActiveEnemyLimit()) return;

    const word = createWordEntry(s.language, s.breaks);
    const placement = findSpawnPlacement(false, 0.02, 0.14);
    if (!placement) return;
    const { lane, depth, projected } = placement;
    const speed = random(0.065, 0.105) + Math.min(0.045, s.breaks * 0.0018);
    const inputLength = Math.min(...word.answerOptions.map((option) => option.length));

    s.enemies.push({
      id: s.nextId++,
      ...word,
      lane,
      depth,
      depthSpeed: speed,
      x: projected.x,
      y: projected.y,
      vx: random(-0.075, 0.075),
      vy: speed,
      scale: projected.scale,
      baseRadius: 25 + Math.min(18, inputLength * 0.9),
      radius: (25 + Math.min(18, inputLength * 0.9)) * projected.scale,
      hpRate: 1,
      born: performance.now(),
      phase: random(0, Math.PI * 2),
      drift: random(0.7, 1.6),
      shake: 0,
      dead: false,
    });
  };

  const spawnAsteroid = () => {
    const s = stateRef.current;
    const cfg = MODE_CONFIG[s.mode];
    if (!cfg.asteroid || s.asteroids.length >= cfg.maxAsteroids) return;

    const baseRadius = random(30, 58);
    const placement = findSpawnPlacement(true, 0.04, 0.18);
    if (!placement) return;
    const { lane, depth, projected } = placement;
    s.asteroids.push({
      lane,
      depth,
      depthSpeed: random(0.085, 0.145),
      x: projected.x,
      y: projected.y,
      vx: random(-0.12, 0.12),
      vy: 0,
      scale: projected.scale,
      baseRadius,
      radius: baseRadius * projected.scale,
      rotation: random(0, Math.PI * 2),
      rotationVelocity: random(-2, 2),
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
    for (let i = 0; i < count; i += 1) {
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

  const hitTestEnemy = (x, y) => {
    const s = stateRef.current;
    return [...s.enemies]
      .sort((a, b) => distance(s.pointer.x, s.pointer.y, a.x, a.y) - distance(s.pointer.x, s.pointer.y, b.x, b.y))
      .find((enemy) => distance(x, y, enemy.x, enemy.y) < enemy.radius + 34);
  };

  const lockEnemy = (enemy) => {
    const s = stateRef.current;
    if (!s.running || s.over) return;

    s.lockedId = enemy.id;
    s.typedText = "";
    s.locks += 1;
    s.lockTimes.push(performance.now() - enemy.born);

    addParticles(enemy.x, enemy.y, 12, "cyan");
    showNotice("LOCKED", "good");
    syncHud();
  };

  const unlock = () => {
    const s = stateRef.current;
    s.lockedId = null;
    s.typedText = "";
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
    s.hp = clamp(s.hp - damage, 0, 100);
    s.shake = 12;

    const enemy = s.enemies.find((item) => item.id === s.lockedId);
    if (enemy) enemy.shake = 8;

    triggerDamage();
    showNotice("MISS", "bad");

    if (s.hp <= 0) {
      endTraining("TRAINING FAILED", "Shield is down. Keep the cursor stable and type cleanly.");
      return;
    }

    syncHud();
  };

  const breakEnemy = (enemy) => {
    const s = stateRef.current;
    const bestAnswerLength = Math.min(...enemy.answerOptions.map((option) => option.length));
    const bonus = 110 + bestAnswerLength * 9 + Math.min(360, s.combo * 24);

    s.score += bonus;
    s.combo += 1;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    s.breaks += 1;
    s.special = clamp(s.special + 16 + Math.min(20, s.combo * 2), 0, 100);
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
    addFloater(`+${bonus}`, enemy.x, enemy.y - 44, "cyan");
    addFloater("BREAK", enemy.x, enemy.y - 20, "orange");
    s.enemies = s.enemies.filter((item) => item.id !== enemy.id);

    if (s.combo > 0 && s.combo % 5 === 0) {
      const chainBonus = 240 + s.combo * 36;
      s.score += chainBonus;
      s.special = clamp(s.special + 18, 0, 100);
      addFloater(`CHAIN BONUS +${chainBonus}`, enemy.x, enemy.y - 72, "orange");
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
      s.typedText = nextText;
      s.special = clamp(s.special + 0.85, 0, 100);
      s.score += 6 + Math.min(34, s.combo * 1.4);
      const currentAnswer = matches.find((option) => option.length >= nextText.length) ?? matches[0];
      enemy.hpRate = 1 - nextText.length / currentAnswer.length;
      enemy.shake = 4;

      addParticles(enemy.x + random(-8, 8), enemy.y + random(-8, 8), 5, "cyan");

      if (matches.some((option) => option === nextText)) {
        breakEnemy(enemy);
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
      showNotice("OVERDRIVE NOT READY", "bad");
      return;
    }

    const targets = [...s.enemies];
    const hazards = [...s.asteroids];
    if (!targets.length && !hazards.length) {
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
    s.enemies = [];
    s.asteroids = [];
    s.lockedId = null;
    s.typedText = "";
    s.special = 0;
    s.shake = 22;

    setComboPop(`OVERDRIVE +${bonus}`);
    window.setTimeout(() => setComboPop(null), 560);
    showNotice("OVERDRIVE CLEAR", "good");
    syncHud();
  };

  const startTraining = (nextMode = "normal", nextLanguage = language) => {
    blurActiveControl();
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

  const continueTraining = () => {
    blurActiveControl();
    const s = stateRef.current;
    s.over = false;
    s.running = true;
    s.hp = Math.max(s.hp, 40);
    spawnEnemy();
    s.lastEnemy = performance.now();
    s.lastAsteroid = performance.now();
    setPhase("game");
    setResult(null);
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
    const hovered = distance(s.pointer.x, s.pointer.y, enemy.x, enemy.y) < enemy.radius + 38;
    const pulse = Math.sin(now * 0.006 + enemy.phase) * 0.5 + 0.5;
    const x = enemy.x + (enemy.shake ? random(-enemy.shake, enemy.shake) : 0);
    const y = enemy.y + (enemy.shake ? random(-enemy.shake, enemy.shake) : 0);
    const glow = locked ? "rgba(255,79,193,.62)" : hovered ? "rgba(100,224,255,.5)" : "rgba(255,79,193,.28)";

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.scale, enemy.scale);
    ctx.globalAlpha = 0.42 + pulse * 0.22;
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.shadowColor = locked ? "rgba(255,79,193,.95)" : "rgba(100,224,255,.65)";
    ctx.shadowBlur = locked ? 28 : 18;
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
    coreGradient.addColorStop(0, locked ? "rgba(255,255,255,.95)" : "rgba(255,140,255,.92)");
    coreGradient.addColorStop(0.22, locked ? "rgba(255,177,59,.92)" : "rgba(255,79,193,.78)");
    coreGradient.addColorStop(0.58, "rgba(100,224,255,.26)");
    coreGradient.addColorStop(1, "rgba(100,224,255,0)");

    ctx.fillStyle = coreGradient;
    ctx.shadowColor = locked ? "rgba(255,177,59,.95)" : "rgba(255,79,193,.75)";
    ctx.shadowBlur = locked ? 30 : 22;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.baseRadius + 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = locked ? "rgba(255,138,42,.98)" : hovered ? "rgba(100,224,255,.98)" : "rgba(100,224,255,.6)";
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
    ctx.strokeStyle = locked ? "rgba(255,177,59,.82)" : "rgba(255,79,193,.58)";
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
      ctx.fillStyle = locked ? "rgba(255,177,59,.95)" : "rgba(100,224,255,.88)";
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

    ctx.fillStyle = locked ? "rgba(255,138,42,.98)" : "rgba(233,251,255,.82)";
    ctx.font =
      enemy.language === "japanese"
        ? "800 15px Inter, ui-sans-serif, system-ui, sans-serif"
        : "700 12px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(enemy.prompt, 0, enemy.baseRadius + 38);

    ctx.restore();
  };

  const drawAsteroid = (ctx, asteroid) => {
    ctx.save();
    ctx.globalAlpha = 0.76;
    asteroid.trail.forEach((point, index) => {
      const alpha = (index + 1) / asteroid.trail.length;
      ctx.beginPath();
      ctx.arc(point.x, point.y, asteroid.radius * 0.18 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 177, 59, ${0.12 * alpha})`;
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
    ctx.arc(0, 0, asteroid.baseRadius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,65,109,.26)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  };

  const drawArenaGrid = (ctx, now) => {
    const s = stateRef.current;
    const horizon = s.height * 0.34;
    const floor = s.height * 0.86;
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

  const drawLaserShots = (ctx, dt) => {
    const s = stateRef.current;
    s.shots.forEach((shot) => {
      shot.life -= dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, shot.life / shot.maxLife);
      ctx.strokeStyle = "rgba(255,138,42,.95)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(255,138,42,.9)";
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
      ctx.fillStyle = floater.color === "orange" ? "rgba(255,138,42,.96)" : "rgba(0,242,254,.96)";
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

    if (!s.running || s.over) return;

    if (now - s.lastEnemy > Math.max(cfg.enemyMinInterval, cfg.enemyBaseInterval - s.breaks * 16)) {
      spawnEnemy();
      s.lastEnemy = now;
    }

    if (cfg.asteroid && now - s.lastAsteroid > Math.max(900, 2300 - s.breaks * 10)) {
      spawnAsteroid();
      s.lastAsteroid = now;
    }

    s.enemies.forEach((enemy) => {
      enemy.depth += enemy.depthSpeed * dt * 2.8;
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
        registerMiss(8);
      }
    });

    s.enemies = s.enemies.filter((enemy) => !enemy.dead);

    s.asteroids.forEach((asteroid) => {
      asteroid.depth += asteroid.depthSpeed * dt * 2.8;
      asteroid.lane += asteroid.vx * dt;
      asteroid.lane = clamp(asteroid.lane, -1, 1);
      const projected = projectDepth(asteroid.lane, asteroid.depth);
      asteroid.x = projected.x;
      asteroid.y = projected.y;
      asteroid.scale = projected.scale;
      asteroid.radius = asteroid.baseRadius * projected.scale;
      asteroid.rotation += asteroid.rotationVelocity * dt;
      asteroid.trail.push({ x: asteroid.x, y: asteroid.y });
      if (asteroid.trail.length > 12) asteroid.trail.shift();

      if (asteroid.depth > 0.58 && distance(asteroid.x, asteroid.y, s.pointer.x, s.pointer.y) < asteroid.radius + 10) {
        asteroid.dead = true;
        addParticles(s.pointer.x, s.pointer.y, 22, "red");
        registerMiss(16);
      }

      if (asteroid.depth > 1.08 || asteroid.x < -140 || asteroid.x > s.width + 140) {
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

    drawLaserShots(ctx, dt);
    drawParticles(ctx, dt);
    drawFloaters(ctx, dt);
    drawShip(ctx, s.pointer.x, s.pointer.y, (s.pointer.x - s.width / 2) * 0.0008, true);
    drawCrosshair(ctx);

    ctx.restore();

    if (s.running && !s.over) {
      setStats(computeStats());
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  };

  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(renderFrame);

    const handleResize = () => resizeCanvas();
    const handleMouseMove = (event) => {
      stateRef.current.pointer.x = event.clientX;
      stateRef.current.pointer.y = event.clientY;
    };
    const handleMouseDown = (event) => {
      const s = stateRef.current;
      if (!s.running || s.over) return;

      const enemy = hitTestEnemy(event.clientX, event.clientY);
      if (enemy) lockEnemy(enemy);
      else showNotice("NO TARGET", "bad");
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
        <span>{phase === "game" ? `ACTIVE LIMIT ${getActiveEnemyLimit()}` : "SIMULATION READY"}</span>
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
        </section>

        <section className="shieldPanel">
          <span className="hudLabel">SHIELD</span>
          <div className="shieldBar">
            <div
              className={`shieldFill ${stats.hp < 30 ? "critical" : ""}`}
              style={{ width: `${stats.hp}%` }}
            />
          </div>
          <span className="hudLabel specialLabel">OVERDRIVE</span>
          <div className="specialBar">
            <div
              className={`specialFill ${stats.special >= 100 ? "ready" : ""}`}
              style={{ width: `${stats.special}%` }}
            />
          </div>
        </section>
      </header>

      <section className={`targetPanel ${target ? "" : "hidden"}`}>
        <div className="targetTop">
          <span className="lockBadge">LOCKED</span>
          <span className="targetName">
            {target?.name ?? "TARGET"} / {activeAnswer.length} KEYS / {target?.language?.toUpperCase() ?? "ENGLISH"}
          </span>
        </div>

        {target?.language === "japanese" && (
          <div className="jpPrompt">
            <strong>{target.prompt}</strong>
            <span>{target.reading}</span>
          </div>
        )}

        <div className="wordDisplay">
          {target?.language === "english" && <span className="promptGhost">{target.prompt}</span>}
          <span className="typed">{typed.toUpperCase()}</span>
          <span className="next">{next.toUpperCase() || " "}</span>
          <span className="rest">{rest.toUpperCase()}</span>
        </div>

        <div className="progressRow">
          <div className="progressBar">
            <div className="progressFill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
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
            <Metric label="BREAKS" value={result.stats.breaks} />
          </div>

          <div className="buttonRow">
            <button onClick={() => startTraining(stateRef.current.mode, stateRef.current.language)}>RETRY</button>
            <button className="orangeButton" onClick={continueTraining}>
              CONTINUE
            </button>
            <a className="shareButton" href={getShareUrl(result)} target="_blank" rel="noreferrer">
              POST TO X
            </a>
          </div>
        </Overlay>
      )}

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}
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
