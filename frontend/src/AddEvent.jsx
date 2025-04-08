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
  const [eventUrl, setEventUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  // Handle image selection and preview
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setEventBanner(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
    setUploadProgress(0);

    const formData = new FormData();
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
      const response = await axios.post(
        "http://localhost:3000/admin-form",
        formData,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
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
            onChange={handleFileChange}
            required
          />

          {/* Image preview */}
          {previewUrl && (
            <div className="image-preview">
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  marginTop: "10px",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}
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

        {isSubmitting && (
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${uploadProgress}%`,
                height: "10px",
                backgroundColor: "#4CAF50",
                borderRadius: "5px",
                marginBottom: "20px",
              }}
            ></div>
            <p>{uploadProgress}% Uploaded</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? "#cccccc" : "#4CAF50",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Uploading..." : "Submit Event"}
        </button>
      </form>
    </div>
  );
}

export default AddEvent;
