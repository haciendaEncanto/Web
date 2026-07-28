-- Fix clausula 1: eliminar duplicacion de titulo y agregar variables dinamicas
-- El codigo ya antepone "CLAUSULA PRIMERA - OBJETO: " en negrilla;
-- el contenido de site_content debe empezar directamente con el texto.
UPDATE site_content
SET content = 'El objeto del presente contrato es que EL CONTRATISTA se compromete alquilar la Hacienda el Encanto, para un evento social, ubicado en el Kilómetro 5. Vía Suba Cota, para el día {{fecha_evento}}, en un horario sugerido de: {{hora_inicio}} hasta las {{hora_fin}}, para {{num_invitados}} personas.'
WHERE key = 'contrato_clausula_1';

-- Fix clausula 11: reemplazar texto de fotografia/video con la clausula de
-- sujecion a la ley del contrato original de la hacienda.
-- El codigo antepone "CLAUSULA DÉCIMA PRIMERA: " automaticamente.
UPDATE site_content
SET content = 'Sujeción a la ley: este contrato rige por las leyes de la república de Colombia y constituye la totalidad de lo acordado entre el CONTRATANTE y el CONTRATISTA.'
WHERE key = 'contrato_clausula_11';
