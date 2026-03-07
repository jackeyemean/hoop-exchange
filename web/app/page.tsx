"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { PlayerTable } from "@/components/player-table";
import { formatCurrency, formatPct, pctColor } from "@/lib/utils";
import { useState } from "react";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "change" | "mcap">("mcap");
  const [moversTab, setMoversTab] = useState<"gainers" | "losers">("gainers");

  const { data, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.getPlayers(),
  });

  const allPlayers = (data?.players || []).filter(
    (p: any) => p.price != null && p.price > 0
  );

  const players = allPlayers
    .filter((p: any) => {
      if (!search) return true;
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();
      return name.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "change") return (b.changePct ?? 0) - (a.changePct ?? 0);
      return b.marketCap - a.marketCap;
    });

  const topGainers = [...allPlayers]
    .filter((p: any) => (p.changePct ?? 0) > 0)
    .sort((a: any, b: any) => (b.changePct ?? 0) - (a.changePct ?? 0))
    .slice(0, 10);

  const topLosers = [...allPlayers]
    .filter((p: any) => (p.changePct ?? 0) < 0)
    .sort((a: any, b: any) => (a.changePct ?? 0) - (b.changePct ?? 0))
    .slice(0, 10);

  const movers = moversTab === "gainers" ? topGainers : topLosers;

  function getTicker(p: { ticker?: string; firstName: string; lastName: string }): string {
    if (p.ticker && p.ticker.trim()) return p.ticker;
    const f = (p.firstName || "").replace(/[^a-zA-Z]/g, "").slice(0, 2) || (p.firstName || "").slice(0, 1);
    const l = (p.lastName || "").replace(/[^a-zA-Z]/g, "").slice(0, 2) || (p.lastName || "").slice(0, 1);
    return (f + l).toUpperCase() || "—";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Browse all player stocks. Prices update daily at 6:00 AM ET.
        </p>
      </div>

      {/* Top Gainers / Top Losers */}
      {!isLoading && !error && (topGainers.length > 0 || topLosers.length > 0) && (
        <div className="mb-6">
          <div className="mb-3 flex justify-start">
            <div className="flex gap-1 rounded-md p-0.5">
              {(["gainers", "losers"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMoversTab(tab)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    moversTab === tab
                      ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  Top {tab === "gainers" ? "Gainers" : "Losers"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="movers-scroll -mx-1 flex gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pb-2">
            {movers.map((p: any) => (
              <Link
                key={p.id}
                href={`/players/${p.id}`}
                className="min-w-[140px] shrink-0 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-neutral-500">
                    {getTicker(p)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {formatCurrency(p.price)}
                </div>
                <div className={`mt-0.5 text-sm font-medium ${pctColor(p.changePct)}`}>
                  {formatPct(p.changePct)}
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <div className="flex gap-1 rounded-md p-0.5">
          {(["mcap", "price", "change"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${
                sortBy === key
                  ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {key === "mcap" ? "Market Cap" : key}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-neutral-500">
          Loading players...
        </div>
      )}
      {error && (
        <div className="py-20 text-center text-red-500">
          Failed to load players
        </div>
      )}
      {!isLoading && !error && <PlayerTable players={players} />}
    </div>
  );
}
