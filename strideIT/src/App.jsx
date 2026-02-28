import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import LoginScreen from "./components/Login/login";
import CalendarView from "./components/Calender/Calender";
import ToastStack from "./components/Notifications/ToastStack";
import {
  NewRequestModal,
  EditRequestModal,
} from "./components/RequestModal/RequestModal";

/* ─────────────────────────────────────────────────────────── */
/* Utils                                                        */
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

const hasOverlap = (start1, end1, start2, end2) =>
  start1 < end2 && end1 > start2;

/* ─────────────────────────────────────────────────────────── */
/* App                                                          */
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
  const [notifications, setNotifications] = useState([]);

  // ── Blocked slots — lifted here so App can pass to NewRequestModal ──
  const [blockedSlots, setBlockedSlots] = useState([]);

  const notify = (message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Activity Logger                                             */
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
  /* Session Restore                                             */
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
        setBlockedSlots([]);
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

  /* ─────────────────────────────────────────────────────────── */
  /* Fetch Interviews                                            */
  /* ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!user) return;
    cleanupPastData().then(() => {
      fetchEvents();
      fetchBlockedSlots();
    });
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
  /* Cleanup Past Data                                           */
  /* ─────────────────────────────────────────────────────────── */

  const cleanupPastData = async () => {
    await supabase.rpc("cleanup_past_data");
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Fetch + Save Blocked Slots                                  */
  /* ─────────────────────────────────────────────────────────── */

  const fetchBlockedSlots = async () => {
    const { data, error } = await supabase
      .from("blocked_slots")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setBlockedSlots(
        data.map((row) => ({
          id: row.id,
          calendar: row.calendar,
          date: row.date,
          mode: row.mode,
          startTime: row.start_time,
          endTime: row.end_time,
          label: row.label,
        })),
      );
    }
  };

  const handleSaveBlock = async (newBlock, deleteId) => {
    if (deleteId) {
      await supabase.from("blocked_slots").delete().eq("id", deleteId);
      setBlockedSlots((prev) => prev.filter((b) => b.id !== deleteId));
    } else if (newBlock) {
      const { data, error } = await supabase
        .from("blocked_slots")
        .insert({
          id: newBlock.id,
          calendar: newBlock.calendar,
          date: newBlock.date,
          mode: newBlock.mode,
          start_time: newBlock.startTime,
          end_time: newBlock.endTime,
          label: newBlock.label,
        })
        .select()
        .single();
      if (!error && data) {
        // Normalise back to camelCase to match local usage
        setBlockedSlots((prev) => [
          ...prev,
          {
            id: data.id,
            calendar: data.calendar,
            date: data.date,
            mode: data.mode,
            startTime: data.start_time,
            endTime: data.end_time,
            label: data.label,
          },
        ]);
      }
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Create Request                                              */
  /* ─────────────────────────────────────────────────────────── */

  const handleSubmitRequest = async (formData) => {
    // Check time conflict with existing events
    const conflictingEvent = events.find((ev) => {
      if (ev.status === "rejected") return false;
      if (ev.calendar !== formData.calendar) return false;
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

    // Check if slot is blocked by admin
    const dateStr = formData.date;
    const startStr = formData.startTime;
    const endStr = formData.endTime;

    const blockHit = blockedSlots.find((b) => {
      if (b.calendar !== formData.calendar && b.calendar !== "both")
        return false;
      if (b.date !== dateStr) return false;
      if (b.mode === "day") return true;
      return startStr < b.endTime && endStr > b.startTime;
    });

    if (blockHit) {
      return {
        error: `This time slot is blocked by admin: "${blockHit.label || "Blocked"}". Please choose a different time.`,
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

    if (error) {
      notify("Failed to create request.", "error");
      return { error: "Failed to submit request." };
    }

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
    notify("Request created successfully.", "success");
    return { error: null };
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Approve / Reject                                            */
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
      const { error } = await supabase.from("interviews").delete().eq("id", changed.id);
      if (error) {
        notify("Failed to reject pending request.", "error");
        return;
      }
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
      notify("Pending request rejected.", "success");
    } else {
      const { error } = await supabase
        .from("interviews")
        .update({
          status: changed.status,
          rejection_reason: changed.rejectionReason ?? null,
        })
        .eq("id", changed.id);
      if (error) {
        notify("Failed to approve pending request.", "error");
        return;
      }
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
      notify("Pending request approved.", "success");
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Edit                                                        */
  /* ─────────────────────────────────────────────────────────── */

  const handleUpdateSingleEvent = async (updatedEvent) => {
    const original = events.find((e) => e.id === updatedEvent.id);
    const conflictingEvent = events.find((ev) => {
      if (ev.id === updatedEvent.id || ev.status === "rejected") return false;
      return hasOverlap(updatedEvent.start, updatedEvent.end, ev.start, ev.end);
    });
    if (conflictingEvent)
      return { error: "This time slot overlaps with another interview." };

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
        calendar: updatedEvent.calendar ?? "boys",
      })
      .eq("id", updatedEvent.id);
    if (error) {
      notify("Failed to update request.", "error");
      return { error: "Failed to update request." };
    }

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
    notify("Request updated successfully.", "success");
    return { error: null };
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Delete                                                      */
  /* ─────────────────────────────────────────────────────────── */

  const handleDeleteEvent = async (ev) => {
    const { error } = await supabase.from("interviews").delete().eq("id", ev.id);
    if (error) {
      notify("Failed to delete request.", "error");
      return;
    }
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
    notify("Request deleted successfully.", "success");
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Logout                                                      */
  /* ─────────────────────────────────────────────────────────── */

  const handleLogout = async () => {
    await insertLog({ action: "logout", entity_type: "auth" });
    await supabase.auth.signOut();
    setUser(null);
    setEvents([]);
    setBlockedSlots([]);
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Loading                                                     */
  /* ─────────────────────────────────────────────────────────── */

  const Spinner = ({ label }) => <div className="app-spinner">{label}</div>;

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
        blockedSlots={blockedSlots}
        onSaveBlock={handleSaveBlock}
        notify={notify}
      />

      <ToastStack
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((item) => item.id !== id))
        }
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
          blockedSlots={blockedSlots}
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
