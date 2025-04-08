import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Home from "./Home";
import Student from "./Student";
import About from "./About";
import Events from "./Events";
import AddEvent from "./AddEvent"; // Component for adding events
import AdminEvent from "./AdminEvent";
import Register from "./Register";

function Navigation() {
  const [userType, setUserType] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const savedUser = localStorage.getItem("userType");
    if (savedUser === "admin" || savedUser === "student") {
      setUserType(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    setUserType(null);
    setAdminId(null);
    navigate("/events");
  };

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {userType === "admin" ? (
            <>
              <li>
                <Link to="/admin-events">Admin Events</Link>
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
                <Link to="/student-login">Student</Link>
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
          element={
            <AdminLogin setUserType={setUserType} setAdminId={setAdminId} />
          }
        />
        <Route
          path="/student-login"
          element={<Student setUserType={setUserType} />}
        />
        <Route path="/events" element={<Events userType={userType}  />} />
        <Route path="/register" element={<Register setUserType={setUserType} />} />
        {/* Ensure only admins can access AddEvent */}
        <Route
          path="/add-event"
          element={
            userType === "admin" ? (
              <AddEvent adminId={adminId} type="admin" />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin-events"
          element={
            userType === "admin" ? (
              <AdminEvent adminId={adminId} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default Navigation;
