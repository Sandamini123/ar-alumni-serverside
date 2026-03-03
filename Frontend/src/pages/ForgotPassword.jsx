import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/auth";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setNote(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      nav("/reset-password", { state: { email } });
    } catch (err) {
      setNote(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Forgot password" footer={<Link to="/login">Back to login</Link>}>
      <form onSubmit={onSubmit} className="stack">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {note ? <div className="alert">{note}</div> : null}
        <Button loading={loading} type="submit">Send Reset OTP</Button>
      </form>
    </Card>
  );
}