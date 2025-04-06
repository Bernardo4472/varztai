import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Styles.css";

const Login = () => {
    const navigate = useNavigate(); // Navigacijos funkcija

    const handleLogin = () => {
        // Čia gali pridėti login validaciją, jei reikia
        navigate("/main"); // Nukreipia į pagrindinį puslapį
    };

    return (
        <div className="page_Container">
            <h1 className="title">BLACKJACK</h1>
            <div className="container">
                <img src="/gameIcon.png" alt="Game Logo" className="form-icon" />
                <div className="form-box">
                    <h2 className="form-title">Login</h2>
                    <div className="input-container">
                        <img src="/userIcon.png" alt="User Icon" />
                        <input type="text" id="login-username" placeholder="Username" required />
                    </div>
                    <div className="input-container">
                        <img src="/passIcon.png" alt="Lock Icon" />
                        <input type="password" id="login-password" placeholder="Password" required />
                    </div>
                    <p id="error-message" className="error"></p>
                    <button id="login-btn" onClick={handleLogin}>Login</button> {/* Paspaudus kviečia handleLogin */}
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
