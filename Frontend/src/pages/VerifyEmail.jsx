import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import { authApi } from "../api/auth.api";

export default function VerifyEmail() {
  const nav = useNavigate();
  const loc = useLocation();
  const initialEmail = loc.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!email && initialEmail) setEmail(initialEmail);
  }, [email, initialEmail]);

  async function onVerify(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, otp });
      setMsg(res.data?.message || "Verified!");
      nav("/login", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit OTP sent to your email. OTP expires in 10 minutes."
    >
      <form onSubmit={onVerify}>
        <InputField label="Email" value={email} onChange={setEmail} placeholder="name@eastminster.ac.uk" autoComplete="email" />
        <InputField label="OTP" value={otp} onChange={setOtp} placeholder="123456" autoComplete="one-time-code" />

        <button disabled={loading} style={btn}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {msg ? <p style={ok}>{msg}</p> : null}
        {err ? <p style={bad}>{err}</p> : null}

        <p style={foot}>
          Go to <Link style={link} to="/login">Login</Link>
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
  background: "#22c55e",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const ok = { marginTop: 12, color: "#86efac" };
const bad = { marginTop: 12, color: "#fca5a5" };
const foot = { marginTop: 14, color: "rgba(255,255,255,0.7)" };
const link = { color: "#93c5fd" };