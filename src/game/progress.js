const STORAGE_KEY = "lock-type-shooter-progress-v1";

const emptyProgress = {
  sessions: 0,
  bestScore: 0,
  bestWpm: 0,
  bestAccuracy: 0,
  bestPointerAccuracy: 0,
  bestAverageLock: 0,
};

function readProgress() {
  if (typeof window === "undefined") return emptyProgress;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...emptyProgress, ...JSON.parse(saved) } : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

export function saveSessionProgress(stats) {
  const previous = readProgress();
  const canJudgeTyping = stats.totalKeys >= 20;
  const canJudgePointing = stats.pointerAttempts >= 5;
  const newRecords = [];

  if (stats.score > previous.bestScore) newRecords.push("SCORE");
  if (canJudgeTyping && stats.wpm > previous.bestWpm) newRecords.push("WPM");
  if (canJudgeTyping && stats.accuracy > previous.bestAccuracy) newRecords.push("TYPE ACC");
  if (canJudgePointing && stats.pointerAccuracy > previous.bestPointerAccuracy) newRecords.push("AIM ACC");
  if (stats.averageLock > 0 && (previous.bestAverageLock === 0 || stats.averageLock < previous.bestAverageLock)) {
    newRecords.push("LOCK SPEED");
  }

  const progress = {
    sessions: previous.sessions + 1,
    bestScore: Math.max(previous.bestScore, stats.score),
    bestWpm: canJudgeTyping ? Math.max(previous.bestWpm, stats.wpm) : previous.bestWpm,
    bestAccuracy: canJudgeTyping ? Math.max(previous.bestAccuracy, stats.accuracy) : previous.bestAccuracy,
    bestPointerAccuracy: canJudgePointing
      ? Math.max(previous.bestPointerAccuracy, stats.pointerAccuracy)
      : previous.bestPointerAccuracy,
    bestAverageLock:
      stats.averageLock > 0 && (previous.bestAverageLock === 0 || stats.averageLock < previous.bestAverageLock)
        ? stats.averageLock
        : previous.bestAverageLock,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress is optional; the game remains fully playable without storage.
  }

  return { progress, newRecords };
}

export function getTrainingInsight(stats) {
  if (stats.totalKeys < 20 || stats.typingBreaks < 3) {
    return {
      title: "まずは3体撃破",
      detail: "照準、クリック、入力の順番を崩さず、3体を確実に撃破しよう。",
    };
  }

  if (stats.pointerAttempts >= 5 && stats.pointerAccuracy < 86) {
    return {
      title: "次は照準を優先",
      detail: `空振りを${Math.max(1, stats.pointerMisses - 1)}回以下に抑え、AIM精度90%を目指そう。`,
    };
  }

  if (stats.totalKeys >= 20 && stats.accuracy < 95) {
    const weakKey = stats.mistakeKeys[0]?.label;
    return {
      title: "次は正確さを優先",
      detail: weakKey
        ? `${weakKey.toUpperCase()}周辺を意識し、TYPE精度95%以上を目指そう。`
        : "速度を少し落とし、TYPE精度95%以上を目指そう。",
    };
  }

  if (stats.averageLock > 2.2) {
    return {
      title: "次は初動を短く",
      detail: `平均LOCK ${stats.averageLock.toFixed(2)}秒から0.2秒短縮を目指そう。`,
    };
  }

  return {
    title: "次は自己ベスト更新",
    detail: `精度を維持したまま、WPM ${stats.wpm + 3}以上を目指そう。`,
  };
}
