import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/auth";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setNote(null);
    setLoading(true);
    try {
      const res = await authApi.login(form);
      localStorage.setItem("token", res.data.token);
      nav("/dashboard");
    } catch (err) {
      setNote(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Login"
      footer={
        <div className="row">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="stack">
        <Input
          label="Email"
          placeholder="abc1@eastminster.ac.uk"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {note ? <div className="alert">{note}</div> : null}
        <Button loading={loading} type="submit">Login</Button>
      </form>
    </Card>
  );
}