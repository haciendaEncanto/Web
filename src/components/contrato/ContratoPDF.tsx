import React from "react";
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
  FIXED_ITEMS,
  type ContractItems,
} from "@/lib/contract-items";

const DORADO = "#C8A24B";
const NEGRO = "#0F0F0F";
const GRIS = "#6B6B6B";
const GRIS_CLARO = "#E8E4DC";
const BLANCO = "#FFFFFF";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: NEGRO,
    backgroundColor: BLANCO,
    paddingHorizontal: 48,
    paddingVertical: 44,
  },
  // Header
  header: { marginBottom: 20, borderBottom: `1.5px solid ${DORADO}`, paddingBottom: 14 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  haciendaName: { fontFamily: "Times-Roman", fontSize: 13, color: DORADO, letterSpacing: 0.5 },
  headerMeta: { fontSize: 7.5, color: GRIS, marginTop: 2 },
  contractTitle: { fontFamily: "Times-Roman", fontSize: 11, color: NEGRO, marginTop: 12, textAlign: "center", letterSpacing: 0.3 },
  versionBadge: { fontSize: 7, color: GRIS, textAlign: "center", marginTop: 2 },
  // Secciones
  section: { marginBottom: 14 },
  sectionTitle: { fontFamily: "Times-Roman", fontSize: 10, color: DORADO, marginBottom: 6, paddingBottom: 3, borderBottom: `0.5px solid ${DORADO}` },
  // Grid de datos
  grid2: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", marginBottom: 5 },
  cellFull: { width: "100%", marginBottom: 5 },
  label: { fontSize: 7, color: GRIS, marginBottom: 1.5 },
  value: { fontSize: 8.5, color: NEGRO },
  // Tabla de ítems
  table: { width: "100%", marginTop: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: NEGRO, paddingVertical: 4, paddingHorizontal: 6 },
  tableHeaderText: { color: BLANCO, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  colItem: { width: "65%" },
  colValue: { width: "35%", textAlign: "right" },
  tableRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottom: `0.3px solid ${GRIS_CLARO}` },
  tableRowAlt: { backgroundColor: "#FAFAF8" },
  tableCell: { fontSize: 8.5 },
  fixedBadge: { fontSize: 6.5, color: GRIS, fontStyle: "italic" },
  // Cláusula
  clausulaNum: { fontFamily: "Helvetica-Bold", fontSize: 8.5, marginBottom: 2 },
  clausulaText: { fontSize: 8, color: "#333333", lineHeight: 1.6 },
  clausulaWrap: { marginBottom: 10 },
  // Firmas
  firmasRow: { flexDirection: "row", marginTop: 32, gap: 24 },
  firmaBox: { flex: 1, alignItems: "center" },
  firmaLine: { width: "80%", borderBottom: `0.75px solid ${NEGRO}`, marginBottom: 4 },
  firmaLabel: { fontSize: 7.5, color: GRIS, textAlign: "center" },
  firmaName: { fontSize: 7.5, color: NEGRO, textAlign: "center", marginTop: 1 },
  firmaImg: { width: 90, height: 36, objectFit: "contain", marginBottom: 4 },
  firmaBlank: { height: 36, marginBottom: 4 },
  // Footer
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, borderTop: `0.5px solid ${GRIS_CLARO}`, paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 6.5, color: GRIS },
});

export interface ContractPDFData {
  clientName: string;
  clientCc: string;
  clientPhone: string;
  clientAddress: string;
  clientEmail: string;
  eventType: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  guestCount: number;
  capilla: boolean | null;
  valorTotal: number | null;
  valorAnticipo: number | null;
  fechaSegundoAbono: string | null;
  fechaTercerAbono: string | null;
  contractItems: ContractItems;
  clauses: string[];
  firmaUrl: string | null;
  version: number;
  generatedAt: string;
  otroSi?: string;
}

