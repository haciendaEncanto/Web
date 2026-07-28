-- Actualizar las 12 cláusulas con el texto exacto del contrato original.
-- Los títulos son añadidos automáticamente por ContratoPDF.tsx;
-- el contenido aquí NO debe incluir el ordinal/título de la cláusula.
-- La cláusula 2 usa {{num_invitados}} que el código reemplaza en tiempo de generación.

UPDATE site_content
SET content = 'El objeto del presente contrato es que EL CONTRATISTA se compromete alquilar la Hacienda el Encanto, para un evento social, ubicado en el Kilómetro 5. Vía Suba Cota, para el día {{fecha_evento}}, en un horario sugerido de: {{hora_inicio}} hasta las {{hora_fin}}.'
WHERE key = 'contrato_clausula_1';

UPDATE site_content
SET content = 'OBLIGACIONES DEL CONTRATISTA se compromete a proporcionar la nómina de empleados Full Dotación, (logísticos, internos, aseo y a hacer entrega del salón bajo acta en perfecto estado y funcionando con los siguientes elementos: baterías de baño completas, tarima, luces sonido, todo con una capacidad para {{num_invitados}} personas (en caso de presentarse una cantidad mayor a asistentes al evento se liquidara en $180.000 los invitados adicionales y serán cancelados por parte del contratante a favor del contratista en común acuerdo), los alcances y particularidades de este contrato se describen a continuación:'
WHERE key = 'contrato_clausula_2';

UPDATE site_content
SET content = 'VALOR: el valor total de este contrato es el acordado entre las partes según la sección financiera del presente documento, los cuales incluyen todo lo enunciado en la cláusula segunda de este contrato y los demás ítems especificados en la cotización anexa. Este valor será asumido así: 100% por EL CONTRATANTE.'
WHERE key = 'contrato_clausula_3';

UPDATE site_content
SET content = 'EL CONTRATISTA se compromete a tramitar los permisos necesarios para la realización de este evento y solicitara la presencia de las distintas entidades de apoyo y control tales como: policía, bomberos, paramédicos y contingencia en caso de emergencia, se reservara el derecho de admisión a personas con porte de armas y en general toda persona que no cumpla con las normas internas del establecimiento.'
WHERE key = 'contrato_clausula_4';

UPDATE site_content
SET content = 'INCUMPLIMIENTO: el evento se producira y se liquidara por los valores pactados por parte del contratista asi no asistan los invitados salvo fuerza mayor el contratante y el contratista deben cumplir con este contrato. No se considera fuerza mayor la no asistencia de los invitados. El evento se celebrara salvo fuerza mayor.'
WHERE key = 'contrato_clausula_5';

UPDATE site_content
SET content = 'Obligaciones DEL CONTRATANTE: cancelar a favor del CONTRATISTA el valor del primer anticipo acordado a la firma del contrato. Estos recursos se deben depositar en la cuenta de ahorros Davivienda a nombre de Hacienda el Encanto Bogotá S.A.S o entregar en efectivo. El saldo debe estar cancelado en las fechas pactadas según la sección financiera del presente contrato.'
WHERE key = 'contrato_clausula_6';

UPDATE site_content
SET content = 'Penal: Si el CONTRATANTE Y EL CONTRATISTA, en caso de incumplimiento, la parte que incumpla pagara el equivalente al 50% del valor total de este contrato.'
WHERE key = 'contrato_clausula_7';

UPDATE site_content
SET content = 'COMPROMISORIA: EL CONTRATISTA y el CONTRATANTE hará lo posible por resolver de forma amistosa y directa las diferencias entre las partes por razón de la celebración, ejecución, desarrollo o terminación del presente contrato y si este no puede arreglarse de forma amigable, las partes se someterán a la jurisdicción ordinaria.'
WHERE key = 'contrato_clausula_8';

UPDATE site_content
SET content = 'MÉRITO EJECUTIVO: El presente contrato por si solo presta mérito ejecutivo, sin necesidad de requerimiento judicial o extrajudicial y las costas del proceso estarán a cargo de quien incumpla el contrato. Esta es una obligación clara, expresa y actualmente exigible.'
WHERE key = 'contrato_clausula_9';

UPDATE site_content
SET content = 'DOMICILIO: las partes fijan de común acuerdo como domicilio y para todos los efectos contractuales la Ciudad de Bogotá.'
WHERE key = 'contrato_clausula_10';

UPDATE site_content
SET content = 'Sujeción a la ley: este contrato rige por las leyes de la república de Colombia y constituye la totalidad de lo acordado entre el CONTRATANTE y el CONTRATISTA.'
WHERE key = 'contrato_clausula_11';

UPDATE site_content
SET content = 'NOTIFICACIONES: para todos los efectos pertinentes el CONTRATISTA podrá ser notificado en el Kilómetro 5, de la Vía Suba Cota, celular 3247836852 correo electrónico contacto@hacienda-encanto.com y el CONTRATANTE en la dirección y contacto registrados en el presente contrato. Las partes se obligan a comunicar a su contratante cualquier cambio de dirección para las notificaciones, so pena de que estas se entiendan surtidas en la dirección indicada en la presente clausula.'
WHERE key = 'contrato_clausula_12';
