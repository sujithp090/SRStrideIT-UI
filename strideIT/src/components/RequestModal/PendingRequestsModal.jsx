import { useState } from "react";
import { ModalChrome } from "./ModalChrome";

export function PendingRequestsModal({
  pendingEvents,
  onClose,
  onApprove,
  onReject,
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject && onReject(rejectingId, rejectReason);
    setRejectingId(null);
    setRejectReason("");
  };

  if (!pendingEvents || pendingEvents.length === 0) {
    return (
      <ModalChrome onClose={onClose}>
        <div className="modal-body">
          <div className="pending-empty-wrap">
            <div className="pending-empty-title">No Pending Requests</div>
            <div className="pending-empty-sub">All requests have been reviewed.</div>
          </div>
        </div>
      </ModalChrome>
    );
  }

  return (
    <>
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} className="pending-lightbox">
          <img src={lightboxImg} alt="Preview" className="pending-lightbox-img" />
          <button
            onClick={() => setLightboxImg(null)}
            className="pending-lightbox-close"
          >
            ×
          </button>
        </div>
      )}

      <ModalChrome onClose={onClose}>
        <div className="modal-body">
          <div className="modal-header-wrapper">
            <div className="modal-section-header">
              <div className="modal-section-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="modal-section-title">
                Pending Requests ({pendingEvents.length})
              </span>
            </div>
            <button className="btn-close-modal" onClick={onClose}>
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="pending-list-wrap">
            {pendingEvents.map((event) => (
              <div key={event.id} className="pending-card">
                {event.image ? (
                  <div
                    onClick={() => setLightboxImg(event.image)}
                    className="pending-image-wrap"
                  >
                    <img src={event.image} alt={event.candidate} className="pending-image" />
                    <div className="pending-zoom-hint">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Click to expand
                    </div>
                  </div>
                ) : (
                  <div className="pending-no-image">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    No image uploaded
                  </div>
                )}

                <div
                  className={`pending-calendar-pill ${
                    event.calendar === "boys"
                      ? "pending-calendar-pill-boys"
                      : "pending-calendar-pill-girls"
                  }`}
                >
                  {event.calendar}
                </div>

                <div className="pending-candidate-wrap">
                  <div className="pending-candidate-name">{event.candidate}</div>
                  <div className="pending-candidate-meta">{event.company} • {event.round}</div>
                  <div className="pending-candidate-meta">
                    {event.start.toLocaleDateString()} &nbsp;
                    {event.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {event.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {rejectingId === event.id && (
                  <div className="pending-reject-box">
                    <label className="pending-reject-label">Rejection Reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="pending-reject-textarea"
                    />
                  </div>
                )}

                <div className="pending-actions">
                  {rejectingId === event.id ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="pending-btn pending-btn-cancel"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={!rejectReason.trim()}
                        className={`pending-btn pending-btn-confirm ${
                          rejectReason.trim() ? "" : "pending-btn-confirm-disabled"
                        }`}
                      >
                        Confirm Rejection
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onApprove && onApprove(event)}
                        className="pending-btn pending-btn-approve"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(event.id)}
                        className="pending-btn pending-btn-remove"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <div className="modal-flex-spacer" />
            <button className="btn-cancel" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </ModalChrome>
    </>
  );
}
