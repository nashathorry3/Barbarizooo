-- Social login: track the auth provider and its subject id for accounts.
-- Existing accounts are 'local' (email + password). Google accounts store the
-- Google "sub" and keep a random unusable password hash.

ALTER TABLE app_user ADD COLUMN provider VARCHAR(20) DEFAULT 'local';
ALTER TABLE app_user ADD COLUMN provider_sub VARCHAR(64);

CREATE INDEX idx_app_user_provider_sub ON app_user(provider_sub);
