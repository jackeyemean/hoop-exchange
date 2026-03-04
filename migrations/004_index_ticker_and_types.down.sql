-- Revert S&P 500 back to NBA League Index
UPDATE indexes
SET name = 'NBA League Index', index_type = 'league', ticker = NULL,
    description = 'Cap-weighted index of all active players'
WHERE name = 'S&P 500';

ALTER TABLE indexes DROP COLUMN IF EXISTS ticker;
