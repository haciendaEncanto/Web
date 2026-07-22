-- ============================================================
-- POLÍTICA DE SESIÓN: last_active_at en profiles
-- ============================================================
-- Permite que el middleware detecte inactividad de 5 minutos
-- aunque el JWT todavía sea válido (expira en 1 hora).
--
-- Flujo:
--   auth.ts login → UPDATE last_active_at = NOW()
--   proxy.ts → llama check_and_update_last_active(uid, 5)
--     · Si NULL o reciente  → actualiza a NOW() y retorna TRUE
--     · Si > 5 minutos      → retorna FALSE → signOut + redirect /login
-- ============================================================

-- 1. Columna en profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- 2. Función atómica: verifica inactividad y actualiza en un solo round-trip
CREATE OR REPLACE FUNCTION check_and_update_last_active(
  p_user_id        uuid,
  p_timeout_minutes integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_active timestamptz;
BEGIN
  SELECT last_active_at INTO v_last_active
  FROM profiles
  WHERE id = p_user_id;

  -- NULL = primera vez (login reciente antes de que existiera la columna) → válido
  IF v_last_active IS NOT NULL
     AND (now() - v_last_active) > (p_timeout_minutes || ' minutes')::interval
  THEN
    RETURN false; -- sesión expirada por inactividad
  END IF;

  UPDATE profiles
    SET last_active_at = now()
    WHERE id = p_user_id;

  RETURN true; -- sesión válida
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_update_last_active(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_update_last_active(uuid, integer) TO service_role;
