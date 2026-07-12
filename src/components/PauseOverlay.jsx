import { Overlay } from "./Overlay";

export function PauseOverlay({ onResume }) {
  return (
    <Overlay>
      <div className="kicker">SIMULATION HOLD</div>
      <h1 className="title small">PAUSED</h1>
      <p className="description">照準位置と進行状況を保持しています。</p>
      <div className="buttonRow">
        <button onClick={onResume}>再開</button>
      </div>
    </Overlay>
  );
}
