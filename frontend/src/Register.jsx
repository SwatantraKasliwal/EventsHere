import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register({ setUserType }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
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
    if (password === confirmPass) {
      axios
        .post(
          "http://localhost:3000/student-register",
          { email, password },
          { withCredentials: true }
        )
        .then((res) => {
          console.log("Registration response:", res.data);
          if (res.data.success) {
            alert(res.data.message);
            localStorage.setItem("userType", "student");
            setUserType("student");
            navigate("/");
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.error("Registration error:", err);
          alert("Something went wrong. Please try again.");
        });
    } else {
      alert("Passwords do not match.");
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} id="stu-registration-form">
        <div>
          <div>
            <label htmlFor="email">Enter your email:</label>
          </div>
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              name="email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
        </div>
        <div>
          <div>
            <label htmlFor="password">Password:</label>
          </div>
          <div>
            <input
              type="password"
              placeholder="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
        </div>
        <div>
          <div>
            <label htmlFor="confirmPass">Confirm Password</label>
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              name="confirmPass"
              value={confirmPass}
              onChange={handleConfirmPass}
            />
          </div>
        </div>
        <button type="submit" className="btn-element">
          Register
        </button>
      </form>
      <div>
        Already Registered?
        <p style={{}}>
          <Link to="/student-login" className="login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
