import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Importuojame stilių

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <h2 className="logo">Blackjack</h2>

            <div className={`profile-container ${menuOpen ? "active" : ""}`}>
                <img
                    src="/profilePic.png"
                    alt="Profile"
                    className="profile-pic"
                    onClick={() => setMenuOpen(!menuOpen)}
                />

                {menuOpen && (
                    <div className="dropdown-menu">
                        <Link to="/profile" className="dropdown-item">Profilis</Link>
                        <Link to="/settings" className="dropdown-item">Nustatymai</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
