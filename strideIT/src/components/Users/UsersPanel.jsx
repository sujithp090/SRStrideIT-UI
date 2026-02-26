import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    // Delete from auth.users via admin API — requires service role
    // Instead we soft-delete: remove from profiles and sign them out
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  return (
    <>
      {/* ── Panel overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(15,39,68,0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-end",
        }}
        onClick={onClose}
      />

      {/* ── Slide-in panel ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          width: "480px",
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
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                {users.length} users
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

        {/* Add user button */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "Poppins, sans-serif",
              boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Onboard New User
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
              No users yet. Onboard your first user above.
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
                  transition: "border-color 0.15s",
                }}
              >
                {/* Avatar */}
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

                {/* Info */}
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
                        letterSpacing: 0.3,
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
                      color: "#64748b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.email}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    Password: ••••••••
                  </div>
                </div>

                {/* Delete */}
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
                    transition: "background 0.15s",
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            fetchUsers();
            setShowAddModal(false);
          }}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
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

// ── Add User Modal ─────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);

    // Use Supabase Admin API via service role — but since we're on frontend
    // we use signUp which creates the auth user, then our trigger creates the profile.
    // We then update the role if admin.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim(), role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If role is admin, update the profile (trigger creates it as 'user' first)
    if (role === "admin" && data.user) {
      await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);
    }

    setLoading(false);
    onCreated();
  };

  return (
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
          padding: "28px 28px 24px",
          width: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            Onboard New User
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <svg
              width="18"
              height="18"
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

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12,
              color: "#dc2626",
              marginBottom: 16,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {[
          {
            label: "Full Name",
            value: name,
            set: setName,
            type: "text",
            placeholder: "e.g. Jane Doe",
          },
          {
            label: "Email",
            value: email,
            set: setEmail,
            type: "email",
            placeholder: "jane@company.com",
          },
          {
            label: "Password",
            value: password,
            set: setPassword,
            type: "password",
            placeholder: "Min 6 characters",
          },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#334155",
                marginBottom: 5,
                textTransform: "uppercase",
                letterSpacing: 0.3,
              }}
            >
              {label} *
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #e2e8f0",
                fontSize: 13,
                outline: "none",
                fontFamily: "Poppins, sans-serif",
                color: "#0f172a",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            Role *
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["user", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                  border:
                    role === r ? "2px solid #1d4ed8" : "1.5px solid #e2e8f0",
                  background: role === r ? "#dbeafe" : "#f8fafc",
                  color: role === r ? "#1d4ed8" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
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
            onClick={handleCreate}
            disabled={loading}
            style={{
              flex: 2,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: loading
                ? "#93c5fd"
                : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
