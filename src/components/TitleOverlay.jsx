import { Overlay } from "./Overlay";

export function TitleOverlay({ onStart }) {
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
        日本語ローマ字入力で、隕石を避けながら精度と連続撃破でランクを伸ばす。
      </p>
      <div className="buttonRow">
        <button onClick={onStart}>スタート</button>
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
