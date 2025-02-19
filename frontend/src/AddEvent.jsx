import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddEvent({ type,adminId }) {
  const [eventName, setEventName] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventBanner, setEventBanner] = useState(null);
  const [eventURL, setEventURL] = useState("");

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

    const formData = new FormData();
    formData.append("eventName", eventName);
    formData.append("eventDetails", eventDetails);
    formData.append("eventDate", eventDate);
    formData.append("eventTime", eventTime);
    formData.append("eventVenue", eventVenue);
    formData.append("eventUrl", eventURL);
    formData.append("eventBanner", eventBanner);
    formData.append("type", type);
    formData.append("adminId", adminId);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.post(
        "http://localhost:3000/admin-form",
        formData,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate("/admin-events"); // Redirect after success
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Posting failed:", error);
      alert("Error in posting the event (frontend)");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} id="addEvent">
        <label htmlFor="eventName">Event Name</label>
        <input
          type="text"
          placeholder="Enter the event name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        <label htmlFor="eventDetails">Event Details</label>
        <textarea
          placeholder="Enter the event details"
          value={eventDetails}
          onChange={(e) => setEventDetails(e.target.value)}
        />

        <label htmlFor="eventDate">Event Date</label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />

        <label htmlFor="eventTime">Event Time</label>
        <input
          type="text"
          placeholder="Enter the time of the event"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
        />

        <label htmlFor="eventVenue">Venue</label>
        <input
          type="text"
          placeholder="Enter the location of the event"
          value={eventVenue}
          onChange={(e) => setEventVenue(e.target.value)}
        />

        <label htmlFor="eventBanner">Event Banner</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files.length > 0 && setEventBanner(e.target.files[0])
          }
        />

        <label htmlFor="eventURL">Event URL</label>
        <input
          type="url"
          placeholder="Enter the event URL"
          value={eventURL}
          onChange={(e) => setEventURL(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default AddEvent;




