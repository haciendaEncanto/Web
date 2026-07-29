#!/usr/bin/env tsx
// Genera docs/documentacion-tecnica.pdf desde docs/documentacion-tecnica.md
// Uso: npx tsx scripts/generate-pdf.tsx

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import * as fs from 'fs'
import * as path from 'path'

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  rojo:   '#D63B2A',
  dorado: '#C9A84C',
  crema:  '#F5F0E8',
  negro:  '#1A1A1A',
  gris:   '#F3F3F3',
  grisB:  '#E4E4E4',
  grisT:  '#555555',
  white:  '#FFFFFF',
  celdaA: '#FBF8F2',
}

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT = process.cwd()
const LOGO = path.join(ROOT, 'public', 'logo-hacienda.png')
const MD   = path.join(ROOT, 'docs', 'documentacion-tecnica.md')
const OUT  = path.join(ROOT, 'docs', 'documentacion-tecnica.pdf')

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Cover
  coverPage: {
    backgroundColor: C.crema,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  coverLogo:    { width: 200, marginBottom: 30 },
  coverLineDor: { width: '75%', height: 2.5, backgroundColor: C.dorado, marginBottom: 28 },
  coverTitle:   {
    fontFamily: 'Helvetica-Bold', fontSize: 30,
    color: C.negro, textAlign: 'center', marginBottom: 14,
  },
  coverSub: {
    fontFamily: 'Helvetica', fontSize: 16,
    color: C.grisT, textAlign: 'center', marginBottom: 10,
  },
  coverDate: {
    fontFamily: 'Helvetica', fontSize: 11,
    color: C.grisT, textAlign: 'center', marginBottom: 36,
  },
  coverDesc: {
    fontFamily: 'Helvetica', fontSize: 10,
    color: C.grisT, textAlign: 'center', lineHeight: 1.6,
    paddingHorizontal: 40,
  },
  coverLineRojo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 10, backgroundColor: C.rojo,
  },

  // Content page
  page: {
    backgroundColor: C.white,
    paddingTop: 88,
    paddingBottom: 68,
    paddingLeft: 50,
    paddingRight: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.negro,
    lineHeight: 1.45,
  },

  // Fixed header
  hdr: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 70,
    paddingTop: 18,
    paddingHorizontal: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
  },
  hdrLogo:  { width: 88, height: 27 },
  hdrTitle: { fontFamily: 'Helvetica', fontSize: 8, color: C.grisT },
  hdrLine: {
    position: 'absolute', bottom: 0, left: 50, right: 50,
    height: 1.5, backgroundColor: C.rojo,
  },

  // Fixed footer
  ftr: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 50,
    paddingHorizontal: 50,
    paddingBottom: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: C.white,
  },
  ftrLine: { width: '100%', height: 1.5, backgroundColor: C.dorado, marginBottom: 7 },
  ftrText: { fontFamily: 'Helvetica', fontSize: 8, color: C.grisT, textAlign: 'center' },

  // Headings
  h2wrap: { marginTop: 22, marginBottom: 8 },
  h2:     { fontFamily: 'Helvetica-Bold', fontSize: 15, color: C.rojo },
  h2line: { height: 1.5, backgroundColor: C.rojo, marginTop: 3 },
  h3:     {
    fontFamily: 'Helvetica-Bold', fontSize: 12, color: C.dorado,
    marginTop: 14, marginBottom: 5,
  },
  h4wrap: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 },
  h4bar:  { width: 3.5, height: 13, backgroundColor: C.dorado, marginRight: 6 },
  h4:     { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: C.negro },

  // Content blocks
  para:   { marginBottom: 7, lineHeight: 1.5 },
  bq:     {
    borderLeftWidth: 3, borderLeftColor: C.dorado, borderLeftStyle: 'solid',
    paddingLeft: 10, marginBottom: 8, marginTop: 2,
  },
  bqTxt:  { fontFamily: 'Helvetica-Oblique', fontSize: 9, color: C.grisT, lineHeight: 1.5 },
  hr:     { height: 0.8, backgroundColor: C.grisB, marginVertical: 8 },

  // Tables
  tbl:    { marginBottom: 10, marginTop: 4, borderWidth: 0.5, borderColor: C.grisB },
  tblHdr: { flexDirection: 'row', backgroundColor: C.rojo },
  tblRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: C.grisB },
  tblRowA:{ backgroundColor: C.celdaA },
  tblCell:{ flex: 1, padding: 5 },
  tblTH:  { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: C.white },
  tblTD:  { fontFamily: 'Helvetica', fontSize: 8.5, color: C.negro, lineHeight: 1.4 },

  // Code blocks
  code:   {
    backgroundColor: C.gris, padding: 8, marginBottom: 8, marginTop: 4,
    borderLeftWidth: 3, borderLeftColor: C.dorado, borderLeftStyle: 'solid',
  },
  codeLn: { fontFamily: 'Courier', fontSize: 6.5, color: '#2A2A2A', lineHeight: 1.35 },

  // Lists
  listWrap: { marginBottom: 7 },
  listItem: { flexDirection: 'row', marginBottom: 3, paddingLeft: 6 },
  listBul:  { width: 14, fontFamily: 'Helvetica', fontSize: 9, color: C.rojo, paddingTop: 0.5 },
  listTxt:  { flex: 1, fontSize: 9.5, lineHeight: 1.45 },
})

