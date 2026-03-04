"""Raw performance score: 13-stat formula."""


def calculate_raw_perf(
    pts: float,
    fgm: float,
    fga: float,
    ftm: float,
    fta: float,
    fg3m: float,
    fg3a: float,
    oreb: float,
    dreb: float,
    ast: float,
    stl: float,
    blk: float,
    tov: float,
) -> float:
    fgmi = fga - fgm
    ftmi = fta - ftm
    fg3mi = fg3a - fg3m
    return (
        (pts * 1.0)
        + (fgm * 1.0)
        + (fgmi * -1.0)
        + (ftm * 1.0)
        + (ftmi * -1.0)
        + (fg3m * 1.0)
        + (oreb * 1.0)
        + (dreb * 1.0)
        + (ast * 2.0)
        + (stl * 4.0)
        + (blk * 4.0)
        + (tov * -2.0)
    )
