"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    let cancelled = false;

    const completeLogin = (session: { access_token: string }) => {
      if (cancelled) return;
      login(session.access_token);
      router.replace(next);
    };

    const run = async () => {
      // PKCE flow: code in query params
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        if (data.session?.access_token) {
          completeLogin(data.session);
        } else {
          setError("No session returned");
        }
        return;
      }

      // Implicit flow: tokens in hash fragment (Supabase auto-parses on load)
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.access_token) {
        completeLogin(session);
      } else {
        setError("Missing authorization code");
      }
    };

    run().catch((err) => {
      if (!cancelled) setError(err.message || "Authentication failed");
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-sm pt-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <a href="/login" className="mt-4 inline-block text-sm underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm pt-8 text-center text-neutral-500">
      Completing sign in...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm pt-8 text-center text-neutral-500">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
