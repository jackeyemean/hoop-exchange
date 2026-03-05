"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPct, pctColor } from "@/lib/utils";

const TEAM_NAME_TO_ABBREV: Record<string, string> = {
  "Atlanta Hawks": "ATL", "Boston Celtics": "BOS", "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA", "Chicago Bulls": "CHI", "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL", "Denver Nuggets": "DEN", "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW", "Houston Rockets": "HOU", "Indiana Pacers": "IND",
  "Los Angeles Clippers": "LAC", "Los Angeles Lakers": "LAL", "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA", "Milwaukee Bucks": "MIL", "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP", "New York Knicks": "NYK", "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL", "Philadelphia 76ers": "PHI", "Phoenix Suns": "PHX",
  "Portland Trail Blazers": "POR", "Sacramento Kings": "SAC", "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR", "Utah Jazz": "UTA", "Washington Wizards": "WAS",
};

const INDEX_NAME_TO_TICKER: Record<string, string> = {
  "S&P 500": "INX",
  "S&P 100": "OEX",
  "Dow Jones Industrial Average": "DJIA",
  "Magnificent 7": "MAG7",
  "Blue Chips": "BLUE",
  "Renaissance IPO Index": "IPO",
};

function getIndexTicker(idx: { ticker?: string; indexType?: string; index_type?: string; name?: string; teamAbbreviation?: string; team_abbreviation?: string }): string {
  if (idx.ticker && idx.ticker.trim()) return idx.ticker;
  const name = idx.name || "";
  if (INDEX_NAME_TO_TICKER[name]) return INDEX_NAME_TO_TICKER[name];
  const type = idx.indexType || idx.index_type || "";
  if (type === "team") {
    const abbrev = idx.teamAbbreviation ?? idx.team_abbreviation;
    if (abbrev) return abbrev;
    const display = displayName(name);
    return TEAM_NAME_TO_ABBREV[display] || "—";
  }
  if (type === "position") {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("guard")) return "GUARD";
    if (nameLower.includes("wing")) return "WINGS";
    if (nameLower.includes("big")) return "BIGS";
  }
  return "—";
}

function displayName(name: string): string {
  return name.replace(/\s+Index$/i, "");
}

export default function IndexesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["indexes"],
    queryFn: () => api.getIndexes(),
  });

  const indexes = data?.indexes || [];
  // Row 1: S&P 500, S&P 100, Dow Jones | Row 2: IPO, Mag 7, Blue Chips
  const marketOrder = ["sp500", "sp100", "djia", "ipo", "tier_mag7", "tier_bluechip"];
  const typeOrder = ["market", "team", "position"];
  const getType = (i: any) => i.indexType || i.index_type || "";
  const grouped = {
    market: marketOrder
      .map((t) => indexes.find((i: any) => getType(i) === t))
      .filter(Boolean),
    team: indexes.filter((i: any) => getType(i) === "team"),
    position: indexes.filter((i: any) => getType(i) === "position"),
  };
  const hasGrouped =
    grouped.market.length > 0 ||
    grouped.team.length > 0 ||
    grouped.position.length > 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Indexes</h1>

      {isLoading && (
        <div className="py-20 text-center text-neutral-500">Loading...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 py-10 text-center text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          Failed to load indexes. Make sure the API is running.
        </div>
      )}

      {!isLoading && !error && indexes.length === 0 && (
        <div className="rounded-lg border border-neutral-200 py-16 text-center dark:border-neutral-800">
          <p className="mb-2 text-neutral-600 dark:text-neutral-400">
            No indexes yet.
          </p>
          <p className="text-sm text-neutral-500">
            Run the engine sync to populate indexes:{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
              python main.py sync-all --season 2025-26
            </code>
          </p>
        </div>
      )}

      {!isLoading && !error && hasGrouped && (
        <>
          {typeOrder.map((type) => {
            const items = grouped[type as keyof typeof grouped];
            if (!items || items.length === 0) return null;
            const sectionTitles: Record<string, string> = {
              market: "Market Indexes",
              team: "Team",
              position: "Position",
            };
            return (
              <div key={type} className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">{sectionTitles[type] || type}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((idx: any) => (
                    <Link
                      key={idx.id}
                      href={`/indexes/${idx.id}`}
                      className="block rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-neutral-900 dark:text-white">
                              {displayName(idx.name)}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-neutral-500">
                              {getIndexTicker(idx)}
                            </span>
                          </div>
                          {idx.description && (
                            <div className="mt-2 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                              {idx.description}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {idx.level != null ? idx.level.toFixed(2) : "—"}
                          </div>
                          {idx.changePct != null && (
                            <div className={`mt-0.5 text-sm ${pctColor(idx.changePct)}`}>
                              {formatPct(idx.changePct)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {!isLoading && !error && indexes.length > 0 && !hasGrouped && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {indexes.map((idx: any) => (
            <Link
              key={idx.id}
              href={`/indexes/${idx.id}`}
              className="block rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-neutral-900 dark:text-white">
                      {displayName(idx.name)}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-neutral-500">
                      {getIndexTicker(idx)}
                    </span>
                  </div>
                  {idx.description && (
                    <div className="mt-2 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {idx.description}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {idx.level != null ? idx.level.toFixed(2) : "—"}
                  </div>
                  {idx.changePct != null && (
                    <div className={`mt-0.5 text-sm ${pctColor(idx.changePct)}`}>
                      {formatPct(idx.changePct)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
