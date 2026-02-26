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
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
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
    <>
      {/* ── Lightbox overlay ── */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img
            src={lightboxImg}
            alt="Preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "88vh",
              borderRadius: "12px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              objectFit: "contain",
            }}
          />
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
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

          <div style={{ marginBottom: "20px" }}>
            {pendingEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                  position: "relative", // ✅ ADD THIS
                }}
              >
                {/* ── Image banner — full width, tall, clickable ── */}
                {event.image ? (
                  <div
                    onClick={() => setLightboxImg(event.image)}
                    style={{
                      width: "100%",
                      height: "180px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      marginBottom: "14px",
                      cursor: "zoom-in",
                      position: "relative",
                      background: "#e2e8f0",
                    }}
                  >
                    <img
                      src={event.image}
                      alt={event.candidate}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* zoom hint */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        background: "rgba(0,0,0,0.45)",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        color: "white",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
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
                  /* No image placeholder */
                  <div
                    style={{
                      width: "100%",
                      height: "72px",
                      borderRadius: "8px",
                      marginBottom: "14px",
                      background: "#fef2f2",
                      border: "1.5px dashed #fca5a5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      color: "#dc2626",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
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
                {/* Calendar Pill */}
                <div
                  style={{
                    position: "absolute",
                    bottpm: "12px",
                    right: "12px",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    background:
                      event.calendar === "boys"
                        ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                        : "linear-gradient(135deg,#ec4899,#be185d)",
                    color: "#fff",
                    boxShadow:
                      event.calendar === "boys"
                        ? "0 4px 10px rgba(59,130,246,0.35)"
                        : "0 4px 10px rgba(236,72,153,0.35)",
                  }}
                >
                  {event.calendar}
                </div>
                {/* ── Candidate info ── */}
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    {event.candidate}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "3px",
                    }}
                  >
                    {event.company} • {event.round}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "3px",
                    }}
                  >
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

                {/* ── Reject reason textarea ── */}
                {rejectingId === event.id && (
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
                )}

                {/* ── Action buttons ── */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {rejectingId === event.id ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
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
                          background: rejectReason.trim()
                            ? "#ef4444"
                            : "#fca5a5",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: rejectReason.trim()
                            ? "pointer"
                            : "not-allowed",
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
    </>
  );
}
