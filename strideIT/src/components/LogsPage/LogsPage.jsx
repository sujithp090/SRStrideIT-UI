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

    </div>
  );
}
