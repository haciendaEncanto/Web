-- ============================================================
-- CONTRACT MODULE
-- ============================================================
-- 1. profiles: agrega cc (cédula / NIT)
-- 2. bookings: campos financieros + contract_items + contract_locked
-- 3. document_type enum: agrega contrato_firmado
-- 4. asesor_assignments: tabla para round-robin de WhatsApp
-- 5. site_content: seed de cláusulas y firma de representante
-- ============================================================

-- 1 ─ profiles: CC / Cédula ───────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cc text;

-- 2 ─ bookings: campos financieros y de contrato ──────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS valor_total      numeric,
  ADD COLUMN IF NOT EXISTS valor_anticipo   numeric,
  ADD COLUMN IF NOT EXISTS fecha_segundo_abono date,
  ADD COLUMN IF NOT EXISTS fecha_tercer_abono  date,
  ADD COLUMN IF NOT EXISTS capilla          boolean,
  ADD COLUMN IF NOT EXISTS contract_items   jsonb,
  ADD COLUMN IF NOT EXISTS contract_locked  boolean NOT NULL DEFAULT false;

-- 3 ─ document_type enum: contrato_firmado ────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'contrato_firmado'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')
  ) THEN
    ALTER TYPE document_type ADD VALUE 'contrato_firmado';
  END IF;
END $$;

-- 4 ─ asesor_assignments: round-robin de WhatsApp ─────────────
CREATE TABLE IF NOT EXISTS asesor_assignments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_assignments   integer NOT NULL DEFAULT 0,
  last_assigned_at    timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asesor_id)
);

-- RLS: solo admin puede ver y modificar
ALTER TABLE asesor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asesor_assignments: admin select"
  ON asesor_assignments FOR SELECT
  USING (is_admin());

CREATE POLICY "asesor_assignments: admin all"
  ON asesor_assignments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5 ─ site_content: seed de cláusulas (12) y firma ────────────
-- Cláusulas del contrato — texto editable desde /admin/contrato
INSERT INTO site_content (key, content) VALUES
  ('contrato_clausula_1',  'PRIMERA (OBJETO): El ARRENDADOR se compromete a prestar al ARRENDATARIO el servicio de celebración de eventos en las instalaciones de HACIENDA EL ENCANTO, ubicada en el Kilómetro 5, Vía Suba Cota, para la realización del evento descrito en el encabezado del presente contrato.'),
  ('contrato_clausula_2',  'SEGUNDA (VALOR DEL CONTRATO): El valor total del contrato es el indicado en la sección financiera del presente documento. El ARRENDATARIO se compromete a cancelar el primer anticipo al momento de la firma del presente contrato como señal de reserva de la fecha. Los abonos restantes se pagarán en las fechas estipuladas.'),
  ('contrato_clausula_3',  'TERCERA (FORMA DE PAGO): Los pagos se realizarán mediante transferencia bancaria a la cuenta Davivienda N.° 108900524282, a nombre de HACIENDA EL ENCANTO, o en efectivo directamente en la hacienda. No se aceptarán cheques posfechados. El incumplimiento de los plazos de pago faculta al ARRENDADOR a resolver el contrato sin responsabilidad.'),
  ('contrato_clausula_4',  'CUARTA (SERVICIOS INCLUIDOS): Los servicios contratados son los indicados en la tabla de ítems del presente contrato. Cualquier servicio adicional no contemplado deberá pactarse por escrito mediante otro sí al presente contrato.'),
  ('contrato_clausula_5',  'QUINTA (NÚMERO DE INVITADOS): El número de invitados acordado es el indicado en este contrato. El ARRENDATARIO deberá informar con al menos 15 días de anticipación cualquier variación significativa. El ingreso de personas adicionales no está permitido sin previa autorización y pago de los costos adicionales correspondientes.'),
  ('contrato_clausula_6',  'SEXTA (HORARIO): El evento se llevará a cabo en el horario indicado en este contrato. La extensión del tiempo pactado generará un costo adicional de común acuerdo entre las partes. El ARRENDATARIO es responsable de garantizar que sus invitados respeten el horario de salida.'),
  ('contrato_clausula_7',  'SÉPTIMA (CANCELACIÓN Y DEVOLUCIONES): En caso de cancelación por parte del ARRENDATARIO con menos de 30 días de anticipación, se perderá el valor del anticipo. Con más de 30 días de anticipación, el anticipo podrá ser abonado a una nueva fecha dentro de los 12 meses siguientes, sujeto a disponibilidad. En caso de cancelación por caso fortuito o fuerza mayor debidamente comprobado, las partes acordarán una nueva fecha sin penalidad.'),
  ('contrato_clausula_8',  'OCTAVA (DECORACIÓN Y MONTAJE): El montaje y decoración del salón se realizará según lo acordado en la propuesta comercial. Cualquier decoración adicional aportada por el ARRENDATARIO deberá ser aprobada previamente y no podrá causar daños a las instalaciones. El ARRENDATARIO responde por los daños causados por su decoración.'),
  ('contrato_clausula_9',  'NOVENA (RESPONSABILIDADES): El ARRENDATARIO es responsable de la conducta de sus invitados durante el evento. HACIENDA EL ENCANTO no se hace responsable por pérdidas o daños a objetos personales de los asistentes. El ARRENDATARIO responderá por los daños causados a la propiedad por él o sus invitados, y se le cobrarán al costo de reposición.'),
  ('contrato_clausula_10', 'DÉCIMA (BEBIDAS ALCOHÓLICAS): Está prohibida la introducción de bebidas alcohólicas externas. El consumo de licor no contratado con la hacienda generará un cargo adicional. El ARRENDADOR se reserva el derecho de suspender el servicio de bebidas a cualquier persona que muestre signos de embriaguez.'),
  ('contrato_clausula_11', 'DÉCIMA PRIMERA (FOTOGRAFÍA Y VIDEO): HACIENDA EL ENCANTO podrá tomar fotografías y videos del evento para uso en redes sociales y material publicitario, salvo instrucción expresa en contrario por parte del ARRENDATARIO. El ARRENDATARIO autoriza expresamente este uso al firmar el presente contrato, salvo que indique lo contrario por escrito.'),
  ('contrato_clausula_12', 'DÉCIMA SEGUNDA (SOLUCIÓN DE CONTROVERSIAS): Las partes se comprometen a resolver cualquier diferencia de forma directa y amigable. En caso de no llegar a un acuerdo, se someterán a la legislación colombiana y a los jueces competentes del Municipio de Cota, Cundinamarca. Para constancia se firma en dos (2) ejemplares del mismo tenor y valor, en la ciudad de Cota, Cundinamarca.')
ON CONFLICT (key) DO NOTHING;

-- Clave para la firma de la representante legal
INSERT INTO site_content (key, content) VALUES
  ('firma_representante', NULL)
ON CONFLICT (key) DO NOTHING;
