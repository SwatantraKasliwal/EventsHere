import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin({ setUserType }) {
  const [adminName, setAdmin] = useState("");
  const [adminPass, setPass] = useState("");
  const navigate = useNavigate();

  const handleUsername = (event) => setAdmin(event.target.value);
  const handlePassword = (event) => setPass(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/adminlogin", {
        username: adminName,
        password: adminPass,
      });

      if (response.data.success) {
        localStorage.setItem("userType", "admin");
        setUserType("admin");
        navigate("/"); // Redirect to home
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
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          value={adminName}
          onChange={handleUsername}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          value={adminPass}
          onChange={handlePassword}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
