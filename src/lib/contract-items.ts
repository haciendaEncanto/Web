// Estructura de los ítems variables del contrato
// Guardados como JSONB en bookings.contract_items

export interface ContractItems {
  menu:                  string; // cantidad
  pastel:                string;
  mesa_dulces:           string;
  canelazo:              string;
  coctel:                "Ilimitado" | "No aplica" | string;
  champana:              string;
  whisky:                string;
  estacion_cafe:         "Sí" | "No" | string;
  tarjetas_invitacion:   string;
  menaje:                string;
  mobiliario:            string;
  barman:                "Sí" | "No" | string;
  aseo:                  "Sí" | "No" | string;
  planner:               "Sí" | "No" | string;
  meseros:               string;
}

export const DEFAULT_CONTRACT_ITEMS: ContractItems = {
  menu:                "0",
  pastel:              "0",
  mesa_dulces:         "0",
  canelazo:            "0",
  coctel:              "No aplica",
  champana:            "0",
  whisky:              "0",
  estacion_cafe:       "No",
  tarjetas_invitacion: "Según cotización",
  menaje:              "0",
  mobiliario:          "0",
  barman:              "No",
  aseo:                "No",
  planner:             "No",
  meseros:             "0",
};

// Ítems fijos — siempre aparecen en el contrato, no editables
export const FIXED_ITEMS: { label: string; value: string }[] = [
  { label: "DJ",                    value: "1" },
  { label: "Maestro de ceremonias", value: "1" },
  { label: "Gaseosa y Agua",        value: "Ilimitado" },
  { label: "Sonido",                value: "Sí" },
  { label: "Luces",                 value: "Sí" },
  { label: "Pista de baile",        value: "Sí" },
];

// Etiquetas de los ítems variables
export const VARIABLE_ITEM_LABELS: Record<keyof ContractItems, string> = {
  menu:                "Menú",
  pastel:              "Pastel",
  mesa_dulces:         "Mesa de dulces",
  canelazo:            "Canelazo",
  coctel:              "Cóctel",
  champana:            "Champaña",
  whisky:              "Whisky",
  estacion_cafe:       "Estación de café",
  tarjetas_invitacion: "Tarjetas de invitación",
  menaje:              "Menaje",
  mobiliario:          "Mobiliario",
  barman:              "Barman",
  aseo:                "Aseo",
  planner:             "Planner",
  meseros:             "Meseros",
};

// Tipo de campo por ítem variable
export type ContractFieldType = "text" | "select-coctel" | "select-sino";

export const VARIABLE_ITEM_TYPES: Record<keyof ContractItems, ContractFieldType> = {
  menu:                "text",
  pastel:              "text",
  mesa_dulces:         "text",
  canelazo:            "text",
  coctel:              "select-coctel",
  champana:            "text",
  whisky:              "text",
  estacion_cafe:       "select-sino",
  tarjetas_invitacion: "text",
  menaje:              "text",
  mobiliario:          "text",
  barman:              "select-sino",
  aseo:                "select-sino",
  planner:             "select-sino",
  meseros:             "text",
};

// Datos fijos de la hacienda (solo lectura en UI)
export const HACIENDA_INFO = {
  nombre:              "HACIENDA EL ENCANTO S.A.S.",
  representante:       "Ana Victoria Marquez Villarreal",
  cc_representante:    "1127661646",
  nit:                 "901860912-1",
  direccion:           "Kilómetro 5, Vía Suba Cota",
  whatsapp:            "3247836852",
  email:               "contacto@hacienda-encanto.com",
  cuenta_davivienda:   "108900524282",
} as const;

// Número de cláusulas del contrato
export const CONTRATO_CLAUSULAS_COUNT = 12;

// Claves en site_content para cláusulas y firma
export const CLAUSULA_KEYS = Array.from(
  { length: CONTRATO_CLAUSULAS_COUNT },
  (_, i) => `contrato_clausula_${i + 1}` as const
);

export const FIRMA_KEY = "firma_representante" as const;
