import { useState, useEffect } from "react";
import { PendingRequestsModal } from "../RequestModal/RequestModal";
import UsersPanel from "../Users/UsersPanel";
import LogsPage from "../LogsPage/LogsPage";
import RestrictedCompaniesPage from "../LogsPage/RestrictedCompanyPage";
import { BlockSlotModal } from "../RequestModal/BlockSlotModal";
import strideMainLogo from "../../assets/strideMainLogo.png";
import { SignupRequestsBell } from "../Login/SignUpPreRequestPanel";

const SLOT_COUNT = 26;
const GRID_START = 8 * 60; // 8:00 AM in minutes
const GRID_END = GRID_START + SLOT_COUNT * 30;

const HOURS = Array.from({ length: SLOT_COUNT }, (_, i) => {
  const totalMinutes = GRID_START + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${m.toString().padStart(2, "0")} ${period}`;
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

function toDayStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CalendarView({
  user,
  onLogout,
  onRequestClick,
  onEventClick,
  events = [],
  onUpdateEvents,
  activeCalendar,
  setActiveCalendar,
  blockedSlots = [],
  onSaveBlock,
  notify,
}) {
  const isMobileViewport = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const getDialableNumber = (event) => {
    const source = event?.mobile ?? event?.mobile_no ?? event?.phone ?? "";
    const number = String(source).replace(/[^\d+]/g, "");
    return number;
  };

  const handleEventCardClick = (event) => {
    if (!isMobileViewport()) return;
    const number = getDialableNumber(event);
    if (!number) {
      notify &&
        notify("Mobile number not available for this candidate.", "warning");
      return;
    }

    const shouldCall = window.confirm(`Call ${number}?`);
    if (!shouldCall) return;

    window.open(`tel:${number}`, "_self");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [anchor, setAnchor] = useState(new Date(today));
  const [view, setView] = useState("Week");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [activeNav, setActiveNav] = useState("calendar");
  const [showLogs, setShowLogs] = useState(false);
  const [showRestricted, setShowRestricted] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const weekDays = getWeekDays(anchor);

  const handlePrev = () => {
    if (isPrevDisabled) return;
    const d = new Date(anchor);
    if (view === "Week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setAnchor(d);
  };
  const handleNext = () => {
    const d = new Date(anchor);
    if (view === "Week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setAnchor(d);
  };

  // Disable prev if the current week/month already contains today (can't go further back)
  const isPrevDisabled = (() => {
    if (view === "Week") {
      const currentWeekDays = getWeekDays(anchor);
      return currentWeekDays.some((day) => isSameDay(day, today));
    } else {
      return (
        anchor.getFullYear() === today.getFullYear() &&
        anchor.getMonth() === today.getMonth()
      );
    }
  })();

  const pendingCount = events.filter((e) => e.status === "pending").length;

  let daysToDisplay = [];
  if (view === "Week") {
    daysToDisplay = weekDays;
  } else {
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    let current = new Date(firstDay);
    while (current <= lastDay) {
      daysToDisplay.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  // Remove past days — only show today and future
  daysToDisplay = daysToDisplay.filter((d) => d.getTime() >= today.getTime());

  const visibleCalendars =
    user?.role === "admin"
      ? ["boys", "girls"]
      : user?.calendars?.length
        ? user.calendars
        : ["boys"];

  useEffect(() => {
    if (!visibleCalendars.includes(activeCalendar)) {
      setActiveCalendar(visibleCalendars[0]);
    }
  }, [visibleCalendars]);

  useEffect(() => {
    if (!showMobileNav) return;
    const onEsc = (event) => {
      if (event.key === "Escape") setShowMobileNav(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showMobileNav]);

  const closeMobileNav = () => setShowMobileNav(false);

  const renderNavActionItems = ({ mobile = false } = {}) => (
    <>
      <button
        className="cal-navbar-pill cal-navbar-pill--primary"
        onClick={() => {
          onRequestClick && onRequestClick(null, activeCalendar);
          closeMobileNav();
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Request
      </button>
      {user?.role === "admin" && (
        <button
          className="cal-navbar-pill"
          onClick={() => {
            setShowPendingModal(true);
            closeMobileNav();
          }}
        >
          <span className="dot" />
          {pendingCount} pending requests
        </button>
      )}
      {user?.role === "admin" && (
        <SignupRequestsBell
          user={user}
          showLabel={mobile}
          inlinePanel={mobile}
          notify={notify}
        />
      )}
      <button
        className="cal-navbar-pill"
        onClick={() => {
          closeMobileNav();
          onLogout();
        }}
      >
        🔒 Log Out
      </button>
    </>
  );

  return (
    <div className="cal-root">
      {/* ── Navbar ── */}
      <div className="cal-navbar">
        <div className="cal-navbar-brand">
          <span className="cal-navbar-title">
            <img src={strideMainLogo} />
          </span>
        </div>
        <div className="cal-navbar-spacer" />
        <div className="cal-navbar-actions">{renderNavActionItems()}</div>
        <button
          className="cal-navbar-menu-btn"
          onClick={() => setShowMobileNav(true)}
          aria-label="Open navigation menu"
          aria-expanded={showMobileNav}
          aria-controls="cal-mobile-drawer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </div>

      {showMobileNav && (
        <>
          <button
            className="cal-mobile-drawer-overlay"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
          />
          <aside
            id="cal-mobile-drawer"
            className="cal-mobile-drawer"
            role="dialog"
          >
            <div className="cal-mobile-drawer-header">
              <h2>Menu</h2>
              <button
                className="cal-mobile-drawer-close"
                onClick={closeMobileNav}
                aria-label="Close navigation menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="cal-mobile-drawer-actions">
              {renderNavActionItems({ mobile: true })}
            </div>
          </aside>
        </>
      )}

      <div className="cal-shell">
        {/* ── Sidebar ── */}
        <div className="cal-sidebar">
          {visibleCalendars.length >= 1 && (
            <div className="cal-calendar-switches">
              {visibleCalendars.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCalendar(c)}
                  className={`cal-calendar-switch ${activeCalendar === c ? "active" : ""}`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <div className="cal-navbar-spacer" />

          {/* ── Logs ── */}
          <button
            className={`cal-sidebar-btn ${activeNav === "logs" ? "active" : ""}`}
            title="Activity Logs"
            onClick={() => {
              setActiveNav("logs");
              setShowLogs(true);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="12" r="7" />
              <polyline points="9 9 9 12 11 14" />
              <line x1="17" y1="8" x2="22" y2="8" />
              <line x1="17" y1="12" x2="22" y2="12" />
              <line x1="17" y1="16" x2="22" y2="16" />
            </svg>
          </button>

          {/* ── Restricted Companies ── */}
          <button
            title="Restricted Companies"
            onClick={() => {
              setActiveNav("restricted");
              setShowRestricted(true);
            }}
            className={`cal-sidebar-btn ${activeNav === "restricted" ? "active" : ""} ${activeNav === "restricted" ? "" : "cal-sidebar-btn-danger"}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* List lines */}
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              {/* Flag marker on left */}
              <path d="M4 3v18" />
              <path d="M4 3l5 3-5 3" fill="currentColor" />
            </svg>
          </button>

          {/* ── User Management (admin only) ── */}
          {user?.role === "admin" && (
            <button
              className={`cal-sidebar-btn ${activeNav === "settings" ? "active" : ""}`}
              title="User Management"
              onClick={() => {
                setActiveNav("settings");
                setShowUsersPanel(true);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a7 7 0 0 1 11.19-5.6" />
                <path d="M16 19l2 2 4-4" />
              </svg>
            </button>
          )}

          {/* ── Block Slot (admin only) ── */}
          {user?.role === "admin" && (
            <button
              className={`cal-sidebar-btn ${activeNav === "block" ? "active" : ""} ${activeNav === "block" ? "" : "cal-sidebar-btn-danger"}`}
              title="Block Time Slots"
              onClick={() => {
                setActiveNav("block");
                setShowBlockModal(true);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Main calendar ── */}
        <div className="cal-main">
          <div className="cal-header">
            <button
              onClick={handlePrev}
              disabled={isPrevDisabled}
              className={`cal-nav-btn ${isPrevDisabled ? "cal-nav-btn-disabled" : ""}`}
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
              {view !== "Month" &&
                daysToDisplay.length > 1 &&
                daysToDisplay[0].getMonth() !==
                  daysToDisplay[daysToDisplay.length - 1].getMonth() &&
                ` – ${MONTH_NAMES[daysToDisplay[daysToDisplay.length - 1].getMonth()]}`}
            </span>
            <span className="cal-header-year">
              {view === "Month"
                ? anchor.getFullYear()
                : daysToDisplay.length > 0
                  ? daysToDisplay[0].getFullYear()
                  : ""}
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
            {/* ── Time header ── */}
            <div className="cal-times-header">
              <div className="cal-times-header-corner" />
              <div className="cal-times-header-row">
                {HOURS.map((hour, i) => (
                  <div key={i} className="cal-time-header-cell">
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Day rows ── */}
            <div className="cal-grid-vertical">
              {daysToDisplay.map((day, dayIdx) => {
                const isCurrentMonth =
                  view !== "Month" || day.getMonth() === anchor.getMonth();
                const isToday = isSameDay(day, today);
                const dayEvents = events.filter(
                  (ev) =>
                    ev.calendar === activeCalendar &&
                    isSameDay(ev.start, day) &&
                    ev.status !== "rejected",
                );

                // Blocked slots for this day
                const dayStr = toDayStr(day);
                const dayBlocks = blockedSlots.filter(
                  (b) =>
                    b.date === dayStr &&
                    (b.calendar === activeCalendar || b.calendar === "both"),
                );

                return (
                  <div
                    key={dayIdx}
                    className={`cal-day-row ${!isCurrentMonth ? "other-month" : ""}`}
                  >
                    {/* Sticky day label */}
                    <div
                      className={`cal-day-row-header ${isToday ? "today" : ""}`}
                    >
                      <div className="cal-day-row-name">
                        {DAY_NAMES[day.getDay()]}
                      </div>
                      <div className="cal-day-row-date">{day.getDate()}</div>
                    </div>

                    {/* Time grid area */}
                    <div className="cal-day-grid-area">
                      {/* Background cell lines */}
                      <div className="cal-grid-bg-row">
                        {HOURS.map((_, i) => (
                          <div
                            key={i}
                            className={`cal-grid-bg-cell ${isToday ? "today" : ""}`}
                          />
                        ))}
                      </div>

                      {/* ── Blocked slot red bars ── */}
                      {dayBlocks.map((b) => {
                        if (b.mode === "day") {
                          return (
                            <div
                              key={b.id}
                              className="cal-block-bar cal-block-bar-full"
                            >
                              <span className="cal-block-label cal-block-label-full">
                                🚫 {b.label}
                              </span>
                            </div>
                          );
                        }
                        const [sh, sm] = b.startTime.split(":").map(Number);
                        const [eh, em] = b.endTime.split(":").map(Number);
                        const startMins = sh * 60 + sm;
                        const endMins = eh * 60 + em;
                        const startSlot = Math.max(
                          0,
                          Math.floor((startMins - GRID_START) / 30),
                        );
                        const endSlot = Math.min(
                          SLOT_COUNT,
                          Math.ceil((endMins - GRID_START) / 30),
                        );
                        const span = Math.max(1, endSlot - startSlot);
                        if (startSlot >= SLOT_COUNT) return null;
                        return (
                          <div
                            key={b.id}
                            className={`cal-block-bar cal-col-${startSlot} cal-span-${span}`}
                          >
                            <span className="cal-block-label">
                              🚫 {b.label}
                            </span>
                          </div>
                        );
                      })}

                      {/* Events — absolutely positioned using pixel offset */}
                      {dayEvents.map((ev) => {
                        const startMinutes =
                          ev.start.getHours() * 60 + ev.start.getMinutes();
                        const endMinutes =
                          ev.end.getHours() * 60 + ev.end.getMinutes();

                        if (
                          endMinutes <= GRID_START ||
                          startMinutes >= GRID_END
                        ) {
                          return null;
                        }

                        const clampedStart = Math.max(startMinutes, GRID_START);
                        const clampedEnd = Math.min(endMinutes, GRID_END);

                        const eventStartMinutes = clampedStart - GRID_START;
                        const eventDurationMinutes = Math.max(
                          clampedEnd - clampedStart,
                          1,
                        );
                        const eventEndMinutes =
                          eventStartMinutes + eventDurationMinutes;

                        let roundClass = "pending";
                        if (ev.round === "L1") roundClass = "round-l1";
                        else if (ev.round === "L2") roundClass = "round-l2";
                        else if (ev.round === "Client round")
                          roundClass = "round-client";
                        else if (ev.round) roundClass = "round-custom";
                        return (
                          <div
                            key={ev.id}
                            className={`cal-event ${roundClass} ${
                              ev.status === "approved"
                                ? "cal-event-approved"
                                : "cal-event-unapproved"
                            } cal-event-pos`}
                            style={{
                              "--event-start-minutes": eventStartMinutes,
                              "--event-duration-minutes": eventDurationMinutes,
                              "--event-end-minutes": eventEndMinutes,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventCardClick(ev);
                            }}
                          >
                            <div className="cal-event-main">
                              <div className="cal-event-title-row">
                                <div className="cal-event-title">
                                  Name: {ev.candidate}
                                </div>
                                {!ev.image ? (
                                  <div
                                    className="cal-event-status cal-event-status-missing"
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
                                ) : null}
                              </div>
                              <div className="cal-event-company">
                                Company: {ev.company}
                              </div>
                              <div className="cal-event-mobile">
                                Mobile no: {ev.mobile}
                              </div>
                              <div className="cal-event-time">
                                {ev.start.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" – "}
                                {ev.end.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <div
                              className="cal-event-edit-zone"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick && onEventClick(ev);
                              }}
                              title="Edit interview"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
          activeCalendar={activeCalendar}
        />
      )}

      {showUsersPanel && (
        <UsersPanel
          notify={notify}
          onClose={() => {
            setShowUsersPanel(false);
            setActiveNav("calendar");
          }}
        />
      )}

      {showLogs && (
        <LogsPage
          onClose={() => {
            setShowLogs(false);
            setActiveNav("calendar");
          }}
        />
      )}

      {showRestricted && (
        <RestrictedCompaniesPage
          onClose={() => {
            setShowRestricted(false);
            setActiveNav("calendar");
          }}
        />
      )}

      {showBlockModal && (
        <BlockSlotModal
          onClose={() => {
            setShowBlockModal(false);
            setActiveNav("calendar");
          }}
          blockedSlots={blockedSlots}
          onSave={onSaveBlock}
        />
      )}
    </div>
  );
}
