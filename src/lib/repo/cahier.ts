import "server-only";
import { db, queryAll } from "@/lib/db";
import type { CahierTexteAvecDetails } from "@/lib/types";

const SELECT = `
  SELECT ct.*, m.nom AS matiere_nom, c.nom AS classe_nom, (e.prenom || ' ' || e.nom) AS enseignant_nom
  FROM cahier_texte ct
  JOIN matieres m ON m.id = ct.matiere_id
  JOIN classes c ON c.id = ct.classe_id
  JOIN enseignants e ON e.id = ct.enseignant_id
`;

export function listCahierParEnseignant(enseignantId: number): CahierTexteAvecDetails[] {
  return queryAll<CahierTexteAvecDetails>(
    `${SELECT} WHERE ct.enseignant_id = ? ORDER BY ct.date DESC`,
    [enseignantId]
  );
}

export function listCahierParClasse(classeId: number): CahierTexteAvecDetails[] {
  return queryAll<CahierTexteAvecDetails>(
    `${SELECT} WHERE ct.classe_id = ? ORDER BY ct.date DESC`,
    [classeId]
  );
}

export interface CahierInput {
  classe_id: number;
  matiere_id: number;
  enseignant_id: number;
  date?: string;
  contenu_seance: string;
  travail_donne?: string | null;
}

export function creerEntreeCahier(input: CahierInput): number {
  const result = db
    .prepare(
      `INSERT INTO cahier_texte (classe_id, matiere_id, enseignant_id, date, contenu_seance, travail_donne)
       VALUES (?, ?, ?, COALESCE(?, date('now')), ?, ?)`
    )
    .run(
      input.classe_id,
      input.matiere_id,
      input.enseignant_id,
      input.date ?? null,
      input.contenu_seance,
      input.travail_donne ?? null
    );
  return Number(result.lastInsertRowid);
}

export function deleteEntreeCahier(id: number): void {
  db.prepare(`DELETE FROM cahier_texte WHERE id = ?`).run(id);
}
