import "server-only";
import { db, queryAll } from "@/lib/db";
import type { AbsenceAvecDetails, StatutAbsence } from "@/lib/types";

const SELECT = `
  SELECT ab.*, el.nom AS eleve_nom, el.prenom AS eleve_prenom, m.nom AS matiere_nom
  FROM absences ab
  JOIN eleves el ON el.id = ab.eleve_id
  LEFT JOIN matieres m ON m.id = ab.matiere_id
`;

export function listAbsencesParEleve(eleveId: number): AbsenceAvecDetails[] {
  return queryAll<AbsenceAvecDetails>(
    `${SELECT} WHERE ab.eleve_id = ? ORDER BY ab.date DESC`,
    [eleveId]
  );
}

export function listAbsencesParClasse(classeId: number): AbsenceAvecDetails[] {
  return queryAll<AbsenceAvecDetails>(
    `${SELECT} WHERE ab.classe_id = ? ORDER BY ab.date DESC`,
    [classeId]
  );
}

export interface AppelEntree {
  eleveId: number;
  statut: StatutAbsence | null; // null = présent
}

export function enregistrerAppel(
  classeId: number,
  matiereId: number,
  enseignantId: number,
  date: string,
  entrees: AppelEntree[]
): void {
  db.exec("BEGIN");
  try {
    db.prepare(
      `DELETE FROM absences WHERE classe_id = ? AND matiere_id = ? AND date = ?`
    ).run(classeId, matiereId, date);

    const insert = db.prepare(
      `INSERT INTO absences (eleve_id, classe_id, matiere_id, enseignant_id, date, statut)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const e of entrees) {
      if (e.statut) {
        insert.run(e.eleveId, classeId, matiereId, enseignantId, date, e.statut);
      }
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function getAppelExistant(
  classeId: number,
  matiereId: number,
  date: string
): Map<number, StatutAbsence> {
  const rows = queryAll<{ eleve_id: number; statut: StatutAbsence }>(
    `SELECT eleve_id, statut FROM absences WHERE classe_id = ? AND matiere_id = ? AND date = ?`,
    [classeId, matiereId, date]
  );
  return new Map(rows.map((r) => [r.eleve_id, r.statut]));
}

export function justifierAbsence(id: number, motif: string): void {
  db.prepare(`UPDATE absences SET justifiee = 1, motif = ? WHERE id = ?`).run(motif, id);
}

export function deleteAbsence(id: number): void {
  db.prepare(`DELETE FROM absences WHERE id = ?`).run(id);
}
