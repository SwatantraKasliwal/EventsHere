import React, { useEffect, useState } from "react";
import axios from "axios";
// import "./AdminEventManagement.css";

const AdminEvent = ({adminId}) => {
  const [events, setEvents] = useState([]);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

const fetchEvents = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/admin-events?adminId=${adminId}`
    );
    setEvents(response.data);
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};


  const handleDeleteClick = (eventId) => {
    setDeleteEventId(eventId);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteEventId) return;

    try {
      await axios.post("http://localhost:3000/delete", { deleteEventId });
      setEvents(events.filter((event) => event.event_id !== deleteEventId));
      setModalOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="admin-event">
      <h2>Event Management</h2>
      <table>
        <thead>
          <tr>
            <th>Delete</th>
            <th>Event</th>
            <th>Details</th>
            <th>Time</th>
            <th>Date</th>
            <th>Venue</th>
            <th>Committees</th>
            <th>Registration Link</th>
            <th>Event Banner</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.event_id}>
              <td>
                <button onClick={() => handleDeleteClick(event.event_id)}>
                  Delete
                </button>
              </td>
              <td>{event.event_name}</td>
              <td>{event.event_details}</td>
              <td>{event.event_time}</td>
              <td>{new Date(event.event_date).toLocaleDateString()}</td>
              <td>{event.event_venue}</td>
              <td>{event.admin_id}</td>
              <td>
                <a
                  href={event.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Registration Link
                </a>
              </td>
              <td>
                <img
                  src={event.event_banner}
                  alt="Event Banner"
                  style={{ width: "100px", height: "100px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <p>Are you sure you want to delete this event?</p>
            <button onClick={confirmDelete}>Confirm</button>
            <button onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvent;
