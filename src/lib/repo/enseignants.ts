import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { Enseignant } from "@/lib/types";

export interface EnseignantInput {
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  specialite?: string | null;
  date_embauche?: string | null;
}

export function listEnseignants(): Enseignant[] {
  return queryAll<Enseignant>(`SELECT * FROM enseignants ORDER BY nom, prenom`);
}

export function getEnseignant(id: number): Enseignant | undefined {
  return queryOne<Enseignant>(`SELECT * FROM enseignants WHERE id = ?`, [id]);
}

export function createEnseignant(input: EnseignantInput): number {
  const result = db
    .prepare(
      `INSERT INTO enseignants (nom, prenom, email, telephone, specialite, date_embauche)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.nom,
      input.prenom,
      input.email || null,
      input.telephone || null,
      input.specialite || null,
      input.date_embauche || null
    );
  return Number(result.lastInsertRowid);
}

export function updateEnseignant(id: number, input: EnseignantInput): void {
  db.prepare(
    `UPDATE enseignants
     SET nom = ?, prenom = ?, email = ?, telephone = ?, specialite = ?, date_embauche = ?
     WHERE id = ?`
  ).run(
    input.nom,
    input.prenom,
    input.email || null,
    input.telephone || null,
    input.specialite || null,
    input.date_embauche || null,
    id
  );
}

export function deleteEnseignant(id: number): void {
  db.prepare(`DELETE FROM enseignants WHERE id = ?`).run(id);
}

export function countClassesForEnseignant(id: number): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM classes WHERE enseignant_principal_id = ?`
    )
    .get(id) as { n: number };
  return row.n;
}
