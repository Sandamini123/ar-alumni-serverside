import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import { authApi } from "../api/auth.api";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    setLoading(true);
    try {
      const res = await authApi.register({ email, password });
      setMsg(res.data?.message || "Registered. OTP sent.");
      nav("/verify-email", { state: { email } });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your alumni account"
      subtitle="Use your university email. We'll send a one-time OTP to verify your email."
    >
      <form onSubmit={onSubmit}>
        <InputField label="University Email" value={email} onChange={setEmail} placeholder="name@eastminster.ac.uk" autoComplete="email" />
        <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="StrongPass1" autoComplete="new-password" />

        <button disabled={loading} style={btn}>
          {loading ? "Creating..." : "Register & Send OTP"}
        </button>

        {msg ? <p style={ok}>{msg}</p> : null}
        {err ? <p style={bad}>{err}</p> : null}

        <p style={foot}>
          Already verified? <Link style={link} to="/login">Login</Link>
        </p>
      </form>
    </AuthCard>
  );
}

const btn = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: 0,
  marginTop: 8,
  background: "#3b82f6",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const ok = { marginTop: 12, color: "#86efac" };
const bad = { marginTop: 12, color: "#fca5a5" };
const foot = { marginTop: 14, color: "rgba(255,255,255,0.7)" };
const link = { color: "#93c5fd" };