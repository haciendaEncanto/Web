import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  HACIENDA_INFO,
  VARIABLE_ITEM_LABELS,
  VARIABLE_ITEM_TYPES,
  VARIABLE_ITEM_ORDER,
  DEFAULT_CONTRACT_ITEMS,
  type ContractItems,
  type HaciendaData,
} from "@/lib/contract-items";

const NEGRO = "#0F0F0F";
const GRIS  = "#666666";
const LINEA = "#CCCCCC";

const ORDINALS = [
  "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA", "SEXTA",
  "SÉPTIMA", "OCTAVA", "NOVENA", "DÉCIMA", "DÉCIMA PRIMERA", "DÉCIMA SEGUNDA",
];

const EVENT_LABEL: Record<string, string> = {
  boda:        "Boda",
  quince:      "Quinceañera",
  empresarial: "Evento Empresarial",
  revelacion:  "Revelación de Género",
};

const MONTHS = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: NEGRO,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 50,
    paddingTop: 68,
    paddingBottom: 44,
  },

  // ── Header (repetido en cada página) ────────────────────────────────
  header: {
    position: "absolute",
    top: 10,
    left: 50,
    right: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  haciendaName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  haciendaContact: {
    fontSize: 7,
    color: GRIS,
    textAlign: "right",
    lineHeight: 1.5,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: NEGRO,
    borderBottomStyle: "solid",
  },

  // ── Footer (repetido en cada página) ────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 12,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: LINEA,
    borderTopStyle: "solid",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 6.5,
    color: GRIS,
  },

  // ── Título ───────────────────────────────────────────────────────────
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  // ── Cuerpo ───────────────────────────────────────────────────────────
  body: {
    fontSize: 9.5,
    lineHeight: 1.65,
    textAlign: "justify",
    marginBottom: 6,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },

  // ── Tabla de ítems (4 columnas) ────────────────────────────────────
  table: {
    marginTop: 6,
    marginBottom: 6,
    borderTopWidth: 0.75,
    borderTopColor: NEGRO,
    borderTopStyle: "solid",
    borderLeftWidth: 0.75,
    borderLeftColor: NEGRO,
    borderLeftStyle: "solid",
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: NEGRO,
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: NEGRO,
    borderBottomStyle: "solid",
  },
  tRowAlt: {
    backgroundColor: "#F6F5F1",
  },
  tHBase: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRightWidth: 0.5,
    borderRightColor: "#444444",
    borderRightStyle: "solid",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  tHLast: {
    borderRightWidth: 0,
  },
  tItem: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 0.75,
    borderRightColor: NEGRO,
    borderRightStyle: "solid",
  },
  tQty: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 0.75,
    borderRightColor: NEGRO,
    borderRightStyle: "solid",
    textAlign: "center",
  },
  tQtyLast: {
    borderRightWidth: 0,
  },
  wItem: { width: "38%" },
  wQty:  { width: "12%" },

  // ── Firmas ───────────────────────────────────────────────────────────
  firmasRow: {
    flexDirection: "row",
    marginTop: 28,
    gap: 24,
  },
  firmaBox: {
    flex: 1,
  },
  firmaRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 22,
  },
  firmaImgWrap: {
    height: 44,
    marginBottom: 2,
  },
  firmaImg: {
    width: 88,
    height: 42,
    objectFit: "contain",
  },
  firmaLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: NEGRO,
    borderBottomStyle: "solid",
    width: "85%",
    marginBottom: 3,
  },
  firmaName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  firmaCC: {
    fontSize: 8.5,
  },
  firmaRoleLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    marginTop: 1,
  },
});

// ── Tipos públicos ──────────────────────────────────────────────────────
export interface ContractPDFData {
  clientName:         string;
  clientCc:           string;
  clientPhone:        string;
  clientAddress:      string;
  clientEmail:        string;
  eventType:          string;
  eventDate:          string;
  eventStartTime:     string;
  eventEndTime:       string;
  guestCount:         number;
  capilla:            boolean | null;
  valorTotal:         number | null;
  valorAnticipo:      number | null;
  fechaSegundoAbono:  string | null;
  fechaTercerAbono:   string | null;
  contractItems:      ContractItems;
  clauses:            string[];
  firmaUrl:           string | null;
  version:            number;
  generatedAt:        string;
  otroSi?:            string;
  haciendaData?:      HaciendaData;
}

// ── Helpers ────────────────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} de ${MONTHS[parseInt(m) - 1]} de ${y}`;
}

function fmtMoney(n: number | null) {
  if (!n) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n);
}

type ItemRow = { label: string; value: string };

