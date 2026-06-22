-- Agrega event_type a packages para contenido específico por tipo de evento
ALTER TABLE packages ADD COLUMN IF NOT EXISTS event_type text;

-- ─── BODAS ────────────────────────────────────────────────────────────────────
INSERT INTO packages (id, name, description, includes, is_active, sort_order, price, event_type) VALUES
  (
    gen_random_uuid(),
    'El Encanto Esencial',
    'Todo lo necesario para una boda perfecta en nuestros espacios.',
    '["Salón principal (hasta 150 personas)", "Mobiliario: mesas redondas y sillas", "Iluminación estándar", "Parqueadero privado", "Acceso a jardines para la ceremonia", "Asistencia de coordinación el día de la boda"]'::jsonb,
    true, 1, 0, 'Boda'
  ),
  (
    gen_random_uuid(),
    'El Encanto Premium',
    'Una experiencia completa para que los novios solo piensen en disfrutar.',
    '["Todo lo incluido en Esencial", "Decoración floral en mesas", "Iluminación ambiental personalizada", "Barra de bebidas (4 horas)", "Servicio de meseros", "Espacio de cóctel en jardín", "Coordinador exclusivo para los novios"]'::jsonb,
    true, 2, 0, 'Boda'
  ),
  (
    gen_random_uuid(),
    'El Encanto Gran Gala',
    'La boda que siempre soñaron, sin dejar nada al azar.',
    '["Todo lo incluido en Premium", "Salón principal + espacio adicional", "Decoración personalizada según su visión", "Banquete completo (cena y bebidas)", "Mesa de dulces y recuerdos", "Animación y DJ", "Visita previa de coordinación", "Atención VIP para novios y familia"]'::jsonb,
    true, 3, 0, 'Boda'
  );

-- ─── QUINCE AÑOS ──────────────────────────────────────────────────────────────
INSERT INTO packages (id, name, description, includes, is_active, sort_order, price, event_type) VALUES
  (
    gen_random_uuid(),
    'El Encanto Esencial',
    'Todo lo necesario para una celebración de quince años perfecta.',
    '["Salón principal (hasta 150 personas)", "Mobiliario: mesas redondas y sillas", "Iluminación estándar", "Parqueadero privado", "Acceso a jardines", "Asistencia de coordinación el día del evento"]'::jsonb,
    true, 1, 0, 'Quince Años'
  ),
  (
    gen_random_uuid(),
    'El Encanto Premium',
    'Una celebración especial para que la quinceañera brille en su gran noche.',
    '["Todo lo incluido en Esencial", "Decoración temática en mesas", "Iluminación ambiental personalizada", "Barra de bebidas (4 horas)", "Servicio de meseros", "Espacio de recepción en jardín", "Coordinador exclusivo para la quinceañera"]'::jsonb,
    true, 2, 0, 'Quince Años'
  ),
  (
    gen_random_uuid(),
    'El Encanto Gran Gala',
    'La celebración más completa para una noche que se recuerda toda la vida.',
    '["Todo lo incluido en Premium", "Salón principal + espacio adicional", "Decoración personalizada según la temática elegida", "Banquete completo (cena y bebidas)", "Mesa de dulces y recuerdos", "Animación y DJ", "Sorpresa de cumpleaños incluida", "Atención VIP para la quinceañera y su familia"]'::jsonb,
    true, 3, 0, 'Quince Años'
  );

-- ─── EVENTOS EMPRESARIALES ────────────────────────────────────────────────────
INSERT INTO packages (id, name, description, includes, is_active, sort_order, price, event_type) VALUES
  (
    gen_random_uuid(),
    'El Encanto Esencial',
    'El espacio y la logística para que tu equipo se concentre en lo que importa.',
    '["Salón principal (hasta 150 personas)", "Mobiliario: mesas de trabajo y sillas", "Iluminación estándar", "Parqueadero privado", "Acceso a zonas al aire libre", "Coffee break de bienvenida"]'::jsonb,
    true, 1, 0, 'Evento Empresarial'
  ),
  (
    gen_random_uuid(),
    'El Encanto Premium',
    'Infraestructura y servicios para eventos corporativos de alto nivel.',
    '["Todo lo incluido en Esencial", "Equipos audiovisuales (video beam y sonido)", "Dos coffee breaks (mañana y tarde)", "Barra de bebidas (4 horas)", "Servicio de meseros", "Espacio para networking en jardín", "Coordinador de evento asignado"]'::jsonb,
    true, 2, 0, 'Evento Empresarial'
  ),
  (
    gen_random_uuid(),
    'El Encanto Gran Gala',
    'La experiencia corporativa completa, desde la bienvenida hasta el cierre.',
    '["Todo lo incluido en Premium", "Salón principal + espacio adicional", "Montaje personalizado según el tipo de evento", "Almuerzo o cena de gala", "Decoración con identidad corporativa", "Recepción y registro de asistentes", "Soporte técnico durante el evento", "Transporte de cortesía desde Bogotá"]'::jsonb,
    true, 3, 0, 'Evento Empresarial'
  );

-- ─── REVELACIÓN DE GÉNERO ─────────────────────────────────────────────────────
INSERT INTO packages (id, name, description, includes, is_active, sort_order, price, event_type) VALUES
  (
    gen_random_uuid(),
    'El Encanto Esencial',
    'El escenario perfecto para revelar la gran noticia en familia.',
    '["Espacio en jardines (hasta 80 personas)", "Mobiliario: mesas y sillas", "Iluminación estándar", "Parqueadero privado", "Zona de revelación preparada", "Asistencia de coordinación el día del evento"]'::jsonb,
    true, 1, 0, 'Revelación de Género'
  ),
  (
    gen_random_uuid(),
    'El Encanto Premium',
    'Una celebración llena de color y emoción para el momento más esperado.',
    '["Todo lo incluido en Esencial", "Decoración temática rosa y azul", "Barra de bebidas y snacks (3 horas)", "Servicio de meseros", "Backdrop para fotografías", "Coordinador exclusivo para la celebración"]'::jsonb,
    true, 2, 0, 'Revelación de Género'
  ),
  (
    gen_random_uuid(),
    'El Encanto Gran Gala',
    'La revelación más especial, con todo el amor y la magia que merece ese momento.',
    '["Todo lo incluido en Premium", "Salón + jardín completo", "Decoración personalizada más allá de rosa y azul", "Banquete completo (cena y bebidas)", "Mesa de dulces temática", "Cañón de confeti para la revelación", "Animación y música en vivo", "Atención VIP para los futuros papás y familia"]'::jsonb,
    true, 3, 0, 'Revelación de Género'
  );
