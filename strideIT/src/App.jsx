import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import LoginScreen from "./components/Login/login";
import CalendarView from "./components/Calender/Calender";
import {
  NewRequestModal,
  EditRequestModal,
} from "./components/RequestModal/RequestModal";

/* ─────────────────────────────────────────────────────────── */
/* Utils */
/* ─────────────────────────────────────────────────────────── */

const rowToEvent = (row) => ({
  id: row.id,
  candidate: row.candidate,
  company: row.company,
  round: row.round,
  status: row.status,
  image: row.image_url ?? null,
  rejectionReason: row.rejection_reason ?? null,
  calendar: row.calendar ?? "boys",
  start: new Date(row.start_time),
  end: new Date(row.end_time),
});

const hasOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

/* ─────────────────────────────────────────────────────────── */
/* App */
/* ─────────────────────────────────────────────────────────── */

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showNewReq, setShowNewReq] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState("boys");

  /* ─────────────────────────────────────────────────────────── */
  /* Activity Logger */
  /* ─────────────────────────────────────────────────────────── */

  const insertLog = async ({
    action,
    entity_type,
    entity_id = null,
    metadata = {},
  }) => {
    if (!user) return;

    await supabase.from("activity_logs").insert({
      action,
      entity_type,
      entity_id,
      metadata,
      performed_by: user.name,
    });
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Session Restore */
  /* ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadProfile(session.user.id);

        await insertLog({
          action: "login",
          entity_type: "auth",
          metadata: { email: session.user.email },
        });
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

    if (profile) {
      setUser(profile);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Fetch Interviews */
  /* ─────────────────────────────────────────────────────────── */

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

  /* ─────────────────────────────────────────────────────────── */
  /* Create Request */
  /* ─────────────────────────────────────────────────────────── */

  const handleSubmitRequest = async (formData) => {
    const conflictingEvent = events.find((ev) => {
      if (ev.status === "rejected") return false;
      return hasOverlap(formData.start, formData.end, ev.start, ev.end);
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
        error: `This time slot is already booked by ${conflictingEvent.candidate} (${conflictingEvent.company}) from ${startStr} to ${endStr}.`,
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
        calendar: formData.calendar ?? "boys",
      })
      .select()
      .single();

    if (error) return { error: "Failed to submit request." };

    const newEvent = rowToEvent(data);

    setEvents((prev) => [...prev, newEvent]);
    setShowNewReq(false);
    setSelectedTimeSlot(null);

    await insertLog({
      action: "created",
      entity_type: "interview",
      entity_id: newEvent.id,
      metadata: {
        candidate: newEvent.candidate,
        company: newEvent.company,
        calendar: newEvent.calendar,
        start_time: newEvent.start.toISOString(),
        end_time: newEvent.end.toISOString(),
      },
    });
    return { error: null };
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Approve / Reject */
  /* ─────────────────────────────────────────────────────────── */

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
      await supabase.from("interviews").delete().eq("id", changed.id);

      setEvents((prev) => prev.filter((e) => e.id !== changed.id));

      await insertLog({
        action: "rejected",
        entity_type: "interview",
        entity_id: changed.id,
        metadata: {
          candidate: changed.candidate,
          calendar: changed.calendar,
          reason: changed.rejectionReason,
          start_time: changed.start.toISOString(),
          end_time: changed.end.toISOString(),
        },
      });
    } else {
      await supabase
        .from("interviews")
        .update({
          status: changed.status,
          rejection_reason: changed.rejectionReason ?? null,
        })
        .eq("id", changed.id);

      setEvents(updatedEvents);

      await insertLog({
        action: "approved",
        entity_type: "interview",
        entity_id: changed.id,
        metadata: {
          candidate: changed.candidate,
          company: changed.company,
          calendar: changed.calendar,
          start_time: changed.start.toISOString(),
          end_time: changed.end.toISOString(),
        },
      });
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Edit */
  /* ─────────────────────────────────────────────────────────── */

  const handleUpdateSingleEvent = async (updatedEvent) => {
    const original = events.find((e) => e.id === updatedEvent.id);
    const conflictingEvent = events.find((ev) => {
      if (ev.id === updatedEvent.id) return false;
      if (ev.status === "rejected") return false;
      return hasOverlap(updatedEvent.start, updatedEvent.end, ev.start, ev.end);
    });

    if (conflictingEvent) {
      return {
        error: "This time slot overlaps with another interview.",
      };
    }

    await supabase
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
        calendar: updatedEvent.calendar ?? "boys",
      })
      .eq("id", updatedEvent.id);

    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
    );

    setSelectedEvent(null);

    await insertLog({
      action: "updated",
      entity_type: "interview",
      entity_id: updatedEvent.id,
      metadata: {
        candidate: updatedEvent.candidate,
        calendar: updatedEvent.calendar,
        old_start: original.start.toISOString(),
        old_end: original.end.toISOString(),
        new_start: updatedEvent.start.toISOString(),
        new_end: updatedEvent.end.toISOString(),
      },
    });

    return { error: null };
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Delete */
  /* ─────────────────────────────────────────────────────────── */

  const handleDeleteEvent = async (ev) => {
    await supabase.from("interviews").delete().eq("id", ev.id);

    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    setSelectedEvent(null);
    await insertLog({
      action: "deleted",
      entity_type: "interview",
      entity_id: ev.id,
      metadata: {
        candidate: ev.candidate,
        company: ev.company,
        calendar: ev.calendar,
        start_time: ev.start.toISOString(),
        end_time: ev.end.toISOString(),
      },
    });
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Logout */
  /* ─────────────────────────────────────────────────────────── */

  const handleLogout = async () => {
    await insertLog({
      action: "logout",
      entity_type: "auth",
    });

    await supabase.auth.signOut();
    setUser(null);
    setEvents([]);
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Loading */
  /* ─────────────────────────────────────────────────────────── */

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
        activeCalendar={activeCalendar}
        setActiveCalendar={setActiveCalendar}
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
          calendar={activeCalendar}
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
