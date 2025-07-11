﻿import React, { useState } from "react";
import { registerUser, AuthData, RegisterResponse } from "../services/authService";
import { useNavigate } from "react-router-dom";
import styles from "./Styles.module.css";

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);

    const data: AuthData = { username, email, password };

    try {
      const res: RegisterResponse = await registerUser(data);
      console.log("✅ Registration:", res.message);
      setSuccess(true);

      // Po kelių sekundžių redirect į login
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Registration error");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Registration</h1>
      <div className="form-box">
        <h2 className="form-title">Create an account</h2>
        <div className="input-container">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p style={{ color: "lightgreen" }}>✅ Registration successful! Moving...</p>}

        <button onClick={handleRegister}>Register</button>
        <p className="white">Do you have an account? <a href="/">Log in</a></p>
      </div>
    </div>
  );
};

export default Register;
