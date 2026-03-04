"""Season management: ensure_season, get_season_by_label, ensure_season_with_dates."""

from datetime import date

from constants import SEASON_START_DEFAULT


def ensure_season(conn, label: str) -> int:
    """Ensure season exists; create if missing. Returns season id."""
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM seasons WHERE label = %s", (label,))
        row = cur.fetchone()
        if row:
            return row[0]
        cur.execute(
            "INSERT INTO seasons (label, start_date, end_date, is_active) VALUES (%s, %s, %s, TRUE) RETURNING id",
            (label, SEASON_START_DEFAULT, date(2026, 6, 30)),
        )
        conn.commit()
        return cur.fetchone()[0]


def get_season_by_label(conn, label: str):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, label, start_date, end_date, is_active FROM seasons WHERE label = %s",
            (label,),
        )
        row = cur.fetchone()
        if not row:
            return None
        return {"id": row[0], "label": row[1], "start_date": row[2], "end_date": row[3], "is_active": row[4]}


def ensure_season_with_dates(conn, label: str, start_date: date, end_date: date) -> int:
    """Ensure season exists with specific dates. Returns season id."""
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM seasons WHERE label = %s", (label,))
        row = cur.fetchone()
        if row:
            cur.execute(
                "UPDATE seasons SET start_date = %s, end_date = %s WHERE id = %s",
                (start_date, end_date, row[0]),
            )
            conn.commit()
            return row[0]
        cur.execute(
            "INSERT INTO seasons (label, start_date, end_date, is_active) VALUES (%s, %s, %s, TRUE) RETURNING id",
            (label, start_date, end_date),
        )
        conn.commit()
        return cur.fetchone()[0]
