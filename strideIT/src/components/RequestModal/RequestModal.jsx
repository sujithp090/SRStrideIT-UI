import { useState, useRef } from "react";
import "./RequestModal.css";

// ── Shared modal chrome ───────────────────────────────────────────────────────
function ModalChrome({ onClose, children }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">
        {/* Top bar */}
        <div className="modal-header-bar">
          <div className="modal-header-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="modal-header-app-name">Interview Approval App</span>
          <button className="btn-close" onClick={onClose}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── New Interview Request Modal ───────────────────────────────────────────────
export function NewRequestModal({ onClose, onSubmit }) {
  const [candidate, setCandidate] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStart] = useState("10:00");
  const [endTime, setEnd] = useState("11:00");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => f && setFile(f);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!candidate || !date) return;
    setSubmitted(true);
    onSubmit &&
      onSubmit({
        candidate,
        interviewer,
        date,
        startTime,
        endTime,
        room,
        notes,
        file,
      });
  };

  const formatDatetime = () => {
    if (!date) return "Select date and time below";
    const d = new Date(date + "T" + startTime);
    const e = new Date(date + "T" + endTime);
    return `${d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}, ${startTime} – ${endTime}`;
  };

  if (submitted) {
    return (
      <ModalChrome onClose={onClose}>
        <div className="modal-success">
          <div className="modal-success-icon">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="modal-success-title">Request Submitted!</div>
          <div className="modal-success-sub">
            Your interview request for <strong>{candidate}</strong> has been
            sent for approval.
          </div>
          <button className="btn-submit" onClick={onClose}>
            Done
          </button>
        </div>
      </ModalChrome>
    );
  }

  return (
    <ModalChrome onClose={onClose}>
      <div className="modal-body">
        {/* Title */}
        <div className="modal-section-header">
          <div className="modal-section-icon">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <span className="modal-section-title">New Interview Request</span>
        </div>

        {/* Upload zone */}
        {!file ? (
          <div
            className={`modal-upload-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="modal-upload-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <div className="modal-upload-text">Drop resume / docs here</div>
            <div className="modal-upload-sub">
              or <span className="modal-upload-link">browse files</span> (PDF,
              DOCX, up to 10 MB)
            </div>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="modal-file-preview">
            <div className="modal-file-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
            <div>
              <div className="modal-file-name">{file.name}</div>
              <div className="modal-file-size">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              className="btn-cancel"
              style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={() => setFile(null)}
            >
              Remove
            </button>
          </div>
        )}

        {/* Date/time display */}
        <div className="modal-field">
          <div className="modal-datetime-display">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="modal-datetime-text">{formatDatetime()}</span>
          </div>
        </div>

        {/* Form fields */}
        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Candidate Name *</label>
            <input
              className="modal-input"
              placeholder="e.g. Alice Johnson"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Interviewer</label>
            <input
              className="modal-input"
              placeholder="e.g. Bob Smith"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Date *</label>
            <input
              className="modal-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Room / Location</label>
            <input
              className="modal-input"
              placeholder="e.g. Room A / Zoom"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Start Time</label>
            <input
              className="modal-input"
              type="time"
              value={startTime}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">End Time</label>
            <input
              className="modal-input"
              type="time"
              value={endTime}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label">Notes</label>
          <input
            className="modal-input"
            placeholder="Any additional context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!candidate || !date}
        >
          Submit Request
        </button>
      </div>
    </ModalChrome>
  );
}

// ── Event Detail Modal (click on calendar event) ──────────────────────────────
export function EventDetailModal({
  event,
  user,
  onClose,
  onApprove,
  onReject,
}) {
  if (!event) return null;

  const fmt = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const dateStr = event.start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ModalChrome onClose={onClose}>
      <div className="modal-body">
        <div className="modal-section-header">
          <div className="modal-section-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="modal-section-title">{event.title}</span>
        </div>

        {/* Status */}
        <div className="modal-status-row">
          <span
            className="modal-detail-label"
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            Status
          </span>
          <span className={`badge ${event.status}`}>
            <span className="badge-dot" />
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        {/* Details */}
        {[
          {
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ),
            bg: "#eff6ff",
            label: "Candidate",
            value: event.candidate,
          },
          {
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
            bg: "#f5f3ff",
            label: "Interviewer",
            value: event.interviewer,
          },
          {
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#0369a1"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
            bg: "#e0f2fe",
            label: "Date",
            value: dateStr,
          },
          {
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#0369a1"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            bg: "#e0f2fe",
            label: "Time",
            value: `${fmt(event.start)} – ${fmt(event.end)}`,
          },
          {
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#0f766e"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            ),
            bg: "#f0fdfa",
            label: "Location",
            value: event.room,
          },
        ].map(({ icon, bg, label, value }) => (
          <div className="modal-detail-row" key={label}>
            <div className="modal-detail-icon" style={{ background: bg }}>
              {icon}
            </div>
            <div>
              <div className="modal-detail-label">{label}</div>
              <div className="modal-detail-value">{value}</div>
            </div>
          </div>
        ))}

        {/* Admin actions */}
        {user?.role === "admin" && event.status === "pending" && (
          <div className="modal-admin-actions">
            <button
              className="btn-approve"
              onClick={() => {
                onApprove(event);
                onClose();
              }}
            >
              ✓ Approve
            </button>
            <button
              className="btn-reject"
              onClick={() => {
                onReject(event);
                onClose();
              }}
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>

      {user?.role !== "admin" && (
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </ModalChrome>
  );
}
