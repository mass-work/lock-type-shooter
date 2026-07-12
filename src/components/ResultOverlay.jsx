import { getShareUrl } from "../game/gameConfig";
import { Metric } from "./Metric";
import { Overlay } from "./Overlay";

export function ResultOverlay({ result, onRetry }) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  };

  return (
    <Overlay>
      <div className="kicker">TRAINING RESULT</div>
      <h1 className="title small">{result.title}</h1>
      <p className="description">{result.message}</p>

      <div className="rankPlate">
        <span>RANK</span>
        <strong>{result.rank.name}</strong>
        <em>{result.rank.label}</em>
      </div>

      {result.newRecords.length > 0 && (
        <div className="recordBanner">NEW RECORD / {result.newRecords.join(" + ")}</div>
      )}

      <div className="resultGrid">
        <Metric label="SCORE" value={result.stats.score.toLocaleString()} />
        <Metric label="MAX COMBO" value={result.stats.maxCombo} />
        <Metric label="TYPE ACC" value={`${result.stats.accuracy}%`} />
        <Metric label="AIM ACC" value={`${result.stats.pointerAccuracy}%`} />
        <Metric label="WPM" value={result.stats.wpm} />
        <Metric label="AVG LOCK" value={`${result.stats.averageLock.toFixed(2)}s`} />
        <Metric label="TYPE BREAK" value={result.stats.typingBreaks} />
        <Metric label="BEST CLEAN TYPE" value={result.stats.maxNoMissKeys} />
        <Metric label="DAMAGE" value={result.stats.damageTaken} />
        <Metric label="TIME" value={formatTime(result.stats.elapsedSeconds)} />
      </div>

      <section className="trainingReport">
        <div className="nextMission">
          <span>NEXT MISSION</span>
          <strong>{result.insight.title}</strong>
          <p>{result.insight.detail}</p>
        </div>
        <div className="reviewSummary">
          <p>
            <span>苦手キー</span>
            <strong>{result.stats.mistakeKeys.map((item) => item.label.toUpperCase()).join(" / ") || "なし"}</strong>
          </p>
          <p>
            <span>要復習ワード</span>
            <strong>{result.stats.mistakeWords.map((item) => item.label).join(" / ") || "なし"}</strong>
          </p>
        </div>
      </section>

      <div className="personalBest">
        PLAY {result.progress.sessions} / BEST SCORE {result.progress.bestScore.toLocaleString()} / BEST WPM {result.progress.bestWpm}
      </div>

      <div className="buttonRow">
        <button onClick={onRetry}>RETRY</button>
        <a className="shareButton" href={getShareUrl(result)} target="_blank" rel="noreferrer">
          Xに投稿
        </a>
      </div>
    </Overlay>
  );
}