function fmt(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`;
}

const EVENT_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Evento Empresarial",
  revelacion: "Revelación de Género",
};

export function ContratoPDF({
  clientName, clientCc, clientPhone, clientAddress, clientEmail,
  eventType, eventDate, eventStartTime, eventEndTime, guestCount, capilla,
  valorTotal, valorAnticipo, fechaSegundoAbono, fechaTercerAbono,
  contractItems, clauses, firmaUrl, version, generatedAt, otroSi,
}: ContractPDFData) {
  const variableRows = (Object.keys(contractItems) as (keyof ContractItems)[]).map((key) => ({
    label: VARIABLE_ITEM_LABELS[key],
    value: contractItems[key] ?? "0",
  }));
  const allRows = [...variableRows, ...FIXED_ITEMS.map((f) => ({ label: f.label, value: f.value, fixed: true }))];

  return (
    <Document
      title={`Contrato de Servicios v${version} — ${clientName}`}
      author={HACIENDA_INFO.nombre}
      subject="Contrato de servicios para evento"
    >
      <Page size="LETTER" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.haciendaName}>{HACIENDA_INFO.nombre}</Text>
              <Text style={s.headerMeta}>NIT: {HACIENDA_INFO.nit} · {HACIENDA_INFO.direccion}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.headerMeta}>Generado: {generatedAt}</Text>
            </View>
          </View>
          <Text style={s.contractTitle}>CONTRATO DE SERVICIOS PARA EVENTO</Text>
          <Text style={s.versionBadge}>Versión {version}</Text>
        </View>

        {/* ── Partes ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>PARTES DEL CONTRATO</Text>
          <View style={s.grid2}>
            <View style={s.cell}>
              <Text style={[s.label, { color: DORADO }]}>CONTRATANTE (La Hacienda)</Text>
              <Text style={s.value}>{HACIENDA_INFO.nombre}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>NIT: {HACIENDA_INFO.nit}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>Rep. Legal: {HACIENDA_INFO.representante}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>CC Rep.: {HACIENDA_INFO.cc_representante}</Text>
            </View>
            <View style={s.cell}>
              <Text style={[s.label, { color: DORADO }]}>CONTRATADO (El Cliente)</Text>
              <Text style={s.value}>{clientName}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>CC/NIT: {clientCc}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>Tel: {clientPhone}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>Dirección: {clientAddress}</Text>
              <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>Correo: {clientEmail}</Text>
            </View>
          </View>
        </View>

        {/* ── Datos del evento ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>DATOS DEL EVENTO</Text>
          <View style={s.grid2}>
            <View style={s.cell}>
              <Text style={s.label}>Tipo de evento</Text>
              <Text style={s.value}>{EVENT_LABEL[eventType] ?? eventType}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Fecha</Text>
              <Text style={s.value}>{fmtDate(eventDate)}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Horario</Text>
              <Text style={s.value}>{eventStartTime} – {eventEndTime}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Número de invitados</Text>
              <Text style={s.value}>{guestCount}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Capilla</Text>
              <Text style={s.value}>{capilla === true ? "Sí" : capilla === false ? "No" : "Sin definir"}</Text>
            </View>
          </View>
        </View>

        {/* ── Valores ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>VALORES Y PLAN DE PAGO</Text>
          <View style={s.grid2}>
            <View style={s.cell}>
              <Text style={s.label}>Valor total del evento</Text>
              <Text style={[s.value, { fontFamily: "Helvetica-Bold" }]}>{fmt(valorTotal)}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Primer anticipo (50%)</Text>
              <Text style={s.value}>{fmt(valorAnticipo)}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Fecha 2.° abono</Text>
              <Text style={s.value}>{fmtDate(fechaSegundoAbono)}</Text>
            </View>
            <View style={s.cell}>
              <Text style={s.label}>Fecha 3.° abono / saldo</Text>
              <Text style={s.value}>{fmtDate(fechaTercerAbono)}</Text>
            </View>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={[s.value, { fontSize: 7.5, color: GRIS }]}>
              Cuenta Davivienda: {HACIENDA_INFO.cuenta_davivienda} a nombre de {HACIENDA_INFO.nombre}
            </Text>
          </View>
        </View>

        {/* ── Ítems ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>SERVICIOS E ÍTEMS INCLUIDOS</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colItem]}>Ítem</Text>
              <Text style={[s.tableHeaderText, s.colValue]}>Cantidad / Valor</Text>
            </View>
            {allRows.map((row, i) => (
              <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <View style={s.colItem}>
                  <Text style={s.tableCell}>{row.label}</Text>
                  {"fixed" in row && row.fixed && (
                    <Text style={s.fixedBadge}>Incluido</Text>
                  )}
                </View>
                <Text style={[s.tableCell, s.colValue]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer (primera página) ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{HACIENDA_INFO.nombre} · NIT {HACIENDA_INFO.nit}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* ── Página 2: Cláusulas + Firmas ── */}
      <Page size="LETTER" style={s.page}>
        <View style={[s.header, { marginBottom: 14 }]}>
          <Text style={[s.haciendaName, { fontSize: 10 }]}>{HACIENDA_INFO.nombre} — Contrato de Servicios v{version}</Text>
          <Text style={[s.versionBadge, { textAlign: "left", marginTop: 0 }]}>Continuación — Cláusulas</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>CLÁUSULAS Y CONDICIONES</Text>
          {clauses.map((text, i) =>
            text ? (
              <View key={i} style={s.clausulaWrap}>
                <Text style={s.clausulaNum}>CLÁUSULA {i + 1}</Text>
                <Text style={s.clausulaText}>{text}</Text>
              </View>
            ) : null
          )}
        </View>

        {/* Otro sí */}
        {otroSi && (
          <View style={[s.section, { marginTop: 6 }]}>
            <Text style={s.sectionTitle}>OTRO SÍ</Text>
            <Text style={s.clausulaText}>{otroSi}</Text>
          </View>
        )}

        {/* ── Firmas ── */}
        <View style={s.firmasRow}>
          {/* Representante hacienda */}
          <View style={s.firmaBox}>
            {firmaUrl ? (
              <Image src={firmaUrl} style={s.firmaImg} />
            ) : (
              <View style={s.firmaBlank} />
            )}
            <View style={s.firmaLine} />
            <Text style={s.firmaLabel}>Por la Hacienda El Encanto</Text>
            <Text style={s.firmaName}>{HACIENDA_INFO.representante}</Text>
            <Text style={[s.firmaLabel, { marginTop: 1 }]}>CC {HACIENDA_INFO.cc_representante}</Text>
          </View>
          {/* Cliente */}
          <View style={s.firmaBox}>
            <View style={s.firmaBlank} />
            <View style={s.firmaLine} />
            <Text style={s.firmaLabel}>El Contratado</Text>
            <Text style={s.firmaName}>{clientName}</Text>
            <Text style={[s.firmaLabel, { marginTop: 1 }]}>CC {clientCc}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{HACIENDA_INFO.nombre} · NIT {HACIENDA_INFO.nit}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
