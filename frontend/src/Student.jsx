import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Student({ setUserType,setStudentId }) {
  const [studentName, setStudentName] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const navigate = useNavigate();

  const handleNameChange = (event) => setStudentName(event.target.value);
  const handlePassChange = (event) => setStudentPass(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/student-login",
        {
          studentName,
          studentPass
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem("userType", "student");
        localStorage.setItem("studentId", response.data.user.id); // Store student ID
        setUserType("student");
        setStudentId(response.data.user.id);
        alert(response.data.user.id);
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Email</label>
        <input
          type="email"
          value={studentName}
          onChange={handleNameChange}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          value={studentPass}
          onChange={handlePassChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <div>
        New user ?
        <p>
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Student;
