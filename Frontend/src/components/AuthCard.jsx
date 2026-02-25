export default function AuthCard({ title, subtitle, children }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0b1220",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#111a2c",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    color: "white",
  },
  title: { margin: 0, fontSize: 22, fontWeight: 700 },
  subtitle: { marginTop: 8, marginBottom: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 },
};