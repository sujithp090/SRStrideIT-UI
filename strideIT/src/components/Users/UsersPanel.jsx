import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersPanel({ onClose, notify = () => {} }) {
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
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      notify("Failed to delete user.", "error");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    notify(`User deleted: ${deleteTarget.name}.`, "error");
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="users-panel-overlay" onClick={onClose} />

      <div className="users-panel-drawer">
        <div className="users-panel-header">
          <div className="users-panel-header-main">
            <div className="users-panel-icon-wrap">
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
              <div className="users-panel-title">User Management</div>
              <div className="users-panel-subtitle">{users.length} active users</div>
            </div>
          </div>
          <button onClick={onClose} className="users-panel-close-btn">
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

        <div className="users-panel-list-wrap">
          {loading ? (
            <div className="users-panel-empty-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="users-panel-empty-state">No active users yet.</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="users-panel-user-card">
                <div
                  className={`users-panel-avatar ${
                    u.role === "admin"
                      ? "users-panel-avatar-admin"
                      : "users-panel-avatar-user"
                  }`}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="users-panel-user-meta">
                  <div className="users-panel-user-name-row">
                    <span className="users-panel-user-name">{u.name}</span>
                    <span
                      className={`users-panel-role-pill ${
                        u.role === "admin"
                          ? "users-panel-role-pill-admin"
                          : "users-panel-role-pill-user"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="users-panel-username">@{u.username || "—"}</div>
                  <div className="users-panel-email">{u.email}</div>
                  <div className="users-panel-calendars">
                    {(u.calendars || ["boys"]).map((c) => c.toUpperCase()).join(" • ")}
                  </div>
                </div>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => setDeleteTarget(u)}
                    className="users-panel-delete-btn"
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
        <div className="users-panel-delete-overlay">
          <div className="users-panel-delete-modal">
            <div className="users-panel-delete-title">Delete User?</div>
            <div className="users-panel-delete-text">
              <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) will be
              removed and lose access immediately.
            </div>
            <div className="users-panel-delete-actions">
              <button
                onClick={() => setDeleteTarget(null)}
                className="users-panel-delete-cancel"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="users-panel-delete-confirm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
