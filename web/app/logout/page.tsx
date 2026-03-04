"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  useEffect(() => {
    const run = async () => {
      // Clear our app state first
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
      }
      await supabase.auth.signOut({ scope: "local" });
      // Hard redirect to login - full page load, no React state carried over
      window.location.replace("/login");
    };
    run();
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-neutral-500">Signing out...</p>
    </div>
  );
}
