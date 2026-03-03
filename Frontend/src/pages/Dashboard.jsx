import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div className="page">
      <div className="topbar">
        <h1>Dashboard</h1>
        <button className="btn" onClick={logout}>Logout</button>
      </div>

      <div className="panel">
        <p className="muted">You are logged in (verified users only).</p>
        <div className="row">
          <Link to="/profile" className="linkBtn">Go to Profile (next step)</Link>
        </div>
      </div>
    </div>
  );
}