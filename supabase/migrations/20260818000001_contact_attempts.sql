-- Tabla para rate limiting de intentos de contacto por IP.
-- Solo accesible via service_role (bypasa RLS).

CREATE TABLE IF NOT EXISTS contact_attempts (
  ip              text        PRIMARY KEY,
  attempts        int         NOT NULL DEFAULT 0,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  blocked_until   timestamptz
);

ALTER TABLE contact_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_client_access" ON contact_attempts USING (false);
