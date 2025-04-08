import React, { useEffect, useState } from "react";
import axios from "axios";

const Events = ({ userType }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
    if(userType !== "student"){
      alert("To join the event please register or login"); // Alert when page loads
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:3000/events");
      const currentDate = new Date();

      // Filter upcoming events
      const upcomingEvents = response.data.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= currentDate;
      });

      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div>
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        events.map((event) => {
          const eventDate = new Date(event.event_date);
          const isToday =
            new Date().toLocaleDateString() === eventDate.toLocaleDateString();
          return (
            <article key={event.event_id}>
              <img
                src={event.event_banner}
                alt={event.event_name}
                style={{ width: "10rem", height: "auto" }}
              />

              <div>
                <h3>{event.event_name}</h3>
                <div>
                  {eventDate.toLocaleDateString()}, {event.event_time}
                </div>
                <p>{event.event_details}</p>
                <ul>
                  <li>Venue: {event.event_venue}</li>
                  <li>Organizer: {event.admin_id}</li>
                  <li>Status: {isToday ? "The Event is Today" : "Upcoming"}</li>
                </ul>
                {/* Show Register button only if userType is 'student' */}
                {userType === "student" && (
                  <a href={event.event_url}>Register for Event</a>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
};

export default Events;
