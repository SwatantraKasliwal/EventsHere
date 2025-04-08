
import React, { useState } from "react"
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Authentication.css"; // Assuming you have a CSS file for styling

function Register({ setUserType, setStudentId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleConfirmPass(event) {
    setConfirmPass(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    // Password strength validation (optional)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    axios
      .post(
        "http://localhost:3000/student-register",
        { email, password },
        { withCredentials: true }
      )
      .then((res) => {
        console.log("Registration response:", res.data);
        if (res.data.success) {
          setSuccess(res.data.message || "Registration successful!");

          localStorage.setItem("userType", "student");
          localStorage.setItem("studentId", res.data.user.id);
          setUserType("student");
          setStudentId(res.data.user.id);

          // Delay navigation to show success message
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          setError(res.data.message || "Registration failed.");
        }
      })
      .catch((err) => {
        console.error("Registration error:", err);
        setError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="auth-container">
      <h2>Student Registration</h2>

      {error && <div className="auth-message error-message">{error}</div>}

      {success && <div className="auth-message success-message">{success}</div>}

      <form
        onSubmit={handleSubmit}
        className="auth-form"
        id="stu-registration-form"
      >
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            required
            autoComplete="new-password"
          />
          <div className="password-requirements">
            <span>Password should:</span>
            <ul>
              <li>Be at least 8 characters long</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPass">Confirm Password</label>
          <input
            id="confirmPass"
            type="password"
            placeholder="Confirm password"
            name="confirmPass"
            value={confirmPass}
            onChange={handleConfirmPass}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="auth-footer">
        <span>Already Registered?</span>
        <p>
          <Link to="/student-login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;