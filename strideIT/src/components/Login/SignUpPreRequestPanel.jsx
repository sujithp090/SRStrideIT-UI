import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export function SignupRequestsBell({
  user,
  showLabel = false,
  inlinePanel = false,
  notify = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({});
  const [onboarding, setOnboarding] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("signup_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setRequests(data);
      const init = {};
      data.forEach((r) => {
        if (!selections[r.id]) init[r.id] = { calendars: ["boys"], role: "user" };
      });
      setSelections((prev) => ({ ...init, ...prev }));
    }
    setLoading(false);
  };

  const getSel = (id) => selections[id] || { calendars: ["boys"], role: "user" };

  const toggleCal = (id, cal) => {
    const s = getSel(id);
    setSelections((prev) => ({
      ...prev,
      [id]: {
        ...s,
        calendars: s.calendars.includes(cal)
          ? s.calendars.filter((c) => c !== cal)
          : [...s.calendars, cal],
      },
    }));
  };

  const setRole = (id, role) =>
    setSelections((prev) => ({ ...prev, [id]: { ...getSel(id), role } }));

  const handleApprove = async (req) => {
    const sel = getSel(req.id);
    if (sel.calendars.length === 0) return;
    setOnboarding(req.id);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: req.email,
      password: req.password_hash,
      options: { data: { name: req.name, role: sel.role } },
    });

    if (signUpError) {
      notify(`Failed to onboard user: ${signUpError.message}`, "error");
      setOnboarding(null);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          username: req.username,
          calendars: sel.calendars,
          role: sel.role,
          name: req.name,
        })
        .eq("id", data.user.id);
    }

    const { error: approvalError } = await supabase
      .from("signup_requests")
      .update({ status: "approved" })
      .eq("id", req.id);

    if (approvalError) {
      notify("User created but request status update failed.", "error");
      setOnboarding(null);
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setOnboarding(null);
    notify(`User onboarded successfully: ${req.name}.`, "success");
  };

  const handleReject = async (req) => {
    const { error } = await supabase
      .from("signup_requests")
      .update({ status: "rejected" })
      .eq("id", req.id);

    if (error) {
      notify("Failed to reject onboarding request.", "error");
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    notify(`Onboarding request rejected: ${req.name}.`, "error");
  };

  if (user?.role !== "admin") return null;

  const count = requests.length;

  return (
    <div
      className={`signup-bell-wrap ${inlinePanel ? "signup-bell-wrap--inline" : ""}`}
    >
      <button
        className="cal-navbar-pill signup-bell-trigger"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) fetchRequests();
        }}
        title="Signup Requests"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {showLabel && <span>Signup Requests</span>}
        {count > 0 && <span className="signup-bell-badge">{count}</span>}
      </button>

      {open && (
        <>
          <div className="signup-bell-backdrop" onClick={() => setOpen(false)} />
          <div className="signup-bell-panel">
            <div className="signup-bell-header">
              <div className="signup-bell-title">
                Signup Requests
                {count > 0 && <span className="signup-bell-count">{count}</span>}
              </div>
              <button onClick={() => setOpen(false)} className="signup-bell-close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="signup-bell-list">
              {loading ? (
                <div className="signup-bell-loading">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="signup-bell-empty">
                  <div className="signup-bell-empty-icon">✅</div>
                  <div className="signup-bell-empty-title">All clear!</div>
                  <div className="signup-bell-empty-sub">No pending signup requests.</div>
                </div>
              ) : (
                requests.map((req) => {
                  const sel = getSel(req.id);
                  const isProcessing = onboarding === req.id;
                  return (
                    <div key={req.id} className="signup-bell-card">
                      <div className="signup-bell-card-head">
                        <div className="signup-bell-avatar">{(req.name || "U").charAt(0).toUpperCase()}</div>
                        <div className="signup-bell-user-meta">
                          <div className="signup-bell-user-name">{req.name}</div>
                          <div className="signup-bell-user-username">@{req.username}</div>
                          <div className="signup-bell-user-email">{req.email}</div>
                        </div>
                      </div>

                      <div className="signup-bell-selectors">
                        <div>
                          <div className="signup-bell-mini-label">Calendar</div>
                          <div className="signup-bell-mini-row">
                            {["boys", "girls"].map((c) => (
                              <button
                                key={c}
                                className={`bell-cal-btn ${sel.calendars.includes(c) ? "active" : ""}`}
                                onClick={() => toggleCal(req.id, c)}
                              >
                                {c.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="signup-bell-mini-label">Role</div>
                          <div className="signup-bell-mini-row">
                            {["user", "admin"].map((r) => (
                              <button
                                key={r}
                                className={`bell-role-btn ${sel.role === r ? "active" : ""}`}
                                onClick={() => setRole(req.id, r)}
                              >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="signup-bell-actions">
                        <button
                          onClick={() => handleReject(req)}
                          disabled={isProcessing}
                          className="signup-bell-btn signup-bell-btn-reject"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={isProcessing || sel.calendars.length === 0}
                          className={`signup-bell-btn signup-bell-btn-approve ${
                            isProcessing || sel.calendars.length === 0 ? "is-disabled" : ""
                          }`}
                        >
                          {isProcessing ? "Onboarding..." : "✓ Onboard"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