// ─── Inline text parser ───────────────────────────────────────────────────────
function inline(raw: string): React.ReactNode[] {
  const text = raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // strip markdown links
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/
  const parts = text.split(pattern).filter(p => p !== '')
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
      return <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>{p.slice(2, -2)}</Text>
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2)
      return <Text key={i} style={{ fontFamily: 'Courier', fontSize: 8, backgroundColor: '#E8E8E8' }}>{p.slice(1, -1)}</Text>
    return <Text key={i}>{p}</Text>
  })
}

// ─── Markdown block types ─────────────────────────────────────────────────────
type MdBlock =
  | { t: 'h1' | 'h2' | 'h3' | 'h4' | 'hr' | 'para' | 'bq'; text: string }
  | { t: 'tbl'; rows: string[][] }
  | { t: 'code'; lines: string[]; lang: string }
  | { t: 'list'; items: string[] }

// ─── Markdown parser ──────────────────────────────────────────────────────────
function parseMd(md: string): MdBlock[] {
  const lines = md.split('\n')
  const out: MdBlock[] = []
  let i = 0
  while (i < lines.length) {
    const l = lines[i]

    if (l.startsWith('#### ')) { out.push({ t: 'h4', text: l.slice(5).trim() }); i++; continue }
    if (l.startsWith('### '))  { out.push({ t: 'h3', text: l.slice(4).trim() }); i++; continue }
    if (l.startsWith('## '))   { out.push({ t: 'h2', text: l.slice(3).trim() }); i++; continue }
    if (l.startsWith('# '))    { out.push({ t: 'h1', text: l.slice(2).trim() }); i++; continue }

    if (/^---+$/.test(l.trim())) { out.push({ t: 'hr', text: '' }); i++; continue }

    // Code block
    if (l.startsWith('```')) {
      const lang = l.slice(3).trim(); i++
      const cl: string[] = []
      while (i < lines.length && !lines[i].startsWith('```')) { cl.push(lines[i]); i++ }
      i++; out.push({ t: 'code', lines: cl, lang }); continue
    }

    // Blockquote
    if (l.startsWith('> ')) {
      const bl: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) { bl.push(lines[i].slice(2)); i++ }
      out.push({ t: 'bq', text: bl.join('\n') }); continue
    }

    // Table
    if (l.startsWith('|')) {
      const tl: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) { tl.push(lines[i]); i++ }
      const rows: string[][] = tl
        .filter(r => !/^\|[-:\s|]+\|$/.test(r))
        .map(r => r.split('|').slice(1, -1).map(c => c.trim()))
        .filter(r => r.some(c => c.length > 0))
      if (rows.length) out.push({ t: 'tbl', rows }); continue
    }

    // List
    if (/^[-*] /.test(l)) {
      const items: string[] = []
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2).trim()); i++ }
      out.push({ t: 'list', items }); continue
    }

    // Empty line
    if (l.trim() === '') { i++; continue }

    // Paragraph — collect consecutive body lines
    const pl: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('|') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('> ') &&
      !/^[-*] /.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) { pl.push(lines[i]); i++ }
    if (pl.length) out.push({ t: 'para', text: pl.join(' ') })
  }
  return out
}

