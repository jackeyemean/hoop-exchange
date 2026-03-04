"""Ranking queries: get_end_of_season_ranking."""


def get_end_of_season_ranking(conn, season_id: int) -> list[tuple[str, float]]:
    """
    Get player ranking by price at last trading day of season.
    Returns [(external_id, price), ...] sorted by price descending.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT p.external_id, ph.price
            FROM price_history ph
            JOIN player_seasons ps ON ph.player_season_id = ps.id
            JOIN players p ON ps.player_id = p.id
            WHERE ps.season_id = %s
              AND ph.trade_date = (
                  SELECT MAX(trade_date) FROM price_history
                  WHERE player_season_id IN (SELECT id FROM player_seasons WHERE season_id = %s)
              )
            ORDER BY ph.price DESC
            """,
            (season_id, season_id),
        )
        return [(str(row[0]), float(row[1])) for row in cur.fetchall()]
