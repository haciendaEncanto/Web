// Estructura de los ítems variables del contrato
// Guardados como JSONB en bookings.contract_items

export interface ContractItems {
  // Sí/No con cantidad fija implícita (DJ=1, Maestro=1)
  dj:                  boolean;
  maestro_ceremonias:  boolean;
  // Sí/No simple
  barman:              boolean;
  aseo:                boolean;
  planner:             boolean;
  estacion_cafe:       boolean;
  kit_boda:            boolean;
  mobiliario:          boolean;
  // Cantidad (número de personas/unidades)
  menu:                string;
  pastel:              string;
  mesa_dulces:         string;
  canelazo:            string;
  champana:            string;
  whisky:              string;
  meseros:             string;
  menaje:              string;
  // Texto libre
  tarjetas_invitacion: string;
}

export const DEFAULT_CONTRACT_ITEMS: ContractItems = {
  dj:                  true,
  maestro_ceremonias:  true,
  barman:              false,
  aseo:                false,
  planner:             false,
  estacion_cafe:       false,
  kit_boda:            false,
  mobiliario:          false,
  menu:                "0",
  pastel:              "0",
  mesa_dulces:         "0",
  canelazo:            "0",
  champana:            "0",
  whisky:              "0",
  meseros:             "0",
  menaje:              "0",
  tarjetas_invitacion: "Según cotización",
};

// Orden de visualización en formulario y PDF
export const VARIABLE_ITEM_ORDER: (keyof ContractItems)[] = [
  "dj", "maestro_ceremonias",
  "barman", "aseo", "planner", "estacion_cafe", "kit_boda", "mobiliario",
  "menu", "pastel", "mesa_dulces", "canelazo", "champana", "whisky",
  "meseros", "menaje", "tarjetas_invitacion",
];

// Ítems fijos — siempre aparecen, no editables
export const FIXED_ITEMS: { label: string; value: string }[] = [
  { label: "Sonido",          value: "Sí" },
  { label: "Luces",           value: "Sí" },
  { label: "Pista de baile",  value: "Sí" },
  { label: "Gaseosa y Agua",  value: "Ilimitado" },
  { label: "Cóctel",          value: "Ilimitado" },
];

// Etiquetas de los ítems variables
export const VARIABLE_ITEM_LABELS: Record<keyof ContractItems, string> = {
  dj:                  "DJ",
  maestro_ceremonias:  "Maestro de ceremonias",
  barman:              "Barman",
  aseo:                "Aseo",
  planner:             "Planner",
  estacion_cafe:       "Estación de café",
  kit_boda:            "Kit de boda",
  mobiliario:          "Mobiliario",
  menu:                "Menú",
  pastel:              "Pastel",
  mesa_dulces:         "Mesa de dulces",
  canelazo:            "Canelazo",
  champana:            "Champaña",
  whisky:              "Whisky (botellas)",
  meseros:             "Meseros",
  menaje:              "Menaje",
  tarjetas_invitacion: "Tarjetas de invitación",
};

// Tipo de campo por ítem variable
// sino-fixed-1 → Sí/No; si Sí, muestra "1" fijo
// sino          → Sí/No puro
// cantidad      → número
// texto         → texto libre
export type ContractFieldType = "sino-fixed-1" | "sino" | "cantidad" | "texto";

export const VARIABLE_ITEM_TYPES: Record<keyof ContractItems, ContractFieldType> = {
  dj:                  "sino-fixed-1",
  maestro_ceremonias:  "sino-fixed-1",
  barman:              "sino",
  aseo:                "sino",
  planner:             "sino",
  estacion_cafe:       "sino",
  kit_boda:            "sino",
  mobiliario:          "sino",
  menu:                "cantidad",
  pastel:              "cantidad",
  mesa_dulces:         "cantidad",
  canelazo:            "cantidad",
  champana:            "cantidad",
  whisky:              "cantidad",
  meseros:             "cantidad",
  menaje:              "cantidad",
  tarjetas_invitacion: "texto",
};

// Datos de la hacienda — valores por defecto (hardcoded como fallback)
export const HACIENDA_INFO = {
  nombre:            "HACIENDA EL ENCANTO S.A.S.",
  representante:     "Ana Victoria Marquez Villarreal",
  cc_representante:  "1127661646",
  nit:               "901860912-1",
  direccion:         "Kilómetro 5, Vía Suba Cota",
  whatsapp:          "3247836852",
  email:             "contacto@hacienda-encanto.com",
  cuenta_davivienda: "108900524282",
} as const;

// Claves en site_content para datos editables de la hacienda
export const HACIENDA_CONTENT_KEYS: Record<keyof typeof HACIENDA_INFO, string> = {
  nombre:            "hacienda_nombre",
  representante:     "hacienda_representante",
  cc_representante:  "hacienda_cc_representante",
  nit:               "hacienda_nit",
  direccion:         "hacienda_direccion",
  whatsapp:          "hacienda_whatsapp",
  email:             "hacienda_email",
  cuenta_davivienda: "hacienda_cuenta_davivienda",
};

export const HACIENDA_FIELD_LABELS: Record<keyof typeof HACIENDA_INFO, string> = {
  nombre:            "Razón social",
  representante:     "Representante legal",
  cc_representante:  "CC del representante",
  nit:               "NIT",
  direccion:         "Dirección",
  whatsapp:          "WhatsApp (solo dígitos)",
  email:             "Correo electrónico",
  cuenta_davivienda: "Cuenta Davivienda",
};

// Resuelve datos de la hacienda combinando site_content con defaults
export type HaciendaData = { [K in keyof typeof HACIENDA_INFO]: string };

export function resolveHaciendaData(
  contentMap: Record<string, string | null>
): HaciendaData {
  const keys = Object.keys(HACIENDA_CONTENT_KEYS) as (keyof typeof HACIENDA_INFO)[];
  const result = {} as HaciendaData;
  for (const k of keys) {
    result[k] = contentMap[HACIENDA_CONTENT_KEYS[k]] || HACIENDA_INFO[k];
  }
  return result;
}

// Número de cláusulas del contrato
export const CONTRATO_CLAUSULAS_COUNT = 12;

export const CLAUSULA_KEYS = Array.from(
  { length: CONTRATO_CLAUSULAS_COUNT },
  (_, i) => `contrato_clausula_${i + 1}` as const
);

export const FIRMA_KEY = "firma_representante" as const;
