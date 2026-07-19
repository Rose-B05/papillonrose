import React from "react"
import { Document, Page, Text, View, StyleSheet, Img } from "@react-pdf/renderer"
import type { Devis } from "./types"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#2E2E2E" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  logo: { width: 80, height: 80 },
  title: { fontSize: 22, fontWeight: "bold", color: "#C9948E", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#888", marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#C9948E", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#C9948E33", paddingBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  infoBlock: { width: "48%" },
  label: { fontSize: 9, color: "#888", marginBottom: 2 },
  value: { fontSize: 10, fontWeight: "bold" },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F8F6F3", padding: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  tableHeaderCell: { fontSize: 9, fontWeight: "bold", color: "#555" },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  rowNom: { width: "35%" },
  rowDim: { width: "15%" },
  rowQty: { width: "10%", textAlign: "center" },
  rowPrix: { width: "20%", textAlign: "right" },
  rowSousTotal: { width: "20%", textAlign: "right" },
  totals: { marginTop: 12, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", width: 200, justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { fontSize: 10, color: "#555" },
  totalValue: { fontSize: 10, textAlign: "right" },
  grandTotal: { flexDirection: "row", width: 200, justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1.5, borderTopColor: "#C9948E", marginTop: 4 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", color: "#C9948E" },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: "#C9948E", textAlign: "right" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#aaa" },
  notes: { marginTop: 16, padding: 12, backgroundColor: "#F8F6F3", borderRadius: 6 },
  notesTitle: { fontSize: 10, fontWeight: "bold", color: "#555", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#666" },
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function formatCurrency(amount: number) {
  return amount.toFixed(2) + " €"
}

export function devisPdfTemplate(devis: Devis) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"
  const LOGO_URL = SITE_URL + "/papillon-rose-logo.png"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Devis</Text>
            <Text style={styles.subtitle}>N° {devis.quoteNumber}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Date : {formatDate(devis.creeLe)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Img src={LOGO_URL} style={styles.logo} />
            <Text style={[styles.label, { marginTop: 4, textAlign: "right" }]}>Papillon Rose</Text>
            <Text style={[styles.label, { textAlign: "right" }]}>Île-de-France</Text>
          </View>
        </View>

        {/* Client info */}
        <Text style={styles.sectionTitle}>Informations client</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{devis.client.prenom} {devis.client.nom}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Email</Text>
            <Text style={styles.value}>{devis.client.email}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Téléphone</Text>
            <Text style={styles.value}>{devis.client.telephone}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Date de début</Text>
            <Text style={styles.value}>{formatDate(devis.dateDebut)}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Date de fin</Text>
            <Text style={styles.value}>{formatDate(devis.dateFin)}</Text>
          </View>
        </View>

        {/* Articles */}
        <Text style={styles.sectionTitle}>Articles</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.rowNom]}>Article</Text>
            <Text style={[styles.tableHeaderCell, styles.rowDim]}>Dimension</Text>
            <Text style={[styles.tableHeaderCell, styles.rowQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.rowPrix]}>Prix unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.rowSousTotal]}>Sous-total</Text>
          </View>
          {devis.lignes.map((ligne, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.rowNom}>{ligne.nom}</Text>
              <Text style={styles.rowDim}>{ligne.dimension || "—"}</Text>
              <Text style={styles.rowQty}>{ligne.quantite}</Text>
              <Text style={styles.rowPrix}>{formatCurrency(ligne.prixUnitaire)}</Text>
              <Text style={styles.rowSousTotal}>{formatCurrency(ligne.sousTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{formatCurrency(devis.totalHt)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA (20%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(devis.totalTtc - devis.totalHt)}</Text>
          </View>
          {devis.remise > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise ({devis.remise}%)</Text>
              <Text style={[styles.totalValue, { color: "#16a34a" }]}>−{formatCurrency(devis.totalHt * devis.remise / 100)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Frais de livraison</Text>
            <Text style={styles.totalValue}>{devis.fraisLivraison > 0 ? formatCurrency(devis.fraisLivraison) : "Gratuit"}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total TTC</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(devis.totalTtc)}</Text>
          </View>
        </View>

        {/* Notes */}
        {devis.notesInternes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{devis.notesInternes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Devis valable 30 jours — Papillon Rose — papillonrose.fr — papillonrosebertha@gmail.com
        </Text>
      </Page>
    </Document>
  )
}
