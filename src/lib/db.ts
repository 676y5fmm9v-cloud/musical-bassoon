import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seedIfEmpty } from "@/lib/seed";

const DB_PATH = path.join(process.cwd(), "data", "kalan.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

declare global {
  var __kalanDb: DatabaseSync | undefined;
}

function connect(): DatabaseSync {
  // `timeout` configures SQLite's busy handler at open time, before any
  // statement runs, so concurrent processes (e.g. Next.js build workers)
  // wait for each other instead of failing immediately with SQLITE_BUSY.
  const database = new DatabaseSync(DB_PATH, { timeout: 5000 });
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");
  migrate(database);
  seedIfEmpty(database);
  return database;
}

function migrate(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS enseignants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT UNIQUE,
      telephone TEXT,
      specialite TEXT,
      date_embauche TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      niveau TEXT NOT NULL,
      annee_scolaire TEXT NOT NULL,
      enseignant_principal_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
      capacite INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS eleves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT NOT NULL UNIQUE,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      date_naissance TEXT,
      genre TEXT NOT NULL DEFAULT 'M' CHECK (genre IN ('M','F')),
      classe_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      nom_parent TEXT,
      telephone_parent TEXT,
      email_parent TEXT,
      adresse TEXT,
      date_inscription TEXT NOT NULL DEFAULT (date('now')),
      statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif','inactif')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS matieres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE,
      coefficient REAL NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eleve_id INTEGER NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
      matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
      enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
      trimestre INTEGER NOT NULL CHECK (trimestre IN (1,2,3)),
      type TEXT NOT NULL DEFAULT 'devoir' CHECK (type IN ('devoir','composition')),
      valeur REAL NOT NULL CHECK (valeur >= 0 AND valeur <= 20),
      date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(eleve_id, matiere_id, trimestre, type)
    );

    CREATE INDEX IF NOT EXISTS idx_eleves_classe ON eleves(classe_id);
    CREATE INDEX IF NOT EXISTS idx_notes_eleve ON notes(eleve_id);
    CREATE INDEX IF NOT EXISTS idx_notes_matiere ON notes(matiere_id);
    CREATE INDEX IF NOT EXISTS idx_classes_enseignant ON classes(enseignant_principal_id);

    -- ── Comptes & rôles ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS comptes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifiant TEXT NOT NULL UNIQUE,
      mot_de_passe_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('eleve','prof','parent','ecole')),
      sous_role TEXT CHECK (sous_role IN ('directeur','secretaire','comptable','superecole')),
      nom TEXT NOT NULL,
      telephone TEXT,
      eleve_id INTEGER REFERENCES eleves(id) ON DELETE CASCADE,
      enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE CASCADE,
      actif INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_comptes_eleve ON comptes(eleve_id);
    CREATE INDEX IF NOT EXISTS idx_comptes_enseignant ON comptes(enseignant_id);

    CREATE TABLE IF NOT EXISTS parent_eleve (
      compte_id INTEGER NOT NULL REFERENCES comptes(id) ON DELETE CASCADE,
      eleve_id INTEGER NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
      PRIMARY KEY (compte_id, eleve_id)
    );
    CREATE INDEX IF NOT EXISTS idx_parent_eleve_eleve ON parent_eleve(eleve_id);

    -- Quelle matière un enseignant donne dans quelle classe
    CREATE TABLE IF NOT EXISTS affectations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enseignant_id INTEGER NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
      UNIQUE(enseignant_id, classe_id, matiere_id)
    );
    CREATE INDEX IF NOT EXISTS idx_affectations_enseignant ON affectations(enseignant_id);
    CREATE INDEX IF NOT EXISTS idx_affectations_classe ON affectations(classe_id);

    -- ── Pédagogie ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS cours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
      enseignant_id INTEGER NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
      fichier_nom TEXT,
      date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cours_classe ON cours(classe_id);

    CREATE TABLE IF NOT EXISTS devoirs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      consignes TEXT,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
      enseignant_id INTEGER NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
      date_limite TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_devoirs_classe ON devoirs(classe_id);

    CREATE TABLE IF NOT EXISTS devoir_rendus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      devoir_id INTEGER NOT NULL REFERENCES devoirs(id) ON DELETE CASCADE,
      eleve_id INTEGER NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
      rendu_le TEXT,
      commentaire TEXT,
      fichier_nom TEXT,
      note REAL CHECK (note IS NULL OR (note >= 0 AND note <= 20)),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(devoir_id, eleve_id)
    );
    CREATE INDEX IF NOT EXISTS idx_devoir_rendus_devoir ON devoir_rendus(devoir_id);
    CREATE INDEX IF NOT EXISTS idx_devoir_rendus_eleve ON devoir_rendus(eleve_id);

    CREATE TABLE IF NOT EXISTS cahier_texte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
      enseignant_id INTEGER NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
      date TEXT NOT NULL DEFAULT (date('now')),
      contenu_seance TEXT NOT NULL,
      travail_donne TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cahier_classe ON cahier_texte(classe_id);

    -- ── Vie scolaire ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS absences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eleve_id INTEGER NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      matiere_id INTEGER REFERENCES matieres(id) ON DELETE SET NULL,
      enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      statut TEXT NOT NULL DEFAULT 'absent' CHECK (statut IN ('absent','retard')),
      justifiee INTEGER NOT NULL DEFAULT 0,
      motif TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_absences_eleve ON absences(eleve_id);
    CREATE INDEX IF NOT EXISTS idx_absences_classe ON absences(classe_id);

    CREATE TABLE IF NOT EXISTS edt_creneaux (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
      enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
      jour_semaine INTEGER NOT NULL CHECK (jour_semaine BETWEEN 1 AND 6),
      heure_debut TEXT NOT NULL,
      heure_fin TEXT NOT NULL,
      salle TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_edt_classe ON edt_creneaux(classe_id);

    -- ── Communication ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS annonces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      message TEXT NOT NULL,
      cible TEXT NOT NULL DEFAULT 'ecole' CHECK (cible IN ('ecole','parents','profs','classe')),
      classe_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
      auteur_compte_id INTEGER REFERENCES comptes(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expediteur_id INTEGER NOT NULL REFERENCES comptes(id) ON DELETE CASCADE,
      destinataire_id INTEGER NOT NULL REFERENCES comptes(id) ON DELETE CASCADE,
      contenu TEXT NOT NULL,
      lu INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_expediteur ON messages(expediteur_id);
    CREATE INDEX IF NOT EXISTS idx_messages_destinataire ON messages(destinataire_id);
  `);
}

export const db = globalThis.__kalanDb ?? connect();

if (process.env.NODE_ENV !== "production") {
  globalThis.__kalanDb = db;
}

export type SqlParam = string | number | bigint | null;

// node:sqlite returns rows as null-prototype objects, which React rejects
// when passed from a Server Component to a Client Component. Spreading each
// row rebuilds it as a plain object.
export function queryAll<T>(sql: string, params: SqlParam[] = []): T[] {
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  return rows.map((row) => ({ ...row })) as T[];
}

export function queryOne<T>(sql: string, params: SqlParam[] = []): T | undefined {
  const row = db.prepare(sql).get(...params) as
    | Record<string, unknown>
    | undefined;
  return row ? ({ ...row } as T) : undefined;
}
