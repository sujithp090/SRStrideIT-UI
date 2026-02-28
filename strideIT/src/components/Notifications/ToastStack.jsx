export default function ToastStack({ notifications = [], onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`toast-item toast-item-${item.type || "info"}`}
        >
          <div className="toast-item-message">{item.message}</div>
          <button
            className="toast-item-close"
            onClick={() => onDismiss(item.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
