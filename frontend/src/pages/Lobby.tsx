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
      <h1 className="title">Blackjack Game</h1>

      <div className="container">
        <div className="form-box">
          <h2 className="form-title">Choose an option</h2>

          <button onClick={handleDirectoryPlayChoose}>Play</button>
          <button onClick={handleDirectoryProfile}>Profile</button>
          <button onClick={handleDirectorySettings}>Settings</button>
          <button onClick={handleDirectoryRules}>Rules</button>
          <button onClick={handleDirectoryClose}>Log Out</button>
        </div>
      </div>
    </div>
  </div>
);

};

export default Main;
