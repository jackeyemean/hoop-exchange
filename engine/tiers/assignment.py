"""Tier assignment from ranking: assign_tiers_by_perf, assign_tiers_from_ranking."""

from constants import TIER_CUTOFFS, TIER_DEFAULT


def assign_tiers_by_perf(player_perfs: list[tuple[str, float]]) -> dict[str, str]:
    """Given [(ext_id, raw_perf), ...] sorted by perf/price desc, assign tier labels."""
    tier_map = {}
    for rank, (ext_id, _raw) in enumerate(player_perfs):
        tier = TIER_DEFAULT
        for label, cutoff in TIER_CUTOFFS:
            if rank < cutoff:
                tier = label
                break
        tier_map[ext_id] = tier
    return tier_map


def assign_tiers_from_ranking(ranking: list[tuple[str, float]]) -> dict[str, str]:
    """Alias: assign tiers from [(ext_id, price), ...] sorted by price desc."""
    return assign_tiers_by_perf(ranking)
