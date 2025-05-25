const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Funkcija vartotojo ID gavimui iš JWT tokeno
function getAuthUserId(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

// 🔹 Interface for user details
export interface UserDetails {
  id: number;
  username: string;
  email: string;
  balance: number;
  wins?: number;
  losses?: number;
  games_played?: number;
}

export interface UpdateBalanceResponse {
  message: string;
  data: UserDetails;
}

export async function getPlayerDetails(userId: number | string, token: string): Promise<UserDetails> {
  const response = await fetch(`${API_URL}/players/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Failed to parse response. Status: ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(result?.message || `Failed to fetch player details. Status: ${response.status}`);
  }

  if (result && typeof result.balance === 'string') {
    result.balance = parseFloat(result.balance);
  }
  if (result && typeof result.wins === 'string') result.wins = parseInt(result.wins, 10);
  if (result && typeof result.losses === 'string') result.losses = parseInt(result.losses, 10);
  if (result && typeof result.games_played === 'string') result.games_played = parseInt(result.games_played, 10);

  return result;
}

export interface UpdateUsernameResponse {
  message: string;
  data: UserDetails;
}

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
    throw new Error(result.message || "Failed to update username");
  }
  return result;
}

export interface UpdateStatsResponse {
  message: string;
  data: {
    id: number;
    username: string;
    wins: number;
    losses: number;
    games_played: number;
  };
}

export async function updatePlayerStats(userId: number | string, gameResult: 'win' | 'loss' | 'push' | 'tie', token: string): Promise<UpdateStatsResponse> {
  const response = await fetch(`${API_URL}/players/${userId}/stats`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ result: gameResult })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update stats");
  }
  return result;
}

export async function updatePlayerBalance(userId: number | string, changeAmount: number, token: string): Promise<UpdateBalanceResponse> {
  const response = await fetch(`${API_URL}/players/${userId}/balance`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ changeAmount })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update balance");
  }

  // Ensure numeric fields in the response data are parsed correctly
  if (result.data && typeof result.data.balance === 'string') {
    result.data.balance = parseFloat(result.data.balance);
  }
  if (result.data && typeof result.data.wins === 'string') {
    result.data.wins = parseInt(result.data.wins, 10);
  }
  if (result.data && typeof result.data.losses === 'string') {
    result.data.losses = parseInt(result.data.losses, 10);
  }
  if (result.data && typeof result.data.games_played === 'string') {
    result.data.games_played = parseInt(result.data.games_played, 10);
  }

  return result;
}

// 🔸 Nauja funkcija su x-user-id iš JWT
export async function updatePlayerInfo(data: {
  username: string;
  password?: string;
}): Promise<{ message: string }> {
  const userId = getAuthUserId(); // Gauti iš JWT

  if (!userId) {
    throw new Error("User ID not found in token");
  }

  const response = await fetch(`${API_URL}/players/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId.toString(),
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update player info");
  }

  return result;
}
