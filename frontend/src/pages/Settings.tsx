import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StylesSettings.css';
import { updatePlayerInfo } from "../services/playerService";
import { useAuth } from "../context/AuthContext"; // 🔹 naudoti auth context
import { useSettings } from "../context/settingsContext"; // 🔹 naudoti settings tik garsui

const Settings: React.FC = () => {
  const { user, updateUsername } = useAuth();
  const { soundVolume, setSoundVolume, saveSettings } = useSettings();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>(user?.username || "");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSave = async (): Promise<void> => {
    if (!username) {
      setMessage("❗ Username cannot be empty.");
      return;
    }

    if (password && password !== confirmPassword) {
      setMessage("❗ Passwords do not match.");
      return;
    }

    try {
      await updatePlayerInfo(
  {
    username,
    password: password || undefined,
  },
);

      updateUsername(username); //  Atnaujina AuthContext visur
      saveSettings();           //  Išsaugo sound volume

      setMessage("✅ Settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Failed to save settings: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="page_Container">
      <h1 className="title">Settings</h1>
      <div className="settings-grid">
        <div className="settings-column">
          <h2 className="form-title">Account Info</h2>

          <label className="input-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        
      </div>

      <div className="buttons">
        <p className="message">{message}</p>
        <button onClick={handleSave}>Save Changes</button>
        <button
          className="back-btn"
          onClick={() => navigate("/lobby")}
          style={{ margin: "10px" }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Settings;
