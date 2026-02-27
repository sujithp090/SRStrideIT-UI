import { useState } from "react";
import { ModalChrome } from "./ModalChrome";

const toDateInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const todayStr = toDateInput(new Date());

export function BlockSlotModal({ onClose, onSave, blockedSlots = [] }) {
  const [mode, setMode] = useState("range"); // "range" | "day"
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [calendar, setCalendar] = useState("boys");

  const handleSave = () => {
    setError("");
    if (!date) return setError("Please select a date.");
    if (mode === "range") {
      if (!startTime || !endTime)
        return setError("Please set both start and end times.");
      if (startTime >= endTime)
        return setError("End time must be after start time.");
    }
    const block = {
      id: `block-${Date.now()}`,
      calendar,
      date,
      mode,
      startTime: mode === "range" ? startTime : "00:00",
      endTime: mode === "range" ? endTime : "23:59",
      label: label || (mode === "day" ? "Full day blocked" : "Blocked"),
    };
    onSave(block);
    onClose();
  };

  return (
    <ModalChrome onClose={onClose}>
      <style>{`
        .block-modal-tabs {
          display: flex; gap: 6px; margin-bottom: 18px;
        }
        .block-modal-tab {
          flex: 1; padding: 8px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          color: #475569; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .block-modal-tab.active {
          background: #fef2f2; color: #dc2626; border-color: #fca5a5;
        }
        .block-error {
          background: #fef2f2; border: 1.5px solid #fca5a5;
          border-radius: 10px; padding: 10px 14px;
          font-size: 12.5px; color: #dc2626; margin-bottom: 14px;
        }
        .block-existing {
          margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 14px;
        }
        .block-existing-title {
          font-size: 11.5px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .block-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px; border-radius: 8px; background: #fff5f5;
          border: 1px solid #fecaca; margin-bottom: 6px;
        }
        .block-item-info { font-size: 12.5px; color: #991b1b; }
        .block-item-label { font-weight: 600; margin-bottom: 2px; }
        .block-item-time { font-size: 11.5px; color: #b91c1c; }
        .block-item-del {
          background: none; border: none; cursor: pointer;
          color: #ef4444; padding: 4px; border-radius: 4px;
          display: flex; align-items: center;
        }
        .block-item-del:hover { background: #fee2e2; }
      `}</style>

      <div className="modal-body">
        {/* Header */}
        <div className="modal-header-wrapper">
          <div className="modal-section-header">
            <div
              className="modal-section-icon"
              style={{ background: "#fef2f2" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            </div>
            <span className="modal-section-title" style={{ color: "#dc2626" }}>
              Block Time Slot
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="block-error">⚠️ {error}</div>}

        {/* Mode tabs */}
        <div className="block-modal-tabs">
          <button
            className={`block-modal-tab ${mode === "range" ? "active" : ""}`}
            onClick={() => setMode("range")}
          >
            🕐 Time Range
          </button>
          <button
            className={`block-modal-tab ${mode === "day" ? "active" : ""}`}
            onClick={() => setMode("day")}
          >
            📅 Entire Day
          </button>
        </div>

        {/* Calendar selector */}
        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Calendar</label>
            <select
              className="modal-input"
              value={calendar}
              onChange={(e) => setCalendar(e.target.value)}
              style={{ appearance: "none" }}
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="modal-field">
            <label className="modal-label">Date *</label>
            <input
              type="date"
              className="modal-input"
              value={date}
              min={todayStr}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
            />
          </div>
        </div>

        {/* Time range fields */}
        {mode === "range" && (
          <div className="modal-input-row">
            <div className="modal-field">
              <label className="modal-label">Start Time *</label>
              <input
                type="time"
                className="modal-input"
                value={startTime}
                step="1800"
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">End Time *</label>
              <input
                type="time"
                className="modal-input"
                value={endTime}
                step="1800"
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>
        )}

        {/* Optional label */}
        <div className="modal-field">
          <label className="modal-label">Reason / Label (optional)</label>
          <input
            className="modal-input"
            placeholder="e.g. Internal meeting, Holiday..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        {/* Existing blocks list */}
        {blockedSlots.length > 0 && (
          <div className="block-existing">
            <div className="block-existing-title">Active Blocks</div>
            {blockedSlots.map((b) => (
              <div key={b.id} className="block-item">
                <div className="block-item-info">
                  <div className="block-item-label">
                    🚫 {b.label} —{" "}
                    {b.calendar === "both" ? "All calendars" : b.calendar}
                  </div>
                  <div className="block-item-time">
                    {b.date}
                    {b.mode === "range" && ` · ${b.startTime} – ${b.endTime}`}
                    {b.mode === "day" && " · Full day"}
                  </div>
                </div>
                <button
                  className="block-item-del"
                  title="Remove block"
                  onClick={() => onSave(null, b.id)}
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-submit"
          style={{ background: "#dc2626" }}
          onClick={handleSave}
          disabled={!date || (mode === "range" && (!startTime || !endTime))}
        >
          🚫 Block Slot
        </button>
      </div>
    </ModalChrome>
  );
}

// ── Helper: check if a proposed booking overlaps a block ──────────────────────
export function checkBlockedSlot(
  blockedSlots,
  calendar,
  date,
  startTime,
  endTime,
) {
  for (const b of blockedSlots) {
    if (b.calendar !== calendar && b.calendar !== "both") continue;
    if (b.date !== date) continue;
    if (b.mode === "day") {
      return `This entire day (${date}) is blocked: "${b.label}". No interviews can be scheduled.`;
    }
    // Range overlap check
    if (startTime < b.endTime && endTime > b.startTime) {
      return `Time slot ${startTime}–${endTime} is blocked (${b.label || "admin block"}). Please choose a different time.`;
    }
  }
  return null;
}
