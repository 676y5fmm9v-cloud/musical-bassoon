import "server-only";
import { db, queryAll } from "@/lib/db";
import type { CoursAvecDetails } from "@/lib/types";

const SELECT = `
  SELECT co.*, m.nom AS matiere_nom, c.nom AS classe_nom, (e.prenom || ' ' || e.nom) AS enseignant_nom
  FROM cours co
  JOIN matieres m ON m.id = co.matiere_id
  JOIN classes c ON c.id = co.classe_id
  JOIN enseignants e ON e.id = co.enseignant_id
`;

export function listCoursParEnseignant(enseignantId: number): CoursAvecDetails[] {
  return queryAll<CoursAvecDetails>(
    `${SELECT} WHERE co.enseignant_id = ? ORDER BY co.date DESC, co.created_at DESC`,
    [enseignantId]
  );
}

export function listCoursParClasse(classeId: number): CoursAvecDetails[] {
  return queryAll<CoursAvecDetails>(
    `${SELECT} WHERE co.classe_id = ? ORDER BY co.date DESC, co.created_at DESC`,
    [classeId]
  );
}

export interface CoursInput {
  titre: string;
  classe_id: number;
  matiere_id: number;
  enseignant_id: number;
  fichier_nom?: string | null;
}

export function creerCours(input: CoursInput): number {
  const result = db
    .prepare(
      `INSERT INTO cours (titre, classe_id, matiere_id, enseignant_id, fichier_nom)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.titre,
      input.classe_id,
      input.matiere_id,
      input.enseignant_id,
      input.fichier_nom ?? null
    );
  return Number(result.lastInsertRowid);
}

export function deleteCours(id: number): void {
  db.prepare(`DELETE FROM cours WHERE id = ?`).run(id);
}