function buildItemRows(items: ContractItems, capilla: boolean | null): ItemRow[] {
  const rows: ItemRow[] = [];
  const merged = { ...DEFAULT_CONTRACT_ITEMS, ...items };

  for (const key of VARIABLE_ITEM_ORDER) {
    const val  = merged[key as keyof ContractItems];
    const type = VARIABLE_ITEM_TYPES[key as keyof ContractItems];

    if (type === "sino-fixed-1" || type === "sino") {
      if (!val) continue;
    } else if (type === "cantidad") {
      if (!val || parseInt(val as string, 10) <= 0) continue;
    } else {
      if (!val || !(val as string).trim()) continue;
    }

    let displayVal: string;
    if (type === "sino-fixed-1") {
      displayVal = "1";
    } else if (type === "sino") {
      const k = key as keyof ContractItems;
      displayVal = (k === "gaseosa_agua" || k === "coctel") ? "(ILIMITADO)" : "Sí";
    } else {
      displayVal = String(val);
    }

    rows.push({
      label: VARIABLE_ITEM_LABELS[key as keyof ContractItems].toUpperCase(),
      value: displayVal,
    });
  }

  if (capilla === true) {
    rows.push({ label: "CAPILLA", value: "Sí" });
  }

  return rows;
}

// ── Componente ──────────────────────────────────────────────────────────
export function ContratoPDF({
  clientName, clientCc,
  eventType, eventDate, eventStartTime, eventEndTime, guestCount, capilla,
  valorTotal, valorAnticipo, fechaSegundoAbono, fechaTercerAbono,
  contractItems, clauses, firmaUrl, version, otroSi,
  haciendaData,
}: ContractPDFData) {
  const h: HaciendaData = haciendaData ?? { ...HACIENDA_INFO };

  const itemRows = buildItemRows(contractItems, capilla);
  const pairs: [ItemRow, ItemRow | null][] = [];
  for (let i = 0; i < itemRows.length; i += 2) {
    pairs.push([itemRows[i], itemRows[i + 1] ?? null]);
  }

  const now    = new Date();
  const nowDay = now.getDate();
  const nowMon = MONTHS[now.getMonth()];
  const nowYr  = now.getFullYear();

  // Línea de valores concatenada
  const valorParts: string[] = [];
  if (valorTotal)        valorParts.push(`Valor total del evento: ${fmtMoney(valorTotal)}`);
  if (valorAnticipo)     valorParts.push(`Primer anticipo: ${fmtMoney(valorAnticipo)}`);
  if (fechaSegundoAbono) valorParts.push(`Fecha 2.° abono: ${fmtDate(fechaSegundoAbono)}`);
  if (fechaTercerAbono)  valorParts.push(`Saldo: ${fmtDate(fechaTercerAbono)}`);
  valorParts.push(`Cuenta Davivienda No. ${h.cuenta_davivienda} a nombre de ${h.nombre}.`);

  // Cláusulas 3–12 como texto corrido
  let clauseBlock = "";
  for (let i = 0; i < clauses.slice(2).length; i++) {
    const text = clauses[i + 2];
    if (!text) continue;
    clauseBlock += `CLAUSULA ${ORDINALS[i + 2]}: ${text}  `;
  }

  // Texto de cláusula 2 (default si vacía en site_content)
  const clause2Text = clauses[1]
    ? clauses[1]
    : "EL CONTRATISTA se compromete a proporcionar la nómina de empleados Full Dotación y a hacer entrega del salón bajo acta en perfecto estado con todos los ítems especificados en la cotización anexa,";

  return (
    <Document
      title={`Contrato de Servicios v${version} — ${clientName}`}
      author={h.nombre}
      subject="Contrato de prestación de servicios"
    >
      <Page size="LETTER" style={s.page}>

        {/* ── Header fijo ─── */}
        <View style={s.header} fixed>
          <View style={s.headerRow}>
            <Text style={s.haciendaName}>{h.nombre}</Text>
            <Text style={s.haciendaContact}>
              {`www.hacienda-encanto.com\nDirección ${h.direccion}\nWhatsapp ${h.whatsapp}`}
            </Text>
          </View>
          <View style={s.headerBorder} />
        </View>

        {/* ── Título ─── */}
        <Text style={s.title}>
          {"CONTRATO DE PRESTACIÓN DE SERVICIOS Y SUMINISTROS"}
        </Text>

        {/* ── Intro + Cláusulas 1 y 2 (texto corrido) ─── */}
        <Text style={s.body}>
          {"Entre los suscritos a saber "}
          <Text style={s.bold}>{h.representante}</Text>
          {" mayor de edad y vecino de Bogotá, identificada con C.C " +
            h.cc_representante +
            ", como representante legal de la "}
          <Text style={s.bold}>{h.nombre}</Text>
          {" NIT " +
            h.nit +
            ", parte que en lo sucesivo y que para efectos del siguiente contrato se denominará "}
          <Text style={s.bold}>{"EL CONTRATISTA"}</Text>
          {" por una parte; y por la otra "}
          <Text style={s.bold}>{clientName}</Text>
          {" mayor de edad, identificado(a) con CC "}
          <Text style={s.bold}>{clientCc}</Text>
          {", quien de ahora en adelante se llamará el "}
          <Text style={s.bold}>{"CONTRATANTE"}</Text>
          {", hemos acordado celebrar el presente contrato contenido dentro de las siguientes cláusulas: "}
          <Text style={s.bold}>{"CLAUSULA PRIMERA – OBJETO: "}</Text>
          {"El objeto del presente contrato es que "}
          <Text style={s.bold}>{"EL CONTRATISTA"}</Text>
          {" se compromete a prestar sus servicios para un evento de tipo "}
          <Text style={s.bold}>{EVENT_LABEL[eventType] ?? eventType}</Text>
          {", para el día " +
            fmtDate(eventDate) +
            ", en un horario sugerido de: " +
            eventStartTime +
            " hasta las " +
            eventEndTime +
            ". " +
            (clauses[0] ? clauses[0] + " " : "")}
          <Text style={s.bold}>{"CLAUSULA SEGUNDA: "}</Text>
          {"OBLIGACIONES DEL CONTRATISTA: " +
            clause2Text +
            " todo con una capacidad para " +
            guestCount +
            " personas, los alcances y particularidades de este contrato se describen a continuación:"}
        </Text>

        {/* ── Tabla de ítems (4 columnas) ─── */}
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.tHBase, s.wItem]}>{"ÍTEM"}</Text>
            <Text style={[s.tHBase, s.wQty]}>{"CANTIDAD"}</Text>
            <Text style={[s.tHBase, s.wItem]}>{"ÍTEM"}</Text>
            <Text style={[s.tHBase, s.wQty, s.tHLast]}>{"CANTIDAD"}</Text>
          </View>
          {pairs.map(([left, right], i) => (
            <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
              <Text style={[s.tItem, s.wItem]}>{left.label}</Text>
              <Text style={[s.tQty, s.wQty]}>{left.value}</Text>
              <Text style={[s.tItem, s.wItem]}>{right ? right.label : ""}</Text>
              <Text style={[s.tQty, s.wQty, s.tQtyLast]}>
                {right ? right.value : ""}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Valores ─── */}
        <Text style={s.body}>{valorParts.join("  ·  ")}</Text>

        {/* ── Cláusulas 3–12 en texto corrido ─── */}
        {clauseBlock.trim() ? (
          <Text style={[s.body, { marginTop: 4 }]}>{clauseBlock}</Text>
        ) : null}

        {/* ── Otro Sí ─── */}
        {otroSi ? (
          <Text style={s.body}>
            <Text style={s.bold}>{"OTRO SÍ: "}</Text>
            {otroSi}
          </Text>
        ) : null}

        {/* ── Párrafo de constancia ─── */}
        <Text style={[s.body, { marginTop: 10 }]}>
          {`Para constancia de este, se firman dos copias del mismo tenor en Bogotá, a los ${nowDay} días del mes de ${nowMon} de ${nowYr}.`}
        </Text>

        {/* ── Bloque de firmas ─── */}
        <View style={s.firmasRow}>
          <View style={s.firmaBox}>
            <Text style={s.firmaRole}>{"EL CONTRATISTA"}</Text>
            <View style={s.firmaImgWrap}>
              {firmaUrl ? <Image src={firmaUrl} style={s.firmaImg} /> : null}
            </View>
            <View style={s.firmaLine} />
            <Text style={s.firmaName}>{h.representante}</Text>
            <Text style={s.firmaCC}>{"C.C " + h.cc_representante}</Text>
            <Text style={s.firmaRoleLabel}>{"CONTRATISTA"}</Text>
          </View>
          <View style={s.firmaBox}>
            <Text style={s.firmaRole}>{"EL CONTRATANTE"}</Text>
            <View style={s.firmaImgWrap} />
            <View style={s.firmaLine} />
            <Text style={s.firmaName}>{clientName}</Text>
            <Text style={s.firmaCC}>{"C.C " + clientCc}</Text>
            <Text style={s.firmaRoleLabel}>{"CONTRATANTE"}</Text>
          </View>
        </View>

        {/* ── Footer fijo ─── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{`${h.nombre}  ·  NIT ${h.nit}`}</Text>
          <Text style={s.footerText}>
            {`www.hacienda-encanto.com  ·  Whatsapp ${h.whatsapp}`}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Pág. ${pageNumber} / ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  );
}
