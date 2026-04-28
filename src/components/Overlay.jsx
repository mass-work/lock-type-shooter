export function Overlay({ children }) {
  return (
    <section className="overlay">
      <div className="menuCard">{children}</div>
    </section>
  );
}
