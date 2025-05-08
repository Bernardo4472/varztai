import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerDetails, updateUsername, UserDetails } from '../services/playerService'; // Import updateUsername
// Assuming you have a CSS file for styling, or use inline styles/utility classes
import './Styles.css'; // Using the same shared style as Login

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [editableUsername, setEditableUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false); // State for save button loading
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success message

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      // Retrieve userId and token from localStorage (adjust keys if needed)
      const userId = localStorage.getItem('userId'); // Assuming userId is stored on login
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
        setEditableUsername(data.username); // Initialize editable username
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile data.');
        // Handle specific errors, e.g., redirect if token is invalid (401/403)
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
    // --- TODO: Implement Save Logic ---
    // 1. Get userId and token from localStorage again.
    // 2. Check if editableUsername has changed from userData.username.
    if (!userData || editableUsername === userData.username) {
      return; // No changes to save
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      setError("Authentication error. Cannot save changes.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateUsername(userId, editableUsername, token);
      // Update local state with the data returned from the backend
      setUserData(response.data); 
      // Update editable username as well in case backend modified it (e.g., trimming)
      setEditableUsername(response.data.username); 
      // Update username in localStorage if other parts of the app use it
      localStorage.setItem('username', response.data.username); 
      setSuccessMessage("Username updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update username.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container"><h1 className="title">Loading Profile...</h1></div>;
  }

  if (error) {
    return <div className="container error"><h1 className="title">Error</h1><p>{error}</p><button onClick={() => navigate('/lobby')}>Back to Lobby</button></div>;
  }

  if (!userData) {
    // Should be handled by loading/error states, but as a fallback
    return <div className="container"><h1 className="title">Profile not found.</h1><button onClick={() => navigate('/lobby')}>Back to Lobby</button></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Your Profile</h1>
      <div className="profile-details">
        <p><strong>Email:</strong> {userData.email}</p>
        
        <div className="input-container">
          <label htmlFor="username"><strong>Username:</strong></label>
          <input 
            type="text" 
            id="username"
            value={editableUsername} 
            onChange={handleUsernameChange} 
          />
        </div>

        <p><strong>Balance:</strong> {userData.balance?.toFixed(2) ?? 'N/A'}$</p>
        <hr />
        <h2>Stats</h2>
        <p><strong>Wins:</strong> {userData.wins ?? 'N/A'}</p>
        <p><strong>Losses:</strong> {userData.losses ?? 'N/A'}</p>
        <p><strong>Games Played:</strong> {userData.games_played ?? 'N/A'}</p>
      </div>
      
      {successMessage && <p className="success-message">{successMessage}</p>} 
      {error && !successMessage && <p className="error">{error}</p>} {/* Show error only if no success message */}
      
      <div className="profile-actions">
        <button 
          onClick={handleSaveChanges} 
          disabled={!userData || editableUsername === userData.username || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
      </div>
    </div>
  );
};

export default Profile;
