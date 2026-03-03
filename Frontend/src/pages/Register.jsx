import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/auth";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setNote(null);
    setLoading(true);
    try {
      await authApi.register(form);
      setNote("OTP sent. Please verify your email.");
      nav("/verify-email", { state: { email: form.email } });
    } catch (err) {
      setNote(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Create account"
      footer={
        <div className="row">
          <span className="muted">Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="stack">
        <Input
          label="University Email"
          placeholder="abc1@eastminster.ac.uk"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 4 chars"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {note ? <div className="alert">{note}</div> : null}
        <Button loading={loading} type="submit">Register & Send OTP</Button>
      </form>
    </Card>
  );
}