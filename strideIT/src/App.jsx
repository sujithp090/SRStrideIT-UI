import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import LoginScreen from "./components/Login/login";
import CalendarView from "./components/Calender/Calender";
import {
  NewRequestModal,
  EditRequestModal,
} from "./components/RequestModal/RequestModal";

// ── Parse a UTC ISO string into a LOCAL Date correctly ──────────────────────
// "2026-02-27T10:00:00+00:00" → Date object where .getHours() = 15 in IST (UTC+5:30)
// new Date(isoString) already does this correctly in JS — the issue was elsewhere.
// We lock the display to local time by using toLocaleTimeString, which is already correct.
// The REAL fix: ensure start_time/end_time are stored as UTC ISO and parsed with new Date().
const rowToEvent = (row) => ({
  id: row.id,
  candidate: row.candidate,
  company: row.company,
  round: row.round,
  status: row.status,
  image: row.image_url ?? null,
  rejectionReason: row.rejection_reason ?? null,
  // new Date() parses ISO strings as UTC and converts to local time automatically
  start: new Date(row.start_time),
  end: new Date(row.end_time),
});

// ── Check if two time ranges overlap ───────────────────────────────────────
const hasOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showNewReq, setShowNewReq] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ── Restore session on page load ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setAuthLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        setEvents([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, role, username")
      .eq("id", userId)
      .single();
    if (profile) setUser(profile);
  };

  // ── Fetch events when user logs in ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .order("start_time", { ascending: true });
    if (!error) setEvents(data.map(rowToEvent));
    setEventsLoading(false);
  };

  // ── Insert with conflict check ───────────────────────────────────────────
  const handleSubmitRequest = async (formData) => {
    const newStart = formData.start;
    const newEnd = formData.end;

    // Check against all existing non-rejected events
    const conflictingEvent = events.find((ev) => {
      if (ev.status === "rejected") return false;
      return hasOverlap(newStart, newEnd, ev.start, ev.end);
    });

    if (conflictingEvent) {
      const startStr = conflictingEvent.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endStr = conflictingEvent.end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        error: `This time slot is already booked by ${conflictingEvent.candidate} (${conflictingEvent.company}) from ${startStr} to ${endStr}. Please choose a different time.`,
      };
    }

    const { data, error } = await supabase
      .from("interviews")
      .insert({
        candidate: formData.candidate,
        company: formData.company,
        round: formData.round,
        status: "pending",
        start_time: formData.start.toISOString(),
        end_time: formData.end.toISOString(),
        image_url: formData.image ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert failed:", error.message);
      return { error: "Failed to submit request. Please try again." };
    }

    setEvents((prev) => [...prev, rowToEvent(data)]);
    setShowNewReq(false);
    setSelectedTimeSlot(null);
    return { error: null };
  };

  // ── Approve / reject ─────────────────────────────────────────────────────
  const handleUpdateEvents = async (updatedEvents) => {
    const changed = updatedEvents.find((ev) => {
      const orig = events.find((e) => e.id === ev.id);
      return (
        orig &&
        (orig.status !== ev.status ||
          orig.rejectionReason !== ev.rejectionReason)
      );
    });
    if (!changed) return;

    if (changed.status === "rejected") {
      // Permanently delete rejected events from DB and local state
      const { error } = await supabase
        .from("interviews")
        .delete()
        .eq("id", changed.id);
      if (error) {
        console.error("Delete failed:", error.message);
        return;
      }
      setEvents((prev) => prev.filter((e) => e.id !== changed.id));
    } else {
      // Approve — update status in DB
      const { error } = await supabase
        .from("interviews")
        .update({
          status: changed.status,
          rejection_reason: changed.rejectionReason ?? null,
        })
        .eq("id", changed.id);
      if (error) {
        console.error("Update failed:", error.message);
        return;
      }
      setEvents(updatedEvents);
    }
  };

  // ── Edit single event ────────────────────────────────────────────────────
  const handleUpdateSingleEvent = async (updatedEvent) => {
    // Check conflict excluding the event being edited
    const conflictingEvent = events.find((ev) => {
      if (ev.id === updatedEvent.id) return false;
      if (ev.status === "rejected") return false;
      return hasOverlap(updatedEvent.start, updatedEvent.end, ev.start, ev.end);
    });

    if (conflictingEvent) {
      const startStr = conflictingEvent.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endStr = conflictingEvent.end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        error: `This time slot overlaps with ${conflictingEvent.candidate} (${conflictingEvent.company}) from ${startStr} to ${endStr}.`,
      };
    }

    const { error } = await supabase
      .from("interviews")
      .update({
        candidate: updatedEvent.candidate,
        company: updatedEvent.company,
        round: updatedEvent.round,
        status: updatedEvent.status,
        start_time: updatedEvent.start.toISOString(),
        end_time: updatedEvent.end.toISOString(),
        image_url: updatedEvent.image ?? null,
        rejection_reason: updatedEvent.rejectionReason ?? null,
      })
      .eq("id", updatedEvent.id);

    if (error) {
      console.error("Update failed:", error.message);
      return { error: error.message };
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
    );
    setSelectedEvent(null);
    return { error: null };
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteEvent = async (ev) => {
    const { error } = await supabase
      .from("interviews")
      .delete()
      .eq("id", ev.id);
    if (error) {
      console.error("Delete failed:", error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    setSelectedEvent(null);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEvents([]);
  };

  // ── Loading states ───────────────────────────────────────────────────────
  const Spinner = ({ label }) => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
        fontSize: 14,
        color: "#64748b",
        background: "#f8fafc",
        gap: 10,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      {label}
    </div>
  );

  if (authLoading) return <Spinner label="Loading..." />;
  if (!user) return <LoginScreen onLogin={(profile) => setUser(profile)} />;
  if (eventsLoading) return <Spinner label="Loading interviews..." />;

  return (
    <>
      <CalendarView
        user={user}
        onLogout={handleLogout}
        onRequestClick={(timeSlot) => {
          setSelectedTimeSlot(timeSlot || null);
          setShowNewReq(true);
        }}
        onEventClick={(ev) => setSelectedEvent(ev)}
        events={events}
        onUpdateEvents={handleUpdateEvents}
      />

      {showNewReq && (
        <NewRequestModal
          onClose={() => {
            setShowNewReq(false);
            setSelectedTimeSlot(null);
          }}
          onSubmit={handleSubmitRequest}
          selectedTimeSlot={selectedTimeSlot}
          existingEvents={events}
        />
      )}

      {selectedEvent && (
        <EditRequestModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onUpdate={handleUpdateSingleEvent}
          existingEvents={events}
        />
      )}
    </>
  );
}
