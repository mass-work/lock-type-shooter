import { LANGUAGE_CONFIG } from "../game/typingConfig";

export function TargetPanel({
  target,
  bonusTimeActive,
  stats,
  activeAnswer,
  typed,
  next,
  rest,
  dockProgress,
  progress,
}) {
  return (
    <section className={`targetPanel ${target ? "locked" : "idle"} ${bonusTimeActive ? "bonusMode" : ""}`}>
      <div className="targetTop">
        <span className="lockBadge">{bonusTimeActive ? "BONUS TIME" : target ? "LOCKED" : "NO LOCK"}</span>
        <span className="targetName">
          {bonusTimeActive
            ? `CLICK TARGETS TO BREAK / MISS ${stats.bonusTimeMisses}/${stats.bonusTimeMaxMisses}`
            : target
              ? `${target.name} / ${activeAnswer.length} KEYS / ${LANGUAGE_CONFIG[target.language].label}`
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
  );
}
