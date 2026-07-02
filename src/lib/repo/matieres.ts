import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { Matiere } from "@/lib/types";

export interface MatiereInput {
  nom: string;
  coefficient: number;
}

export function listMatieres(): Matiere[] {
  return queryAll<Matiere>(`SELECT * FROM matieres ORDER BY nom`);
}

export function getMatiere(id: number): Matiere | undefined {
  return queryOne<Matiere>(`SELECT * FROM matieres WHERE id = ?`, [id]);
}

export function createMatiere(input: MatiereInput): number {
  const result = db
    .prepare(`INSERT INTO matieres (nom, coefficient) VALUES (?, ?)`)
    .run(input.nom, input.coefficient);
  return Number(result.lastInsertRowid);
}

export function updateMatiere(id: number, input: MatiereInput): void {
  db.prepare(`UPDATE matieres SET nom = ?, coefficient = ? WHERE id = ?`).run(
    input.nom,
    input.coefficient,
    id
  );
}

export function deleteMatiere(id: number): void {
  db.prepare(`DELETE FROM matieres WHERE id = ?`).run(id);
}
