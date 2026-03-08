"use client";

import Link from "next/link";
import { formatCurrency, formatCompact, formatCompactNumber, formatPct, pctColor } from "@/lib/utils";
import { TierBadge } from "@/components/tier-badge";

interface PlayerRow {
  id: number;
  ticker?: string;
  firstName: string;
  lastName: string;
  position: string;
  teamAbbreviation: string;
  tier: string;
  floatShares: number;
  price: number;
  changePct: number | null;
  marketCap: number;
}

function getTicker(p: PlayerRow): string {
  if (p.ticker && p.ticker.trim()) return p.ticker;
  const f = (p.firstName || "").replace(/[^a-zA-Z]/g, "").slice(0, 2) || (p.firstName || "").slice(0, 1);
  const l = (p.lastName || "").replace(/[^a-zA-Z]/g, "").slice(0, 2) || (p.lastName || "").slice(0, 1);
  return (f + l).toUpperCase() || "—";
}

export function PlayerTable({ players }: { players: PlayerRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <th className="w-10 px-3 py-3 text-center font-medium text-neutral-600 dark:text-neutral-400">#</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Ticker</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Player</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Pos</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Team</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Tier</th>
            <th className="px-4 py-3 text-right font-medium text-neutral-600 dark:text-neutral-400">Shares</th>
            <th className="px-4 py-3 text-right font-medium text-neutral-600 dark:text-neutral-400">Price</th>
            <th className="px-4 py-3 text-right font-medium text-neutral-600 dark:text-neutral-400">Change</th>
            <th className="px-4 py-3 text-right font-medium text-neutral-600 dark:text-neutral-400">Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, idx) => (
              <tr
                key={p.id}
                className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-900/50"
              >
                <td className="w-10 px-3 py-3 text-center font-mono text-neutral-400 dark:text-neutral-500">
                  {idx + 1}
                </td>
                <td className="px-3 py-3 font-mono text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {getTicker(p)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/players/${p.id}`}
                    className="font-medium text-neutral-900 hover:underline dark:text-white"
                  >
                    {p.firstName} {p.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{p.position}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{p.teamAbbreviation}</td>
                <td className="px-4 py-3">
                  <TierBadge tier={p.tier} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                  {formatCompactNumber(p.floatShares)}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.price)}</td>
                <td className={`px-4 py-3 text-right font-mono ${pctColor(p.changePct)}`}>
                  {formatPct(p.changePct)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                  {formatCompact(p.marketCap)}
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
