import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import LoginScreen from "./components/Login/login";
import CalendarView from "./components/Calender/Calender";
import {
  NewRequestModal,
  EditRequestModal,
} from "./components/RequestModal/RequestModal";

const rowToEvent = (row) => ({
  id: row.id,
  candidate: row.candidate,
  company: row.company,
  round: row.round,
  status: row.status,
  image: row.image_url ?? null,
  rejectionReason: row.rejection_reason ?? null,
  start: new Date(row.start_time),
  end: new Date(row.end_time),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // checking session on load
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
      .select("id, name, email, role")
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

  // ── Insert ───────────────────────────────────────────────────────────────
  const handleSubmitRequest = async (formData) => {
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
      return;
    }
    setEvents((prev) => [...prev, rowToEvent(data)]);
    setShowNewReq(false);
    setSelectedTimeSlot(null);
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
  };

  // ── Edit single event ────────────────────────────────────────────────────
  const handleUpdateSingleEvent = async (updatedEvent) => {
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
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
    );
    setSelectedEvent(null);
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

  // ── Loading session ──────────────────────────────────────────────────────
  if (authLoading) {
    return (
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
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={(profile) => setUser(profile)} />;
  }

  if (eventsLoading) {
    return (
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
        Loading interviews...
      </div>
    );
  }

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
        />
      )}

      {selectedEvent && (
        <EditRequestModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onUpdate={handleUpdateSingleEvent}
        />
      )}
    </>
  );
}
