import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  login: (token: string, role: string, userId?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("role");
    }
    return null;
  });
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!token;

  const login = (token: string, role: string, userId?: string) => {
    setToken(token);
    setRole(role);
    setUserId(userId || null);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  };

  // Session validation and loading
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // First check expiry locally
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          const expiry = payload.exp * 1000; // Convert to milliseconds
          if (Date.now() >= expiry) {
            logout();
            alert("Session expired. Please login again.");
            setIsLoading(false);
            return;
          }

          // Validate with backend
          const response = await fetch("http://localhost:8000/validate_token", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (response.ok) {
            // Token is valid, set state
            setToken(storedToken);
            setRole(localStorage.getItem("role"));
            const id = localStorage.getItem("userId");
            setUserId(id);
          } else {
            logout();
            alert("Session invalid. Please login again.");
          }
        } catch (error) {
          console.error("Error validating token:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    validateToken();

    // Check token expiry every minute
    const checkTokenExpiry = () => {
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000; // Convert to milliseconds
          if (Date.now() >= expiry) {
            logout();
            alert("Session expired. Please login again.");
          }
        } catch (error) {
          console.error("Error checking token expiry:", error);
          logout();
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
