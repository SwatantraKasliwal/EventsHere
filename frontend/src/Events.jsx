import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Events.css"; // Import your CSS file for styling
const Events = ({ userType }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchEvents();

    if (userType !== "student") {
      // Commented out to avoid annoying alert during development
      // alert("To join the event please register or login");
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

  // Add event listener to close modal on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.keyCode === 27) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

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
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
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

  // Event date in more descriptive format for modal
  const getFormattedEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
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

      {events.length === 0 ? (
        <div className="no-events">
          <p>
            No upcoming events{" "}
            {selectedCategory ? `in ${selectedCategory}` : ""}
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <article
              key={event.event_id}
              className="event-card"
              onClick={() => handleEventClick(event)}
            >
              <img
                src={event.event_banner || "/api/placeholder/300/200"}
                alt={event.event_name}
                className="event-banner"
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
                  <a
                    href={event.event_url}
                    className="register-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Register for Event
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {modalOpen && selectedEvent && (
        <div className="event-modal-overlay" onClick={closeModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h3>{selectedEvent.event_name}</h3>
              <button className="close-modal" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="event-modal-content">
              <img
                src={selectedEvent.event_banner || "/api/placeholder/800/400"}
                alt={selectedEvent.event_name}
                className="event-modal-banner"
              />

              <div className="event-info-grid">
                <div className="event-info-item">
                  <h4>Date & Time</h4>
                  <p>{getFormattedEventDate(selectedEvent.event_date)}</p>
                  <p>{selectedEvent.event_time}</p>
                </div>
                <div className="event-info-item">
                  <h4>Venue</h4>
                  <p>{selectedEvent.event_venue}</p>
                </div>
                <div className="event-info-item">
                  <h4>Organizer</h4>
                  <p>{selectedEvent.admin_id}</p>
                </div>
                <div className="event-info-item">
                  <h4>Status</h4>
                  <p
                    className={
                      isToday(selectedEvent.event_date) ? "today-highlight" : ""
                    }
                  >
                    {isToday(selectedEvent.event_date)
                      ? "The Event is Today"
                      : "Upcoming"}
                  </p>
                </div>
              </div>

              <div className="event-modal-details">
                <h4>Event Description</h4>
                <p>{selectedEvent.event_details}</p>
              </div>

              {userType === "student" && (
                <a href={selectedEvent.event_url} className="register-btn">
                  Register for Event
                </a>
              )}

              {relatedEvents.length > 0 && (
                <>
                  <h4 className="related-events-heading">Related Events</h4>
                  <div className="related-events-grid">
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;