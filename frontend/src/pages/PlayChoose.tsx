import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles.css"; // Jei naudoji bendrą globalų CSS

const PlayChoose: React.FC = () => {
  const navigate = useNavigate();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomId, setRoomId] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleCreateRoom = async () => {
    console.log("Attempting to create a new room...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ userId: "someUserId" }), // Send user data if needed
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Room created:", data);
      alert(`Kambarys sėkmingai sukurtas! ID: ${data.roomId}`);
      navigate(`/room/${data.roomId}`); // Navigate to the room page
    } catch (error) {
      console.error("Failed to create room:", error);
      alert(`Nepavyko sukurti kambario: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleJoinRoomClick = () => {
    setShowJoinInput(true);
  };

  const handleJoinRoomSubmit = async () => {
    if (roomId.trim() === "") {
      alert("Prašome įvesti kambario ID.");
      return;
    }
    console.log(`Attempting to join room: ${roomId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Joined room:", data);
      alert(`Sėkmingai prisijungta prie kambario: ${data.roomId}`);
      navigate(`/room/${data.roomId}`); // Navigate to the room page
    } catch (error) {
      console.error("Failed to join room:", error);
      alert(`Nepavyko prisijungti prie kambario: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="page_Container">
      <h1 className="title">Pasirinkite Žaidimo Būdą</h1>
      <div className="container form-box">
        <button className="menu-btn" onClick={handleCreateRoom}>
          Sukurti Naują Kambarį
        </button>

        {!showJoinInput ? (
          <button className="menu-btn" onClick={handleJoinRoomClick}>
            Prisijungti prie Kambario su ID
          </button>
        ) : (
          <div className="join-room-section">
            <input
              type="text"
              placeholder="Įveskite kambario ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-id-input"
            />
            <button className="menu-btn" onClick={handleJoinRoomSubmit}>
              Patvirtinti Prisijungimą
            </button>
            <button className="menu-btn" onClick={() => setShowJoinInput(false)}>
              Atšaukti
            </button>
          </div>
        )}

        <button className="menu-btn" onClick={() => navigate("/")}>
          Grįžti į Pagrindinį Meniu
        </button>
      </div>
    </div>
  );
};

export default PlayChoose;
