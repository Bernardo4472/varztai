const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Tipas registracijos/prisijungimo formos duomenims
export interface AuthData {
  email: string;
  password: string;
  username?: string; // registracijai reikalingas, loginui - ne
}

// 🔹 Atsakymas iš login endpoint'o
export interface LoginResponse {
  message: string;
  token: string;
  username: string;
  balance: number;
}

// 🔹 Registracijos atsakymas
export interface RegisterResponse {
  message: string;
}

// 🔸 REGISTRACIJA
export async function registerUser(data: AuthData): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Registracijos klaida");

  return result;
}

// 🔸 PRISIJUNGIMAS
export async function loginUser(data: AuthData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Prisijungimo klaida");

  return result;
}