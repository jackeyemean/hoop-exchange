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

  const login = useCallback((token: string, u?: string) => {
    api.setToken(token);
    if (u) {
      localStorage.setItem("username", u);
      setUsername(u);
    } else {
      setUsername(localStorage.getItem("username"));
      void api.getMe().then((me) => {
        if (me) {
          localStorage.setItem("username", me.username);
          setUsername(me.username);
        }
      }).catch(() => {});
    }
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
    supabase.auth.signOut();
  }, []);

  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        login(
          session.access_token,
          session.user?.user_metadata?.full_name ??
            session.user?.email ??
            undefined
        );
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
        login(
          session.access_token,
          session.user?.user_metadata?.full_name ??
            session.user?.email ??
            undefined
        );
      } else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
