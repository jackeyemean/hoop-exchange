"""
Quick script to check if NBA API has game data for a given date.
Usage: python scripts/check_nba_api_date.py [YYYY-MM-DD]
"""
import sys
from pathlib import Path

_engine_dir = Path(__file__).resolve().parent.parent
if str(_engine_dir) not in sys.path:
    sys.path.insert(0, str(_engine_dir))

from datetime import date

def main():
    game_date = sys.argv[1] if len(sys.argv) > 1 else "2025-03-04"
    print(f"Checking NBA API for games on {game_date}...")

    try:
        from nba_api.stats.endpoints import ScoreboardV2

        resp = ScoreboardV2(game_date=game_date, league_id="00")
        games_df = resp.get_data_frames()[0]

        if games_df.empty:
            print(f"  No games returned for {game_date} (empty DataFrame)")
            return

        n_games = len(games_df["GAME_ID"].unique())
        print(f"  Found {n_games} game(s)")
        for _, row in games_df.iterrows():
            gid = row.get("GAME_ID", "?")
            matchup = row.get("MATCHUP", "?")
            status = row.get("GAME_STATUS_TEXT", row.get("GAME_STATUS_ID", "?"))
            print(f"    - {gid}: {matchup} ({status})")

        # Try one box score to see if player stats are available
        game_id = games_df["GAME_ID"].iloc[0]
        from nba_api.stats.endpoints import BoxScoreTraditionalV2
        box = BoxScoreTraditionalV2(game_id=game_id)
        player_stats = box.get_data_frames()[0]
        n_players = len(player_stats)
        print(f"  Box score for {game_id}: {n_players} player rows")
        if n_players > 0:
            sample = player_stats.iloc[0]
            print(f"  Sample: {sample.get('PLAYER_NAME', '?')} - {sample.get('PTS', 0)} pts")

    except Exception as e:
        print(f"  Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
