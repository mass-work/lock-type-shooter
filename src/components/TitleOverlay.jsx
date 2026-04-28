import { LANGUAGE_CONFIG } from "../game/typingConfig";
import { Overlay } from "./Overlay";

export function TitleOverlay({ language, onLanguageChange, onStart }) {
  return (
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
            onClick={() => onLanguageChange(key)}
          >
            {config.label}
          </button>
        ))}
      </div>
      <div className="buttonRow">
        <button onClick={() => onStart(language)}>スタート</button>
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
  );
}
