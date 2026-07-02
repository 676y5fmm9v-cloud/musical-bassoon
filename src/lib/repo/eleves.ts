import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { Eleve, EleveAvecClasse, StatutEleve, Genre } from "@/lib/types";

export interface EleveInput {
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance?: string | null;
  genre: Genre;
  classe_id?: number | null;
  nom_parent?: string | null;
  telephone_parent?: string | null;
  email_parent?: string | null;
  adresse?: string | null;
  date_inscription?: string | null;
  statut?: StatutEleve;
}

const SELECT_AVEC_CLASSE = `
  SELECT el.*, c.nom AS classe_nom
  FROM eleves el
  LEFT JOIN classes c ON c.id = el.classe_id
`;

export interface ListElevesFiltre {
  recherche?: string;
  classeId?: number;
  statut?: StatutEleve;
}

export function listEleves(filtre: ListElevesFiltre = {}): EleveAvecClasse[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filtre.recherche) {
    clauses.push(
      "(el.nom LIKE ? OR el.prenom LIKE ? OR el.matricule LIKE ?)"
    );
    const like = `%${filtre.recherche}%`;
    params.push(like, like, like);
  }
  if (filtre.classeId) {
    clauses.push("el.classe_id = ?");
    params.push(filtre.classeId);
  }
  if (filtre.statut) {
    clauses.push("el.statut = ?");
    params.push(filtre.statut);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return queryAll<EleveAvecClasse>(
    `${SELECT_AVEC_CLASSE} ${where} ORDER BY el.nom, el.prenom`,
    params
  );
}

export function getEleve(id: number): EleveAvecClasse | undefined {
  return queryOne<EleveAvecClasse>(`${SELECT_AVEC_CLASSE} WHERE el.id = ?`, [
    id,
  ]);
}

export function matriculeExiste(matricule: string, excludeId?: number): boolean {
  const row = db
    .prepare(
      `SELECT id FROM eleves WHERE matricule = ? AND id != ?`
    )
    .get(matricule, excludeId ?? -1) as { id: number } | undefined;
  return !!row;
}

export function genererMatricule(): string {
  const annee = new Date().getFullYear();
  const row = db
    .prepare(`SELECT COUNT(*) AS n FROM eleves WHERE matricule LIKE ?`)
    .get(`KLN-${annee}-%`) as { n: number };
  const numero = String(row.n + 1).padStart(4, "0");
  return `KLN-${annee}-${numero}`;
}

export function createEleve(input: EleveInput): number {
  const result = db
    .prepare(
      `INSERT INTO eleves
        (matricule, nom, prenom, date_naissance, genre, classe_id, nom_parent, telephone_parent, email_parent, adresse, date_inscription, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, date('now')), ?)`
    )
    .run(
      input.matricule,
      input.nom,
      input.prenom,
      input.date_naissance || null,
      input.genre,
      input.classe_id || null,
      input.nom_parent || null,
      input.telephone_parent || null,
      input.email_parent || null,
      input.adresse || null,
      input.date_inscription || null,
      input.statut || "actif"
    );
  return Number(result.lastInsertRowid);
}

export function updateEleve(id: number, input: EleveInput): void {
  db.prepare(
    `UPDATE eleves
     SET matricule = ?, nom = ?, prenom = ?, date_naissance = ?, genre = ?, classe_id = ?,
         nom_parent = ?, telephone_parent = ?, email_parent = ?, adresse = ?,
         date_inscription = COALESCE(?, date_inscription), statut = ?
     WHERE id = ?`
  ).run(
    input.matricule,
    input.nom,
    input.prenom,
    input.date_naissance || null,
    input.genre,
    input.classe_id || null,
    input.nom_parent || null,
    input.telephone_parent || null,
    input.email_parent || null,
    input.adresse || null,
    input.date_inscription || null,
    input.statut || "actif",
    id
  );
}

export function deleteEleve(id: number): void {
  db.prepare(`DELETE FROM eleves WHERE id = ?`).run(id);
}

export function listElevesParClasse(classeId: number): Eleve[] {
  return queryAll<Eleve>(
    `SELECT * FROM eleves WHERE classe_id = ? ORDER BY nom, prenom`,
    [classeId]
  );
}
