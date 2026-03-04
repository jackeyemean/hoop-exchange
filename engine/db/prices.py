"""Price history: insert_price_history, get_prev_prices."""

from datetime import date


def insert_price_history(
    conn,
    player_season_id: int,
    trade_date,
    perf_score: float,
    age_mult: float,
    win_pct_mult: float,
    salary_eff_mult: float,
    raw_score: float,
    price: float,
    market_cap: float,
    prev_price: float | None,
    change_pct: float | None,
):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO price_history
                (player_season_id, trade_date, perf_score, age_mult, win_pct_mult,
                 salary_eff_mult, raw_score, price, market_cap, prev_price, change_pct)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (player_season_id, trade_date) DO UPDATE SET
                perf_score = EXCLUDED.perf_score, age_mult = EXCLUDED.age_mult,
                win_pct_mult = EXCLUDED.win_pct_mult, salary_eff_mult = EXCLUDED.salary_eff_mult,
                raw_score = EXCLUDED.raw_score, price = EXCLUDED.price,
                market_cap = EXCLUDED.market_cap, prev_price = EXCLUDED.prev_price,
                change_pct = EXCLUDED.change_pct
            """,
            (
                player_season_id,
                trade_date,
                perf_score,
                age_mult,
                win_pct_mult,
                salary_eff_mult,
                raw_score,
                price,
                market_cap,
                prev_price,
                change_pct,
            ),
        )


def get_prev_prices(conn, season_id: int, trade_date: date) -> dict[int, float]:
    """Get most recent price per player_season_id before trade_date."""
    prev_prices = {}
    with conn.cursor() as cur:
        cur.execute(
            """
            WITH prev_date AS (
                SELECT MAX(ph.trade_date) AS d FROM price_history ph
                JOIN player_seasons ps ON ph.player_season_id = ps.id
                WHERE ps.season_id = %s AND ph.trade_date < %s
            )
            SELECT ph.player_season_id, ph.price
            FROM price_history ph
            JOIN player_seasons ps ON ph.player_season_id = ps.id
            CROSS JOIN prev_date
            WHERE ps.season_id = %s AND ph.trade_date = prev_date.d
            """,
            (season_id, trade_date, season_id),
        )
        for row in cur.fetchall():
            prev_prices[row[0]] = float(row[1])
    return prev_prices
