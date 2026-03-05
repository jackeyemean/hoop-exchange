"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { isLoggedIn, username, refreshUsername } = useAuth();
  const [newUsername, setNewUsername] = useState(username || "");

  useEffect(() => {
    if (username) setNewUsername(username);
  }, [username]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.updateUsername(newUsername.trim());
      await refreshUsername();
      setSuccess(true);
    } catch (e: any) {
      const msg = e.message || "Failed to update username";
      setError(
        msg.toLowerCase().includes("different username")
          ? "very funny…"
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Profile</h1>
        <p className="mb-6 text-neutral-500">
          Set your display name for the leaderboard.
        </p>
        <div className="rounded-xl border border-neutral-200 py-20 text-center dark:border-neutral-800">
          <p className="mb-4 text-neutral-500">
            Log in to set your username.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Log in with Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Profile</h1>
      <p className="mb-8 text-neutral-500">
        Your username is shown on the leaderboard (max 23 characters).
      </p>

      <form onSubmit={handleSubmit} className="max-w-md">
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Display name
        </label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="e.g. hoop_fan_42"
          maxLength={23}
          className="mb-4 w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {success && (
          <p className="mb-3 text-sm text-green-600 dark:text-green-400">
            Username updated.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !newUsername.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {loading ? "Saving..." : "Save username"}
        </button>
      </form>
    </div>
  );
}
