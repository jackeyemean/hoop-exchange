-- Add IPO index type for Renaissance IPO Index (tracks rookies)
ALTER TYPE index_type ADD VALUE IF NOT EXISTS 'ipo';

-- Migrate Growth Stocks to Renaissance IPO Index
UPDATE indexes
SET name = 'Renaissance IPO Index', index_type = 'ipo', ticker = 'IPO',
    description = 'Cap-weighted index of all rookies in the current season'
WHERE name = 'Growth Stocks';
