import { useState } from "react";
import { PendingRequestsModal } from "../RequestModal/RequestModal";
import UsersPanel from "../Users/UsersPanel";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
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
  start.setDate(anchor.getDate() - anchor.getDay());
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

export default function CalendarView({
  user,
  onLogout,
  onRequestClick,
  onEventClick,
  events = [],
  onUpdateEvents,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [anchor, setAnchor] = useState(new Date(today));
  const [view, setView] = useState("Week");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [activeNav, setActiveNav] = useState("calendar"); // "calendar" | "settings"
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
  const prevMonth = () => {
    const d = new Date(anchor);
    d.setMonth(d.getMonth() - 1);
    setAnchor(d);
  };
  const nextMonth = () => {
    const d = new Date(anchor);
    d.setMonth(d.getMonth() + 1);
    setAnchor(d);
  };

  const handlePrev = () => {
    if (view === "Week") prevWeek();
    else prevMonth();
  };
  const handleNext = () => {
    if (view === "Week") nextWeek();
    else nextMonth();
  };

  const getEvents = (day, hourIdx) => {
    const totalMinutes = 8 * 60 + hourIdx * 30;
    const cellStart = new Date(day);
    cellStart.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
    const cellEnd = new Date(cellStart);
    cellEnd.setMinutes(cellEnd.getMinutes() + 30);
    return events.filter(
      (ev) =>
        isSameDay(ev.start, day) && ev.start < cellEnd && ev.end > cellStart,
    );
  };

  const eventStartsInCell = (ev, hourIdx, day) => {
    const totalMinutes = 8 * 60 + hourIdx * 30;
    const cellStart = new Date(day);
    cellStart.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
    const cellEnd = new Date(cellStart);
    cellEnd.setMinutes(cellEnd.getMinutes() + 30);
    return ev.start >= cellStart && ev.start < cellEnd;
  };

  const shouldMerge = (ev1, ev2) =>
    ev1.candidate === ev2.candidate &&
    ev1.company === ev2.company &&
    ev1.round === ev2.round;

  const getMergedEventEnd = (ev, day, startingHourIdx) => {
    let mergedEnd = ev.end;
    let currentEnd = ev.end;
    let currentHourIdx = startingHourIdx;
    while (currentHourIdx < HOURS.length) {
      currentHourIdx++;
      if (currentHourIdx >= HOURS.length) break;
      const matchingEvent = getEvents(day, currentHourIdx).find(
        (nextEv) =>
          nextEv.start.getTime() === currentEnd.getTime() &&
          shouldMerge(ev, nextEv),
      );
      if (matchingEvent) {
        mergedEnd = matchingEvent.end;
        currentEnd = matchingEvent.end;
      } else break;
    }
    return mergedEnd;
  };

  const pendingCount = events.filter((e) => e.status === "pending").length;

  let daysToDisplay = [];
  if (view === "Week") {
    daysToDisplay = weekDays;
  } else {
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    let current = new Date(start);
    while (current <= lastDay || current.getDay() !== 0) {
      daysToDisplay.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

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
        <button
          className="cal-navbar-pill cal-navbar-pill--primary"
          onClick={() => onRequestClick && onRequestClick(null)}
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Request
        </button>
        {user?.role === "admin" && (
          <button
            className="cal-navbar-pill"
            onClick={() => setShowPendingModal(true)}
          >
            <span className="dot" />
            {pendingCount} pending requests
          </button>
        )}
        <button className="cal-navbar-pill" onClick={onLogout}>
          🔒 Log Out
        </button>
      </div>

      <div className="cal-shell">
        {/* ── Sidebar ── */}
        <div className="cal-sidebar">
          {/* Calendar icon */}
          <button
            className={`cal-sidebar-btn ${activeNav === "calendar" ? "active" : ""}`}
            title="Calendar"
            onClick={() => {
              setActiveNav("calendar");
              setShowUsersPanel(false);
            }}
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>

          {/* Settings / Users icon — admin only */}
          {user?.role === "admin" && (
            <button
              className={`cal-sidebar-btn ${activeNav === "settings" ? "active" : ""}`}
              title="User Management"
              onClick={() => {
                setActiveNav("settings");
                setShowUsersPanel(true);
              }}
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Main calendar ── */}
        <div className="cal-main">
          <div className="cal-header">
            <button className="cal-nav-btn" onClick={handlePrev}>
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
            <button className="cal-nav-btn" onClick={handleNext}>
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
              {view === "Month"
                ? MONTH_NAMES[anchor.getMonth()]
                : daysToDisplay.length > 0
                  ? MONTH_NAMES[daysToDisplay[0].getMonth()]
                  : ""}
              {view === "Month" && ` ${anchor.getFullYear()}`}
              {view !== "Month" &&
                daysToDisplay.length > 1 &&
                daysToDisplay[0].getMonth() !==
                  daysToDisplay[daysToDisplay.length - 1].getMonth() &&
                ` – ${MONTH_NAMES[daysToDisplay[daysToDisplay.length - 1].getMonth()]}`}
            </span>
            <span className="cal-header-year">
              {view !== "Month" &&
                daysToDisplay.length > 0 &&
                daysToDisplay[0].getFullYear()}
            </span>
            <div className="cal-view-tabs">
              {["Week", "Month"].map((v) => (
                <button
                  key={v}
                  className={`cal-view-tab ${view === v ? "active" : ""}`}
                  onClick={() => setView(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="cal-grid-scroll">
            <div className="cal-times-header">
              <div
                className="cal-times-header-corner"
                style={{ width: 120, minWidth: 120 }}
              />
              {HOURS.map((hour, i) => (
                <div key={i} className="cal-time-header-cell">
                  {hour}
                </div>
              ))}
            </div>

            <div className="cal-grid-vertical">
              {daysToDisplay.map((day, dayIdx) => {
                const isCurrentMonth =
                  view !== "Month" || day.getMonth() === anchor.getMonth();
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={dayIdx}
                    className={`cal-day-row ${!isCurrentMonth ? "other-month" : ""}`}
                    style={{
                      gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)`,
                    }}
                  >
                    <div
                      className={`cal-day-row-header ${isToday ? "today" : ""}`}
                    >
                      <div className="cal-day-row-name">
                        {DAY_NAMES[day.getDay()]}
                      </div>
                      <div className="cal-day-row-date">{day.getDate()}</div>
                    </div>
                    {HOURS.map((hour, hourIdx) => {
                      const eventsStartingHere = getEvents(day, hourIdx).filter(
                        (ev) => eventStartsInCell(ev, hourIdx, day),
                      );
                      return (
                        <div
                          key={`cell-${dayIdx}-${hourIdx}`}
                          className={`cal-cell ${isToday ? "today-row" : ""}`}
                        >
                          {eventsStartingHere.map((ev) => {
                            let roundClass = "pending";
                            if (ev.round === "L1") roundClass = "round-l1";
                            else if (ev.round === "L2") roundClass = "round-l2";
                            else if (ev.round === "Client round")
                              roundClass = "round-client";
                            else if (
                              ev.round &&
                              !["L1", "L2", "Client round"].includes(ev.round)
                            )
                              roundClass = "round-custom";

                            const mergedEnd = getMergedEventEnd(
                              ev,
                              day,
                              hourIdx,
                            );
                            const spanCells = Math.max(
                              1,
                              Math.round((mergedEnd - ev.start) / (30 * 60000)),
                            );

                            return (
                              <div
                                key={ev.id}
                                className={`cal-event ${roundClass} ${spanCells > 1 ? "spanning" : ""}`}
                                style={{
                                  gridColumn: `${hourIdx + 2} / span ${spanCells}`,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick && onEventClick(ev);
                                }}
                              >
                                {!ev.image && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 4,
                                      right: 4,
                                      width: 16,
                                      height: 16,
                                      backgroundColor: "#fca5a5",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    title="No image uploaded"
                                  >
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#dc2626"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line
                                        x1="12"
                                        y1="16"
                                        x2="12.01"
                                        y2="16"
                                      />
                                    </svg>
                                  </div>
                                )}
                                <div className="cal-event-title">
                                  {ev.candidate}
                                </div>
                                <div className="cal-event-company">
                                  {ev.company}
                                </div>
                                <div className="cal-event-time">
                                  {ev.start.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" – "}
                                  {mergedEnd.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                {ev.status === "pending" && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: 4,
                                      backgroundColor: "#9ca3af",
                                      borderRadius: "0 0 4px 4px",
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending Modal ── */}
      {showPendingModal && (
        <PendingRequestsModal
          pendingEvents={events.filter((e) => e.status === "pending")}
          onClose={() => setShowPendingModal(false)}
          onApprove={(event) => {
            onUpdateEvents &&
              onUpdateEvents(
                events.map((e) =>
                  e.id === event.id ? { ...e, status: "approved" } : e,
                ),
              );
            setShowPendingModal(false);
          }}
          onReject={(eventId, reason) => {
            onUpdateEvents &&
              onUpdateEvents(
                events.map((e) =>
                  e.id === eventId
                    ? { ...e, status: "rejected", rejectionReason: reason }
                    : e,
                ),
              );
            setShowPendingModal(false);
          }}
        />
      )}

      {/* ── Users Panel ── */}
      {showUsersPanel && (
        <UsersPanel
          onClose={() => {
            setShowUsersPanel(false);
            setActiveNav("calendar");
          }}
        />
      )}
    </div>
  );
}
