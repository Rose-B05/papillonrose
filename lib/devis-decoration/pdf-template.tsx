import React from "react"
import path from "path"
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer"
import { COMPANY } from "@/lib/company-info"

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
  grey: "#544f4f",
  lineGrey: "#E4DCD2",
  white: "#FFFFFF",
  rowAlt: "#FCF8F4",
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 55,
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
  hr: { borderBottomWidth: 1.2, borderBottomColor: COLORS.rose, marginBottom: 14 },

  projectTitle: { fontFamily: "PlayfairDisplay", fontWeight: 700, fontSize: 19, color: COLORS.ink, marginBottom: 4 },
  eventMeta: { fontSize: 9.5, color: COLORS.grey, lineHeight: 1.5, marginBottom: 2 },
  projectLabel: { fontSize: 9.5, color: COLORS.gold, fontFamily: "PlayfairDisplay", marginBottom: 14 },

  table: { borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  tHeadRow: { flexDirection: "row", backgroundColor: "#6B7B8D", paddingVertical: 7, paddingHorizontal: 8 },
  tHeadDesc: { flex: 1 },
  tHeadQty: { width: 50, textAlign: "right" },
  tHeadPrice: { width: 80, textAlign: "right" },
  tHeadText: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 9 },

  tRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lineGrey,
  },
  tDescCell: { flex: 1, paddingRight: 4 },
  tDescText: { fontSize: 9.3, color: COLORS.ink },
  tQtyCell: { width: 50, textAlign: "right", fontSize: 9.3 },
  tPriceCell: { width: 80, textAlign: "right", fontSize: 9.3 },

  totalBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6B7B8D",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderRadius: 3,
  },
  totalLabel: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  totalValue: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 13 },

  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: COLORS.ink, marginBottom: 6, marginTop: 4 },
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
  signatureBox: { width: 200, borderWidth: 1, borderColor: COLORS.lineGrey, borderRadius: 4, padding: 10 },
  signatureBoxLabel: { fontSize: 9, color: COLORS.grey, fontStyle: "italic", marginBottom: 10 },
  sigDateLine: { fontSize: 9, color: COLORS.ink, borderBottomWidth: 0.5, borderBottomColor: COLORS.lineGrey, paddingBottom: 4, marginBottom: 10 },
  sigSignLine: { fontSize: 9, color: COLORS.ink, borderBottomWidth: 0.5, borderBottomColor: COLORS.lineGrey, paddingBottom: 18 },

  footer: { position: "absolute", bottom: 30, left: 46, right: 46 },
  footerHr: { borderBottomWidth: 0.6, borderBottomColor: COLORS.lineGrey, marginBottom: 6 },
  footerLegal: { fontSize: 7.4, color: COLORS.grey, lineHeight: 1.4 },
})

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatEUR(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`
}

interface DecorationLigne {
  description: string
  quantite: number
  prix_unitaire: number
}

interface DecorationDevis {
  id: string
  numero: string
  client_nom: string
  client_email: string
  client_telephone?: string
  titre_projet: string
  date_evenement_debut: string
  date_evenement_fin?: string
  total_ht: number
  pourcentage_main_oeuvre: number
  montant_accompte: number
  date_echeance_accompte?: string
  montant_solde: number
  date_echeance_solde?: string
  iban: string
  bic: string
  date_creation: string
  lignes: DecorationLigne[]
}

export function decorationPdfTemplate(devis: DecorationDevis) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"
  const logoUrl = COMPANY.logoUrl.startsWith("/")
    ? `${SITE_URL}${COMPANY.logoUrl}`
    : COMPANY.logoUrl

  const eventDateStr = devis.date_evenement_fin
    ? `du ${formatDateShort(devis.date_evenement_debut)} au ${formatDateShort(devis.date_evenement_fin)}`
    : formatDateShort(devis.date_evenement_debut)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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
            <Text style={styles.docTypeLabel}>DEVIS</Text>
            <Text style={styles.docNumber}>N° {devis.numero}</Text>
          </View>
        </View>
        <View style={styles.hr} />

        {/* Project info */}
        <Text style={styles.projectTitle}>{devis.client_nom}</Text>
        <Text style={styles.eventMeta}>
          Évènement prévu le : {eventDateStr}
        </Text>
        <Text style={styles.projectLabel}>Titre du projet : {devis.titre_projet}</Text>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.tHeadDesc, styles.tHeadText]}>Description</Text>
            <Text style={[styles.tHeadQty, styles.tHeadText]}>Quantité</Text>
            <Text style={[styles.tHeadPrice, styles.tHeadText]}>Prix</Text>
          </View>
          {devis.lignes.map((ligne, i) => (
            <View
              key={i}
              style={[
                styles.tRow,
                { backgroundColor: i % 2 === 1 ? COLORS.rowAlt : COLORS.white },
              ]}
            >
              <View style={styles.tDescCell}>
                <Text style={styles.tDescText}>{ligne.description}</Text>
              </View>
              <Text style={styles.tQtyCell}>{ligne.quantite}</Text>
              <Text style={styles.tPriceCell}>{formatEUR(ligne.prix_unitaire * ligne.quantite)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalBand}>
          <Text style={styles.totalLabel}>TOTAL à payer déco</Text>
          <Text style={styles.totalValue}>{formatEUR(devis.total_ht)}</Text>
        </View>

        {/* Payment schedule */}
        <Text style={styles.sectionTitle}>Échéancier de paiement</Text>
        <View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>
              Acompte à la validation (25%)
              {devis.date_echeance_accompte ? ` — ${formatDateShort(devis.date_echeance_accompte)}` : ""}
            </Text>
            <Text style={styles.payValue}>{formatEUR(devis.montant_accompte)}</Text>
          </View>
          <View style={styles.soldeRow}>
            <Text style={styles.soldeLabel}>
              Solde à régler (75%)
              {devis.date_echeance_solde ? ` — ${formatDateShort(devis.date_echeance_solde)}` : ""}
            </Text>
            <Text style={styles.soldeValue}>{formatEUR(devis.montant_solde)}</Text>
          </View>
        </View>

        {/* Legal conditions */}
        <Text style={styles.conditions}>
          Le présent devis est validé à la signature "Bon pour accord".
          {"\n"}
          Conditions de règlement : espèces, Paylib ou virement bancaire.
          {"\n"}
          Coordonnées bancaires : IBAN {devis.iban} — BIC {devis.bic}
          {"\n"}
          En cas de report de l&apos;événement, celui-ci doit être communiqué au minimum 6 mois à l&apos;avance. Au-delà, le report ne pourra être garanti.
          {"\n"}
          En cas d&apos;annulation less than 1 semaine avant l&apos;événement, l&apos;acompte versé ne sera que partiellement restitué.
          {"\n"}
          Un chèque de caution sera demandé pour tout matériel dépassant la valeur de l&apos;acompte.
        </Text>

        {/* Signature */}
        <View style={styles.signRow}>
          <View>
            <Text style={styles.thanks}>Bien cordialement,</Text>
            <Text style={styles.thanksSub}>Rose — {COMPANY.name}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureBoxLabel}>Bon pour accord, date et signature du client</Text>
            <Text style={styles.sigDateLine}>Date :</Text>
            <Text style={styles.sigSignLine}>Signature :</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerHr} />
          <Text style={styles.footerLegal}>
            {COMPANY.name} — Micro-entreprise (auto-entrepreneur) · SIRET : {COMPANY.siret} ·
            TVA non applicable, art. 293 B du CGI · {COMPANY.addressLines.join(", ")}
            {"\n"}
            Devis n° {devis.numero} — numérotation séquentielle et unique, conforme à l&apos;article L441-9 du Code de commerce.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
