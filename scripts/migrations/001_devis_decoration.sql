-- ============================================================================
-- Migration 001 : Devis Décoration d'événement
-- ============================================================================
-- IMPORTANT : Ce script est à exécuter MANUELLEMENT une seule fois sur la
-- base Postgres (Neon). Il ne sera PAS exécuté automatiquement au déploiement.
--
-- Pour l'exécuter :
--   1. Assurez-vous que DATABASE_URL est configuré dans votre .env.local
--   2. Lancez : npx tsx scripts/migrate.ts
--   3. Ou exécutez ce fichier SQL directement dans l'éditeur Neon
-- ============================================================================

-- Table principale des devis décoration
CREATE TABLE IF NOT EXISTS devis_decoration (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            TEXT UNIQUE NOT NULL,               -- ex: "E-36", auto-incrémenté
  token_public      UUID UNIQUE DEFAULT gen_random_uuid(), -- URL publique client
  client_nom        TEXT NOT NULL,
  client_email      TEXT NOT NULL,
  client_telephone  TEXT,
  titre_projet      TEXT NOT NULL,
  date_evenement_debut DATE NOT NULL,
  date_evenement_fin   DATE,
  statut            TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon, envoye, acompte_verse, solde, annule
  total_ht          NUMERIC(10,2) DEFAULT 0,
  pourcentage_main_oeuvre NUMERIC(5,2) DEFAULT 45,
  montant_main_oeuvre     NUMERIC(10,2) DEFAULT 0,
  montant_accompte  NUMERIC(10,2) DEFAULT 0,            -- 25% du total_ht
  date_echeance_accompte DATE,                           -- date de validation du devis
  montant_solde     NUMERIC(10,2) DEFAULT 0,            -- 75% du total_ht
  date_echeance_solde    DATE,                           -- veille de date_evenement_debut
  iban              TEXT DEFAULT 'LT59 3250 0043 8779 3619',
  bic               TEXT DEFAULT 'REVOLT21',
  date_creation     TIMESTAMP DEFAULT NOW(),
  date_envoi        TIMESTAMP,
  date_dernier_rappel TIMESTAMP,
  notes_internes    TEXT
);

-- Lignes du devis (détail des articles/services)
CREATE TABLE IF NOT EXISTS lignes_devis_decoration (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id        UUID NOT NULL REFERENCES devis_decoration(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantite        INTEGER NOT NULL DEFAULT 1,
  prix_unitaire   NUMERIC(10,2) NOT NULL DEFAULT 0,
  ordre           INTEGER DEFAULT 0
);

-- Index pour les recherches par devis_id
CREATE INDEX IF NOT EXISTS idx_lignes_devis_id ON lignes_devis_decoration(devis_id);

-- Versements enregistrés
CREATE TABLE IF NOT EXISTS versements_decoration (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id        UUID NOT NULL REFERENCES devis_decoration(id) ON DELETE CASCADE,
  montant         NUMERIC(10,2) NOT NULL,
  date_versement  DATE NOT NULL,
  methode         TEXT,            -- especes, paylib, virement
  type            TEXT,            -- acompte, versement_intermediaire, solde
  commentaire     TEXT,
  date_enregistrement TIMESTAMP DEFAULT NOW()
);

-- Index pour les recherches par devis_id
CREATE INDEX IF NOT EXISTS idx_versements_devis_id ON versements_decoration(devis_id);

-- Log des rappels envoyés
CREATE TABLE IF NOT EXISTS rappels_devis_decoration (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id        UUID NOT NULL REFERENCES devis_decoration(id) ON DELETE CASCADE,
  date_envoi      TIMESTAMP DEFAULT NOW(),
  type            TEXT             -- rappel_15_jours
);

-- Index pour les recherches par devis_id
CREATE INDEX IF NOT EXISTS idx_rappels_devis_id ON rappels_devis_decoration(devis_id);
