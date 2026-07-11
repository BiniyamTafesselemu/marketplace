import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";


interface User {
  id: number;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);

  const parseToken = (token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.id, role: payload.role };
    } catch {
      return null;
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(parseToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Read token from URL after Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      login(urlToken);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  // Load user from stored token on app start
  useEffect(() => {
    if (token) {
      setUser(parseToken(token));
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}