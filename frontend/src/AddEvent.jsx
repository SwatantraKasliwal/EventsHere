
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddEvent({ type, adminId }) {
  const [eventName, setEventName] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventBanner, setEventBanner] = useState(null);
  const [eventUrl, setEventUrl] = useState(""); // Changed to match backend field name
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    // Basic validation
    if (
      !eventName ||
      !eventDetails ||
      !eventDate ||
      !eventTime ||
      !eventVenue ||
      !eventBanner
    ) {
      return alert("Please fill all fields and upload an event banner.");
    }

    setIsSubmitting(true);

    const formData = new FormData();
    // Match these field names exactly with what the backend expects
    formData.append("eventName", eventName);
    formData.append("eventDetails", eventDetails);
    formData.append("eventDate", eventDate);
    formData.append("eventTime", eventTime);
    formData.append("eventVenue", eventVenue);
    formData.append("eventUrl", eventUrl);
    formData.append("eventBanner", eventBanner);
    formData.append("type", type);
    formData.append("adminId", adminId);

    try {
      // Don't set Content-Type header - axios will set it with correct boundary for FormData
      const response = await axios.post(
        "http://localhost:3000/admin-form",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate("/admin-events"); // Redirect after success
      } else {
        alert(response.data.message || "Error submitting event");
      }
    } catch (error) {
      console.error("Posting failed:", error);
      alert(error.response?.data?.message || "Error in posting the event");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-event-container">
      <h2>Add New Event</h2>
      <form onSubmit={handleSubmit} id="addEvent">
        <div className="form-group">
          <label htmlFor="eventName">Event Name</label>
          <input
            type="text"
            id="eventName"
            placeholder="Enter the event name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDetails">Event Details</label>
          <textarea
            id="eventDetails"
            placeholder="Enter the event details"
            value={eventDetails}
            onChange={(e) => setEventDetails(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDate">Event Date</label>
          <input
            type="date"
            id="eventDate"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventTime">Event Time</label>
          <input
            type="text"
            id="eventTime"
            placeholder="Enter the time of the event (e.g. 3:00 PM)"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventVenue">Venue</label>
          <input
            type="text"
            id="eventVenue"
            placeholder="Enter the location of the event"
            value={eventVenue}
            onChange={(e) => setEventVenue(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventBanner">Event Banner</label>
          <input
            type="file"
            id="eventBanner"
            accept="image/*"
            onChange={(e) =>
              e.target.files.length > 0 && setEventBanner(e.target.files[0])
            }
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventUrl">Event URL</label>
          <input
            type="url"
            id="eventUrl"
            placeholder="Enter the event URL"
            value={eventUrl}
            onChange={(e) => setEventUrl(e.target.value)}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default AddEvent;