// ─── Block renderer ───────────────────────────────────────────────────────────
function RenderBlock({ b }: { b: MdBlock }) {
  switch (b.t) {
    case 'h1': return null

    case 'h2': return (
      <View style={S.h2wrap}>
        <Text style={S.h2}>{b.text}</Text>
        <View style={S.h2line} />
      </View>
    )

    case 'h3': return <Text style={S.h3}>{b.text}</Text>

    case 'h4': return (
      <View style={S.h4wrap}>
        <View style={S.h4bar} />
        <Text style={S.h4}>{b.text.replace(/`/g, '')}</Text>
      </View>
    )

    case 'hr': return <View style={S.hr} />

    case 'para': return (
      <Text style={S.para}>{inline(b.text)}</Text>
    )

    case 'bq': return (
      <View style={S.bq}>
        {b.text.split('\n').map((ln, j) => (
          <Text key={j} style={S.bqTxt}>{inline(ln)}</Text>
        ))}
      </View>
    )

    case 'tbl': {
      const [hdr, ...body] = b.rows
      if (!hdr) return null
      return (
        <View style={S.tbl}>
          {/* Header row */}
          <View style={S.tblHdr}>
            {hdr.map((c, j) => (
              <View key={j} style={S.tblCell}>
                <Text style={S.tblTH}>{inline(c)}</Text>
              </View>
            ))}
          </View>
          {/* Data rows */}
          {body.map((row, ri) => (
            <View key={ri} style={[S.tblRow, ri % 2 !== 0 ? S.tblRowA : {}]}>
              {row.map((c, ci) => (
                <View key={ci} style={S.tblCell}>
                  <Text style={S.tblTD}>{inline(c)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    }

    case 'code': return (
      <View style={S.code}>
        {b.lines.map((ln, j) => (
          <Text key={j} style={S.codeLn}>{ln === '' ? ' ' : ln}</Text>
        ))}
      </View>
    )

    case 'list': return (
      <View style={S.listWrap}>
        {b.items.map((item, j) => (
          <View key={j} style={S.listItem}>
            <Text style={S.listBul}>{'• '}</Text>
            <Text style={S.listTxt}>{inline(item)}</Text>
          </View>
        ))}
      </View>
    )

    default: return null
  }
}

// ─── PDF Document component ───────────────────────────────────────────────────
function TechDoc({ blocks }: { blocks: MdBlock[] }) {
  return (
    <Document
      title="Documentación Técnica — Hacienda El Encanto"
      author="Hacienda El Encanto"
      creator="Portal Hacienda El Encanto"
      subject="Documentación técnica del sistema de gestión de eventos"
    >
      {/* ── Portada ── */}
      <Page size="A4" style={S.coverPage}>
        <Image src={LOGO} style={S.coverLogo} />
        <View style={S.coverLineDor} />
        <Text style={S.coverTitle}>Documentación Técnica</Text>
        <Text style={S.coverSub}>Hacienda El Encanto — Portal de Eventos</Text>
        <Text style={S.coverDate}>29 de julio de 2026</Text>
        <Text style={S.coverDesc}>
          {'Documento de referencia técnica para el sistema de gestión de eventos,\n'}
          {'portal multi-rol y sitio web público.\n'}
          {'Cota, Cundinamarca — Colombia'}
        </Text>
        <View style={S.coverLineRojo} />
      </Page>

      {/* ── Páginas de contenido ── */}
      <Page size="A4" style={S.page}>
        {/* Header fijo */}
        <View style={S.hdr} fixed>
          <Image src={LOGO} style={S.hdrLogo} />
          <Text style={S.hdrTitle}>Documentación Técnica — Hacienda El Encanto</Text>
          <View style={S.hdrLine} />
        </View>

        {/* Footer fijo con número de página */}
        <View style={S.ftr} fixed>
          <View style={S.ftrLine} />
          <Text
            style={S.ftrText}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Página ${pageNumber} de ${totalPages}   ·   Hacienda El Encanto   ·   www.hacienda-encanto.com`
            }
          />
        </View>

        {/* Bloques de contenido */}
        {blocks.map((b, i) => (
          <RenderBlock key={i} b={b} />
        ))}
      </Page>
    </Document>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📄  Leyendo markdown...')
  const md = fs.readFileSync(MD, 'utf-8')

  console.log('🔍  Parseando bloques...')
  const blocks = parseMd(md)
  console.log(`    → ${blocks.length} bloques encontrados`)

  console.log('🎨  Renderizando PDF...')
  const buf = await renderToBuffer(<TechDoc blocks={blocks} />)

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, buf)

  const kb = Math.round(buf.length / 1024)
  console.log(`✅  PDF guardado: ${OUT}  (${kb} KB)`)
}

main().catch(e => {
  console.error('❌  Error generando PDF:', e)
  process.exit(1)
})
