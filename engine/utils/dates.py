"""Date helpers: trading days, game dates to ingest."""

from datetime import date, timedelta


def trading_days_in_range(start: date, end: date) -> list[date]:
    """Return list of weekdays (Mon–Fri) from start through end inclusive."""
    result = []
    current = start
    while current <= end:
        if current.weekday() < 5:
            result.append(current)
        current += timedelta(days=1)
    return result


def game_dates_to_ingest(trade_date: date) -> list[date]:
    """On Monday, ingest Fri/Sat/Sun. Otherwise ingest yesterday."""
    if trade_date.weekday() == 0:  # Monday
        return [trade_date - timedelta(days=d) for d in (3, 2, 1)]
    return [trade_date - timedelta(days=1)]
