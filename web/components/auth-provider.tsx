"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  isLoggedIn: boolean;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshUsername: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  username: null,
  login: () => {},
  logout: () => {},
  refreshUsername: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const login = useCallback((token: string) => {
    api.setToken(token);
    setIsLoggedIn(true);
    setUsername(localStorage.getItem("username")); // temporary until getMe returns
    // Always fetch username from our API (not OAuth metadata)
    void api.getMe().then((me) => {
      if (me?.username) {
        localStorage.setItem("username", me.username);
        setUsername(me.username);
      }
    }).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    api.setToken(null);
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
    await supabase.auth.signOut({ scope: "local" });
    // Full reload to clear all auth state and fix logout->login flow
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const refreshUsername = useCallback(async () => {
    const me = await api.getMe().catch(() => null);
    if (me?.username) {
      localStorage.setItem("username", me.username);
      setUsername(me.username);
    }
  }, []);

  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        login(session.access_token);
      } else {
        const token = api.getToken();
        const storedUsername = typeof window !== "undefined" ? localStorage.getItem("username") : null;
        setIsLoggedIn(!!token);
        setUsername(storedUsername);
      }
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        login(session.access_token);
      } else if (event === "SIGNED_OUT") {
        api.setToken(null);
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [login]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout, refreshUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
