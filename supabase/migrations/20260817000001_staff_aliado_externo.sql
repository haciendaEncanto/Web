-- Nuevos campos en tabla staff para aliados externos
ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_aliado_externo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS frase TEXT;

-- Aliado de prueba
INSERT INTO staff (nombre, cargo, descripcion, frase, is_aliado_externo, sort_order, is_active)
VALUES (
  'Jaime Guarín',
  'Fotografía & Video',
  NULL,
  'Cada instante merece ser eterno',
  true,
  100,
  true
);
