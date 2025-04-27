import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

// Interface for the decoded JWT payload (adjust based on your actual token structure)
interface DecodedToken {
  userId: number;
  username: string;
  // Add other relevant fields from your token payload if needed
  exp: number; // Expiration time
}

// Interface for user details stored in context
interface User {
  id: number;
  username: string;
  // Add balance if you want to store/update it via context as well,
  // though fetching fresh balance in the game component might be better.
}

// Updated context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean; // Add loading state for initial auth check
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  // Effect to check for existing token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({ id: decoded.userId, username: decoded.username });
        } else {
          // Token expired, remove it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token'); // Remove invalid token
      }
    }
    setIsLoading(false); // Finished loading initial auth state
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ id: decoded.userId, username: decoded.username });
      console.log("User logged in:", { id: decoded.userId, username: decoded.username });
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      // Handle login failure - maybe clear state?
      logout(); // Clear potentially bad state
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    console.log("User logged out");
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
