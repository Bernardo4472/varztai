import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: number;
  username: string;
  exp: number;
}

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, usernameFromBackend?: string) => void;
  logout: () => void;
  isLoading: boolean;
  updateUsername: (newUsername: string) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            id: decoded.userId,
            username: decoded.username,
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, usernameFromBackend?: string) => {
  try {
    const decoded = jwtDecode<DecodedToken>(newToken);
    const finalUsername = usernameFromBackend || decoded.username || "Player";

    localStorage.setItem("token", newToken);
    localStorage.setItem("username", finalUsername); // Atnaujinta

    setToken(newToken);
    setUser({
      id: decoded.userId,
      username: finalUsername,
    });

    console.log("User logged in:", {
      id: decoded.userId,
      username: finalUsername,
    });
  } catch (error) {
    console.error("Failed to decode token on login:", error);
    logout();
  }
};


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUsername = (newUsername: string) => {
    setUser((prev) =>
      prev ? { ...prev, username: newUsername } : prev
    );
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        isLoading,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
