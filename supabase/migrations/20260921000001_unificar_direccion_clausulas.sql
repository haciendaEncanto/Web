-- Unifica la dirección de la hacienda en las cláusulas del contrato:
-- "Kilómetro 5" / "Kilometro 5" → "Km 5.5" (dirección oficial: Km 5.5, Vía Suba Cota).
-- Afecta a contrato_clausula_1 y contrato_clausula_20 (verificado en remoto antes de aplicar).
-- La guarda NOT LIKE '%5.5%' evita producir "Km 5.5.5" si una fila ya usara "Kilómetro 5.5".

UPDATE site_content
SET content = REPLACE(content, 'Kilómetro 5', 'Km 5.5')
WHERE content LIKE '%Kilómetro 5%'
  AND content NOT LIKE '%Kilómetro 5.5%';

UPDATE site_content
SET content = REPLACE(content, 'Kilometro 5', 'Km 5.5')
WHERE content LIKE '%Kilometro 5%'
  AND content NOT LIKE '%Kilometro 5.5%';
