export default function Card({ title, children, footer }) {
  return (
    <div className="card">
      <div className="cardHeader">
        <h2>{title}</h2>
        <p className="muted">Alumni System</p>
      </div>
      <div className="cardBody">{children}</div>
      {footer ? <div className="cardFooter">{footer}</div> : null}
    </div>
  );
}