import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/auth";

export default function VerifyEmail() {
  const loc = useLocation();
  const initialEmail = loc.state?.email || "";
  const [form, setForm] = useState({ email: initialEmail, otp: "" });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);

  const verify = async (e) => {
    e.preventDefault();
    setNote(null);
    setLoading(true);
    try {
      await authApi.verifyEmail(form);
      setNote("Verified! Now you can login.");
    } catch (err) {
      setNote(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setNote(null);
    setLoading(true);
    try {
      await authApi.sendOtp({ email: form.email, purpose: "EMAIL_VERIFY" });
      setNote("New OTP sent.");
    } catch (err) {
      setNote(err?.response?.data?.message || "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Verify email"
      footer={
        <div className="row">
          <Link to="/login">Go to Login</Link>
        </div>
      }
    >
      <form onSubmit={verify} className="stack">
        <Input
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="OTP (6 digits)"
          placeholder="123456"
          value={form.otp}
          onChange={(e) => setForm({ ...form, otp: e.target.value })}
        />
        {note ? <div className="alert">{note}</div> : null}
        <Button loading={loading} type="submit">Verify</Button>
        <button type="button" className="linkBtn" onClick={resend} disabled={loading}>
          Resend OTP
        </button>
      </form>
    </Card>
  );
}