import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // 2. Fetch the user's profile to get name + role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      setError("Account setup incomplete. Contact your admin.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    onLogin(profile);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
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

        <div className="login-title">Welcome back</div>

        {error && <div className="login-error-msg">⚠ {error}</div>}

        <div className="login-field">
          <label className="login-label">Email</label>
          <input
            className={`login-input ${error ? "error" : ""}`}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        </div>

        <div className="login-field">
          <label className="login-label">Password</label>
          <input
            className={`login-input ${error ? "error" : ""}`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </div>
    </div>
  );
}
