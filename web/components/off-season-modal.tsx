"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

const DISMISSED_KEY = "hx_offseason_dismissed";

export function OffSeasonModal() {
  const [visible, setVisible] = useState(false);

  const { data } = useQuery({
    queryKey: ["marketStatus"],
    queryFn: () => api.getMarketStatus(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (!data?.isOffSeason) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed !== data.seasonLabel) {
      setVisible(true);
    }
  }, [data]);

  function dismiss() {
    if (data?.seasonLabel) {
      localStorage.setItem(DISMISSED_KEY, data.seasonLabel);
    }
    setVisible(false);
  }

  if (!visible || !data) return null;

  const formattedEnd = data.seasonEnd
    ? new Date(data.seasonEnd + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Basketball icon */}
        <div className="mb-4 flex justify-center">
          <span className="text-4xl">🏀</span>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {data.seasonLabel} Regular Season Complete
        </h2>

        <p className="mb-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {formattedEnd
            ? `The ${data.seasonLabel} regular season concluded on ${formattedEnd}.`
            : `The ${data.seasonLabel} regular season has concluded.`}{" "}
          The market is frozen until the{" "}
          {data.seasonLabel.split("-")[1]
            ? `20${data.seasonLabel.split("-")[1]}-${String(Number(data.seasonLabel.split("-")[1]) + 1).slice(-2)}`
            : "next"}{" "}
          season opens.
        </p>

        <p className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Player stock prices are locked at their regular season closing values.
          Browse any player to see how their stock performed throughout the
          season.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            onClick={dismiss}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Browse Season Stats
          </Link>
          <button
            onClick={dismiss}
            className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
