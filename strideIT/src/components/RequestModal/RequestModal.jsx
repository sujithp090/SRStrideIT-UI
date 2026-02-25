import { useState, useRef } from "react";

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
export function NewRequestModal({ onClose, onSubmit, selectedTimeSlot }) {
  const isValidDate = selectedTimeSlot && selectedTimeSlot instanceof Date;

  const initDate = isValidDate
    ? selectedTimeSlot.toISOString().split("T")[0]
    : "";
  const initTime = isValidDate
    ? selectedTimeSlot.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "10:00";

  const [candidate, setCandidate] = useState("");
  const [date, setDate] = useState(initDate);
  const [startTime, setStart] = useState(initTime);
  const [endTime, setEnd] = useState(
    isValidDate
      ? new Date(selectedTimeSlot.getTime() + 1800000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "10:30",
  );
  const [company, setCompany] = useState("");
  const [round, setRound] = useState("L1");
  const [customRound, setCustomRound] = useState("");
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
    if (!candidate || !date || !company) return;
    setSubmitted(true);
    onSubmit &&
      onSubmit({
        candidate,
        company,
        round: round === "Custom" ? customRound : round,
        date,
        startTime,
        endTime,
        image: file ? URL.createObjectURL(file) : null,
        status: "pending",
        title: `Interview - ${candidate}`,
        start: new Date(date + "T" + startTime),
        end: new Date(date + "T" + endTime),
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
            <div className="modal-upload-text">Drop images here</div>
            <div className="modal-upload-sub">
              or <span className="modal-upload-link">browse files</span> (JPG,
              PNG, GIF, WebP, up to 10 MB)
            </div>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
            <label className="modal-label">Company *</label>
            <input
              className="modal-input"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Round *</label>
            <select
              className="modal-input"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              style={{
                borderLeft: `4px solid ${
                  round === "L1"
                    ? "#3b82f6"
                    : round === "L2"
                      ? "#10b981"
                      : round === "Client round"
                        ? "#f97316"
                        : "#7f1d1d"
                }`,
              }}
            >
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="Client round">Client round</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          {round === "Custom" && (
            <div className="modal-field">
              <label className="modal-label">Custom Round *</label>
              <input
                className="modal-input"
                placeholder="Max 10 chars"
                maxLength="10"
                value={customRound}
                onChange={(e) => setCustomRound(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={
            !candidate ||
            !date ||
            !company ||
            (round === "Custom" && !customRound)
          }
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
  onDelete,
}) {
  if (!event) return null;

  const fmt = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <ModalChrome onClose={onClose}>
      <div className="modal-body">
        <div className="modal-section-header">
          <div className="modal-section-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="modal-section-title">{event.candidate}</span>
        </div>

        {/* Candidate Image */}
        {event.image && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <img
              src={event.image}
              alt={event.candidate}
              style={{
                maxWidth: "150px",
                maxHeight: "150px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Time Display */}
        <div className="modal-detail-row">
          <div className="modal-detail-icon" style={{ background: "#e0f2fe" }}>
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
          </div>
          <div>
            <div className="modal-detail-label">Time</div>
            <div className="modal-detail-value">
              {fmt(event.start)} – {fmt(event.end)}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        {user?.role === "admin" && (
          <button
            className="btn-delete"
            onClick={() => {
              if (
                window.confirm(`Delete appointment for ${event.candidate}?`)
              ) {
                onDelete && onDelete(event);
                onClose();
              }
            }}
          >
            🗑️ Delete
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </ModalChrome>
  );
}
