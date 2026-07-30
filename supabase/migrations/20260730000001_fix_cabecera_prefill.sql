-- ============================================================
-- Fix: alinear labels de Cabecera entre templates y función
-- La migración 20260624000016 usaba 'Hora de inicio'/'Hora de fin'.
-- La migración 20260625000000 cambió templates a 'Hora inicio'/'Hora fin'
-- pero si la función no se actualizó correctamente en el DB live, los
-- UPDATE de pre-llenado no encuentran ninguna fila.
-- Esta migración garantiza que templates y función estén sincronizados.
-- ============================================================

-- 1. Asegurar labels correctos en templates (idempotente)
UPDATE public.service_order_templates
  SET item_label = 'Hora inicio'
  WHERE event_type = 'all'
    AND section_name = 'Cabecera'
    AND item_sort = 2
    AND item_label <> 'Hora inicio';

UPDATE public.service_order_templates
  SET item_label = 'Hora fin'
  WHERE event_type = 'all'
    AND section_name = 'Cabecera'
    AND item_sort = 3
    AND item_label <> 'Hora fin';

-- 2. Re-crear la función con labels que coinciden con los templates actuales
CREATE OR REPLACE FUNCTION public.initialize_service_order(p_booking_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_event_type      text;
  v_event_date      date;
  v_start_time      time;
  v_end_time        time;
  v_guest_count     int;
  v_client_name     text;
  v_event_label     text;
  v_section_id      uuid;
  v_cabecera_id     uuid;
  v_current_section text := null;
  tmpl              record;
BEGIN
  -- Permite service_role (auth.uid() NULL) o planner/admin autenticado
  IF auth.uid() IS NOT NULL AND NOT public.is_planner_or_admin() THEN
    RAISE EXCEPTION 'Solo wedding planner o admin pueden inicializar la orden de servicio';
  END IF;

  -- Obtener datos del booking + nombre completo del cliente
  SELECT
    b.event_type,
    b.event_date,
    b.event_start_time,
    b.event_end_time,
    b.guest_count,
    p.full_name
  INTO
    v_event_type, v_event_date, v_start_time, v_end_time, v_guest_count, v_client_name
  FROM public.bookings b
  JOIN public.profiles p ON p.id = b.client_id
  WHERE b.id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking no encontrado: %', p_booking_id;
  END IF;

  -- Etiqueta legible del tipo de evento (coincide con el select de Cabecera)
  v_event_label := CASE v_event_type
    WHEN 'boda'        THEN 'Boda'
    WHEN 'quince'      THEN 'Quinceañera'
    WHEN 'empresarial' THEN 'Empresarial'
    WHEN 'revelacion'  THEN 'Revelación de Género'
    ELSE v_event_type
  END;

  -- Borrar secciones existentes — CASCADE elimina ítems (idempotente)
  DELETE FROM public.service_order_sections WHERE booking_id = p_booking_id;

  -- Crear secciones e ítems desde plantillas
  FOR tmpl IN
    SELECT *
    FROM public.service_order_templates
    WHERE event_type IN ('all', v_event_type)
    ORDER BY section_sort, item_sort
  LOOP
    IF v_current_section IS DISTINCT FROM tmpl.section_name THEN
      INSERT INTO public.service_order_sections (booking_id, name, sort_order)
      VALUES (p_booking_id, tmpl.section_name, tmpl.section_sort)
      RETURNING id INTO v_section_id;

      v_current_section := tmpl.section_name;
    END IF;

    INSERT INTO public.service_order_items
      (section_id, label, item_type, options, sort_order, filled_by, notes)
    VALUES
      (v_section_id, tmpl.item_label, tmpl.item_type, tmpl.options,
       tmpl.item_sort, tmpl.filled_by, tmpl.notes);
  END LOOP;

  -- Pre-llenar sección Cabecera con datos del booking
  -- Labels deben coincidir EXACTAMENTE con los de service_order_templates
  SELECT id INTO v_cabecera_id
  FROM public.service_order_sections
  WHERE booking_id = p_booking_id AND name = 'Cabecera';

  IF v_cabecera_id IS NOT NULL THEN
    UPDATE public.service_order_items
      SET value = v_event_date::text
      WHERE section_id = v_cabecera_id AND label = 'Fecha del evento';

    UPDATE public.service_order_items
      SET value = to_char(v_start_time, 'HH24:MI')
      WHERE section_id = v_cabecera_id AND label = 'Hora inicio';

    UPDATE public.service_order_items
      SET value = to_char(v_end_time, 'HH24:MI')
      WHERE section_id = v_cabecera_id AND label = 'Hora fin';

    UPDATE public.service_order_items
      SET value = COALESCE(v_client_name, '')
      WHERE section_id = v_cabecera_id AND label = 'Cliente(s)';

    UPDATE public.service_order_items
      SET value = v_event_label
      WHERE section_id = v_cabecera_id AND label = 'Tipo de evento';

    UPDATE public.service_order_items
      SET value = v_guest_count::text
      WHERE section_id = v_cabecera_id AND label = 'Cantidad de invitados';
  END IF;
END;
$$;
