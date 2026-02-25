import { useState } from "react";
import "./login.css";

// Hard-coded users — no backend
const USERS = [
  {
    email: "admin",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  {
    email: "user@company.com",
    password: "user123",
    role: "user",
    name: "Jane Doe",
  },
];

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    const match = USERS.find(
      (u) =>
        u.email === email.trim().toLowerCase() &&
        u.password === password &&
        (isAdmin ? u.role === "admin" : u.role === "user")
    );
    if (match) {
      onLogin(match);
    } else {
      setError("Invalid credentials or wrong login mode.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="login-app-name">Interview Approval App</span>
        </div>

        <div className="login-title">Login</div>

        {error && <div className="login-error-msg">⚠ {error}</div>}

        {/* Email */}
        <div className="login-field">
          <label className="login-label">Email</label>
          <input
            className={`login-input ${error ? "error" : ""}`}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Password */}
        <div className="login-field">
          <label className="login-label">Password</label>
          <input
            className={`login-input ${error ? "error" : ""}`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Admin toggle */}
        <div className="login-toggle-row">
          <span className="login-toggle-label">Log in as Admin</span>
          <button
            className={`toggle-switch ${isAdmin ? "on" : ""}`}
            onClick={() => setIsAdmin((v) => !v)}
            aria-label="Toggle admin login"
          >
            <div className="toggle-knob" />
          </button>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Log In
        </button>
      </div>
    </div>
  );
}
