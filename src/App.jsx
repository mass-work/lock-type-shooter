import { useEffect, useMemo, useRef, useState } from "react";

const WORDS = [
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

const MODE_CONFIG = {
  normal: {
    label: "NORMAL MODE",
    maxEnemies: 5,
    maxAsteroids: 5,
    asteroid: true,
    enemyBaseInterval: 1420,
    enemyMinInterval: 560,
  },
  practice: {
    label: "PRACTICE MODE",
    maxEnemies: 3,
    maxAsteroids: 0,
    asteroid: false,
    enemyBaseInterval: 1650,
    enemyMinInterval: 720,
  },
};

const initialStats = {
  score: 0,
  hp: 100,
  combo: 0,
  maxCombo: 0,
  accuracy: 100,
  wpm: 0,
  averageLock: 0,
  breaks: 0,
  locks: 0,
};

const RANKS = [
  { name: "S+", threshold: 12000, label: "ACE VECTOR" },
  { name: "S", threshold: 9000, label: "ZERO MISSILE" },
  { name: "A", threshold: 6200, label: "CLEAN BREAKER" },
  { name: "B", threshold: 3600, label: "FIELD LOCKER" },
  { name: "C", threshold: 1600, label: "ROOKIE PILOT" },
  { name: "D", threshold: 0, label: "BOOT SEQUENCE" },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => Math.random() * (max - min) + min;
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

function getRank(stats) {
  if (stats.breaks === 0) return RANKS[RANKS.length - 1];

  const rating =
    stats.score + stats.accuracy * 18 + stats.wpm * 14 + stats.maxCombo * 220 + stats.breaks * 80;

  return RANKS.find((rank) => rating >= rank.threshold) ?? RANKS[RANKS.length - 1];
}

function getShareUrl(result) {
  const { rank, stats } = result;
  const pageUrl = window.location.origin + window.location.pathname;
  const text = [
    "LOCK / TYPE / BREAK result",
    `SCORE ${stats.score.toLocaleString()} / RANK ${rank.name} (${rank.label})`,
    `MAX COMBO ${stats.maxCombo} / ACC ${stats.accuracy}% / WPM ${stats.wpm}`,
    "#LockTypeBreak",
  ].join("\n");

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
}

function makeGameState(mode = "normal") {
  return {
    mode,
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
    typedCount: 0,
    pointer: { x: window.innerWidth / 2, y: window.innerHeight * 0.72 },
    score: 0,
    hp: 100,
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
      word: enemy.word,
      typedCount: s.typedCount,
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

  const pickWord = () => {
    const s = stateRef.current;
    const base = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (s.breaks > 14 && Math.random() < 0.32) {
      return `${base}${WORDS[Math.floor(Math.random() * WORDS.length)].slice(0, 3)}`;
    }
    return base;
  };

  const spawnEnemy = () => {
    const s = stateRef.current;
    const cfg = MODE_CONFIG[s.mode];
    if (s.enemies.length >= cfg.maxEnemies) return;

    const word = pickWord();
    const x = random(96, s.width - 96);
    const speed = random(34, 64) + Math.min(34, s.breaks * 1.2);

    s.enemies.push({
      id: s.nextId++,
      word,
      x,
      y: -64,
      vx: random(-42, 42),
      vy: speed,
      radius: 24 + Math.min(17, word.length * 0.8),
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

    const radius = random(24, 58);
    s.asteroids.push({
      x: random(80, s.width - 80),
      y: -70,
      vx: random(-40, 40),
      vy: random(82, 148),
      radius,
      rotation: random(0, Math.PI * 2),
      rotationVelocity: random(-2, 2),
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
    s.typedCount = 0;
    s.locks += 1;
    s.lockTimes.push(performance.now() - enemy.born);

    addParticles(enemy.x, enemy.y, 12, "cyan");
    showNotice("LOCKED", "good");
    syncHud();
  };

  const unlock = () => {
    const s = stateRef.current;
    s.lockedId = null;
    s.typedCount = 0;
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
    const bonus = 180 + enemy.word.length * 12 + s.combo * 45;

    s.score += bonus;
    s.combo += 1;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    s.breaks += 1;
    s.lockedId = null;
    s.typedCount = 0;

    s.shots.push({
      x: s.pointer.x,
      y: s.pointer.y,
      tx: enemy.x,
      ty: enemy.y,
      life: 0.18,
      maxLife: 0.18,
    });

    addParticles(enemy.x, enemy.y, 40, "orange");
    addFloater("BREAK", enemy.x, enemy.y - 20, "orange");
    s.enemies = s.enemies.filter((item) => item.id !== enemy.id);

    if (s.combo >= 3) {
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

    const char = key.toUpperCase();
    if (!/^[A-Z0-9]$/.test(char)) return;

    s.totalKeys += 1;

    if (char === enemy.word[s.typedCount]) {
      s.correctKeys += 1;
      s.typedCount += 1;
      s.score += 12 + Math.min(80, s.combo * 3);
      enemy.hpRate = 1 - s.typedCount / enemy.word.length;
      enemy.shake = 4;

      addParticles(enemy.x + random(-8, 8), enemy.y + random(-8, 8), 5, "cyan");

      if (s.typedCount >= enemy.word.length) {
        breakEnemy(enemy);
      } else {
        syncHud();
      }
    } else {
      registerMiss(3);
    }
  };

  const startTraining = (nextMode = "normal") => {
    setMode(nextMode);
    stateRef.current = makeGameState(nextMode);
    resizeCanvas();

    const s = stateRef.current;
    s.running = true;
    s.over = false;
    s.startAt = performance.now();
    s.lastFrame = performance.now();

    for (let i = 0; i < 4; i += 1) spawnEnemy();

    setPhase("game");
    setResult(null);
    setTarget(null);
    showNotice("TRAINING START", "good");
    syncHud();
  };

  const continueTraining = () => {
    const s = stateRef.current;
    s.over = false;
    s.running = true;
    s.hp = Math.max(s.hp, 40);
    for (let i = 0; i < 3; i += 1) spawnEnemy();
    setPhase("game");
    setResult(null);
    syncHud();
  };

  const drawShip = (ctx, x, y, rotation, player = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

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

    drawShip(ctx, x, y, Math.atan2(enemy.vy, enemy.vx) + Math.PI / 2, false);

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = locked ? "rgba(255,138,42,.98)" : hovered ? "rgba(0,242,254,.98)" : "rgba(0,242,254,.55)";
    ctx.lineWidth = locked ? 2.6 : 1.45;

    const size = enemy.radius + 16 + pulse * 3;
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

    if (locked) {
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 27, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (s.typedCount / enemy.word.length));
      ctx.strokeStyle = "rgba(101,240,200,.96)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s.pointer.x - x, s.pointer.y - y);
      ctx.strokeStyle = "rgba(255,138,42,.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = locked ? "rgba(255,138,42,.98)" : "rgba(233,251,255,.82)";
    ctx.font = "700 12px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(enemy.word, 0, enemy.radius + 36);

    ctx.restore();
  };

  const drawAsteroid = (ctx, asteroid) => {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);

    ctx.beginPath();
    asteroid.points.forEach((point, index) => {
      const x = Math.cos(point.angle) * asteroid.radius * point.radiusRate;
      const y = Math.sin(point.angle) * asteroid.radius * point.radiusRate;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fillStyle = "rgba(52,58,70,.56)";
    ctx.fill();
    ctx.strokeStyle = "rgba(233,251,255,.26)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  const drawCrosshair = (ctx) => {
    const s = stateRef.current;
    const { x, y } = s.pointer;

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
      enemy.y += enemy.vy * dt;
      enemy.x += enemy.vx * dt + Math.sin(now * 0.0018 * enemy.drift + enemy.phase) * 18 * dt;

      if (enemy.x < 42 || enemy.x > s.width - 42) {
        enemy.vx *= -1;
        enemy.x = clamp(enemy.x, 42, s.width - 42);
      }

      if (enemy.shake) enemy.shake = Math.max(0, enemy.shake - 42 * dt);

      if (enemy.y > s.height + 90) {
        if (s.lockedId === enemy.id) {
          s.lockedId = null;
          s.typedCount = 0;
        }
        enemy.dead = true;
        registerMiss(8);
      }
    });

    s.enemies = s.enemies.filter((enemy) => !enemy.dead);

    s.asteroids.forEach((asteroid) => {
      asteroid.x += asteroid.vx * dt;
      asteroid.y += asteroid.vy * dt;
      asteroid.rotation += asteroid.rotationVelocity * dt;

      if (distance(asteroid.x, asteroid.y, s.pointer.x, s.pointer.y) < asteroid.radius + 10) {
        asteroid.dead = true;
        addParticles(s.pointer.x, s.pointer.y, 22, "red");
        registerMiss(16);
      }

      if (asteroid.y > s.height + 110 || asteroid.x < -120 || asteroid.x > s.width + 120) {
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

    updateWorld(now, dt);

    s.asteroids.forEach((asteroid) => drawAsteroid(ctx, asteroid));
    s.enemies.forEach((enemy) => drawEnemy(ctx, enemy, now));

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
      if (event.key === "r" || event.key === "R") {
        startTraining(stateRef.current.mode);
        return;
      }

      if (event.key === "Escape") {
        unlock();
        return;
      }

      if (event.key.length === 1) {
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

  const typed = target?.word.slice(0, target.typedCount) ?? "";
  const next = target?.word.slice(target.typedCount, target.typedCount + 1) ?? "";
  const rest = target?.word.slice(target.typedCount + 1) ?? "";
  const progress = target ? Math.round((target.typedCount / target.word.length) * 100) : 0;

  return (
    <main className="gameShell">
      <canvas ref={canvasRef} className="gameCanvas" />

      <header className="hud">
        <section className="logoPanel">
          <div className="logoMain">LOCK / TYPE / BREAK</div>
          <div className="logoSub">DESKTOP SHOOTING TRAINER</div>
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
        </section>
      </header>

      <section className={`targetPanel ${target ? "" : "hidden"}`}>
        <div className="targetTop">
          <span className="lockBadge">LOCKED</span>
          <span className="targetName">
            {target?.name ?? "TARGET"} / {target?.word.length ?? 0} KEYS
          </span>
        </div>

        <div className="wordDisplay">
          <span className="typed">{typed}</span>
          <span className="next">{next || " "}</span>
          <span className="rest">{rest}</span>
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
            BREAK
          </h1>
          <p className="description">
            上から接近するターゲットをマウスやトラックボールで捕捉し、クリックでロック。
            <br />
            照準の安定、入力精度、連続撃破でランクを伸ばすデスクトップ射撃トレーナー。
          </p>
          <div className="buttonRow">
            <button onClick={() => startTraining("normal")}>START TRAINING</button>
            <button className="orangeButton" onClick={() => startTraining("practice")}>
              PRACTICE MODE
            </button>
          </div>
          <div className="keyHints">
            <span>Mouse: aim</span>
            <span>Click: lock</span>
            <span>Keyboard: type</span>
            <span>ESC: unlock</span>
            <span>R: restart</span>
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
            <button onClick={() => startTraining(stateRef.current.mode)}>RETRY</button>
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
      <div className="modeTag">{currentModeConfig.label}</div>
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
