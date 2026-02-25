import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import { authApi } from "../api/auth.api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("auth_token", res.data.token);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Login after verifying your email via OTP.">
      <form onSubmit={onSubmit}>
        <InputField label="Email" value={email} onChange={setEmail} placeholder="name@eastminster.ac.uk" autoComplete="email" />
        <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="StrongPass1" autoComplete="current-password" />

        <button disabled={loading} style={btn}>
          {loading ? "Signing in..." : "Login"}
        </button>

        {err ? <p style={bad}>{err}</p> : null}

        <p style={foot}>
          Forgot password? <Link style={link} to="/forgot-password">Reset here</Link>
        </p>

        <p style={foot}>
          New user? <Link style={link} to="/register">Register</Link>
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
const bad = { marginTop: 12, color: "#fca5a5" };
const foot = { marginTop: 14, color: "rgba(255,255,255,0.7)" };
const link = { color: "#93c5fd" };