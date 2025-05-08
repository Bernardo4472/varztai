const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Interface for user details returned by the backend
export interface UserDetails {
  id: number;
  username: string;
  email: string;
  balance: number;
  wins?: number; // Add optional stats fields
  losses?: number;
  games_played?: number;
}

// 🔹 Interface for the balance update response
export interface UpdateBalanceResponse {
  message: string;
  data: UserDetails; // Backend returns updated user details
}

// 🔸 Function to get user details by ID
export async function getPlayerDetails(userId: number | string, token: string): Promise<UserDetails> {
  const response = await fetch(`${API_URL}/players/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, // Assuming Bearer token auth
      "Content-Type": "application/json"
    }
  });

  // Try to parse the JSON body regardless of status first
  let result;
  try {
      result = await response.json();
  } catch (e) {
      // Handle cases where the response is not JSON (e.g., server error HTML page)
      throw new Error(`Failed to parse server response. Status: ${response.status}`);
  }

  // Now check if the response status was okay
  if (!response.ok) {
    // Throw an error using the message from the parsed result, or a default
    throw new Error(result?.message || `Failed to fetch player details. Status: ${response.status}`);
  }
  
  // If response was ok, parse balance and return the result
  if (result && typeof result.balance === 'string') {
    result.balance = parseFloat(result.balance);
  }
  // Also parse stats if they are strings (PostgreSQL might return integer/numeric types as strings)
  if (result && typeof result.wins === 'string') result.wins = parseInt(result.wins, 10);
  if (result && typeof result.losses === 'string') result.losses = parseInt(result.losses, 10);
  if (result && typeof result.games_played === 'string') result.games_played = parseInt(result.games_played, 10);

  return result; 
}

// 🔹 Interface for username update response (assuming it returns updated UserDetails)
export interface UpdateUsernameResponse {
    message: string;
    data: UserDetails; 
}

// 🔸 Function to update username
export async function updateUsername(userId: number | string, newUsername: string, token: string): Promise<UpdateUsernameResponse> {
    const response = await fetch(`${API_URL}/players/${userId}/username`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ newUsername })
    });

    const result = await response.json();
    if (!response.ok) {
        // Handle potential conflict error (username taken)
        throw new Error(result.message || "Failed to update username");
    }
    return result;
}


// 🔹 Interface for the stats update response
export interface UpdateStatsResponse {
    message: string;
    data: { // Assuming backend returns the updated stats
        id: number;
        username: string;
        wins: number;
        losses: number;
        games_played: number;
    };
}

// 🔸 Function to update player stats
export async function updatePlayerStats(userId: number | string, gameResult: 'win' | 'loss' | 'push' | 'tie', token: string): Promise<UpdateStatsResponse> {
    const response = await fetch(`${API_URL}/players/${userId}/stats`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ result: gameResult }) // Send the game result
    });

    const result = await response.json();
    if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: "Failed to update stats" }));
        throw new Error(errorResult.message || "Failed to update stats");
    }
    return result;
}

// 🔸 Function to update user balance
export async function updatePlayerBalance(userId: number | string, changeAmount: number, token: string): Promise<UpdateBalanceResponse> {
  const response = await fetch(`${API_URL}/players/${userId}/balance`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`, // Assuming Bearer token auth
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ changeAmount }) // Send the amount to change by
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update balance");
  }
  return result;
}
