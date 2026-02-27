import { useState, useRef } from "react";
import { ModalChrome } from "./ModalChrome";
import { getRestrictedCompanyInfo } from "../LogsPage/RestrictedCompanyPage";

const toTimeInput = (d) => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const toDateInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export function NewRequestModal({
  onClose,
  onSubmit,
  selectedTimeSlot,
  calendar,
}) {
  const [roundOpen, setRoundOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const isValidDate =
    selectedTimeSlot instanceof Date && !isNaN(selectedTimeSlot);
  const slotStart = isValidDate ? selectedTimeSlot : null;
  const slotEnd = slotStart
    ? new Date(slotStart.getTime() + 30 * 60 * 1000)
    : null;

  const [candidate, setCandidate] = useState("");
  const [date, setDate] = useState(slotStart ? toDateInput(slotStart) : "");
  const [startTime, setStart] = useState(
    slotStart ? toTimeInput(slotStart) : "",
  );
  const [endTime, setEnd] = useState(slotEnd ? toTimeInput(slotEnd) : "");
  const [company, setCompany] = useState("");
  const [round, setRound] = useState("L1");
  const [customRound, setCustomRound] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState("");
  const fileRef = useRef();

  // Restricted company check — live as user types
  const restrictedInfo = getRestrictedCompanyInfo(company);

  const handleFile = (f) => f && setFile(f);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!candidate || !date || !company || !startTime || !endTime) return;
    setConflictError("");
    setSubmitting(true);

    const result = await onSubmit({
      candidate,
      company,
      round: round === "Custom" ? customRound : round,
      calendar,
      date,
      startTime,
      endTime,
      image: file ? URL.createObjectURL(file) : null,
      status: "pending",
      title: `Interview - ${candidate}`,
      start: new Date(`${date}T${startTime}`),
      end: new Date(`${date}T${endTime}`),
    });

    setSubmitting(false);

    if (result?.error) {
      setConflictError(result.error);
      return;
    }

    setSubmitted(true);
  };

  const roundColor =
    round === "L1"
      ? "#3b82f6"
      : round === "L2"
        ? "#10b981"
        : round === "Client round"
          ? "#f97316"
          : "#7f1d1d";

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
      <style>{`
        .modal-input-wrap { position: relative; display: block; }
        .modal-input-wrap .modal-input { width: 100%; padding-right: 36px; }
        .modal-input-wrap .modal-input[type="date"]::-webkit-calendar-picker-indicator,
        .modal-input-wrap .modal-input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0; position: absolute; right: 0; width: 36px; height: 100%; cursor: pointer;
        }
        .modal-input-icon {
          position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%); display: flex; align-items: center; pointer-events: none;
        }
        .modal-select {
          appearance: none; -webkit-appearance: none; -moz-appearance: none;
          padding-right: 36px; border-left: 4px solid var(--round-color, #3b82f6);
          cursor: pointer; width: 100%;
        }
        .modal-chevron {
          position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%) rotate(0deg);
          transform-origin: 50% 50%;
          transition: transform 0.2s ease;
          display: flex; align-items: center; pointer-events: none;
        }
        .modal-input-wrap.open .modal-chevron {
          transform: translateY(-50%) rotate(180deg);
        }
        .modal-conflict-error {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          border-radius: 10px;
          padding: 12px 14px;
          margin: 0 0 14px 0;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #dc2626;
          font-family: Poppins, sans-serif;
          line-height: 1.5;
        }
        .modal-conflict-error svg { flex-shrink: 0; margin-top: 1px; }

        @keyframes warnSlideIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-restricted-warn {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          animation: warnSlideIn 0.18s ease;
          margin-bottom: 12px;
        }
        .modal-restricted-warn-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 3px;
        }
        .modal-restricted-warn-reason {
          font-size: 12px;
          color: #b91c1c;
          line-height: 1.5;
        }
        .modal-restricted-warn-exempt {
          font-size: 11.5px;
          color: #6b7280;
          margin-top: 5px;
          font-style: italic;
        }
        .modal-input--restricted {
          border-color: #fca5a5 !important;
          background: #fff8f8 !important;
        }
      `}</style>

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
            <span className="modal-section-title">New Interview Request</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Conflict / time error banner ── */}
        {conflictError && (
          <div className="modal-conflict-error">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{conflictError}</span>
          </div>
        )}

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

        {/* Date + Start Time */}
        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Date *</label>
            <div className="modal-input-wrap">
              <input
                type="date"
                className="modal-input"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setConflictError("");
                }}
                required
              />
              <span className="modal-input-icon">
                <CalendarIcon />
              </span>
            </div>
          </div>
          <div className="modal-field">
            <label className="modal-label">Start Time *</label>
            <div className={`modal-input-wrap${startOpen ? " open" : ""}`}>
              <input
                type="time"
                className="modal-input"
                value={startTime}
                step="1800"
                onChange={(e) => {
                  setStart(e.target.value);
                  setConflictError("");
                }}
                required
                onFocus={() => setStartOpen(true)}
                onBlur={() => setStartOpen(false)}
              />
              <span className="modal-chevron">
                <ChevronIcon />
              </span>
            </div>
          </div>
        </div>

        {/* End Time */}
        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">End Time *</label>
            <div className={`modal-input-wrap${endOpen ? " open" : ""}`}>
              <input
                type="time"
                className="modal-input"
                value={endTime}
                step="1800"
                onChange={(e) => {
                  setEnd(e.target.value);
                  setConflictError("");
                }}
                required
                onFocus={() => setEndOpen(true)}
                onBlur={() => setEndOpen(false)}
              />
              <span className="modal-chevron">
                <ChevronIcon />
              </span>
            </div>
          </div>
        </div>

        {/* Candidate + Company */}
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

          {/* ── Company field with live restricted-company check ── */}
          <div className="modal-field">
            <label className="modal-label">Company *</label>
            <input
              className={`modal-input${restrictedInfo ? " modal-input--restricted" : ""}`}
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setConflictError("");
              }}
            />
          </div>
        </div>
        {restrictedInfo && (
          <div className="modal-restricted-warn">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ flexShrink: 0, marginTop: 2 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <div className="modal-restricted-warn-title">
                Restricted Company
              </div>
              <div className="modal-restricted-warn-reason">
                <strong>{restrictedInfo.name}</strong> — {restrictedInfo.reason}
                . Do not schedule interviews for this company.
              </div>
              <div className="modal-restricted-warn-exempt">
                Genuine candidates who have already cleared the relevant checks
                are exempted. Contact admin if unsure.
              </div>
            </div>
          </div>
        )}

        {/* Round */}
        <div className="modal-input-row">
          <div className="modal-field">
            <label className="modal-label">Round *</label>
            <div
              className={`modal-input-wrap${roundOpen ? " open" : ""}`}
              style={{ "--round-color": roundColor }}
            >
              <select
                className="modal-input modal-select"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                onFocus={() => setRoundOpen(true)}
                onBlur={() => setRoundOpen(false)}
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="Client round">Client round</option>
                <option value="Custom">Custom</option>
              </select>
              <span className="modal-chevron">
                <ChevronIcon />
              </span>
            </div>
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
            submitting ||
            !candidate ||
            !date ||
            !startTime ||
            !endTime ||
            !company ||
            (round === "Custom" && !customRound)
          }
        >
          {submitting ? "Checking..." : "Submit Request"}
        </button>
      </div>
    </ModalChrome>
  );
}
