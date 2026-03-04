-- Allow OAuth users (Google) without password_hash
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
