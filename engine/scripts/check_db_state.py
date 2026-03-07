"""
Check DB state: latest trade_date, game_stats coverage.
Helps debug why change % might be 0 for players who played.
Usage: python scripts/check_db_state.py
"""
import sys
from pathlib import Path

_engine_dir = Path(__file__).resolve().parent.parent
if str(_engine_dir) not in sys.path:
    sys.path.insert(0, str(_engine_dir))

from config import get_db_connection


def main():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT MAX(ph.trade_date) as latest_trade_date,
                       COUNT(DISTINCT ph.trade_date) as n_dates
                FROM price_history ph
                JOIN player_seasons ps ON ph.player_season_id = ps.id
                WHERE ps.season_id = (SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1)
            """)
            row = cur.fetchone()
            print(f"Latest trade_date in price_history: {row[0]}")
            print(f"Number of distinct trade dates: {row[1]}")

            cur.execute("""
                SELECT game_date, COUNT(*) as n_rows
                FROM game_stats gs
                JOIN player_seasons ps ON gs.player_season_id = ps.id
                WHERE ps.season_id = (SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1)
                AND game_date >= CURRENT_DATE - INTERVAL '14 days'
                GROUP BY game_date
                ORDER BY game_date DESC
                LIMIT 10
            """)
            rows = cur.fetchall()
            print("\nRecent game_stats by date:")
            for r in rows:
                print(f"  {r[0]}: {r[1]} rows")

            # Check if we have today's prices (needed for yesterday's game impact)
            from datetime import date
            today = date.today()
            cur.execute("SELECT 1 FROM price_history WHERE trade_date = %s LIMIT 1", (today,))
            has_today = cur.fetchone() is not None
            print(f"\nHas price_history for {today}: {has_today}")
            if not has_today:
                print("  -> Run update_market.py to create today's prices (incorporates yesterday's games)")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
