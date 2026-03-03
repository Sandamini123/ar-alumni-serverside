export default function Input({ label, ...props }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <input className="input" {...props} />
    </label>
  );
}