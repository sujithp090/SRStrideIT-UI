import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// ── Standalone bell dropdown for pending signup requests ──────────────────────
export function SignupRequestsBell({ user }) {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({});
  const [onboarding, setOnboarding] = useState(null); // id being processed

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

  /* ── Approve ── */
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
      alert("Failed to create user: " + signUpError.message);
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

    await supabase
      .from("signup_requests")
      .update({ status: "approved" })
      .eq("id", req.id);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setOnboarding(null);
  };

  /* ── Reject ── */
  const handleReject = async (req) => {
    await supabase
      .from("signup_requests")
      .update({ status: "rejected" })
      .eq("id", req.id);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  if (user?.role !== "admin") return null;

  const count = requests.length;

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        className="cal-navbar-pill"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) fetchRequests();
        }}
        style={{ position: "relative", gap: 6 }}
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
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              width: 17,
              height: 17,
              borderRadius: "50%",
              background: "#ef4444",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              border: "2px solid #0f2744",
            }}
          >
            {count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Click-outside backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 299 }}
            onClick={() => setOpen(false)}
          />

          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 380,
              maxHeight: "80vh",
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 12px 48px rgba(15,39,68,0.22)",
              border: "1px solid #e2e8f0",
              zIndex: 300,
              display: "flex",
              flexDirection: "column",
              fontFamily: "Poppins, sans-serif",
              animation: "bellDrop 0.18s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <style>{`
              @keyframes bellDrop { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
              .bell-cal-btn { padding:4px 10px; border-radius:6px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:11px; font-weight:700; cursor:pointer; font-family:Poppins,sans-serif; color:#64748b; transition:all 0.12s; }
              .bell-cal-btn.active { border-color:#6366f1; background:#eef2ff; color:#4338ca; }
              .bell-role-btn { padding:4px 10px; border-radius:6px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:11px; font-weight:700; cursor:pointer; font-family:Poppins,sans-serif; color:#64748b; transition:all 0.12s; }
              .bell-role-btn.active { border-color:#1d4ed8; background:#dbeafe; color:#1d4ed8; }
            `}</style>

            {/* Header */}
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                Signup Requests
                {count > 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      background: "#ef4444",
                      color: "white",
                      borderRadius: 20,
                      padding: "1px 8px",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                }}
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

            {/* Request list */}
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  Loading...
                </div>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: "center", padding: 36 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                      marginBottom: 4,
                    }}
                  >
                    All clear!
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    No pending signup requests.
                  </div>
                </div>
              ) : (
                requests.map((req) => {
                  const sel = getSel(req.id);
                  const isProcessing = onboarding === req.id;
                  return (
                    <div
                      key={req.id}
                      style={{
                        borderRadius: 10,
                        border: "1.5px solid #fde68a",
                        background: "#fffbeb",
                        padding: "12px 12px 10px",
                        marginBottom: 10,
                      }}
                    >
                      {/* User info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#f59e0b,#fbbf24)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {req.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#0f172a",
                            }}
                          >
                            {req.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#3b82f6",
                              fontWeight: 600,
                            }}
                          >
                            @{req.username}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.email}
                          </div>
                        </div>
                      </div>

                      {/* Calendar + Role selectors */}
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginBottom: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              marginBottom: 5,
                            }}
                          >
                            Calendar
                          </div>
                          <div style={{ display: "flex", gap: 5 }}>
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
                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              marginBottom: 5,
                            }}
                          >
                            Role
                          </div>
                          <div style={{ display: "flex", gap: 5 }}>
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

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 7 }}>
                        <button
                          onClick={() => handleReject(req)}
                          disabled={isProcessing}
                          style={{
                            flex: 1,
                            padding: "7px",
                            borderRadius: 7,
                            border: "1.5px solid #fecaca",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#dc2626",
                            fontFamily: "Poppins,sans-serif",
                          }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={isProcessing || sel.calendars.length === 0}
                          style={{
                            flex: 2,
                            padding: "7px",
                            borderRadius: 7,
                            border: "none",
                            background:
                              isProcessing || sel.calendars.length === 0
                                ? "#93c5fd"
                                : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                            cursor:
                              isProcessing || sel.calendars.length === 0
                                ? "not-allowed"
                                : "pointer",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "white",
                            fontFamily: "Poppins,sans-serif",
                          }}
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
