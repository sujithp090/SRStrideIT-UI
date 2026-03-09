import { useState } from "react";
import { supabase } from "../../lib/supabase";
import strideLogoLogin from "../../assets/strideLogoLogin.svg";
import { Eye, EyeOff } from "lucide-react";

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const normalizeMobile = (num) => {
    return num.replace(/\D/g, "").slice(-10);
  };

  /* ── Login ── */
  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const rawInput = username.trim();
      const usernameInput = rawInput.toLowerCase();
      const mobileInput = normalizeMobile(rawInput);
      const strippedInput = rawInput.replace(/[\s()+-]/g, "");
      const isMobileLookup = /^\d+$/.test(strippedInput);

      // 🔎 Find account by mobile OR username (properly)
      let query = supabase.from("profiles").select("id, email");

      if (isMobileLookup && mobileInput.length >= 10) {
        query = query.eq("mobile", mobileInput);
      } else {
        query = query.eq("username", usernameInput);
      }

      const { data: account, error: accountError } = await query.maybeSingle();

      const email = account?.email || null;

      if (accountError || !email) {
        setError("No account found with that username/mobile number.");
        setLoading(false);
        return;
      }

      // 🔐 Sign in using email + password
      const {
        data: loginData,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError("Invalid password.");
        setLoading(false);
        return;
      }

      if (loginData?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, email, role, username, calendars, mobile")
          .eq("id", loginData.user.id)
          .single();

        if (profile) {
          onLogin(profile);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  /* ── Signup ── */
  const handleSignup = async () => {
    setError("");
    if (
      !signupName.trim() ||
      !signupUsername.trim() ||
      !signupEmail.trim() ||
      !signupMobile.trim() ||
      !signupPassword
    ) {
      setError("All fields are required.");
      return;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(signupUsername.trim())) {
      setError("Username: lowercase letters, numbers, underscores only.");
      return;
    }

    const normalizedSignupMobile = normalizeMobile(signupMobile);
    if (normalizedSignupMobile.length < 10) {
      setError("Enter a valid mobile number.");
      return;
    }

    setLoading(true);

    // Check username not already taken
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", signupUsername.trim().toLowerCase())
      .single();

    if (existingProfile) {
      setError("That username is already taken.");
      setLoading(false);
      return;
    }

    const { data: existingReq } = await supabase
      .from("signup_requests")
      .select("id")
      .eq("username", signupUsername.trim().toLowerCase())
      .single();

    if (existingReq) {
      setError("A request with that username is already pending.");
      setLoading(false);
      return;
    }

    const { data: existingMobileProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("mobile", normalizedSignupMobile)
      .maybeSingle();

    if (existingMobileProfile) {
      setError("That mobile number is already in use.");
      setLoading(false);
      return;
    }

    const { data: existingMobileReq } = await supabase
      .from("signup_requests")
      .select("id")
      .eq("mobile", normalizedSignupMobile)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (existingMobileReq) {
      setError("A request with that mobile number already exists.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("signup_requests")
      .insert({
        name: signupName.trim(),
        username: signupUsername.trim().toLowerCase(),
        email: signupEmail.trim().toLowerCase(),
        mobile: normalizedSignupMobile,
        password_hash: signupPassword,
        status: "pending",
      });

    if (insertError) {
      setError("Failed to submit request. Try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSignupDone(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") mode === "login" ? handleLogin() : handleSignup();
  };

  /* ── Signup success screen ── */
  if (mode === "signup" && signupDone) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo-wrap">
            <div className="login-logo-icon">
              <img src={strideLogoLogin} />
            </div>
          </div>
          <div className="login-success-content">
            <div className="login-success-icon">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="login-success-title">Request Submitted!</div>
            <div className="login-success-text">
              Your signup request has been sent to the admin. You'll be able to
              log in once your account is approved.
            </div>
            <button
              className="login-btn"
              onClick={() => {
                setMode("login");
                setSignupDone(false);
                setSignupName("");
                setSignupUsername("");
                setSignupEmail("");
                setSignupMobile("");
                setSignupPassword("");
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Signup screen ── */
  if (mode === "signup") {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo-wrap">
            <div className="login-logo-icon">
              <img src={strideLogoLogin} />
            </div>
          </div>
          <div className="login-title">Request Access</div>
          <div className="login-signup-subtitle">
            Your request will be reviewed by an admin
          </div>

          {error && <div className="login-error-msg">⚠ {error}</div>}

          <div className="login-field">
            <label className="login-label">Full Name</label>
            <input
              className="login-input"
              type="text"
              placeholder="e.g. Jane Doe"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              className="login-input"
              type="text"
              placeholder="jane_doe"
              value={signupUsername}
              onChange={(e) =>
                setSignupUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="jane@company.com"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Min 6 characters"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <div className="login-field">
            <label className="login-label">Mobile Number</label>
            <input
              className="login-input"
              type="tel"
              placeholder="10-digit mobile number"
              value={signupMobile}
              onChange={(e) =>
                setSignupMobile(e.target.value.replace(/\D/g, ""))
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
              inputMode="numeric"
              maxLength={15}
            />
          </div>

          <button
            className="login-btn"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Request Access"}
          </button>

          <div className="login-switch-row">
            <span className="login-switch-text">Already have an account? </span>
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="login-switch-btn"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login screen ── */
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
          <label className="login-label">Username / Mobile Number</label>
          <input
            className={`login-input ${error ? "error" : ""}`}
            type="text"
            placeholder="your username or Mobile no"
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

          <div className="password-wrapper">
            <input
              className={`login-input ${error ? "error" : ""}`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="login-switch-row">
          <span className="login-switch-text">Don't have an account? </span>
          <button
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className="login-switch-btn"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
