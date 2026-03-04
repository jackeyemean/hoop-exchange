"""
Year 0 tier logic: build_year0_tier_fn, apply_year0_tiers_from_prices, rookie_tier_from_pick.
Manual overrides + rookies by draft position.
"""

import logging

from constants import FLOAT_SHARES, TIER_DEFAULT
from utils.api import safe_request

log = logging.getLogger(__name__)

# One-time Year 0 tier overrides (first season of Hoop Exchange)
YEAR0_TIER_OVERRIDES = {
    "magnificent_7": ["203999", "1628983", "1629029", "1641705", "203507", "1628369", "1630162"],
    "blue_chip": [
        "1630169", "202681", "203076", "1631114",
        "201939", "1627734", "1626157", "1629027", "1627826", "1629639", "1630596", "1641708",
    ],
    "growth": [
        "202695", "1627742", "1631096",
        "1630581", "1630530", "1628374", "1630552", "1630567", "1630559", "202696",
    ],
    "mid_cap": ["1630166", "1641718", "203954", "1627749"],
    "penny_stock": ["1642263", "1629674", "1642918", "1642404", "1631157", "1629645", "1631212", "1630230"],
}


def rookie_tier_from_pick(overall_pick: int) -> str:
    """Assign rookie tier based on draft position.
    Lottery (1-14) -> growth, first round/early second (15-39) -> mid_cap, else -> penny_stock."""
    if 1 <= overall_pick <= 14:
        return "growth"
    if 15 <= overall_pick <= 39:
        return "mid_cap"
    return "penny_stock"


def build_rookie_tier_map(season_label: str) -> dict[str, str]:
    """Fetch draft history and return {external_id: tier} for rookies."""
    draft_year = int(season_label.split("-")[0])
    try:
        from nba_api.stats.endpoints import DraftHistory
        draft_resp = safe_request(DraftHistory, season_year_nullable=draft_year)
        draft_df = draft_resp.get_data_frames()[0]
        return {
            str(r["PERSON_ID"]): rookie_tier_from_pick(int(r.get("OVERALL_PICK", 60) or 60))
            for _, r in draft_df.iterrows()
        }
    except Exception:
        log.warning("Failed to fetch draft history, rookies will default to penny_stock")
        return {}


def apply_tiers_to_current_season(
    conn, season_id: int, tier_map: dict[str, str], rookie_tier_map: dict[str, str] | None = None
):
    """Update player_seasons for current season with tier-based float_shares."""
    with conn.cursor() as cur:
        cur.execute(
            """SELECT ps.id, p.external_id FROM player_seasons ps
               JOIN players p ON ps.player_id = p.id
               WHERE ps.season_id = %s""",
            (season_id,),
        )
        rows = cur.fetchall()

    rookie_tier_map = rookie_tier_map or {}
    for ps_id, ext_id in rows:
        tier = tier_map.get(ext_id) or rookie_tier_map.get(ext_id, TIER_DEFAULT)
        float_shares = FLOAT_SHARES[tier]
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE player_seasons SET tier = %s, float_shares = %s WHERE id = %s",
                (tier, float_shares, ps_id),
            )
    conn.commit()
    log.info("Applied tiers to %d players for current season", len(rows))


def build_year0_tier_fn(season_label: str):
    """Build get_tier(ext_id) -> tier for Year 0 backfill. Fetches draft history for rookies."""
    manual_tier_map = {}
    for tier, pids in YEAR0_TIER_OVERRIDES.items():
        for pid in pids:
            manual_tier_map[pid] = tier

    draft_year = int(season_label.split("-")[0])
    rookie_tier_map = {}
    try:
        from nba_api.stats.endpoints import DraftHistory
        draft_resp = safe_request(DraftHistory, season_year_nullable=draft_year)
        draft_df = draft_resp.get_data_frames()[0]
        for _, r in draft_df.iterrows():
            pid = str(r["PERSON_ID"])
            pick = int(r.get("OVERALL_PICK", 0) or 0)
            rookie_tier_map[pid] = rookie_tier_from_pick(pick)
        log.info("Loaded draft positions for %d rookies", len(rookie_tier_map))
    except Exception:
        log.warning("Failed to fetch draft history, rookies will default to penny_stock")

    def get_tier(ext_id: str) -> str:
        if ext_id in manual_tier_map:
            return manual_tier_map[ext_id]
        if ext_id in rookie_tier_map:
            return rookie_tier_map[ext_id]
        return TIER_DEFAULT

    return get_tier


