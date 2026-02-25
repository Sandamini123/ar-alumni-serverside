import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import { authApi } from "../api/auth.api";

export default function ResetPassword() {
  const nav = useNavigate();
  const loc = useLocation();
  const initialEmail = loc.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    setLoading(true);
    try {
      const res = await authApi.confirmPasswordReset({ email, otp, newPassword });
      setMsg(res.data?.message || "Password reset successful");
      nav("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Set a new password" subtitle="Enter the OTP and your new password.">
      <form onSubmit={onSubmit}>
        <InputField label="Email" value={email} onChange={setEmail} placeholder="name@eastminster.ac.uk" autoComplete="email" />
        <InputField label="Reset OTP" value={otp} onChange={setOtp} placeholder="123456" autoComplete="one-time-code" />
        <InputField label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="NewStrong1" autoComplete="new-password" />

        <button disabled={loading} style={btn}>
          {loading ? "Updating..." : "Reset Password"}
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
  background: "#a855f7",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const ok = { marginTop: 12, color: "#86efac" };
const bad = { marginTop: 12, color: "#fca5a5" };
const foot = { marginTop: 14, color: "rgba(255,255,255,0.7)" };
const link = { color: "#93c5fd" };