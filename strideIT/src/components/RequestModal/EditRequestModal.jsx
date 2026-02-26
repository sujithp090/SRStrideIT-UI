import { useState } from "react";
import { ModalChrome } from "./ModalChrome";

// ── Edit Request Modal (click on scheduled event) ──────────────────────────────
export function EditRequestModal({ event, user, onClose, onDelete, onUpdate }) {
  if (!event) return null;

  const [candidate, setCandidate] = useState(event.candidate);
  const [company, setCompany] = useState(event.company);
  const [round, setRound] = useState(event.round);
  const [customRound, setCustomRound] = useState(
    event.round && !["L1", "L2", "Client round"].includes(event.round)
      ? event.round
      : "",
  );
  const [startDate, setStartDate] = useState(
    event.start.toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState(
    event.start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );
  const [endDate, setEndDate] = useState(event.end.toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState(
    event.end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

  const handleUpdate = () => {
    const updatedEvent = {
      ...event,
      candidate,
      company,
      round: round === "Custom" ? customRound : round,
      startDate,
      startTime,
      endDate,
      endTime,
      start: new Date(startDate + "T" + startTime),
      end: new Date(endDate + "T" + endTime),
    };
    onUpdate && onUpdate(updatedEvent);
    onClose();
  };

  return (
    <ModalChrome onClose={onClose}>
      <div className="modal-body">
        <div className="modal-header-wrapper">
          <div className="modal-section-header">
            <div className="modal-section-icon">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <span className="modal-section-title">Edit Interview Request</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Event image */}
        {event.image && (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={event.image}
              alt="event"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        {/* Read-only fields */}
        <div className="modal-field">
          <label className="modal-label">Candidate Name</label>
          <input
            type="text"
            className="modal-input"
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            placeholder="e.g. Alice Johnson"
          />
        </div>

        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Company</label>
            <input
              type="text"
              className="modal-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Round</label>
            <select
              className="modal-select"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            >
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="Client round">Client round</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>

        {round === "Custom" && (
          <div className="modal-field">
            <label className="modal-label">Custom Round</label>
            <input
              type="text"
              className="modal-input"
              value={customRound}
              onChange={(e) => setCustomRound(e.target.value.slice(0, 10))}
              placeholder="Enter custom round name"
              maxLength="10"
            />
          </div>
        )}

        {/* Editable date and time fields */}
        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Start Date</label>
            <input
              type="date"
              className="modal-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Start Time</label>
            <input
              type="time"
              className="modal-input"
              value={startTime}
              step="900"
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">End Date</label>
            <input
              type="date"
              className="modal-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">End Time</label>
            <input
              type="time"
              className="modal-input"
              value={endTime}
              step="900"
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Footer buttons */}
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
          <button className="btn-submit" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>
    </ModalChrome>
  );
}
