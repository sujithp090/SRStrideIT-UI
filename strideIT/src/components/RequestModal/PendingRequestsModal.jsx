import { useState } from "react";
import { ModalChrome } from "./ModalChrome";

// ── Pending Requests Modal ─────────────────────────────────────────────────────
export function PendingRequestsModal({
  pendingEvents,
  onClose,
  onApprove,
  onReject,
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

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
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              No Pending Requests
            </div>
            <div style={{ fontSize: "14px", color: "#64748b" }}>
              All requests have been reviewed.
            </div>
          </div>
        </div>
      </ModalChrome>
    );
  }

  return (
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

        <div style={{ marginBottom: "20px" }}>
          {pendingEvents.map((event) => (
            <div
              key={event.id}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    {event.candidate}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    {event.company} • {event.round}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    {event.start.toLocaleDateString()} -{" "}
                    {event.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {event.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.candidate}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "6px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {rejectingId === event.id ? (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontFamily: "Poppins, sans-serif",
                      resize: "vertical",
                      minHeight: "80px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                {rejectingId === event.id ? (
                  <>
                    <button
                      onClick={() => setRejectingId(null)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        color: "#475569",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: rejectReason.trim() ? "#ef4444" : "#fca5a5",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                        color: "#fff",
                      }}
                    >
                      Confirm Rejection
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onApprove && onApprove(event)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "#16a34a",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(event.id)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "#f1f5f9",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        color: "#dc2626",
                      }}
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
          <div style={{ flex: 1 }} />
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </ModalChrome>
  );
}
