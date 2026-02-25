export default function InputField({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </div>
  );
}

const styles = {
  label: { display: "block", marginBottom: 6, color: "rgba(255,255,255,0.85)", fontSize: 13 },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#0c1426",
    color: "white",
    outline: "none",
  },
};