def apply_year0_tiers_from_prices(conn, season_id: int, season_label: str):
    """One-time: manual overrides + rookies by draft. Remaining players fill tier slots by price rank.
    Manual overrides reserve their slots; price-ranked players fill the rest."""
    draft_year = int(season_label.split("-")[0])
    manual_ext_ids = set()
    for pids in YEAR0_TIER_OVERRIDES.values():
        manual_ext_ids.update(pids)

    rookie_tier_map = {}
    try:
        from nba_api.stats.endpoints import DraftHistory
        draft_resp = safe_request(DraftHistory, season_year_nullable=draft_year)
        draft_df = draft_resp.get_data_frames()[0]
        for _, r in draft_df.iterrows():
            pid = str(r["PERSON_ID"])
            pick = int(r.get("OVERALL_PICK", 0) or 0)
            rookie_tier_map[pid] = rookie_tier_from_pick(pick)
    except Exception:
        log.warning("Could not fetch draft for Year 0 tier assignment")

    with conn.cursor() as cur:
        cur.execute(
            """SELECT ps.id, p.external_id, ph.price
               FROM player_seasons ps
               JOIN players p ON ps.player_id = p.id
               JOIN LATERAL (
                   SELECT price FROM price_history
                   WHERE player_season_id = ps.id ORDER BY trade_date DESC LIMIT 1
               ) ph ON true
               WHERE ps.season_id = %s AND ps.status NOT IN ('delisting', 'delisted')""",
            (season_id,),
        )
        rows = cur.fetchall()

    tier_map = {}
    for ext_id in manual_ext_ids:
        for tier, pids in YEAR0_TIER_OVERRIDES.items():
            if ext_id in pids:
                tier_map[ext_id] = tier
                break
    for ext_id, tier in rookie_tier_map.items():
        tier_map[ext_id] = tier

    price_rankable = [
        (ps_id, ext_id, float(price))
        for ps_id, ext_id, price in rows
        if ext_id not in manual_ext_ids and ext_id not in rookie_tier_map
    ]
    price_rankable.sort(key=lambda x: x[2], reverse=True)

    manual_counts = {t: len(pids) for t, pids in YEAR0_TIER_OVERRIDES.items()}
    slots_remaining = {
        "magnificent_7": 7 - manual_counts.get("magnificent_7", 0),
        "blue_chip": 33 - manual_counts.get("blue_chip", 0),
        "growth": 110 - manual_counts.get("growth", 0),
        "mid_cap": 100 - manual_counts.get("mid_cap", 0),
    }
    tier_order = ["magnificent_7", "blue_chip", "growth", "mid_cap"]
    idx = 0
    for tier in tier_order:
        for _ in range(slots_remaining[tier]):
            if idx >= len(price_rankable):
                break
            _, ext_id, _ = price_rankable[idx]
            tier_map[ext_id] = tier
            idx += 1
    for _, ext_id, _ in price_rankable[idx:]:
        tier_map[ext_id] = TIER_DEFAULT

    for ps_id, ext_id, _ in rows:
        tier = tier_map.get(ext_id, TIER_DEFAULT)
        float_shares = FLOAT_SHARES[tier]
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE player_seasons SET tier = %s, float_shares = %s WHERE id = %s",
                (tier, float_shares, ps_id),
            )
    conn.commit()
    log.info("Applied Year 0 tiers: %d manual/rookie preserved, %d price-ranked",
             len(manual_ext_ids) + len(rookie_tier_map), len(price_rankable))

    with conn.cursor() as cur:
        cur.execute(
            """UPDATE price_history ph
               SET market_cap = ROUND(ph.price * ps.float_shares, 2)
               FROM player_seasons ps
               WHERE ph.player_season_id = ps.id AND ps.season_id = %s""",
            (season_id,),
        )
    conn.commit()
    log.info("Updated market_cap for all price_history rows")
