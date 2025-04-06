import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles.css";

const Settings: React.FC = () => {
  const [username, setUsername] = useState<string>("User123");
  const [displayName, setDisplayName] = useState<string>("Player One");
  const [email, setEmail] = useState<string>("user@example.com");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguage] = useState<"en" | "lt">("en");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleSave = (): void => {
    if (!username || !email || !displayName) {
      setMessage("❗ Username, display name and email cannot be empty.");
      return;
    }

    if (password && password !== confirmPassword) {
      setMessage("❗ Passwords do not match.");
      return;
    }

    setMessage("✅ Settings saved successfully!");
  };

  return (
    <div className="page_Container">
      <h1 className="title">Settings</h1>
      <div className="settings-grid">
        {/* Kairė pusė */}
        <div className="settings-column">
          <h2 className="form-title">Account Info</h2>

          <label className="input-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="input-label">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <label className="input-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Dešinė pusė */}
        <div className="settings-column">
          <h2 className="form-title">Preferences</h2>

          <label className="input-label">New Password</label>
          <input
            type="password"
            placeholder="Optional"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="input-label">Confirm Password</label>
          <input
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <label className="input-label">Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as "dark" | "light")}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>

          <label className="input-label">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as "en" | "lt")}>
            <option value="en">English</option>
            <option value="lt">Lietuvių</option>
          </select>

          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <label>Receive email notifications</label>
          </div>
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
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default Settings;
