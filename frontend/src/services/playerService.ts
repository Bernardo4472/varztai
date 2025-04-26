const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Interface for user details returned by the backend
export interface UserDetails {
  id: number;
  username: string;
  email: string;
  balance: number;
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

  const result = await response.json();
  if (!response.ok) {
    // Try to parse error message from backend response if available
    const errorResult = await response.json().catch(() => ({ message: "Failed to fetch player details" }));
    throw new Error(errorResult.message || "Failed to fetch player details");
  }
  // Backend now returns data directly
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
