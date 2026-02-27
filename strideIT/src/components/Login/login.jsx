import { useState } from "react";
import { supabase } from "../../lib/supabase";
import strideLogoLogin from "../../assets/strideLogoLogin.svg";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);

    const input = username.trim().toLowerCase();

    // 1. Resolve email from username via RPC (SECURITY DEFINER bypasses RLS)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_email_by_username",
      { p_username: input },
    );

    // Debug — remove after confirming login works
    console.log("RPC raw data:", JSON.stringify(rpcData));
    console.log("RPC error:", rpcError);

    // Supabase can return scalar TEXT as a plain string OR wrapped in an array
    let email = null;
    if (typeof rpcData === "string") {
      email = rpcData;
    } else if (Array.isArray(rpcData) && rpcData.length > 0) {
      email = rpcData[0]?.get_email_by_username ?? Object.values(rpcData[0])[0];
    }

    if (rpcError || !email) {
      setError("No account found with that username.");
      setLoading(false);
      return;
    }

    // 2. Sign in with Supabase Auth using the resolved email
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid username or password.");
      setLoading(false);
      return;
    }

    // 3. Fetch full profile — RLS allows it now that user is authenticated
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, role, username")
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
            <img src={strideLogoLogin} />
          </div>
        </div>

        <div className="login-title">Welcome</div>

        {error && <div className="login-error-msg">⚠ {error}</div>}

        <div className="login-field">
          <label className="login-label">Username</label>
          <input
            className={`login-input ${error ? "error" : ""}`}
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoCapitalize="none"
            autoCorrect="off"
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
