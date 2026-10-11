import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { DevoirAvecDetails, DevoirRenduAvecEleve } from "@/lib/types";

export interface DevoirPourEleve extends DevoirAvecDetails {
  rendu_le: string | null;
  note_rendu: number | null;
}

const SELECT = `
  SELECT d.*, m.nom AS matiere_nom, c.nom AS classe_nom, (e.prenom || ' ' || e.nom) AS enseignant_nom,
    (SELECT COUNT(*) FROM eleves el WHERE el.classe_id = d.classe_id AND el.statut = 'actif') AS nb_eleves,
    (SELECT COUNT(*) FROM devoir_rendus dr WHERE dr.devoir_id = d.id AND dr.rendu_le IS NOT NULL) AS nb_rendus
  FROM devoirs d
  JOIN matieres m ON m.id = d.matiere_id
  JOIN classes c ON c.id = d.classe_id
  JOIN enseignants e ON e.id = d.enseignant_id
`;

export function listDevoirsParEnseignant(enseignantId: number): DevoirAvecDetails[] {
  return queryAll<DevoirAvecDetails>(
    `${SELECT} WHERE d.enseignant_id = ? ORDER BY d.date_limite DESC`,
    [enseignantId]
  );
}

export function listDevoirsParClasse(classeId: number): DevoirAvecDetails[] {
  return queryAll<DevoirAvecDetails>(
    `${SELECT} WHERE d.classe_id = ? ORDER BY d.date_limite DESC`,
    [classeId]
  );
}

export function getDevoir(id: number): DevoirAvecDetails | undefined {
  return queryOne<DevoirAvecDetails>(`${SELECT} WHERE d.id = ?`, [id]);
}

export function listDevoirsPourEleve(eleveId: number, classeId: number): DevoirPourEleve[] {
  return queryAll<DevoirPourEleve>(
    `SELECT d.*, m.nom AS matiere_nom, c.nom AS classe_nom, (e.prenom || ' ' || e.nom) AS enseignant_nom,
       0 AS nb_eleves, 0 AS nb_rendus,
       dr.rendu_le AS rendu_le, dr.note AS note_rendu
     FROM devoirs d
     JOIN matieres m ON m.id = d.matiere_id
     JOIN classes c ON c.id = d.classe_id
     JOIN enseignants e ON e.id = d.enseignant_id
     LEFT JOIN devoir_rendus dr ON dr.devoir_id = d.id AND dr.eleve_id = ?
     WHERE d.classe_id = ?
     ORDER BY d.date_limite DESC`,
    [eleveId, classeId]
  );
}

export interface DevoirInput {
  titre: string;
  consignes?: string | null;
  classe_id: number;
  matiere_id: number;
  enseignant_id: number;
  date_limite: string;
}

export function creerDevoir(input: DevoirInput): number {
  const result = db
    .prepare(
      `INSERT INTO devoirs (titre, consignes, classe_id, matiere_id, enseignant_id, date_limite)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.titre,
      input.consignes ?? null,
      input.classe_id,
      input.matiere_id,
      input.enseignant_id,
      input.date_limite
    );
  return Number(result.lastInsertRowid);
}

export function deleteDevoir(id: number): void {
  db.prepare(`DELETE FROM devoirs WHERE id = ?`).run(id);
}

export function listRendusPourDevoir(devoirId: number): DevoirRenduAvecEleve[] {
  return queryAll<DevoirRenduAvecEleve>(
    `SELECT
       dr.id AS id,
       el.id AS eleve_id,
       ? AS devoir_id,
       dr.rendu_le AS rendu_le,
       dr.commentaire AS commentaire,
       dr.fichier_nom AS fichier_nom,
       dr.note AS note,
       dr.created_at AS created_at,
       el.nom AS eleve_nom,
       el.prenom AS eleve_prenom
     FROM eleves el
     LEFT JOIN devoir_rendus dr ON dr.eleve_id = el.id AND dr.devoir_id = ?
     WHERE el.classe_id = (SELECT classe_id FROM devoirs WHERE id = ?) AND el.statut = 'actif'
     ORDER BY el.nom, el.prenom`,
    [devoirId, devoirId, devoirId]
  );
}

export function getRenduEleve(
  devoirId: number,
  eleveId: number
): DevoirRenduAvecEleve | undefined {
  return queryOne<DevoirRenduAvecEleve>(
    `SELECT
       dr.id AS id,
       el.id AS eleve_id,
       ? AS devoir_id,
       dr.rendu_le AS rendu_le,
       dr.commentaire AS commentaire,
       dr.fichier_nom AS fichier_nom,
       dr.note AS note,
       dr.created_at AS created_at,
       el.nom AS eleve_nom,
       el.prenom AS eleve_prenom
     FROM eleves el
     LEFT JOIN devoir_rendus dr ON dr.eleve_id = el.id AND dr.devoir_id = ?
     WHERE el.id = ?`,
    [devoirId, devoirId, eleveId]
  );
}

export function soumettreRendu(
  devoirId: number,
  eleveId: number,
  commentaire: string | null,
  fichierNom: string | null
): void {
  db.prepare(
    `INSERT INTO devoir_rendus (devoir_id, eleve_id, rendu_le, commentaire, fichier_nom)
     VALUES (?, ?, datetime('now'), ?, ?)
     ON CONFLICT(devoir_id, eleve_id)
     DO UPDATE SET rendu_le = datetime('now'), commentaire = excluded.commentaire, fichier_nom = excluded.fichier_nom`
  ).run(devoirId, eleveId, commentaire, fichierNom);
}

export function noterRendu(devoirId: number, eleveId: number, note: number): void {
  db.prepare(
    `INSERT INTO devoir_rendus (devoir_id, eleve_id, note)
     VALUES (?, ?, ?)
     ON CONFLICT(devoir_id, eleve_id) DO UPDATE SET note = excluded.note`
  ).run(devoirId, eleveId, note);
}
