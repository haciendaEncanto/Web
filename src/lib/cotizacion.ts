export type TipoEvento = "boda" | "quince" | "cumpleanos" | "grados";

export type DiaSemana =
  | "sabado_noche"
  | "viernes"
  | "domingo"
  | "sabado_dia_lunes_jueves";

export type CotizacionConfig = {
  precio_por_persona: number;
  costo_fijo_hacienda: number;
  costo_adicional: number;
  costo_base_menos_60: number;
  ajuste_por_invitado_menos_60: number;
  fee_porcentaje: number;
  descuento_volumen_menor_68: number;
  descuento_volumen_mayor_69: number;
  descuento_sabado_noche: number;
  descuento_viernes: number;
  descuento_domingo: number;
  descuento_sabado_dia_lunes_jueves: number;
};

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  boda: "Boda",
  quince: "XV Años",
  cumpleanos: "Cumpleaños",
  grados: "Grados",
};

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  sabado_noche: "Sábado Noche",
  viernes: "Viernes",
  domingo: "Domingo",
  sabado_dia_lunes_jueves: "Sábado Día / Lunes–Jueves",
};

export function calcularPrecio(
  invitados: number,
  diaSemana: DiaSemana,
  cfg: CotizacionConfig,
): number {
  let precioBase: number;
  if (invitados >= 60) {
    precioBase =
      invitados * cfg.precio_por_persona +
      cfg.costo_fijo_hacienda +
      cfg.costo_adicional;
  } else {
    precioBase =
      cfg.costo_base_menos_60 -
      (100 - invitados) * cfg.ajuste_por_invitado_menos_60 +
      cfg.costo_adicional;
  }

  const descVol =
    invitados <= 68
      ? cfg.descuento_volumen_menor_68 / 100
      : cfg.descuento_volumen_mayor_69 / 100;

  const subtotal = precioBase * (1 - descVol);
  let total = subtotal * (1 + cfg.fee_porcentaje / 100);

  const descDia: Record<DiaSemana, number> = {
    sabado_noche: cfg.descuento_sabado_noche / 100,
    viernes: cfg.descuento_viernes / 100,
    domingo: cfg.descuento_domingo / 100,
    sabado_dia_lunes_jueves: cfg.descuento_sabado_dia_lunes_jueves / 100,
  };

  total = total * (1 - descDia[diaSemana]);
  return Math.round(total);
}

export function detectarDiaSemana(fechaStr: string): DiaSemana {
  if (!fechaStr) return "sabado_noche";
  const d = new Date(fechaStr + "T12:00:00");
  const day = d.getDay(); // 0=Sun 1=Mon … 5=Fri 6=Sat
  if (day === 5) return "viernes";
  if (day === 0) return "domingo";
  if (day === 6) return "sabado_noche";
  return "sabado_dia_lunes_jueves";
}

export type CotizacionItem = {
  nombre: string;
  descripcion: string;
  cantidad: string;
};

export type CotizacionSeccion = {
  titulo: string;
  items: CotizacionItem[];
};

function setItems(tipoEvento: TipoEvento): CotizacionItem[] {
  switch (tipoEvento) {
    case "boda":
      return [
        { nombre: "Espejo", descripcion: "", cantidad: "1" },
        { nombre: "Lobby/palcos", descripcion: "", cantidad: "3" },
        { nombre: "Alfombra", descripcion: "", cantidad: "1" },
        { nombre: "Cuarto", descripcion: "", cantidad: "1" },
      ];
    case "quince":
      return [
        { nombre: "Espejo", descripcion: "", cantidad: "1" },
        { nombre: "Rosas para el Vals", descripcion: "", cantidad: "3" },
        { nombre: "Alfombra", descripcion: "", cantidad: "1" },
        { nombre: "Cuarto quinceañera", descripcion: "", cantidad: "1" },
      ];
    case "cumpleanos":
      return [
        { nombre: "Espejo", descripcion: "", cantidad: "1" },
        { nombre: "Lobby/palcos", descripcion: "", cantidad: "3" },
        { nombre: "Alfombra", descripcion: "", cantidad: "1" },
        { nombre: "Cuarto cumpleañero", descripcion: "", cantidad: "1" },
      ];
    case "grados":
      return [
        { nombre: "Espejo", descripcion: "", cantidad: "1" },
        { nombre: "Lobby/palcos", descripcion: "", cantidad: "3" },
        { nombre: "Alfombra", descripcion: "", cantidad: "1" },
        { nombre: "Cuarto Graduado/a", descripcion: "", cantidad: "1" },
      ];
  }
}

