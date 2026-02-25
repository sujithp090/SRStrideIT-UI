import { useState } from "react";
import "./Calender.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 8; // 8 AM → 7 PM
  if (h === 12) return "12:00 PM";
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
});

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getWeekDays(anchor) {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay()); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ── Sample events ─────────────────────────────────────────────────────────────
// dayOffset is relative to today (0 = today, 1 = tomorrow, -1 = yesterday)
function buildSampleEvents(today) {
  const mkDate = (offset, h, m = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(h, m, 0, 0);
    return d;
  };
  return [
    {
      id: 1,
      title: "Frontend Interview",
      candidate: "Alice Johnson",
      status: "pending",
      start: mkDate(-1, 10),
      end: mkDate(-1, 11),
      interviewer: "Bob Smith",
      room: "Room A",
    },
    {
      id: 2,
      title: "Backend Interview",
      candidate: "Carlos Lee",
      status: "confirmed",
      start: mkDate(0, 14),
      end: mkDate(0, 15),
      interviewer: "Diana Prince",
      room: "Room B",
    },
    {
      id: 3,
      title: "Design Review",
      candidate: "Emily Wang",
      status: "approved",
      start: mkDate(1, 11),
      end: mkDate(1, 12, 30),
      interviewer: "Frank Miller",
      room: "Room C",
    },
    {
      id: 4,
      title: "HR Screening",
      candidate: "Grace Kim",
      status: "pending",
      start: mkDate(2, 9),
      end: mkDate(2, 9, 30),
      interviewer: "Henry Ford",
      room: "Zoom",
    },
    {
      id: 5,
      title: "Technical Round",
      candidate: "Ivan Petrov",
      status: "confirmed",
      start: mkDate(3, 16),
      end: mkDate(3, 17, 30),
      interviewer: "Julia Chen",
      room: "Room D",
    },
  ];
}

// ── CalendarView ─────────────────────────────────────────────────────────────
export default function CalendarView({
  user,
  onLogout,
  onRequestClick,
  onEventClick,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [anchor, setAnchor] = useState(new Date(today));
  const [view, setView] = useState("Week");
  const events = buildSampleEvents(today);
  const weekDays = getWeekDays(anchor);

  const prevWeek = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - 7);
    setAnchor(d);
  };
  const nextWeek = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + 7);
    setAnchor(d);
  };
  const goToday = () => setAnchor(new Date(today));

  // Events for a given day + hour cell
  const getEvents = (day, hourIdx) => {
    const cellHour = hourIdx + 8; // 8 AM base
    return events.filter((ev) => {
      if (!isSameDay(ev.start, day)) return false;
      return ev.start.getHours() === cellHour;
    });
  };

  const eventHeightPx = (ev) => {
    const mins = (ev.end - ev.start) / 60000;
    return Math.max(36, (mins / 60) * 60 - 4);
  };

  // Pending count for navbar badge
  const pendingCount = events.filter((e) => e.status === "pending").length;

  return (
    <div className="cal-root">
      {/* ── Navbar ── */}
      <div className="cal-navbar">
        <div className="cal-navbar-brand">
          <div className="cal-navbar-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="cal-navbar-title">Interview Approval App</span>
        </div>
        <div className="cal-navbar-spacer" />
        {user?.role === "admin" && (
          <button className="cal-navbar-pill">
            <span className="dot" />
            {pendingCount} pending requests
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button className="cal-navbar-pill" onClick={onLogout}>
          🔒 Log Out
        </button>
      </div>

      <div className="cal-shell">
        {/* ── Sidebar ── */}
        <div className="cal-sidebar">
          <button className="cal-sidebar-btn active" title="Calendar">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          <button className="cal-sidebar-btn" title="Requests">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </button>
          <button className="cal-sidebar-btn" title="People">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
          <button className="cal-sidebar-btn" title="Settings">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* ── Main ── */}
        <div className="cal-main">
          {/* Calendar header */}
          <div className="cal-header">
            <button
              className="cal-nav-btn"
              onClick={prevWeek}
              title="Previous week"
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="cal-nav-btn"
              onClick={nextWeek}
              title="Next week"
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
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <span className="cal-header-month">
              {MONTH_NAMES[weekDays[0].getMonth()]}
              {weekDays[0].getMonth() !== weekDays[6].getMonth() &&
                ` – ${MONTH_NAMES[weekDays[6].getMonth()]}`}
            </span>
            <span className="cal-header-year">{weekDays[0].getFullYear()}</span>

            <div className="cal-view-tabs">
              {["Day", "Week", "Month"].map((v) => (
                <button
                  key={v}
                  className={`cal-view-tab ${view === v ? "active" : ""}`}
                  onClick={() => setView(v)}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="cal-header-spacer" />
            <button className="cal-today-btn" onClick={goToday}>
              Today
            </button>
            <button className="cal-request-btn" onClick={onRequestClick}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Request
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="cal-days-header">
            <div />
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`cal-day-label ${
                  isSameDay(day, today) ? "today" : ""
                }`}
              >
                {DAY_NAMES[day.getDay()]} {day.getDate()}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="cal-grid-scroll">
            <div className="cal-grid">
              {HOURS.map((hour, hi) => (
                <>
                  <div key={`label-${hi}`} className="cal-time-label">
                    {hour}
                  </div>
                  {weekDays.map((day, di) => {
                    const cellEvents = getEvents(day, hi);
                    return (
                      <div
                        key={`cell-${hi}-${di}`}
                        className={`cal-cell ${
                          isSameDay(day, today) ? "today-col" : ""
                        }`}
                      >
                        {cellEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`cal-event ${ev.status}`}
                            style={{ top: 2, height: eventHeightPx(ev) }}
                            onClick={() => onEventClick && onEventClick(ev)}
                          >
                            <div className="cal-event-title">{ev.title}</div>
                            <div className="cal-event-time">
                              {ev.start.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              –{" "}
                              {ev.end.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
