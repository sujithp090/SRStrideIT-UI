import { useState } from "react";
import LoginScreen from "./components/Login/login";
import CalendarView from "./components/Calender/Calender";
import {
  NewRequestModal,
  EventDetailModal,
} from "./components/RequestModal/RequestModal";

export default function App() {
  const [user, setUser] = useState(null); // null = not logged in
  const [showNewReq, setShowNewReq] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

  return (
    <>
      <CalendarView
        user={user}
        onLogout={() => setUser(null)}
        onRequestClick={() => setShowNewReq(true)}
        onEventClick={(ev) => setSelectedEvent(ev)}
      />

      {showNewReq && (
        <NewRequestModal
          onClose={() => setShowNewReq(false)}
          onSubmit={(data) => {
            console.log("New request:", data);
            // Here you'd POST to your backend
          }}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onApprove={(ev) => console.log("Approved:", ev)}
          onReject={(ev) => console.log("Rejected:", ev)}
        />
      )}
    </>
  );
}
