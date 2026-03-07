"""
Debug change_pct: Inspect price_history for a player to trace why daily % change shows 0.

Usage:
    python scripts/debug_change_pct.py --player "Tatum"
    python scripts/debug_change_pct.py --player "Tatum" --season 2025-26

Run from engine/ directory.
"""
import sys
from pathlib import Path

_engine_dir = Path(__file__).resolve().parent.parent
if str(_engine_dir) not in sys.path:
    sys.path.insert(0, str(_engine_dir))

import click

from config import get_db_connection


@click.command()
@click.option("--player", required=True, help="Player name (partial match, e.g. Tatum)")
@click.option("--season", default="2025-26", help="Season label")
def main(player: str, season: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ps.id, p.first_name, p.last_name, s.label
                FROM player_seasons ps
                JOIN players p ON ps.player_id = p.id
                JOIN seasons s ON ps.season_id = s.id
                WHERE s.label = %s AND (p.last_name ILIKE %s OR p.first_name ILIKE %s)
                """,
                (season, f"%{player}%", f"%{player}%"),
            )
            rows = cur.fetchall()
        if not rows:
            print(f"No player found matching '{player}' in {season}")
            return

        for ps_id, first, last, label in rows:
            print(f"\n=== {first} {last} (player_season_id={ps_id}, season={label}) ===\n")

            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT trade_date, price, change_pct, raw_score, prev_price
                    FROM price_history
                    WHERE player_season_id = %s
                    ORDER BY trade_date DESC
                    LIMIT 10
                    """,
                    (ps_id,),
                )
                ph_rows = cur.fetchall()

            if not ph_rows:
                print("  No price_history rows")
                continue

            print("  trade_date   | price    | stored_change_pct | raw_score | prev_price")
            print("  " + "-" * 75)
            for i, (td, price, chg, raw, prev) in enumerate(ph_rows):
                # Compute what backend would compute: (latest - prev) / prev
                computed = ""
                if i > 0 and ph_rows[i - 1][1] and float(ph_rows[i - 1][1]) > 0:
                    prev_p = float(ph_rows[i - 1][1])
                    computed = f"  computed: {(float(price) - prev_p) / prev_p:.4f}"
                print(f"  {td} | {float(price):7.2f} | {chg} | {float(raw) if raw else '':.4f} | {float(prev) if prev else '':.2f}  {computed}")

            # Simulate backend query
            print("\n  Backend ListActiveWithPrices would use:")
            if len(ph_rows) >= 2:
                latest_price = float(ph_rows[0][1])
                prev_price = float(ph_rows[1][1])
                backend_change = (latest_price - prev_price) / prev_price if prev_price > 0 else None
                print(f"    latest (trade_date={ph_rows[0][0]}): price={latest_price}")
                print(f"    prev   (trade_date={ph_rows[1][0]}): price={prev_price}")
                print(f"    change_pct = (latest - prev) / prev = {backend_change}")
                if backend_change is not None:
                    print(f"    Display: {backend_change * 100:+.2f}%")
            else:
                print("    Only 1 row - no prev, change_pct would be NULL")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
