export default function RulesPage() {
  return (
    <div className="w-full">
      <h1 className="mb-2 text-2xl font-bold">Rules</h1>
      <p className="mb-10 text-neutral-500">
        Players are stocks. You buy low, sell high. Virtual money only.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-base font-semibold">Market hours</h2>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li>Weekdays: 6:00 AM – 6:00 PM Eastern</li>
          <li>Weekends: 6:00 AM – 1:00 PM Eastern</li>
          <li>Prices update daily at 6:00 AM ET, using the previous day&apos;s games</li>
          <li>$100,000 starting cash. Market orders only (instant fill)</li>
        </ul>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base font-semibold">Basics</h2>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200">Share price</strong>
              <p className="mt-0.5">Dollar per share. Changes daily with performance, age, team record, injuries.</p>
            </div>
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200">Float shares</strong>
              <p className="mt-0.5">Total shares per player. Fixed for the season by tier. Stars get more, role players fewer.</p>
            </div>
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200">Market cap</strong>
              <p className="mt-0.5">Price × float. Leaderboard ranks by this. Lower price + more shares can beat higher price + fewer shares.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">What moves the price</h2>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Performance</strong> — Main driver. ESPN fantasy points league style weights on points (+1), assists (+2), rebounds (+1), steals (+4), blocks (+4), turnovers (-2), made shots (+1), missed shots (-1), free throws made (+1), free throws missed (-1), 3-pointers made (+1).
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Recent form</strong> — Last 15 games = 20%, season avg = 80%. Hot streak up, cold streak down.
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Age</strong> — Young stars boost (up to 2.0×). Older players tax (down to 0.5×).
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Team & injuries</strong> — Best teams +15%, worst −15%. Long absences can reduce a player's stock price by up to −30%.
            </li>
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-semibold">Tiers</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="min-w-[200px] flex-1 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-amber-800 dark:text-amber-300">Magnificent 7</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">12M shares</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-700/80 dark:text-amber-400/80">
              NVIDIA, Apple, Microsoft, Alphabet. The dominant few.
              <br /><br />
              Top 7 stocks from last season.
            </p>
          </div>
          <div className="min-w-[200px] flex-1 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800 dark:text-blue-300">Blue Chip</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">8M shares</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-blue-700/80 dark:text-blue-400/80">
              Coca-Cola, Johnson &amp; Johnson. Reliable household names.
              <br /><br />
              Ranks 8–40 from last season.
            </p>
          </div>
          <div className="min-w-[200px] flex-1 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-emerald-800 dark:text-emerald-300">Growth</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">6M shares</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-400/80">
              Shopify, Snowflake, CrowdStrike. Upside potential with high ceilings.
              <br /><br />
              Ranks 41–150 from last season.
            </p>
          </div>
          <div className="min-w-[200px] flex-1 rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800/50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-purple-800 dark:text-purple-300">Mid Cap</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">5M shares</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-purple-700/80 dark:text-purple-400/80">
              Chipotle, DraftKings, Air Canada. Rotation players off the bench.
              <br /><br />
              Ranks 151–250 from last season.
            </p>
          </div>
          <div className="min-w-[200px] flex-1 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-800 dark:text-red-300">Penny Stock</span>
              <span className="font-mono text-red-600 dark:text-red-400">3M shares</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-red-700/80 dark:text-red-400/80">
              Volatile and speculative long shots. Your typical benchwarmers.
              <br /><br />
              Ranks 251+ from last season.
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-1 text-xs text-neutral-500 dark:text-neutral-500">
          <li>For rookie IPOs, tiers are assigned by draft position</li>
          <li>Lottery (1–14) → Growth</li>
          <li>First round / early second (15–39) → Mid Cap</li>
          <li>Everyone else → Penny Stock</li>
          <li>Rookies and the Renaissance IPO Index unlock for trading when the first rookie hits 20 games</li>
        </ul>
      </section>
    </div>
  );
}
