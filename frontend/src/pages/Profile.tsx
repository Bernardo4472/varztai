import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerDetails, updateUsername, UserDetails, updatePlayerBalance } from '../services/playerService';
import { useAuth } from '../context/AuthContext'; // ⬅️ naudoti auth context
import './StylesProfile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUsername: updateAuthUsername } = useAuth(); // ⬅️ auth vartotojas
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [editableUsername, setEditableUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        navigate('/', { state: { message: 'Please log in to view your profile.' } });
        return;
      }

      try {
        const data = await getPlayerDetails(userId, token);
        setUserData(data);
        setEditableUsername(data.username);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile data.');
        if (err.message.includes('401') || err.message.includes('403')) {
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableUsername(event.target.value);
  };

  const handleSaveChanges = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token || !userData) {
      setError("Authentication error. Cannot save changes.");
      return;
    }

    if (editableUsername === userData.username) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateUsername(userId, editableUsername, token);
      setUserData(response.data);
      setEditableUsername(response.data.username);
      updateAuthUsername(response.data.username); // ⬅️ atnaujina visą kontekstą
      setSuccessMessage("Username updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update username.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePapildyti = () => {
    setIsTopUpOpen(true);
  };

  const closeTopUpModal = () => {
    setIsTopUpOpen(false);
    setSelectedBank('');
    setTopUpAmount('');
    // Do not clear setError and setSuccessMessage here,
    // so messages from confirmTopUp persist after modal closes.
  };

  const confirmTopUp = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token || !userData || !topUpAmount) {
      setError("Authentication error or missing data. Cannot top up balance.");
      return;
    }

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setIsSaving(true); // Use isSaving for loading state during top-up
    setError(null); // Clear previous page-level errors before new attempt
    setSuccessMessage(null); // Clear previous page-level success messages before new attempt

    try {
      const response = await updatePlayerBalance(userId, amount, token);
      setUserData(response.data); // Update user data with response from API
      setSuccessMessage("Balance updated successfully!"); // Set page-level success message
      // closeTopUpModal will be called, but success message will persist
      closeTopUpModal(); 
    } catch (err: any) {
      setError(err.message || "Failed to update balance."); // Set page-level error message
      // Do not close modal on error, so user can see the issue or retry.
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container"><h1 className="title">Loading Profile...</h1></div>;
  }

  if (error) {
    return (
      <div className="container error">
        <h1 className="title">Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
      </div>
    );
  }

  if (!userData) {
    return <div className="container"><h1 className="title">Profile not found.</h1></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Your Profile</h1>

      <div className="profile-details">
        <p className="email-text"><strong>Email:</strong> {userData.email}</p>

        <p className="username-text">
          <strong>Username:</strong> {user?.username ?? userData.username}
        </p>

        <p className="balance-text"><strong>Balance:</strong> ${userData.balance?.toFixed(2) ?? 'N/A'}</p>
        <button className="papildyti-btn" onClick={handlePapildyti}>Add balance</button>

        <hr />
        <h2 className="stats-title">Stats</h2>
        <p className="win-text"><strong>Wins:</strong> {userData.wins ?? 'N/A'}</p>
        <p className="lose-text"><strong>Losses:</strong> {userData.losses ?? 'N/A'}</p>
        <p className="gamesPlayed-text"><strong>Games Played:</strong> {userData.games_played ?? 'N/A'}</p>
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && !successMessage && <p className="error">{error}</p>}

      <div className="profile-actions">
        <button
          onClick={handleSaveChanges}
          disabled={editableUsername === userData.username || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
      </div>

      {isTopUpOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select bank and amount</h2>
            <label>Bank:</label>
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
              <option value="">-- Choose --</option>
              <option value="Swedbank">Swedbank</option>
              <option value="SEB">SEB</option>
              <option value="Luminor">Luminor</option>
            </select>

            <label>Sum:</label>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Pvz. 10.00"
            />

            <div className="modal-buttons">
              <button onClick={confirmTopUp}>Confirm</button>
              <button onClick={closeTopUpModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
