-- ============================================================================
-- Migration 002 : Ajout type_document pour suivi devis → facture
-- ============================================================================

-- Colonne type_document : "devis" par défaut, passe à "facture" quand acompte reçu
ALTER TABLE devis_decoration
  ADD COLUMN IF NOT EXISTS type_document TEXT NOT NULL DEFAULT 'devis';
