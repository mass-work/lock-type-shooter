export function HudValue({ label, value, tone = "" }) {
  return (
    <div className={`hudItem ${tone}`}>
      <span className="hudLabel">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
