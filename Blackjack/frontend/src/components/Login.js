import React from "react";
import "./Styles.css"; // Stilius

const Login = () => {
    return (
        <div className="page_Container">
            <h1 className="title">BLACKJACK</h1>
            <div className="container">
                <img src="/gameIcon.png" alt="Game Logo" className="form-icon" />
                <div className="form-box">
                    <h2 className="form-title">Login</h2>
                    <div className="input-container">
                        <img src="/userIcon.png" alt="User Icon" />
                        <input
                            type="text"
                            id="login-username"
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <img src="/passIcon.png" alt="Lock Icon" />
                        <input type="password" id="login-password" placeholder="Password" required />
                    </div>
                    <p id="error-message" className="error"></p>
                    <button id="login-btn">Login</button>
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
