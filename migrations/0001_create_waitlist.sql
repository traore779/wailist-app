-- Migration: 0001_create_waitlist
-- Créer la table principale de la liste d'attente

CREATE TABLE IF NOT EXISTS waitlist (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  email     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  name      TEXT,
  source    TEXT    DEFAULT 'organic',
  ip        TEXT,
  created_at TEXT   NOT NULL DEFAULT (datetime('now'))
);

-- Index pour les stats temporelles
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at);
