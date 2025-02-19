import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Home from "./Home";
import Student from "./Student";
import About from "./About";
import Events from "./Events";
import AddEvent from "./AddEvent"; // Component for adding events

function Navigation() {
  const [userType, setUserType] = useState(null);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userType");
    if (savedUser === "admin" || savedUser === "student") {
      setUserType(savedUser);
    }
  }, []);

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
          element={<AdminLogin setUserType={setUserType} setAdminId={setAdminId} />}
        />
        <Route
          path="/student"
          element={<Student setUserType={setUserType} />}
        />
        <Route path="/events" element={<Events />} />

        {/* Ensure only admins can access AddEvent */}
        <Route
          path="/add-event"
          element={
            userType === "admin" ? (
              <AddEvent type={userType} adminId={adminId}/>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default Navigation;
