import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Student({ setUserType }) {
  const [studentName, setStudentName] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const navigate = useNavigate();

  const handleNameChange = (event) => setStudentName(event.target.value);
  const handlePassChange = (event) => setStudentPass(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/studentlogin", {
        username: studentName,
        password: studentPass,
      });

      if (response.data.success) {
        localStorage.setItem("userType", "student");
        setUserType("student");
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
        <label htmlFor="username">Username</label>
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
    </div>
  );
}

export default Student;