export function generarSecciones(
  tipoEvento: TipoEvento,
  N: number,
): CotizacionSeccion[] {
  const r = Math.round;
  const plannerLabel = tipoEvento === "quince" ? "Fifteen Planner" : "Planner";
  const set = setItems(tipoEvento);

  return [
    {
      titulo: "HACIENDA",
      items: [
        { nombre: "Hacienda", descripcion: "", cantidad: "1" },
        { nombre: "Zonas verdes", descripcion: "", cantidad: "1" },
        { nombre: "Jardines", descripcion: "", cantidad: "1" },
        { nombre: "Parqueadero", descripcion: "", cantidad: "1" },
        { nombre: "Lobby", descripcion: "", cantidad: "1" },
        { nombre: "Cocina", descripcion: "", cantidad: "1" },
      ],
    },
    {
      titulo: "BANQUETE",
      items: [
        { nombre: "Menú", descripcion: "", cantidad: String(N) },
        { nombre: "Pastel", descripcion: "", cantidad: String(N) },
        { nombre: "Prueba de Menú", descripcion: "", cantidad: "1" },
        { nombre: "Mesa de postres", descripcion: "", cantidad: "4" },
      ],
    },
    {
      titulo: "BEBIDAS",
      items: [
        { nombre: "Champaña", descripcion: "", cantidad: String(N) },
        { nombre: "Canelazo", descripcion: "", cantidad: String(N) },
        { nombre: "Whisky", descripcion: "botellas", cantidad: String(r(N / 12.5)) },
        { nombre: "Cocteles", descripcion: "", cantidad: "Ilimitado" },
        { nombre: "Agua", descripcion: "", cantidad: "Ilimitado" },
        { nombre: "Gaseosa", descripcion: "", cantidad: "Ilimitado" },
        { nombre: "Café", descripcion: "", cantidad: "1" },
      ],
    },
    {
      titulo: "PRODUCCIÓN",
      items: [
        { nombre: "Sonido", descripcion: "", cantidad: "1" },
        { nombre: "Luces", descripcion: "", cantidad: "1" },
      ],
    },
    {
      titulo: "PERSONAL",
      items: [
        { nombre: plannerLabel, descripcion: "", cantidad: "1" },
        { nombre: "DJ", descripcion: "", cantidad: "1" },
        { nombre: "Maestro de Ceremonia", descripcion: "", cantidad: "1" },
        { nombre: "Bartender", descripcion: "", cantidad: "1" },
        { nombre: "Personal de Staff", descripcion: "", cantidad: "4" },
        { nombre: "Meseros", descripcion: "", cantidad: String(r(N / 20)) },
        { nombre: "Capitán", descripcion: "", cantidad: "1" },
        { nombre: "Aseo", descripcion: "", cantidad: "1" },
        { nombre: "Logístico", descripcion: "", cantidad: "1" },
      ],
    },
    {
      titulo: "INVITACIONES",
      items: [
        { nombre: "Tarjetas", descripcion: "", cantidad: String(r(N * 0.3)) },
      ],
    },
    {
      titulo: "SET ESPECÍFICO",
      items: set,
    },
    {
      titulo: "MOBILIARIO",
      items: [
        { nombre: "Mesas", descripcion: "", cantidad: "10" },
        { nombre: "Mesas Principal", descripcion: "", cantidad: "2" },
        { nombre: "Sillas", descripcion: "", cantidad: String(N) },
        { nombre: "Sillas cambio zapatilla", descripcion: "", cantidad: "2" },
        { nombre: "Mesa Pastel", descripcion: "", cantidad: "1" },
        { nombre: "Bar", descripcion: "", cantidad: "1" },
        { nombre: "Sillas jardín", descripcion: "", cantidad: "5" },
        { nombre: "Mesas jardín", descripcion: "", cantidad: "2" },
      ],
    },
    {
      titulo: "DECORACIÓN",
      items: [
        { nombre: "Candelabros", descripcion: "", cantidad: "10" },
        { nombre: "Floreros", descripcion: "", cantidad: "10" },
        { nombre: "Ornamentación", descripcion: "", cantidad: "1" },
        { nombre: "Urna", descripcion: "", cantidad: "1" },
        { nombre: "Estantería urna", descripcion: "", cantidad: "1" },
        { nombre: "Velas", descripcion: "", cantidad: "10" },
        { nombre: "Arreglos de mesa", descripcion: "", cantidad: "4" },
        { nombre: "Centros de mesa", descripcion: "", cantidad: String(r(N / 10)) },
        { nombre: "Números para mesa", descripcion: "", cantidad: String(r(N / 10)) },
        { nombre: "Arreglo telas Lobby", descripcion: "", cantidad: "1" },
        { nombre: "Luces decorativas", descripcion: "", cantidad: "10" },
      ],
    },
    {
      titulo: "MENAJE",
      items: [
        { nombre: "Todo el menaje", descripcion: "", cantidad: String(N) },
      ],
    },
    {
      titulo: "COMPLEMENTOS",
      items: [
        { nombre: "Maqueta ponque", descripcion: "", cantidad: "1" },
        { nombre: "Hora loca", descripcion: "", cantidad: "1" },
        { nombre: "Accesorios", descripcion: "", cantidad: "1" },
      ],
    },
    {
      titulo: "SHOW MEDIA NOCHE",
      items: [
        { nombre: "SET", descripcion: "", cantidad: "1" },
      ],
    },
    {
      titulo: "SET FINAL",
      items: set,
    },
  ];
}
