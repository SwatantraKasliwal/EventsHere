import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Authentication.css"; // Assuming you have a CSS file for styling

function AdminLogin({ setUserType, setAdminId }) {
  const [adminName, setAdmin] = useState("");
  const [adminPass, setPass] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUsername = (event) => setAdmin(event.target.value);
  const handlePassword = (event) => setPass(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/adminlogin", {
        username: adminName,
        password: adminPass,
      });

      if (response.data.success) {
        localStorage.setItem("userType", "admin");
        localStorage.setItem("adminId", response.data.user.id); // Store admin ID
        setUserType("admin");
        setAdminId(response.data.user.id);
        navigate("/"); // Redirect to home
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
      <h2>Admin Login</h2>

      {error && <div className="auth-message error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={adminName}
            onChange={handleUsername}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={adminPass}
            onChange={handlePassword}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Admin access only. For student login, please go to the student
          section.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;