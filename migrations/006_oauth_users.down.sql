-- Revert: require password_hash (will fail if OAuth-only users exist)
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
