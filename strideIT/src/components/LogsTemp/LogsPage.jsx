import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LogsPage({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("performed_at", { ascending: false });

    if (!error) setLogs(data || []);
    setLoading(false);
  };

  const getBadgeClass = (action) => {
    return `badge badge-${action}`;
  };

  // ✅ Smart Details Formatter
  const formatDetails = (log) => {
    if (!log) return "";

    const meta = log.metadata || {};
    const formatIST = (date) =>
      date
        ? new Date(date).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

    switch (log.action) {
      case "created":
        return `Interview scheduled for ${meta.candidate}
in ${meta.calendar} sheet
on ${formatIST(meta.start_time)} – ${formatIST(meta.end_time)}
with ${meta.company}`;

      case "approved":
        return `Interview approved for ${meta.candidate}
(${meta.calendar})
${formatIST(meta.start_time)} – ${formatIST(meta.end_time)}`;

      case "rejected":
        return `Interview rejected for ${meta.candidate}
(${meta.calendar})
Reason: ${meta.reason || "No reason provided"}`;

      case "updated":
        return `Interview rescheduled for ${meta.candidate}
From: ${formatIST(meta.old_start)} – ${formatIST(meta.old_end)}
To: ${formatIST(meta.new_start)} – ${formatIST(meta.new_end)}`;

      case "deleted":
        return `Interview deleted for ${meta.candidate}
(${meta.calendar})
${formatIST(meta.start_time)} – ${formatIST(meta.end_time)}`;

      case "login":
        return `User logged into system`;

      case "logout":
        return `User logged out`;
    }
  };

  const formatMumbaiTime = (dateString) => {
    if (!dateString) return "";

    // Force UTC interpretation
    const utcDate = new Date(dateString + "Z");

    return utcDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  if (loading) {
    return (
      <div className="logs-wrapper">
        <div className="logs-card">
          <div className="logs-loading">Loading activity logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-wrapper">
      <div className="logs-card">
        <div className="logs-header">
          <div>
            <div className="logs-title">Activity Logs</div>
            <div className="logs-subtitle">
              Complete system activity history
            </div>
          </div>

          <button
            onClick={onClose}
            className="logs-close-btn"
            title="Close Logs"
          >
            ✕
          </button>
        </div>

        <div className="logs-table">
          <div className="logs-row logs-head">
            <div>Time</div>
            <div>Action</div>
            <div>User</div>
            <div>Details</div>
          </div>

          {logs.length === 0 && (
            <div className="logs-empty">No activity recorded yet.</div>
          )}

          {logs.map((log) => (
            <div key={log.id} className="logs-row">
              <div className="logs-time">
                {formatMumbaiTime(log.performed_at)}
              </div>

              <div>
                <span className={getBadgeClass(log.action)}>{log.action}</span>
              </div>

              <div className="logs-user">{log.performed_by}</div>

              <div className="logs-meta">{formatDetails(log)}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .logs-wrapper {
          height: 100%;
          width: 100%;
          padding: 24px 32px;
          background: #f8fafc;
          box-sizing: border-box;
        }

        .logs-card {
          height: 100%;
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .logs-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logs-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
        }

        .logs-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        /* ✅ Improved Close Button */
        .logs-close-btn {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          transition: all 0.2s ease;
        }

        .logs-close-btn:hover {
          background: #e2e8f0;
          transform: rotate(90deg);
        }

        .logs-table {
          flex: 1;
          overflow-y: auto;
        }

        .logs-row {
          display: grid;
          grid-template-columns: 220px 140px 180px minmax(300px, 1fr);
          column-gap: 28px; /* ✅ Proper spacing between columns */
          padding: 18px 28px; /* ✅ More breathing space */
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
        }
        .logs-row > div:not(:last-child) {
          border-right: 1px solid #f1f5f9;
          padding-right: 20px;
        }

        .logs-row:hover {
          background: #f8fafc;
        }

        .logs-head {
          background: #f8fafc;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #334155;
          position: sticky;
          top: 0;
          z-index: 2;
          padding: 16px 28px; /* match body padding */
        }

        .logs-time {
          font-size: 12px;
          color: #64748b;
        }

        .logs-user {
          font-weight: 500;
          color: #0f172a;
        }

        .logs-meta {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          padding-right: 12px; /* keeps text away from edge */
        }

        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .badge-created {
          background: #e0f2fe;
          color: #0369a1;
        }
        .badge-approved {
          background: #dcfce7;
          color: #15803d;
        }
        .badge-rejected {
          background: #fee2e2;
          color: #b91c1c;
        }
        .badge-deleted {
          background: #f1f5f9;
          color: #475569;
        }
        .badge-login {
          background: #ede9fe;
          color: #6d28d9;
        }
        .badge-updated {
          background: #fef3c7;
          color: #b45309;
        }

        .logs-empty,
        .logs-loading {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
