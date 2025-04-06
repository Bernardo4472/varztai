import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleDirectoryPlay = () => {
    navigate("/main");
  };

  const handleDirectorySettings = () => {
    navigate("/Settings");
  };

  //const [players, setPlayers] = useState<any[]>([]); // jei žaisi su tipais vėliau, galima aprašyti

  return (
    <div>
      <div className="page_Container">
        <h1 className="title">Blackjack žaidimas</h1>

        <div className="container">
          <div className="form-box">
            <h2 className="form-title">Pasirinkite</h2>

            <button onClick={handleDirectoryPlay}>Žaisti</button>
            <button onClick={handleDirectorySettings}>Nustatymai</button>
            <button>Išjungti</button>
            <button>Taisyklės</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
