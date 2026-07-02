import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { Classe, ClasseAvecDetails } from "@/lib/types";

export interface ClasseInput {
  nom: string;
  niveau: string;
  annee_scolaire: string;
  enseignant_principal_id?: number | null;
  capacite?: number | null;
}

const SELECT_AVEC_DETAILS = `
  SELECT
    c.*,
    (e.prenom || ' ' || e.nom) AS enseignant_nom,
    (SELECT COUNT(*) FROM eleves el WHERE el.classe_id = c.id) AS effectif
  FROM classes c
  LEFT JOIN enseignants e ON e.id = c.enseignant_principal_id
`;

export function listClasses(): ClasseAvecDetails[] {
  return queryAll<ClasseAvecDetails>(
    `${SELECT_AVEC_DETAILS} ORDER BY c.annee_scolaire DESC, c.nom`
  );
}

export function getClasse(id: number): ClasseAvecDetails | undefined {
  return queryOne<ClasseAvecDetails>(`${SELECT_AVEC_DETAILS} WHERE c.id = ?`, [
    id,
  ]);
}

export function createClasse(input: ClasseInput): number {
  const result = db
    .prepare(
      `INSERT INTO classes (nom, niveau, annee_scolaire, enseignant_principal_id, capacite)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.nom,
      input.niveau,
      input.annee_scolaire,
      input.enseignant_principal_id || null,
      input.capacite || null
    );
  return Number(result.lastInsertRowid);
}

export function updateClasse(id: number, input: ClasseInput): void {
  db.prepare(
    `UPDATE classes
     SET nom = ?, niveau = ?, annee_scolaire = ?, enseignant_principal_id = ?, capacite = ?
     WHERE id = ?`
  ).run(
    input.nom,
    input.niveau,
    input.annee_scolaire,
    input.enseignant_principal_id || null,
    input.capacite || null,
    id
  );
}

export function deleteClasse(id: number): void {
  db.prepare(`DELETE FROM classes WHERE id = ?`).run(id);
}

export function listAllClasses(): Classe[] {
  return queryAll<Classe>(
    `SELECT * FROM classes ORDER BY annee_scolaire DESC, nom`
  );
}
