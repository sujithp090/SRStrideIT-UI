// ── Shared modal chrome ───────────────────────────────────────────────────────
export function ModalChrome({ onClose, children }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">{children}</div>
    </div>
  );
}
