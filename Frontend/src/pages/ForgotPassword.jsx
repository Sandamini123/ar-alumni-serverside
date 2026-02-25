import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import { authApi } from "../api/auth.api";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    setLoading(true);
    try {
      const res = await authApi.requestPasswordReset({ email });
      setMsg(res.data?.message || "OTP sent if email exists.");
      nav("/reset-password", { state: { email } });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll send an OTP to your email.">
      <form onSubmit={onSubmit}>
        <InputField label="Email" value={email} onChange={setEmail} placeholder="name@eastminster.ac.uk" autoComplete="email" />

        <button disabled={loading} style={btn}>
          {loading ? "Sending..." : "Send Reset OTP"}
        </button>

        {msg ? <p style={ok}>{msg}</p> : null}
        {err ? <p style={bad}>{err}</p> : null}

        <p style={foot}>
          Back to <Link style={link} to="/login">Login</Link>
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
  background: "#f59e0b",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const ok = { marginTop: 12, color: "#86efac" };
const bad = { marginTop: 12, color: "#fca5a5" };
const foot = { marginTop: 14, color: "rgba(255,255,255,0.7)" };
const link = { color: "#93c5fd" };