import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Home from "./Home";
import Student from "./Student";
import About from "./About";
import Events from "./Events";
import AddEvent from "./AddEvent";
import AdminEvent from "./AdminEvent";
import Register from "./Register";
import "./Navigation.css"; // Import your CSS file for styling

function Navigation() {
  const [userType, setUserType] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("userType");
    const savedAdminId = localStorage.getItem("adminId");
    const savedStudentId = localStorage.getItem("studentId");
    if (savedAdminId && savedUser === "admin") {
      setAdminId(savedAdminId);
      setUserType(savedUser);
    }
    if (savedStudentId && savedUser === "student") {
      setStudentId(savedStudentId);
      setUserType(savedUser);
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    setUserType(null);
    setAdminId(null);
    setStudentId(null);
    navigate("/events");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className={mobileMenuOpen ? "" : "collapsed"}>
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
        <ul>
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          {userType === "admin" ? (
            <>
              <li>
                <Link
                  to="/admin-events"
                  className={
                    location.pathname === "/admin-events" ? "active" : ""
                  }
                >
                  Admin Events
                </Link>
              </li>
              <li>
                <Link
                  to="/add-event"
                  className={location.pathname === "/add-event" ? "active" : ""}
                >
                  Add Event
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : userType === "student" ? (
            <>
              <li>
                <Link
                  to="/events"
                  className={location.pathname === "/events" ? "active" : ""}
                >
                  Events
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/about"
                  className={location.pathname === "/about" ? "active" : ""}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/adminlogin"
                  className={
                    location.pathname === "/adminlogin" ? "active" : ""
                  }
                >
                  Admin
                </Link>
              </li>
              <li>
                <Link
                  to="/student-login"
                  className={
                    location.pathname === "/student-login" ? "active" : ""
                  }
                >
                  Student
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className={location.pathname === "/events" ? "active" : ""}
                >
                  Events
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="container">
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
            element={
              <Student setUserType={setUserType} setStudentId={setStudentId} />
            }
          />
          <Route path="/events" element={<Events userType={userType} />} />
          <Route
            path="/register"
            element={
              <Register setUserType={setUserType} setStudentId={setStudentId} />
            }
          />
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
      </div>
    </>
  );
}

export default Navigation;