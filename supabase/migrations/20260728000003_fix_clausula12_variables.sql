-- Actualizar cláusula 12 con variables dinámicas del cliente.
-- El código añade "CLAUSULA DÉCIMA SEGUNDA: " automáticamente en bold;
-- el contenido aquí empieza con el subtítulo "NOTIFICACIONES:".
-- Las variables {{cliente_direccion}}, {{cliente_telefono}}, {{cliente_email}}
-- son reemplazadas en ContratoPDF.tsx con los datos reales del perfil del cliente.

UPDATE site_content
SET content = 'NOTIFICACIONES: para todos los efectos pertinentes el CONTRATISTA podrá ser notificado en el Kilómetro 5, de la Vía Suba Cota, celular 3247836852, correo electrónico contacto@hacienda-encanto.com y el CONTRATANTE en la dirección {{cliente_direccion}}, teléfono {{cliente_telefono}}, correo electrónico {{cliente_email}}. Ambas partes ubicadas en Bogotá. Las partes se obligan a comunicar a su contratante cualquier cambio de dirección para las notificaciones, so pena de que estas se entiendan surtidas en la dirección indicada en la presente cláusula.'
WHERE key = 'contrato_clausula_12';
