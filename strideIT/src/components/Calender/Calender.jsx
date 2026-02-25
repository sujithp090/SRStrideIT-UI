import { useState } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30; // Start at 8 AM, increment by 30 minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 12) return "12:00 PM";
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours < 12 ? hours : hours - 12;
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

// ── Events are now managed via state in App.jsx ─────────────────────────────

// ── CalendarView ─────────────────────────────────────────────────────────────
export default function CalendarView({
  user,
  onLogout,
  onRequestClick,
  onEventClick,
  events = [],
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [anchor, setAnchor] = useState(new Date(today));
  const [view, setView] = useState("Week");
  const weekDays = getWeekDays(anchor);

  // Day view: single day
  const getDayToDisplay = () => anchor;

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

  const prevDay = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - 1);
    setAnchor(d);
  };
  const nextDay = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + 1);
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

  const goToday = () => setAnchor(new Date(today));

  const handleCellClick = (day, hourIdx) => {
    const totalMinutes = 8 * 60 + hourIdx * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const slotDate = new Date(day);
    slotDate.setHours(hours, minutes, 0, 0);
    onRequestClick(slotDate);
  };

  // Navigation based on view
  const handlePrev = () => {
    if (view === "Week") prevWeek();
    else if (view === "Month") prevMonth();
  };
  const handleNext = () => {
    if (view === "Week") nextWeek();
    else if (view === "Month") nextMonth();
  };

  // Events for a given day + 30-minute cell
  // Returns events that start or occur during this 30-minute slot
  const getEvents = (day, hourIdx) => {
    const totalMinutes = 8 * 60 + hourIdx * 30;
    const startHours = Math.floor(totalMinutes / 60);
    const startMins = totalMinutes % 60;
    const cellStart = new Date(day);
    cellStart.setHours(startHours, startMins, 0, 0);
    const cellEnd = new Date(cellStart);
    cellEnd.setMinutes(cellEnd.getMinutes() + 30);

    return events.filter((ev) => {
      if (!isSameDay(ev.start, day)) return false;
      // Event overlaps with this 30-minute cell
      return ev.start < cellEnd && ev.end > cellStart;
    });
  };

  // Calculate the top position of an event within its cell
  const eventTopPosition = (ev, hourIdx) => {
    const totalMinutes = 8 * 60 + hourIdx * 30;
    const cellStartMinutes = totalMinutes;
    const eventStartMinutes = ev.start.getHours() * 60 + ev.start.getMinutes();
    const minuteOffset = eventStartMinutes - cellStartMinutes;

    // Position is proportional to minutes: (minutes / 30) * cellHeight
    // Cell height is 40px for 30 minutes, so each minute is ~1.33px
    return (minuteOffset / 30) * 40;
  };

  const eventHeightPx = (ev) => {
    const mins = (ev.end - ev.start) / 60000;
    // Each 30 minutes is 40px
    const height = (mins / 30) * 40;
    return Math.max(38, height);
  };

  // Check if event starts in this cell
  const eventStartsInCell = (ev, hourIdx, day) => {
    const totalMinutes = 8 * 60 + hourIdx * 30;
    const startHours = Math.floor(totalMinutes / 60);
    const startMins = totalMinutes % 60;
    const cellStart = new Date(day);
    cellStart.setHours(startHours, startMins, 0, 0);
    const cellEnd = new Date(cellStart);
    cellEnd.setMinutes(cellEnd.getMinutes() + 30);

    // Check if event starts within this cell
    return ev.start >= cellStart && ev.start < cellEnd;
  };

  // Check if two events should be merged
  const shouldMerge = (ev1, ev2) => {
    return (
      ev1.candidate === ev2.candidate &&
      ev1.company === ev2.company &&
      ev1.round === ev2.round
    );
  };

  // Find merged event end time (for consecutive matching events)
  const getMergedEventEnd = (ev, day, startingHourIdx) => {
    let mergedEnd = ev.end;
    let currentEnd = ev.end;
    let currentHourIdx = startingHourIdx;

    // Keep checking next cells for matching events
    while (currentHourIdx < 24) {
      currentHourIdx++;
      if (currentHourIdx >= 24) break;

      const nextCellEvents = getEvents(day, currentHourIdx);
      const matchingEvent = nextCellEvents.find(
        (nextEv) =>
          nextEv.start.getTime() === currentEnd.getTime() &&
          shouldMerge(ev, nextEv),
      );

      if (matchingEvent) {
        mergedEnd = matchingEvent.end;
        currentEnd = matchingEvent.end;
      } else {
        break;
      }
    }

    return mergedEnd;
  };

  // Pending count for navbar badge
  const pendingCount = events.filter((e) => e.status === "pending").length;

  // Determine days to display
  let daysToDisplay = [];
  if (view === "Week") {
    daysToDisplay = weekDays;
  } else if (view === "Month") {
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    daysToDisplay = [];
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
        </div>

        {/* ── Main ── */}
        <div className="cal-main">
          {/* Calendar header */}
          <div className="cal-header">
            <button
              className="cal-nav-btn"
              onClick={handlePrev}
              title="Previous"
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
            <button className="cal-nav-btn" onClick={handleNext} title="Next">
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
                : MONTH_NAMES[daysToDisplay[0].getMonth()]}
              {view === "Month" && ` ${anchor.getFullYear()}`}
              {view !== "Month" &&
                daysToDisplay[0].getMonth() !==
                  daysToDisplay[daysToDisplay.length - 1].getMonth() &&
                ` – ${
                  MONTH_NAMES[
                    daysToDisplay[daysToDisplay.length - 1].getMonth()
                  ]
                }`}
            </span>
            <span className="cal-header-year">
              {view !== "Month" && daysToDisplay[0].getFullYear()}
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

            <div className="cal-header-spacer" />
            <button className="cal-today-btn" onClick={goToday}>
              Today
            </button>
          </div>

          {/* Days grid (Y-axis) with time slots (X-axis) */}
          <div className="cal-grid-scroll">
            {/* Time header (X-axis) - inside scroll container */}
            <div className="cal-times-header">
              <div className="cal-times-header-corner" />
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
                    className={`cal-day-row ${
                      !isCurrentMonth ? "other-month" : ""
                    }`}
                  >
                    {/* Day label (Y-axis) */}
                    <div
                      className={`cal-day-row-header ${isToday ? "today" : ""}`}
                    >
                      <div className="cal-day-row-name">
                        {DAY_NAMES[day.getDay()]}
                      </div>
                      <div className="cal-day-row-date">{day.getDate()}</div>
                    </div>

                    {/* Time slots for this day (X-axis) */}
                    {HOURS.map((hour, hourIdx) => {
                      const cellEvents = getEvents(day, hourIdx);
                      // Only render events that start in this cell to avoid duplicates
                      const eventsStartingHere = cellEvents.filter((ev) =>
                        eventStartsInCell(ev, hourIdx, day),
                      );

                      return (
                        <div
                          key={`cell-${dayIdx}-${hourIdx}`}
                          className={`cal-cell ${isToday ? "today-row" : ""}`}
                          onClick={() => handleCellClick(day, hourIdx)}
                        >
                          {eventsStartingHere.map((ev) => {
                            let roundClass = "pending";
                            if (ev.round === "L1") roundClass = "round-l1";
                            else if (ev.round === "L2") roundClass = "round-l2";
                            else if (ev.round === "Client round")
                              roundClass = "round-client";
                            else if (
                              ev.round === "Custom" ||
                              (ev.round &&
                                ev.round !== "L1" &&
                                ev.round !== "L2" &&
                                ev.round !== "Client round")
                            )
                              roundClass = "round-custom";

                            // Get merged end time for adjacent matching events
                            const mergedEnd = getMergedEventEnd(
                              ev,
                              day,
                              hourIdx,
                            );

                            // Compute how many 30-min cells this event spans horizontally
                            const spanCells = Math.max(
                              1,
                              Math.round((mergedEnd - ev.start) / (30 * 60000)),
                            );

                            return (
                              <div
                                key={ev.id}
                                className={`cal-event ${roundClass} ${
                                  spanCells > 1 ? "spanning" : ""
                                }`}
                                style={{
                                  width: `calc(${spanCells * 100}% + ${spanCells - 1}px)`,
                                }}
                                onClick={() => onEventClick && onEventClick(ev)}
                              >
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
                                  })}{" "}
                                  –{" "}
                                  {mergedEnd.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
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
    </div>
  );
}
