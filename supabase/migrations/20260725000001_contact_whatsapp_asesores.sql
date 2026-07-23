-- ============================================================
-- Hacienda El Encanto — WhatsApp en contacto + RLS asesores
-- 1. contact_messages: columnas whatsapp + assigned_asesor_id
-- 2. helper is_admin_or_gerente()
-- 3. RLS contact_messages: por rol (asesor ve solo los suyos)
-- 4. profiles.phone: comentario de privacidad (RLS es por fila,
--    no por columna — la privacidad se garantiza a nivel de app)
-- ============================================================

-- 1 ─ Columnas nuevas en contact_messages ─────────────────────

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS whatsapp          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS assigned_asesor_id uuid
    REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2 ─ Helper function ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin_or_gerente()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'gerente')
  );
$$;

-- 3 ─ Actualizar RLS de contact_messages ──────────────────────

-- Borrar políticas antiguas (is_staff_or_admin era demasiado permisiva
-- para asesores — les daba visibilidad total de todos los contactos)
DROP POLICY IF EXISTS "contact_messages: staff select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages: staff update" ON public.contact_messages;

-- Admin y gerente: ven todos los contactos
CREATE POLICY "contact_messages: admin_gerente select"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin_or_gerente());

-- Wedding planner: ve todos (también gestiona comercial)
CREATE POLICY "contact_messages: planner select"
  ON public.contact_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'wedding_planner'
  ));

-- Asesor comercial: solo ve los contactos asignados a él
CREATE POLICY "contact_messages: asesor select"
  ON public.contact_messages FOR SELECT
  USING (
    assigned_asesor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'asesor_comercial'
    )
  );

-- Asesor: puede actualizar el estado de sus contactos asignados
CREATE POLICY "contact_messages: asesor update"
  ON public.contact_messages FOR UPDATE
  USING (
    assigned_asesor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('asesor_comercial', 'wedding_planner')
    )
  )
  WITH CHECK (
    assigned_asesor_id = auth.uid()
  );

-- Admin y gerente: pueden actualizar cualquier contacto
CREATE POLICY "contact_messages: admin update"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin_or_gerente())
  WITH CHECK (public.is_admin_or_gerente());

-- Nota: profiles.phone se protege a nivel de aplicación.
-- La RLS de profiles ya restringe SELECT a (auth.uid() = id OR is_staff_or_admin()).
-- Clientes y usuarios anónimos no pueden leer teléfonos de otros usuarios.
-- En consultas de la app, phone solo se selecciona en /admin/usuarios.
