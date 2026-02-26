import { ModalChrome } from "./ModalChrome";

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
