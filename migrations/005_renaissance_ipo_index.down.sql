-- Revert Renaissance IPO Index back to Growth Stocks
UPDATE indexes
SET name = 'Growth Stocks', index_type = 'tier_growth', ticker = 'GROW',
    description = 'Cap-weighted index of all Growth tier players'
WHERE name = 'Renaissance IPO Index';
