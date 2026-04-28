import { LANGUAGE_CONFIG } from "../game/typingConfig";
import { HudValue } from "./HudValue";

export function GameHud({ language, stats, bonusTimeActive, soundEnabled, onToggleSound }) {
  return (
    <>
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

      <button className={`soundToggle ${soundEnabled ? "on" : "off"}`} type="button" onClick={onToggleSound}>
        AUDIO {soundEnabled ? "ON" : "OFF"}
      </button>
    </>
  );
}
