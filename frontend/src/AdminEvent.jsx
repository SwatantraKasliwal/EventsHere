import React from 'react'

function AdminEvent() {
  const [event, setEvent] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/adminevent")
      .then((res) => setEvent(res.data)) // You need to set the data to state
      .catch((error) => console.error("Error fetching events:", error)); // Add error handling
  }, []);

  return (
    <div>
      {/* Map through the events to display them */}
      {event.map((e) => (
        <div key={e.event_id}>
          <p>{e.event_name}</p>
          <img src={e.event_banner} alt="eventImg" />
        </div>
      ))}
    </div>
  );
}

export default AdminEvent
