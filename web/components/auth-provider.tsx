"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/lib/api";

type AuthContextValue = {
  isLoggedIn: boolean;
  username: string | null;
  login: (token: string, username?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  username: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = api.getToken();
    const storedUsername = typeof window !== "undefined" ? localStorage.getItem("username") : null;
    setIsLoggedIn(!!token);
    setUsername(storedUsername);
  }, []);

  const login = useCallback((token: string, u?: string) => {
    api.setToken(token);
    if (u) localStorage.setItem("username", u);
    setIsLoggedIn(true);
    setUsername(u || localStorage.getItem("username"));
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
