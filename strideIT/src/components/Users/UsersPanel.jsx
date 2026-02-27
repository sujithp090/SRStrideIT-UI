import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersPanel({ onClose }) {
  const [tab, setTab] = useState("active"); // "active" | (no pending tab — pending is in navbar)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUserId(data.user.id);
    };
    getCurrentUser();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, username, calendars, created_at")
      .order("created_at", { ascending: false });
    if (!error) setUsers(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("profiles").delete().eq("id", deleteTarget.id);
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(15,39,68,0.45)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          width: 480,
          maxWidth: "100vw",
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(15,39,68,0.18)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) both",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <style>{`
          @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>

        {/* Header */}
        <div
          style={{
            background: "#0f2744",
            color: "white",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg,#2563eb,#60a5fa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                User Management
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {users.length} active users
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
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

        {/* User list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              No active users yet.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  marginBottom: 8,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      u.role === "admin"
                        ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                        : "linear-gradient(135deg,#0f2744,#334155)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#0f172a",
                      }}
                    >
                      {u.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 7px",
                        borderRadius: 20,
                        background: u.role === "admin" ? "#dbeafe" : "#f1f5f9",
                        color: u.role === "admin" ? "#1d4ed8" : "#64748b",
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#3b82f6",
                      fontWeight: 600,
                      marginBottom: 1,
                    }}
                  >
                    @{u.username || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.email}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#0ea5e9",
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {(u.calendars || ["boys"])
                      .map((c) => c.toUpperCase())
                      .join(" • ")}
                  </div>
                </div>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => setDeleteTarget(u)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Delete user"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: 360,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Delete User?
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) will
              be removed and lose access immediately.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#475569",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
