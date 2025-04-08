import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Authentication.css"; // Assuming you have a CSS file for styling

function Student({ setUserType, setStudentId }) {
  const [studentName, setStudentName] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNameChange = (event) => setStudentName(event.target.value);
  const handlePassChange = (event) => setStudentPass(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/student-login",
        {
          studentName,
          studentPass,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem("userType", "student");
        localStorage.setItem("studentId", response.data.user.id);
        setUserType("student");
        setStudentId(response.data.user.id);
        navigate("/");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Student Login</h2>

      {error && <div className="auth-message error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="student-email">Email</label>
          <input
            id="student-email"
            type="email"
            value={studentName}
            onChange={handleNameChange}
            required
            autoComplete="email"
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="student-password">Password</label>
          <input
            id="student-password"
            type="password"
            value={studentPass}
            onChange={handlePassChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="auth-footer">
        <span>New user?</span>
        <p>
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Student;