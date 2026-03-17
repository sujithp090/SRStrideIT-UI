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
        if (!selections[r.id])
          init[r.id] = { calendars: ["boys"], role: "user" };
      });
      setSelections((prev) => ({ ...init, ...prev }));
    }
    setLoading(false);
  };

  const getSel = (id) =>
    selections[id] || { calendars: ["boys"], role: "user" };

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
    try {
      setOnboarding(req.id);
      const sel = getSel(req.id);

      const {
        data: { session: adminSession },
      } = await supabase.auth.getSession();

      // 1️⃣ Create auth user (browser clients can't call admin.createUser with anon keys)
      const { data, error } = await supabase.auth.signUp({
        email: req.email,
        password: req.password_hash,
      });

      if (error) {
        notify(`Failed to onboard user: ${error.message}`, "error");
        setOnboarding(null);
        return;
      }

      const userId = data?.user?.id;

      if (!userId) {
        notify("Failed to onboard user: no auth user id returned.", "error");
        setOnboarding(null);
        return;
      }

      // If signUp returned a session for the created user, restore admin session.
      if (adminSession && data?.session) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      // 2️⃣ Insert into profiles (linked to auth user id)
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        username: req.username,
        mobile: req.mobile,
        calendars: sel.calendars,
        role: sel.role,
        name: req.name,
        email: req.email,
      });

      if (profileError) {
        notify(`Profile insert failed: ${profileError.message}`, "error");
        setOnboarding(null);
        return;
      }

      // 3️⃣ Delete signup request
      await supabase.from("signup_requests").delete().eq("id", req.id);

      notify("User approved successfully!", "success");

      // refresh list
      fetchRequests();
    } catch (err) {
      console.error(err);
      notify("Something went wrong during approval.", "error");
    }

    setOnboarding(null);
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
          <div
            className="signup-bell-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="signup-bell-panel">
            <div className="signup-bell-header">
              <div className="signup-bell-title">
                Signup Requests
                {count > 0 && (
                  <span className="signup-bell-count">{count}</span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="signup-bell-close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
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
                  <div className="signup-bell-empty-sub">
                    No pending signup requests.
                  </div>
                </div>
              ) : (
                requests.map((req) => {
                  const sel = getSel(req.id);
                  const isProcessing = onboarding === req.id;
                  return (
                    <div key={req.id} className="signup-bell-card">
                      <div className="signup-bell-card-head">
                        <div className="signup-bell-avatar">
                          {(req.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="signup-bell-user-meta">
                          <div className="signup-bell-user-name">
                            {req.name}
                          </div>
                          <div className="signup-bell-user-username">
                            @{req.username}
                          </div>
                          <div className="signup-bell-user-email">
                            {req.email}
                          </div>
                          {req.mobile && (
                            <div className="signup-bell-user-email">
                              📞 {req.mobile}
                            </div>
                          )}
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
                            isProcessing || sel.calendars.length === 0
                              ? "is-disabled"
                              : ""
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
