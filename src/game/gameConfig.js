export const MODE_CONFIG = {
  normal: {
    label: "NORMAL MODE",
    startEnemies: 1,
    maxEnemies: 5,
    maxAsteroids: 5,
    asteroid: true,
    enemyBaseInterval: 1540,
    enemyMinInterval: 680,
  },
};

export const NO_MISS_BONUS_RULES = {
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
    step: 50,
    majorEvery: 150,
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

export const BONUS_TIME_CONFIG = {
  firstMilestone: 75,
  milestoneStep: 100,
  maxMisses: 3,
  maxEnemies: 16,
  initialEnemies: 10,
  spawnInterval: 90,
  baseScore: 1000,
  scoreRamp: 300,
};

export const initialStats = {
  score: 0,
  hp: 100,
  special: 0,
  combo: 0,
  maxCombo: 0,
  accuracy: 100,
  wpm: 0,
  averageLock: 0,
  breaks: 0,
  typingBreaks: 0,
  locks: 0,
  pointerAttempts: 0,
  pointerHits: 0,
  pointerMisses: 0,
  pointerAccuracy: 100,
  totalKeys: 0,
  damageTaken: 0,
  mistakeKeys: [],
  mistakeWords: [],
  noMissBreaks: 0,
  noMissKeys: 0,
  maxNoMissBreaks: 0,
  maxNoMissKeys: 0,
  nextNoMissBreakBonus: NO_MISS_BONUS_RULES.break.step,
  nextNoMissKeyBonus: NO_MISS_BONUS_RULES.typing.step,
  nextBonusTimeKey: BONUS_TIME_CONFIG.firstMilestone,
  bonusTimeActive: false,
  bonusTimeMisses: 0,
  bonusTimeMaxMisses: BONUS_TIME_CONFIG.maxMisses,
};

export const RANKS = [
  {
    name: "SS",
    threshold: 190000,
    label: "LOCK TYPE LEGEND",
    requirements: { score: 170000, accuracy: 99, pointerAccuracy: 96, wpm: 58, maxCombo: 52, typingBreaks: 72 },
  },
  {
    name: "S++",
    threshold: 155000,
    label: "NEON DOMINATOR",
    requirements: { score: 138000, accuracy: 99, pointerAccuracy: 94, wpm: 52, maxCombo: 42, typingBreaks: 60 },
  },
  {
    name: "S+",
    threshold: 122000,
    label: "ACE VECTOR",
    requirements: { score: 108000, accuracy: 98, pointerAccuracy: 92, wpm: 45, maxCombo: 32, typingBreaks: 46 },
  },
  {
    name: "S",
    threshold: 92000,
    label: "ZERO MISSILE",
    requirements: { score: 82000, accuracy: 95, pointerAccuracy: 86, wpm: 36, maxCombo: 22, typingBreaks: 30 },
  },
  {
    name: "A++",
    threshold: 78000,
    label: "VECTOR BREAKER",
    requirements: {},
  },
  {
    name: "A+",
    threshold: 66000,
    label: "HIGH LOCKER",
    requirements: {},
  },
  {
    name: "A",
    threshold: 50000,
    label: "CLEAN BREAKER",
    requirements: {},
  },
  {
    name: "B++",
    threshold: 41000,
    label: "FIELD ACE",
    requirements: {},
  },
  {
    name: "B+",
    threshold: 33000,
    label: "QUICK LOCKER",
    requirements: {},
  },
  {
    name: "B",
    threshold: 25000,
    label: "FIELD LOCKER",
    requirements: {},
  },
  {
    name: "C++",
    threshold: 18000,
    label: "ROOKIE BREAKER",
    requirements: {},
  },
  {
    name: "C+",
    threshold: 12000,
    label: "RANGE CADET",
    requirements: {},
  },
  {
    name: "C",
    threshold: 8000,
    label: "ROOKIE PILOT",
    requirements: {},
  },
  {
    name: "D++",
    threshold: 5000,
    label: "BOOT BREAKER",
    requirements: {},
  },
  {
    name: "D+",
    threshold: 2500,
    label: "WARM START",
    requirements: {},
  },
  { name: "D", threshold: 0, label: "BOOT SEQUENCE", requirements: {} },
];

export const APP_URL = "https://mass-work.github.io/lock-type-shooter/";
export const SHARE_PAGE_URL = `${APP_URL}?share=result-card`;

export function getNoMissBonus(kind, milestone) {
  const rule = NO_MISS_BONUS_RULES[kind];
  const tier = Math.max(1, Math.floor(milestone / rule.step));
  const major = milestone % rule.majorEvery === 0;
  const amount = rule.baseScore + (tier - 1) * rule.scoreRamp + (major ? rule.majorScore : 0);

  return { rule, amount, major };
}

export function getBonusTimeReward(milestone) {
  const tier = Math.max(1, Math.floor((milestone - BONUS_TIME_CONFIG.firstMilestone) / BONUS_TIME_CONFIG.milestoneStep) + 1);
  return BONUS_TIME_CONFIG.baseScore + (tier - 1) * BONUS_TIME_CONFIG.scoreRamp;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scoreRange(value, min, max, points) {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1) * points;
}

function getRankRating(stats) {
  const typingAccuracy = scoreRange(stats.accuracy, 88, 100, 5200);
  const aimAccuracy = scoreRange(stats.pointerAccuracy, 78, 100, 4600);
  const typingSpeed = scoreRange(stats.wpm, 24, 56, 5000);
  const comboControl = scoreRange(stats.maxCombo, 8, 42, 5200);
  const clearVolume = scoreRange(stats.typingBreaks, 12, 62, 3000);

  return Math.floor(stats.score + typingAccuracy + aimAccuracy + typingSpeed + comboControl + clearVolume);
}

function meetsRankRequirements(stats, requirements = {}) {
  return Object.entries(requirements).every(([key, value]) => (stats[key] ?? 0) >= value);
}

export function getRank(stats) {
  if (stats.breaks === 0) return RANKS[RANKS.length - 1];

  const rating = getRankRating(stats);
  const earnedIndex = RANKS.findIndex((rank) => rating >= rank.threshold);
  const startIndex = earnedIndex === -1 ? RANKS.length - 1 : earnedIndex;

  for (let index = startIndex; index < RANKS.length; index += 1) {
    const rank = RANKS[index];
    if (meetsRankRequirements(stats, rank.requirements)) {
      return { ...rank, rating };
    }
  }

  return { ...RANKS[RANKS.length - 1], rating };
}

export function getShareUrl(result) {
  const { rank, stats } = result;
  const text = [
    "タイピング＆ポインティング練習アプリ",
    "LOCK TYPE SHOOTERで遊びました。",
    `スコア：${stats.score.toLocaleString()}点`,
    `ランク：${rank.name}（${rank.label}）`,
    `最大コンボ：${stats.maxCombo}`,
    `正確率：${stats.accuracy}% / AIM：${stats.pointerAccuracy}% / WPM：${stats.wpm}`,
    "#LockTypeShooter",
  ].join("\n");

  const params = new URLSearchParams({
    text,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
