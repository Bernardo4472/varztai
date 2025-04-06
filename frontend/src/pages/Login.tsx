import React, { useState } from "react";
import { loginUser, LoginResponse, AuthData } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Styles.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    const loginData: AuthData = { email, password };

    try {
      const res: LoginResponse = await loginUser(loginData);

      // Galima čia išsaugoti tokeną ar naudotoją global state ar localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username);
      localStorage.setItem("balance", res.balance.toString());

      console.log("✅ Prisijungta:", res);
      navigate("/Loby"); // Perkeliame į pagrindinį puslapį
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
