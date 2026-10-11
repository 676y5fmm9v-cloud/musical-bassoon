import "server-only";
import { db, queryOne, queryAll } from "@/lib/db";
import type { Compte, Role, SousRoleEcole } from "@/lib/types";

export function getCompteByIdentifiant(identifiant: string): Compte | undefined {
  return queryOne<Compte>(
    `SELECT * FROM comptes WHERE identifiant = ? AND actif = 1`,
    [identifiant.trim().toUpperCase()]
  );
}

export function getCompteById(id: number): Compte | undefined {
  return queryOne<Compte>(`SELECT * FROM comptes WHERE id = ?`, [id]);
}

export function getComptesParEleve(eleveId: number): Compte[] {
  return queryAll<Compte>(`SELECT * FROM comptes WHERE eleve_id = ?`, [eleveId]);
}

export function getCompteParEnseignant(enseignantId: number): Compte | undefined {
  return queryOne<Compte>(`SELECT * FROM comptes WHERE enseignant_id = ?`, [
    enseignantId,
  ]);
}

export interface CompteInput {
  identifiant: string;
  mot_de_passe_hash: string;
  role: Role;
  sous_role?: SousRoleEcole | null;
  nom: string;
  telephone?: string | null;
  eleve_id?: number | null;
  enseignant_id?: number | null;
}

export function createCompte(input: CompteInput): number {
  const result = db
    .prepare(
      `INSERT INTO comptes
        (identifiant, mot_de_passe_hash, role, sous_role, nom, telephone, eleve_id, enseignant_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.identifiant.toUpperCase(),
      input.mot_de_passe_hash,
      input.role,
      input.sous_role ?? null,
      input.nom,
      input.telephone ?? null,
      input.eleve_id ?? null,
      input.enseignant_id ?? null
    );
  return Number(result.lastInsertRowid);
}

export function listEnfantsDuParent(compteParentId: number): number[] {
  const rows = queryAll<{ eleve_id: number }>(
    `SELECT eleve_id FROM parent_eleve WHERE compte_id = ?`,
    [compteParentId]
  );
  return rows.map((r) => r.eleve_id);
}

export function lierParentEleve(compteId: number, eleveId: number): void {
  db.prepare(
    `INSERT OR IGNORE INTO parent_eleve (compte_id, eleve_id) VALUES (?, ?)`
  ).run(compteId, eleveId);
}
