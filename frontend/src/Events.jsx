import React, { useEffect, useState } from "react";
import axios from "axios";

function Events() {
  const [event, setEvent] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/events")
      .then((res) => setEvent(res.data)) // You need to set the data to state
      .catch((error) => console.error("Error fetching events:", error)); // Add error handling
  }, []);

  return (
    <div>
      {/* Map through the events to display them */}
      {event.map((e) => (
        <div key={e.event_id}>
          <p>{e.event_name}</p>
          {/* Add other event properties you want to display */}
        </div>
      ))}
    </div>
  );
}

export default Events;
