import React, { useState } from "react";
import "./Styles.css"; // Arba atskirą Register.css, jei reikia

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = () => {
        if (!username || !email || !password) {
            setErrorMessage("All fields are required.");
            return;
        }

        console.log("Registering:", { username, email, password });
        setErrorMessage("");
    };

    return (
        <div className="page_Container">
            <h1 className="title">Register</h1>
            <div className="container">
                <img src="gameIcon.png" alt="Game Logo" className="form-icon" />
                <div className="form-box">
                    <h2 className="form-title">Create Account</h2>
                    <div className="input-container">
                        <img src="userIcon2.png" alt="User Icon" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <img src="userIcon.png" alt="Email Icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <img src="passIcon.png" alt="Lock Icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <p className="error">{errorMessage}</p>
                    <button onClick={handleRegister}>Register</button>
                    <p>
                        Already have an account? <a href="/">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
