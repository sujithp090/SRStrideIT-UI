import { useState } from "react";
import LoginScreen from "./components/Login/login";
import CalendarView from "./components/Calender/Calender";
import {
  NewRequestModal,
  EditRequestModal,
} from "./components/RequestModal/RequestModal";

export default function App() {
  const [user, setUser] = useState(null); // null = not logged in
  const [showNewReq, setShowNewReq] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [events, setEvents] = useState([]);

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

  return (
    <>
      <CalendarView
        user={user}
        onLogout={() => setUser(null)}
        onRequestClick={(timeSlot) => {
          setSelectedTimeSlot(timeSlot || null);
          setShowNewReq(true);
        }}
        onEventClick={(ev) => setSelectedEvent(ev)}
        events={events}
        onUpdateEvents={(updatedEvents) => setEvents(updatedEvents)}
      />

      {showNewReq && (
        <NewRequestModal
          onClose={() => {
            setShowNewReq(false);
            setSelectedTimeSlot(null);
          }}
          onSubmit={(data) => {
            console.log("New request:", data);
            setEvents([...events, { ...data, id: Date.now() }]);
            setShowNewReq(false);
            setSelectedTimeSlot(null);
            // Here you'd POST to your backend
          }}
          selectedTimeSlot={selectedTimeSlot}
        />
      )}

      {selectedEvent && (
        <EditRequestModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onDelete={(ev) => {
            setEvents(events.filter((e) => e.id !== ev.id));
            setSelectedEvent(null);
            console.log("Deleted:", ev);
          }}
          onUpdate={(updatedEvent) => {
            setEvents(
              events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
            );
            setSelectedEvent(null);
            console.log("Updated:", updatedEvent);
          }}
        />
      )}
    </>
  );
}
