"""
Backfill: Full backfill for a single season. Players, game logs, standings, historical prices, Year 0 tier assignment.

Usage:
    python scripts/backfill.py --season 2025-26

Run from engine/ directory.
"""

import logging
import sys
from pathlib import Path

_engine_dir = Path(__file__).resolve().parent.parent
if str(_engine_dir) not in sys.path:
    sys.path.insert(0, str(_engine_dir))

import click

from config import get_db_connection
from db.seasons import ensure_season
from formulas.compute import compute_historical_prices
from ingestion.nba import (
    fetch_prior_season_averages,
    sync_game_logs,
    sync_players,
    sync_standings,
    sync_teams,
)
from tiers.year0 import apply_year0_tiers_from_prices, build_year0_tier_fn

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger("backfill")


@click.command()
@click.option("--season", default="2025-26", help="Season label")
def main(season: str):
    log.info("=== Backfill starting for season %s ===", season)

    engine_dir = Path(__file__).resolve().parent.parent
    if Path.cwd() != engine_dir:
        import os
        os.chdir(engine_dir)

    conn = get_db_connection()
    try:
        log.info("Checking schema...")
        with conn.cursor() as cur:
            cur.execute("SELECT to_regclass('public.seasons')")
            if cur.fetchone()[0] is None:
                log.info("Running schema migration...")
                with open("../migrations/001_initial_schema.up.sql", "r") as f:
                    sql = f.read()
                cur.execute(sql)
                conn.commit()
                log.info("Schema created")
            else:
                log.info("Schema already exists, skipping migration")

        season_id = ensure_season(conn, season)
        log.info("Season ID: %d", season_id)

        sync_teams(conn)
        get_tier_fn = build_year0_tier_fn(season)
        sync_players(conn, season_id, season, get_tier_fn)
        sync_game_logs(conn, season_id, season)
        sync_standings(conn, season_id, season)

        prior_avgs = fetch_prior_season_averages(season)

        log.info("Clearing old price history...")
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM price_history WHERE player_season_id IN (SELECT id FROM player_seasons WHERE season_id = %s)",
                (season_id,),
            )
        conn.commit()
        log.info("Cleared old prices")

        compute_historical_prices(conn, season_id, prior_avgs)

        apply_year0_tiers_from_prices(conn, season_id, season)

        log.info("=== Backfill complete! ===")
    except Exception:
        log.exception("Backfill failed")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
