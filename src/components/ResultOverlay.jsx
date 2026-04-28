import { getShareUrl } from "../game/gameConfig";
import { Metric } from "./Metric";
import { Overlay } from "./Overlay";

export function ResultOverlay({ result, onRetry }) {
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
        <button onClick={onRetry}>RETRY</button>
        <a className="shareButton" href={getShareUrl(result)} target="_blank" rel="noreferrer">
          Xに投稿
        </a>
      </div>
    </Overlay>
  );
}
