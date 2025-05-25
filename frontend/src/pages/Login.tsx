import React, { useState } from "react";
import { loginUser, LoginResponse, AuthData } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Styles.css";
import { useAuth } from "../context/AuthContext"; // ← IMPORTUOJAM

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // ← PANAUDOJAM login FUNKCIJĄ
  
  const handleLogin = async () => {
    setError(null);
    const loginData: AuthData = { email, password };

    try {
    const res: LoginResponse = await loginUser(loginData);

    localStorage.setItem("token", res.token);
    localStorage.setItem("userId", String(res.userId));
    localStorage.setItem("username", res.username);
    localStorage.setItem("balance", res.balance.toString());

    login(res.token, res.username);

    navigate("/Lobby");
  } catch (err: any) {
    setError(err.message || "Nepavyko prisijungti");
  }
  };

  return (
    <div className="container">
      <h1 className="title">BLACKJACK</h1>
      <div className="form-box">
        <h2 className="form-title">Login</h2>
        <div className="input-container">
          <input
            type="email"
            placeholder="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button onClick={handleLogin}>Prisijungti</button>
        <p>Neturi paskyros? <a href="/register">Registruokis</a></p>
      </div>
    </div>
  );
};

export default Login;
