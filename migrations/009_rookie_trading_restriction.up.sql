-- Rookie trading restriction: rookies can only be traded after 20 games played.
-- is_rookie is set by the engine during tier/player sync (apply_tiers, etc.).
ALTER TABLE player_seasons ADD COLUMN is_rookie BOOLEAN NOT NULL DEFAULT FALSE;
