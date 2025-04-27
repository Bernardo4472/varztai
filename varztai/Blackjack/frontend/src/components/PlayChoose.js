import React from "react";
import { useNavigate } from "react-router-dom";
import "./Styles.css"; // jei naudoji bendrą stilių

const PlayChoose = () => {
    const navigate = useNavigate();

    return (
        <div className="page_Container">
            <h1 className="title">Pasirinkite</h1>
            <div className="container form-box">
                <button className="menu-btn" onClick={() => navigate("/create-room")}>
                    Sukurti kambarį
                </button>
                <button className="menu-btn" onClick={() => navigate("/join-room")}>
                    Prisijungti prie kambario
                </button>
                <button className="menu-btn" onClick={() => navigate("/")}>
                    Grįžti
                </button>
            </div>
        </div>
    );
};

export default PlayChoose;
