import { useEffect, useMemo, useRef, useState } from "react";
import { GameHud } from "./components/GameHud";
import { ResultOverlay } from "./components/ResultOverlay";
import { TargetPanel } from "./components/TargetPanel";
import { TitleOverlay } from "./components/TitleOverlay";
import {
  BONUS_TIME_CONFIG,
  MODE_CONFIG,
  NO_MISS_BONUS_RULES,
  getBonusTimeReward,
  getNoMissBonus,
  getRank,
  initialStats,
} from "./game/gameConfig";
import { createAudioEngine, playSfx as playAudioSfx, startBgm, stopBgm } from "./game/audio";
import { clamp, distance, getPlayfieldBottom, random } from "./game/math";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CONFIG,
  WORD_LENGTH_CYCLE,
  createWordEntry,
  getEnemyPacing,
} from "./game/typingConfig";

function blurActiveControl() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, [contenteditable='true']"));
}

function makeGameState(mode = "normal", language = DEFAULT_LANGUAGE) {
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
  const stateRef = useRef(makeGameState("normal", DEFAULT_LANGUAGE));
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const soundEnabledRef = useRef(true);

  const [phase, setPhase] = useState("title");
  const [mode, setMode] = useState("normal");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [stats, setStats] = useState(initialStats);
  const [target, setTarget] = useState(null);
  const [notice, setNotice] = useState(null);
  const [comboPop, setComboPop] = useState(null);
  const [bonusBanner, setBonusBanner] = useState(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentModeConfig = useMemo(() => MODE_CONFIG[mode], [mode]);

  const getAudioEngine = (force = false) => {
    if (!force && !soundEnabledRef.current) return null;

    if (!audioRef.current) {
      audioRef.current = createAudioEngine();
    }

    const engine = audioRef.current;
    if (!engine) return null;
    if (engine.ctx.state === "suspended") {
      void engine.ctx.resume();
    }

    return engine;
  };

  const playSfx = (name, options = {}) => {
    const engine = getAudioEngine();
    playAudioSfx(engine, name, options);
  };

  const toggleSound = () => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);

    if (next) {
      const engine = getAudioEngine(true);
      const s = stateRef.current;
      if (s.running && !s.over) startBgm(engine);
      window.setTimeout(() => playSfx("start"), 0);
    } else if (audioRef.current) {
      stopBgm(audioRef.current);
      if (audioRef.current.ctx.state === "running") {
        void audioRef.current.ctx.suspend();
      }
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
    const pacing = getEnemyPacing(s.breaks);
    const phasePressure = Math.floor((s.breaks % WORD_LENGTH_CYCLE.cycleSize) / 8);
    return Math.min(cfg.maxEnemies, cfg.startEnemies + phasePressure + pacing.enemyLimitBonus);
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

  const addTargetShot = (enemy, options = {}) => {
    const s = stateRef.current;
    const finisher = options.finisher ?? false;
    const jitter = finisher ? 2 : 8;
    const color = options.color ?? (finisher ? "orange" : "cyan");

    s.shots.push({
      x: s.pointer.x + random(-5, 5),
      y: s.pointer.y + random(-5, 5),
      tx: enemy.x + random(-jitter, jitter),
      ty: enemy.y + random(-jitter, jitter),
      life: finisher ? 0.2 : 0.12,
      maxLife: finisher ? 0.2 : 0.12,
      color,
      width: finisher ? 4.4 : 2.2,
    });

    if (s.shots.length > 44) {
      s.shots.splice(0, s.shots.length - 44);
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
    stopBgm(audioRef.current);
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

    addTargetShot(enemy, { finisher: true, color: clickRush ? "magenta" : "orange" });

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

      if (matches.some((option) => option === nextText)) {
        breakEnemy(enemy);
        awardPendingBonusTime(enemy.x, enemy.y);
      } else {
        addTargetShot(enemy, { color: "cyan" });
        addParticles(enemy.x + random(-8, 8), enemy.y + random(-8, 8), 5, "cyan");
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
    const engine = getAudioEngine();
    startBgm(engine);
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
      ctx.lineWidth = shot.width ?? 3;
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
      stopBgm(audioRef.current);
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

      <GameHud
        language={language}
        stats={stats}
        bonusTimeActive={bonusTimeActive}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      <TargetPanel
        target={target}
        bonusTimeActive={bonusTimeActive}
        stats={stats}
        activeAnswer={activeAnswer}
        typed={typed}
        next={next}
        rest={rest}
        dockProgress={dockProgress}
        progress={progress}
      />

      {phase === "title" && (
        <TitleOverlay
          onStart={() => startTraining("normal", DEFAULT_LANGUAGE)}
        />
      )}

      {phase === "result" && result && (
        <ResultOverlay
          result={result}
          onRetry={() => startTraining(stateRef.current.mode, stateRef.current.language)}
        />
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

export default App;
