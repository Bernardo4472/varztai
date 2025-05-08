import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleDirectorySettings = () => {
    navigate("/Settings");
  };
  const handleDirectoryRules = () => {
    navigate("/Rules");
  };
  const handleDirectoryPlayChoose = () => {
    navigate("/PlayChoose");
  };
  const handleDirectoryClose = () => {
    navigate("/");
  };
  const handleDirectoryProfile = () => {
    navigate("/Profile");
  };

  return (
    <div>
      <div className="page_Container">
        <h1 className="title">Blackjack žaidimas</h1>

        <div className="container">
          <div className="form-box">
            <h2 className="form-title">Pasirinkite</h2>

            <button onClick={handleDirectoryPlayChoose}>Žaisti</button>
            <button onClick={handleDirectoryProfile}>Profilis</button>
            <button onClick={handleDirectorySettings}>Nustatymai</button>
            <button onClick={handleDirectoryRules}>Taisyklės</button>
            <button onClick={handleDirectoryClose}>Atsijungti</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
