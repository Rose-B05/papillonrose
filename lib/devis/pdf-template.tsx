import React from "react"
import path from "path"
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer"
import type { Booking } from "@/lib/types"
import { COMPANY } from "@/lib/company-info"
import { produits } from "@/data/produits"
import { getProductImage, parsePrix } from "@/lib/product-helpers"

const fontPath = path.join(process.cwd(), "public", "fonts", "PlayfairDisplay-Variable.ttf")

Font.register({
  family: "PlayfairDisplay",
  fonts: [
    { src: fontPath, fontWeight: 400 },
    { src: fontPath, fontWeight: 700 },
  ],
})

const COLORS = {
  cream: "#FAF3EC",
  rose: "#C97B84",
  roseDark: "#9E5560",
  gold: "#B98A4E",
  sage: "#7C9473",
  ink: "#2E2A2A",
  grey: "#6B6560",
  lineGrey: "#E4DCD2",
  white: "#FFFFFF",
  rowAlt: "#FCF8F4",
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 30,
    paddingHorizontal: 46,
    backgroundColor: COLORS.white,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: COLORS.ink,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  logo: { width: 130, height: 53, objectFit: "contain", marginBottom: 8 },
  companyInfo: { fontSize: 8.3, color: COLORS.grey, lineHeight: 1.5 },
  docTypeLabel: { fontSize: 9, color: COLORS.grey, textAlign: "right", letterSpacing: 1 },
  docNumber: { fontSize: 15, fontFamily: "Helvetica-Bold", color: COLORS.roseDark, textAlign: "right", marginTop: 2 },
  docRef: { fontSize: 8.3, color: COLORS.gold, textAlign: "right", marginTop: 2 },
  hr: { borderBottomWidth: 1.2, borderBottomColor: COLORS.rose, marginBottom: 14 },
  eventTitle: { fontFamily: "PlayfairDisplay", fontWeight: 700, fontSize: 19, color: COLORS.ink, marginBottom: 4 },
  eventMeta: { fontSize: 9.5, color: COLORS.grey, lineHeight: 1.5, marginBottom: 14 },

  table: { borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  tHeadRow: { flexDirection: "row", backgroundColor: COLORS.roseDark, paddingVertical: 7, paddingHorizontal: 8 },
  tHeadImg: { width: 34 },
  tHeadDesc: { flex: 1 },
  tHeadQty: { width: 40, textAlign: "right" },
  tHeadPrice: { width: 70, textAlign: "right" },
  tHeadTotal: { width: 70, textAlign: "right" },
  tHeadText: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 9 },

  tRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lineGrey,
  },
  tImgCell: { width: 34, alignItems: "center" },
  tImg: { width: 24, height: 24, borderRadius: 4 },
  tDescCell: { flex: 1, paddingRight: 4 },
  tDescText: { fontSize: 9.3, color: COLORS.ink },
  tNoteText: { fontSize: 8, color: COLORS.gold },
  tQtyCell: { width: 40, textAlign: "right", fontSize: 9.3 },
  tPriceCell: { width: 70, textAlign: "right", fontSize: 9.3 },
  tTotalCell: { width: 70, textAlign: "right", fontSize: 9.3 },

  totalBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.roseDark,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 3,
  },
  totalLabel: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  totalValue: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 13 },

  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lineGrey,
  },
  payLabel: { fontSize: 9.3 },
  payValue: { fontSize: 9.3, fontFamily: "Helvetica-Bold" },
  soldeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.sage,
    marginTop: 2,
  },
  soldeLabel: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: COLORS.sage },
  soldeValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: COLORS.sage },

  conditions: { fontSize: 7.6, color: COLORS.grey, marginTop: 10, marginBottom: 14, lineHeight: 1.4 },

  signRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  thanks: { fontFamily: "PlayfairDisplay", fontWeight: 700, fontSize: 12, color: COLORS.roseDark, marginBottom: 3 },
  thanksSub: { fontSize: 9.5, color: COLORS.grey, lineHeight: 1.5 },
  signLabel: { fontSize: 9, color: COLORS.grey, fontStyle: "italic" },

  footerHr: { borderBottomWidth: 0.6, borderBottomColor: COLORS.lineGrey, marginBottom: 6 },
  footerLegal: { fontSize: 7.4, color: COLORS.grey, lineHeight: 1.4 },
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatEUR(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`
}

function calcDays(start: string, end: string) {
  if (!start || !end) return 1
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)))
}

function resolveProduct(productId: number) {
  return produits.find((p) => p.id === productId)
}

export function devisPdfTemplate(booking: Booking) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"
  const docType = booking.status === "solde_paye" ? "FACTURE" : "DEVIS"
  const docNumber = booking.quoteNumber || `BK-${booking.id}`
  const clientName = `${booking.client.prenom} ${booking.client.nom}`
  const eventTitle = `${booking.client.typeEvenement} ${clientName}`
  const depositAmount = booking.depositAmount
  const remainingAmount = Math.max(0, booking.totalTtc - depositAmount)
  const isPaid = booking.status === "confirmed" && !!booking.depositPaidAt
  const isReturned = booking.status === "returned"
  const totalLabel = isPaid || isReturned
    ? `TOTAL — réglé le ${booking.depositPaidAt ? formatDate(booking.depositPaidAt) : ""}`
    : "TOTAL à régler"
  const soldeLabel = isPaid || isReturned
    ? "Solde réglé"
    : "Solde restant dû"

  const items = booking.items.map((item) => {
    const product = resolveProduct(item.productId)
    const rawImg = product ? getProductImage(product) : "/placeholder.svg"
    const imgUrl = rawImg.startsWith("http") ? rawImg : `${SITE_URL}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
    const price = product ? parsePrix(product.prix) : 0
    const days = calcDays(item.dateStart, item.dateEnd)
    const lineTotal = price * item.qty * days
    const note = item.variantLabel ? `(${item.variantLabel})` : undefined

    return {
      description: product?.nom || `Produit #${item.productId}`,
      note,
      qty: item.qty,
      unitPrice: price,
      total: lineTotal,
      imageUrl: imgUrl,
    }
  })

  const logoUrl = COMPANY.logoUrl.startsWith("/")
    ? `${SITE_URL}${COMPANY.logoUrl}`
    : COMPANY.logoUrl

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Image src={logoUrl} style={styles.logo} />
            <Text style={styles.companyInfo}>
              {COMPANY.name}
              {"\n"}
              {COMPANY.addressLines.join("\n")}
              {"\n"}
              SIRET : {COMPANY.siret}
              {"\n"}
              TVA non applicable, art. 293 B du CGI
              {"\n"}
              {COMPANY.phone} · {COMPANY.email}
            </Text>
          </View>
          <View>
            <Text style={styles.docTypeLabel}>{docType}</Text>
            <Text style={styles.docNumber}>N° {docNumber}</Text>
            <Text style={styles.docRef}>Réf. réservation : {booking.id}</Text>
          </View>
        </View>
        <View style={styles.hr} />

        <Text style={styles.eventTitle}>{eventTitle}</Text>
        <Text style={styles.eventMeta}>
          {formatDate(booking.client.dateEvenement)} · {booking.client.lieuEvenement}
          {"\n"}
          {booking.client.typeEvenement}
          {booking.client.nbInvites ? ` — ${booking.client.nbInvites} invités` : ""}
        </Text>

        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={styles.tHeadImg} />
            <Text style={[styles.tHeadDesc, styles.tHeadText]}>Description</Text>
            <Text style={[styles.tHeadQty, styles.tHeadText]}>Qté</Text>
            <Text style={[styles.tHeadPrice, styles.tHeadText]}>Prix unitaire</Text>
            <Text style={[styles.tHeadTotal, styles.tHeadText]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View
              key={i}
              style={[
                styles.tRow,
                { backgroundColor: i % 2 === 1 ? COLORS.rowAlt : COLORS.white },
              ]}
            >
              <View style={styles.tImgCell}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} style={styles.tImg} />
                ) : null}
              </View>
              <View style={styles.tDescCell}>
                <Text style={styles.tDescText}>
                  {item.description}
                  {item.note ? <Text style={styles.tNoteText}> {item.note}</Text> : null}
                </Text>
              </View>
              <Text style={styles.tQtyCell}>{item.qty || "—"}</Text>
              <Text style={styles.tPriceCell}>{formatEUR(item.unitPrice)}</Text>
              <Text style={styles.tTotalCell}>{formatEUR(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBand}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <Text style={styles.totalValue}>{formatEUR(booking.totalTtc)}</Text>
        </View>

        <View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>
              {booking.depositPaidAt
                ? `Acompte versé le ${formatDate(booking.depositPaidAt)}`
                : "Acompte à verser (30%)"}
            </Text>
            <Text style={styles.payValue}>{formatEUR(depositAmount)}</Text>
          </View>
          <View style={styles.soldeRow}>
            <Text style={styles.soldeLabel}>{soldeLabel}</Text>
            <Text style={styles.soldeValue}>{formatEUR(remainingAmount)}</Text>
          </View>
        </View>

        <Text style={styles.conditions}>
          Les tarifs pourront être modifiés par l'ajout ou le retrait d'éléments décoratifs et/ou de main d'œuvre jusqu'à 10 jours avant l'événement.
        </Text>

        <View style={styles.signRow}>
          <View>
            <Text style={styles.thanks}>Merci de votre confiance.</Text>
            <Text style={styles.thanksSub}>Cordialement,{"\n"}Rose — {COMPANY.name}</Text>
          </View>
          <View>
            <Text style={styles.signLabel}>Bon pour accord — date et signature du client :</Text>
          </View>
        </View>

        <View style={styles.footerHr} />
        <Text style={styles.footerLegal}>
          {COMPANY.name} — Micro-entreprise (auto-entrepreneur) · SIRET : {COMPANY.siret} ·
          TVA non applicable, art. 293 B du CGI · {COMPANY.addressLines.join(", ")}
          {"\n"}
          {docType} n° {docNumber} — numérotation séquentielle et unique, conforme à l'article L441-9 du Code de commerce.
        </Text>
      </Page>
    </Document>
  )
}
