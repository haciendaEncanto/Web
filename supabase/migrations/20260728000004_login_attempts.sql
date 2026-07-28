-- Tabla para rate limiting de intentos de login fallidos.
-- Solo accesible via service_role (bypasa RLS); anon/authenticated no tienen acceso.

CREATE TABLE IF NOT EXISTS login_attempts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text        NOT NULL,
  attempted_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS login_attempts_email_time_idx
  ON login_attempts (email, attempted_at DESC);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Ningún usuario puede leer, insertar ni modificar vía clave anon o auth.
CREATE POLICY "no_client_access" ON login_attempts USING (false);
