-- ============================================================
-- Hacienda El Encanto — Seed: plantillas de orden de servicio
-- Tipos: quince, empresarial, revelacion
-- ============================================================

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort)
values

  -- ══════════════════════════════════════════════════════════
  -- QUINCEAÑERA
  -- ══════════════════════════════════════════════════════════

  -- Sección 1 — Información general
  ('quince', 'Información general', 1, 'Fecha y horario',       'text',    '[]', 1),
  ('quince', 'Información general', 1, 'Quinceañera',           'text',    '[]', 2),
  ('quince', 'Información general', 1, 'Cantidad de invitados', 'text',    '[]', 3),

  -- Sección 2 — Menú y bebidas
  ('quince', 'Menú y bebidas', 2, 'Menú',                       'textarea','[]', 1),
  ('quince', 'Menú y bebidas', 2, 'Ponque/torta',               'text',    '[]', 2),
  ('quince', 'Menú y bebidas', 2, 'Adicionales por la hacienda','textarea','[]', 3),

  -- Sección 3 — Detalles del evento
  ('quince', 'Detalles del evento', 3, 'Ramo',                         'text', '[]', 1),
  ('quince', 'Detalles del evento', 3, 'Lista de invitados',           'text', '[]', 2),
  ('quince', 'Detalles del evento', 3, 'Llegada de invitados - inicio','time', '[]', 3),
  ('quince', 'Detalles del evento', 3, 'Llegada de invitados - fin',   'time', '[]', 4),
  ('quince', 'Detalles del evento', 3, 'Temática elegida',             'text', '[]', 5),

  -- Sección 4 — Ceremonia
  ('quince', 'Ceremonia', 4, 'Tipo de ceremonia',    'select', '["Cristiana","Civil","Simbólica"]', 1),
  ('quince', 'Ceremonia', 4, 'Inicio de ceremonia',  'time',   '[]', 2),
  ('quince', 'Ceremonia', 4, 'Lugar',                'text',   '[]', 3),
  ('quince', 'Ceremonia', 4, 'Final de ceremonia',   'time',   '[]', 4),
  ('quince', 'Ceremonia', 4, 'Fotos quinceañera sola','time',  '[]', 5),

  -- Sección 5 — Protocolo
  ('quince', 'Protocolo', 5, 'Hora de inicio',           'time',    '[]', 1),
  ('quince', 'Protocolo', 5, 'Canción ingreso al salón', 'text',    '[]', 2),
  ('quince', 'Protocolo', 5, 'Palabras de bienvenida',   'text',    '[]', 3),
  ('quince', 'Protocolo', 5, 'Palabras de padres',       'boolean', '[]', 4),
  ('quince', 'Protocolo', 5, 'Brindis',                  'time',    '[]', 5),
  ('quince', 'Protocolo', 5, 'Vals (hasta 3 canciones)', 'textarea','[]', 6),
  ('quince', 'Protocolo', 5, 'Cámara de niebla en vals', 'boolean', '[]', 7),

  -- Sección 6 — Programa
  ('quince', 'Programa', 6, 'Fotos mesa por mesa', 'time', '[]', 1),
  ('quince', 'Programa', 6, 'Salida del menú',     'time', '[]', 2),
  ('quince', 'Programa', 6, 'Postre',              'time', '[]', 3),
  ('quince', 'Programa', 6, 'Esparcimiento',       'time', '[]', 4),
  ('quince', 'Programa', 6, 'Hora loca',           'time', '[]', 5),
  ('quince', 'Programa', 6, 'Fin del evento',      'time', '[]', 6),

  -- Sección 7 — Observaciones
  ('quince', 'Observaciones', 7, 'Observaciones generales', 'textarea', '[]', 1),

  -- ══════════════════════════════════════════════════════════
  -- EMPRESARIAL
  -- ══════════════════════════════════════════════════════════

  -- Sección 1 — Información general
  ('empresarial', 'Información general', 1, 'Fecha y horario',                  'text',    '[]', 1),
  ('empresarial', 'Información general', 1, 'Empresa/organización',             'text',    '[]', 2),
  ('empresarial', 'Información general', 1, 'Tipo de evento empresarial',       'select',  '["Lanzamiento","Cena de gala","Reunión","Capacitación","Otro"]', 3),
  ('empresarial', 'Información general', 1, 'Cantidad de asistentes',           'text',    '[]', 4),
  ('empresarial', 'Información general', 1, 'Contacto responsable',             'text',    '[]', 5),

  -- Sección 2 — Menú y bebidas
  ('empresarial', 'Menú y bebidas', 2, 'Menú',                        'textarea','[]', 1),
  ('empresarial', 'Menú y bebidas', 2, 'Coffee break',                'select',  '["Sí","N/A"]', 2),
  ('empresarial', 'Menú y bebidas', 2, 'Bebidas',                     'text',    '[]', 3),
  ('empresarial', 'Menú y bebidas', 2, 'Adicionales por la hacienda', 'textarea','[]', 4),

  -- Sección 3 — Logística
  ('empresarial', 'Logística', 3, 'Lista de asistentes',              'text',    '[]', 1),
  ('empresarial', 'Logística', 3, 'Llegada de asistentes - inicio',   'time',    '[]', 2),
  ('empresarial', 'Logística', 3, 'Llegada de asistentes - fin',      'time',    '[]', 3),
  ('empresarial', 'Logística', 3, 'Equipos audiovisuales requeridos', 'textarea','[]', 4),
  ('empresarial', 'Logística', 3, 'Configuración de sala',            'text',    '[]', 5),

  -- Sección 4 — Programa
  ('empresarial', 'Programa', 4, 'Hora de inicio',          'time',    '[]', 1),
  ('empresarial', 'Programa', 4, 'Agenda de actividades',   'textarea','[]', 2),
  ('empresarial', 'Programa', 4, 'Hora de fin',             'time',    '[]', 3),
  ('empresarial', 'Programa', 4, 'Observaciones logísticas','textarea','[]', 4),

  -- Sección 5 — Observaciones
  ('empresarial', 'Observaciones', 5, 'Observaciones generales', 'textarea', '[]', 1),

  -- ══════════════════════════════════════════════════════════
  -- REVELACIÓN DE GÉNERO
  -- ══════════════════════════════════════════════════════════

  -- Sección 1 — Información general
  ('revelacion', 'Información general', 1, 'Fecha y horario',                              'text', '[]', 1),
  ('revelacion', 'Información general', 1, 'Papás (nombres)',                              'text', '[]', 2),
  ('revelacion', 'Información general', 1, 'Cantidad de invitados',                        'text', '[]', 3),
  ('revelacion', 'Información general', 1, 'Género a revelar (confidencial hasta el evento)','text','[]', 4),

  -- Sección 2 — Menú y bebidas
  ('revelacion', 'Menú y bebidas', 2, 'Menú',                       'textarea','[]', 1),
  ('revelacion', 'Menú y bebidas', 2, 'Ponque/torta temática',      'text',    '[]', 2),
  ('revelacion', 'Menú y bebidas', 2, 'Adicionales por la hacienda','textarea','[]', 3),

  -- Sección 3 — Detalles del evento
  ('revelacion', 'Detalles del evento', 3, 'Lista de invitados',           'text',    '[]', 1),
  ('revelacion', 'Detalles del evento', 3, 'Llegada de invitados - inicio','time',    '[]', 2),
  ('revelacion', 'Detalles del evento', 3, 'Llegada de invitados - fin',   'time',    '[]', 3),
  ('revelacion', 'Detalles del evento', 3, 'Decoración temática',          'text',    '[]', 4),
  ('revelacion', 'Detalles del evento', 3, 'Cañón de confeti',             'select',  '["Sí","N/A"]', 5),
  ('revelacion', 'Detalles del evento', 3, 'Color del confeti',            'text',    '[]', 6),

  -- Sección 4 — Programa
  ('revelacion', 'Programa', 4, 'Hora de inicio',         'time', '[]', 1),
  ('revelacion', 'Programa', 4, 'Momento de revelación',  'time', '[]', 2),
  ('revelacion', 'Programa', 4, 'Hora fin del evento',    'time', '[]', 3),

  -- Sección 5 — Observaciones
  ('revelacion', 'Observaciones', 5, 'Observaciones generales', 'textarea', '[]', 1);
