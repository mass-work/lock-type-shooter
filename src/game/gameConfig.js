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
  milestoneStep: 200,
  maxMisses: 3,
  maxEnemies: 16,
  initialEnemies: 10,
  spawnInterval: 90,
  baseScore: 1200,
  scoreRamp: 420,
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

export const RANKS = [
  { name: "S+", threshold: 26000, label: "ACE VECTOR" },
  { name: "S", threshold: 19000, label: "ZERO MISSILE" },
  { name: "A", threshold: 12500, label: "CLEAN BREAKER" },
  { name: "B", threshold: 7600, label: "FIELD LOCKER" },
  { name: "C", threshold: 3200, label: "ROOKIE PILOT" },
  { name: "D", threshold: 0, label: "BOOT SEQUENCE" },
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

export function getRank(stats) {
  if (stats.breaks === 0) return RANKS[RANKS.length - 1];

  const accuracyBonus = Math.max(0, stats.accuracy - 80) * 45;
  const speedBonus = Math.min(2600, stats.wpm * 18);
  const comboBonus = Math.min(5200, stats.maxCombo * 155);
  const clearBonus = Math.min(3600, stats.breaks * 55);
  const rating = stats.score + accuracyBonus + speedBonus + comboBonus + clearBonus;

  return RANKS.find((rank) => rating >= rank.threshold) ?? RANKS[RANKS.length - 1];
}

export function getShareUrl(result) {
  const { rank, stats } = result;
  const text = [
    "LOCK TYPE SHOOTERで遊びました！",
    `スコア：${stats.score.toLocaleString()}点`,
    `ランク：${rank.name}（${rank.label}）`,
    `最大コンボ：${stats.maxCombo}`,
    `正確率：${stats.accuracy}% / WPM：${stats.wpm}`,
    "照準とタイピングで迫る敵を撃ち落とす反応トレーニングゲームです。",
    "#LockTypeShooter",
  ].join("\n");

  const params = new URLSearchParams({
    text,
    url: SHARE_PAGE_URL,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
