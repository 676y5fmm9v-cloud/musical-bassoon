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
