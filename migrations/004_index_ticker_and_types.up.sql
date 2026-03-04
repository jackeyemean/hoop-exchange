-- Add ticker column for index display symbols
ALTER TABLE indexes ADD COLUMN IF NOT EXISTS ticker VARCHAR(20);

-- Add new index types for S&P-style and tier-based indexes
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'sp500';
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'sp100';
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'djia';
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'tier_mag7';
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'tier_bluechip';
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'tier_growth';

-- Migrate NBA League Index to S&P 500 (top 500, ticker INX)
UPDATE indexes
SET name = 'S&P 500', index_type = 'sp500', ticker = 'INX',
    description = 'Cap-weighted index of top 500 players by market cap'
WHERE name = 'NBA League Index';
