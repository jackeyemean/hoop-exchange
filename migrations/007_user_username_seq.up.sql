-- Sequence for generating unique "userN" default usernames
CREATE SEQUENCE IF NOT EXISTS user_username_seq;

-- Start after any existing user1, user2, ... (for migrations on existing DBs)
SELECT setval('user_username_seq', GREATEST(1,
  COALESCE((
    SELECT MAX(CAST(SUBSTRING(username FROM 5) AS INTEGER))
    FROM users WHERE username ~ '^user[0-9]+$'
  ), 0) + 1
));
