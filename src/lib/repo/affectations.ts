import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { AffectationAvecDetails, Classe } from "@/lib/types";

const SELECT = `
  SELECT af.*, c.nom AS classe_nom, m.nom AS matiere_nom
  FROM affectations af
  JOIN classes c ON c.id = af.classe_id
  JOIN matieres m ON m.id = af.matiere_id
`;

export function listAffectationsParEnseignant(enseignantId: number): AffectationAvecDetails[] {
  return queryAll<AffectationAvecDetails>(
    `${SELECT} WHERE af.enseignant_id = ? ORDER BY c.nom, m.nom`,
    [enseignantId]
  );
}

export function listClassesEnseignees(enseignantId: number): Classe[] {
  return queryAll<Classe>(
    `SELECT DISTINCT c.* FROM classes c
     JOIN affectations af ON af.classe_id = c.id
     WHERE af.enseignant_id = ?
     ORDER BY c.nom`,
    [enseignantId]
  );
}

export function enseignantEstAffecte(
  enseignantId: number,
  classeId: number,
  matiereId: number
): boolean {
  const row = queryOne<{ id: number }>(
    `SELECT id FROM affectations WHERE enseignant_id = ? AND classe_id = ? AND matiere_id = ?`,
    [enseignantId, classeId, matiereId]
  );
  return !!row;
}

export function createAffectation(
  enseignantId: number,
  classeId: number,
  matiereId: number
): void {
  db.prepare(
    `INSERT OR IGNORE INTO affectations (enseignant_id, classe_id, matiere_id) VALUES (?, ?, ?)`
  ).run(enseignantId, classeId, matiereId);
}

export function deleteAffectation(id: number): void {
  db.prepare(`DELETE FROM affectations WHERE id = ?`).run(id);
}
