import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Home from "./Home";
import Student from "./Student";
import About from "./About";
import Events from "./Events";
import AddEvent from "./AddEvent"; // Component for adding events

function Navigation() {
  const [userType, setUserType] = useState(null); // null = not logged in, "admin" = admin logged in, "student" = student logged in

  // Check localStorage for existing login state
  useEffect(() => {
    const savedUser = localStorage.getItem("userType");
    if (savedUser) {
      setUserType(savedUser);
    }
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("userType");
    setUserType(null);
  };

  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {userType === "admin" ? (
            <>
              <li>
                <Link to="/events">Admin Events</Link>
              </li>
              <li>
                <Link to="/add-event">Add Event</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : userType === "student" ? (
            <>
              <li>
                <Link to="/events">Events</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/adminlogin">Admin</Link>
              </li>
              <li>
                <Link to="/student">Student</Link>
              </li>
              <li>
                <Link to="/events">Events</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/adminlogin"
          element={<AdminLogin setUserType={setUserType} />}
        />
        <Route
          path="/student"
          element={<Student setUserType={setUserType} />}
        />
        <Route path="/events" element={<Events />} />
        {userType === "admin" && (
          <Route path="/add-event" element={<AddEvent />} />
        )}
      </Routes>
    </Router>
  );
}

export default Navigation;
