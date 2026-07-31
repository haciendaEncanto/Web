-- Migración: reemplaza las 12 cláusulas antiguas por las 20 del contrato actualizado
-- y actualiza el número de WhatsApp de la hacienda.
-- Las cláusulas 1 y 2 se muestran en el párrafo introductorio del PDF.
-- Las cláusulas 3–20 se muestran en el bloque continuo de cláusulas.
-- Las variables {{...}} son reemplazadas en tiempo de generación por ContratoPDF.tsx.

-- ─── Cláusula 1 – OBJETO ────────────────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_1',
  'El objeto del presente contrato es que EL CONTRATISTA se compromete alquilar la Hacienda el Encanto, para un evento social, ubicado en el Kilómetro 5. Vía Suba Cota, para el día {{fecha_evento}}, en un horario sugerido de: {{hora_inicio}} hasta las {{hora_fin}}.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 2 – OBLIGACIONES DEL CONTRATISTA ─────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_2',
  'OBLIGACIONES DEL CONTRATISTA se compromete a proporcionar la nómina de empleados Full Dotación, (logísticos, internos, aseo) y a hacer entrega del salón bajo acta en perfecto estado y funcionando con los siguientes elementos: baterías de baño completas, tarima, luces y sonido, todo con una capacidad para {{num_invitados}} personas (en caso de presentarse una cantidad mayor de asistentes al evento, se liquidará en $180.000 los invitados adicionales y serán cancelados por parte del contratante a favor del contratista en común acuerdo). Los alcances y particularidades de este contrato se describen a continuación:'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 3 – ACEPTACIÓN DEL CONTRATO ───────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_3',
  'El pago del primer abono o anticipo por parte del CONTRATANTE constituye la aceptación formal, total y expresa de todos los términos y condiciones estipulados en el presente contrato.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 4 – HORARIOS Y TIEMPOS DEL EVENTO ────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_4',
  'El evento tendrá como tiempo máximo de finalización la 1:45 A.M. (domingos y lunes festivos hasta las 9:45 P.M.). EL CONTRATISTA entregará el salón una (1) hora antes del inicio del evento. El parqueadero estará disponible hasta quince (15) minutos después de la finalización del evento.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 5 – MODIFICACIONES Y CONDICIONES DE ASISTENCIA ───────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_5',
  'Las modificaciones o cambios de fecha deberán solicitarse dentro de los quince (15) días posteriores a la firma del contrato, sujetos a disponibilidad. Los novios se cuentan como invitados dentro del número pactado.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 6 – ALIMENTOS, BEBIDAS Y DESCORCHE ───────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_6',
  'Queda estrictamente prohibido el consumo de bebidas alcohólicas por parte de menores de edad. Se cobrará descorche al superar seis (6) botellas de licor y cuatro (4) docenas de cerveza. El servicio de cóctel ilimitado estará disponible hasta la medianoche.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 7 – DAÑOS Y PERJUICIOS ───────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_7',
  'El CONTRATANTE asume la responsabilidad total y deberá pagar o reponer cualquier daño, deterioro o rotura de las instalaciones o mobiliario causado por él, sus invitados o cualquier persona relacionada con el evento.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 8 – RESTRICCIONES TÉCNICAS Y DE PRODUCCIÓN ───────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_8',
  'Queda prohibido el uso de máquinas Venturi, lanzallamas, pistolas de CO2 y pirotecnia fría superior a 1.5 metros de altura dentro de las instalaciones. Cualquier producción especial deberá ser previamente aprobada por EL CONTRATISTA.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 9 – PROVEEDORES Y CONTRATACIONES EXTERNAS ────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_9',
  'Las contrataciones externas de proveedores deberán ser notificadas previamente a EL CONTRATISTA. LA HACIENDA se reserva el derecho de verificar la documentación técnica y legal de los proveedores externos antes de autorizar su ingreso a las instalaciones.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 10 – CANALES DE COMUNICACIÓN, PRUEBAS Y ÓRDENES ─────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_10',
  'La comunicación oficial entre las partes se realizará exclusivamente por WhatsApp. Las pruebas de menú se realizarán los días sábados entre 1:00 P.M. y 4:00 P.M. Las órdenes de servicio se firmarán los días martes a jueves, en modalidad presencial de 10:00 A.M. a 3:30 P.M. o virtual de 10:00 A.M. a 6:00 P.M.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 11 – VALOR ────────────────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_11',
  'El valor total de este contrato es de {{valor_total}}, que incluye todo lo enunciado en la cláusula segunda y los ítems especificados en la cotización anexa. Este valor será asumido al 100% por EL CONTRATANTE. El primer anticipo de {{valor_anticipo}} se cancela a la firma del presente contrato. Segundo abono con fecha límite el {{fecha_segundo_abono}}. El saldo restante de {{valor_tercer_abono}} deberá ser cancelado a más tardar el {{fecha_tercer_abono}}. Los depósitos se realizan a la cuenta de ahorros Davivienda a nombre de Hacienda el Encanto Bogotá S.A.S. o en efectivo.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 12 – OBLIGACIONES CONTRATISTA (PERMISOS) ─────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_12',
  'EL CONTRATISTA se compromete a tramitar los permisos necesarios para la realización del evento y solicitará la presencia de las distintas entidades de apoyo y control tales como: policía, bomberos y paramédicos en caso de emergencia. Se reserva el derecho de admisión a personas con porte de armas y en general toda persona que no cumpla con las normas internas del establecimiento.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 13 – INCUMPLIMIENTO ───────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_13',
  'El evento se producirá y se liquidará por los valores pactados por parte del CONTRATISTA así no asistan los invitados, salvo fuerza mayor. El CONTRATANTE y el CONTRATISTA deben cumplir con este contrato. No se considera fuerza mayor la no asistencia de los invitados.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 14 – OBLIGACIONES CONTRATANTE (PAGOS) ────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_14',
  'El CONTRATANTE deberá cancelar a favor del CONTRATISTA el valor del primer anticipo acordado a la firma del contrato. Estos recursos se deben depositar en la cuenta de ahorros Davivienda a nombre de Hacienda el Encanto Bogotá S.A.S. o entregar en efectivo. El saldo deberá ser cancelado en las fechas pactadas según la sección financiera del presente contrato.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 15 – PENAL ────────────────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_15',
  'En caso de incumplimiento por parte del CONTRATANTE o del CONTRATISTA, la parte que incumpla pagará el equivalente al 50% del valor total de este contrato.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 16 – COMPROMISORIA ────────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_16',
  'EL CONTRATISTA y el CONTRATANTE harán lo posible por resolver de forma amistosa y directa las diferencias surgidas por razón de la celebración, ejecución, desarrollo o terminación del presente contrato. Si no es posible un arreglo amigable, las partes se someterán a la jurisdicción ordinaria.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 17 – MÉRITO EJECUTIVO ─────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_17',
  'El presente contrato por sí solo presta mérito ejecutivo, sin necesidad de requerimiento judicial o extrajudicial. Las costas del proceso estarán a cargo de quien incumpla el contrato. Esta es una obligación clara, expresa y actualmente exigible.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 18 – DOMICILIO ────────────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_18',
  'Las partes fijan de común acuerdo como domicilio y para todos los efectos contractuales la Ciudad de Bogotá.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 19 – SUJECIÓN A LA LEY ───────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_19',
  'Este contrato rige por las leyes de la República de Colombia y constituye la totalidad de lo acordado entre el CONTRATANTE y el CONTRATISTA.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Cláusula 20 – NOTIFICACIONES ───────────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES (
  'contrato_clausula_20',
  'Para todos los efectos pertinentes el CONTRATISTA podrá ser notificado en el Kilómetro 5, de la Vía Suba Cota, celular 3150061597, correo electrónico contacto@hacienda-encanto.com y el CONTRATANTE en la dirección {{cliente_direccion}}, teléfono {{cliente_telefono}}, correo {{cliente_email}} registrados en el presente contrato. Las partes se obligan a comunicar cualquier cambio de dirección para las notificaciones.'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- ─── Actualizar WhatsApp de la hacienda ─────────────────────────────────────
INSERT INTO site_content (key, content)
VALUES ('hacienda_whatsapp', '3150061597')
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;
