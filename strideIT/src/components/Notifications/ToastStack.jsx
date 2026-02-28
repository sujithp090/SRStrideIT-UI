const TYPE_ICON = {
  success: "✓",
  error: "✕",
  info: "i",
};

export default function ToastStack({ notifications = [], onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
      {notifications.map((item) => {
        const type = item.type || "info";

        return (
          <div key={item.id} className={`toast-item toast-item-${type}`}>
            <div className="toast-item-body">
              <span className="toast-item-icon" aria-hidden="true">
                {TYPE_ICON[type] || TYPE_ICON.info}
              </span>
              <div className="toast-item-message">{item.message}</div>
            </div>
            <button
              className="toast-item-close"
              onClick={() => onDismiss(item.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
