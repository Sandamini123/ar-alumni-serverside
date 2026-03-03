import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/auth";

export default function ResetPassword() {
  const loc = useLocation();
  const initialEmail = loc.state?.email || "";
  const [form, setForm] = useState({ email: initialEmail, otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setNote(null);
    setLoading(true);
    try {
      await authApi.resetPassword(form);
      setNote("Password updated. You can login now.");
    } catch (err) {
      setNote(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setNote(null);
    setLoading(true);
    try {
      await authApi.sendOtp({ email: form.email, purpose: "PASSWORD_RESET" });
      setNote("New reset OTP sent.");
    } catch (err) {
      setNote(err?.response?.data?.message || "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Reset password" footer={<Link to="/login">Go to login</Link>}>
      <form onSubmit={onSubmit} className="stack">
        <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
        <Input
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        {note ? <div className="alert">{note}</div> : null}
        <Button loading={loading} type="submit">Reset Password</Button>
        <button type="button" className="linkBtn" onClick={resend} disabled={loading}>
          Resend OTP
        </button>
      </form>
    </Card>
  );
}