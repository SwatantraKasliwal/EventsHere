import React, { useEffect, useState } from "react";
import axios from "axios";

const Events = ({ userType }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchEvents();

    if (userType !== "student") {
      alert("To join the event please register or login");
    }
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchRelatedEvents(selectedEvent.event_id);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedCategory) {
      fetchEventsByCategory(selectedCategory);
    } else {
      fetchEvents();
    }
  }, [selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/event-categories"
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEventsByCategory = async (categoryName) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/events/category/${categoryName}`
      );

      // Filter for upcoming events
      const currentDate = new Date();
      const upcomingEvents = response.data.events.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= currentDate;
      });

      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events by category:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedEvents = async (eventId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/related-events/${eventId}`
      );
      setRelatedEvents(response.data.relatedEvents);
    } catch (error) {
      console.error("Error fetching related events:", error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category === "all" ? null : category);
    setSelectedEvent(null); // Reset selected event when changing categories
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if event is today
  const isToday = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Upcoming Events</h2>
        <div className="category-filter">
          <label htmlFor="category-select">Filter by category: </label>
          <select
            id="category-select"
            value={selectedCategory || "all"}
            onChange={handleCategoryChange}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_name}>
                {category.category_name} ({category.event_count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <p>
            No upcoming events{" "}
            {selectedCategory ? `in ${selectedCategory}` : ""}
          </p>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <article
                key={event.event_id}
                className={`event-card ${
                  selectedEvent?.event_id === event.event_id ? "selected" : ""
                }`}
                onClick={() => handleEventClick(event)}
              >
                <img
                  src={event.event_banner || "/api/placeholder/300/200"}
                  alt={event.event_name}
                  className="event-banner"
                  style={{ width: "10rem", height: "5rem" }}
                />
                <div className="event-content">
                  <h3>{event.event_name}</h3>
                  <div className="event-date">
                    {formatDate(event.event_date)}, {event.event_time}
                  </div>
                  <p className="event-details">
                    {event.event_details?.substring(0, 100)}...
                  </p>
                  <ul className="event-meta">
                    <li>Venue: {event.event_venue}</li>
                    <li>Organizer: {event.admin_id}</li>
                    <li
                      className={
                        isToday(event.event_date) ? "today-highlight" : ""
                      }
                    >
                      Status:{" "}
                      {isToday(event.event_date)
                        ? "The Event is Today"
                        : "Upcoming"}
                    </li>
                  </ul>
                  {userType === "student" && (
                    <a href={event.event_url} className="register-btn">
                      Register for Event
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="event-details-section">
          <h3>Event Details</h3>
          <div className="selected-event">
            <h4>{selectedEvent.event_name}</h4>
            <p>{selectedEvent.event_details}</p>

            {relatedEvents.length > 0 && (
              <div className="related-events">
                <h4>Related Events</h4>
                <div className="related-events-list">
                  {relatedEvents.map((event) => (
                    <div key={event.event_id} className="related-event-card">
                      <h5>{event.event_name}</h5>
                      <p>Date: {formatDate(event.event_date)}</p>
                      <p>Category: {event.category_name}</p>
                      {userType === "student" && (
                        <a
                          href={event.event_url}
                          className="register-btn-small"
                        >
                          Register
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;