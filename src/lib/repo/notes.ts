import "server-only";
import { db, queryAll } from "@/lib/db";
import type { NoteAvecDetails, TypeNote } from "@/lib/types";

const SELECT_AVEC_DETAILS = `
  SELECT n.*, m.nom AS matiere_nom, m.coefficient AS coefficient,
         el.nom AS eleve_nom, el.prenom AS eleve_prenom
  FROM notes n
  JOIN matieres m ON m.id = n.matiere_id
  JOIN eleves el ON el.id = n.eleve_id
`;

export interface ListNotesFiltre {
  eleveId?: number;
  classeId?: number;
  matiereId?: number;
  trimestre?: number;
}

export function listNotes(filtre: ListNotesFiltre = {}): NoteAvecDetails[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filtre.eleveId) {
    clauses.push("n.eleve_id = ?");
    params.push(filtre.eleveId);
  }
  if (filtre.classeId) {
    clauses.push("el.classe_id = ?");
    params.push(filtre.classeId);
  }
  if (filtre.matiereId) {
    clauses.push("n.matiere_id = ?");
    params.push(filtre.matiereId);
  }
  if (filtre.trimestre) {
    clauses.push("n.trimestre = ?");
    params.push(filtre.trimestre);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return queryAll<NoteAvecDetails>(
    `${SELECT_AVEC_DETAILS} ${where} ORDER BY el.nom, el.prenom, m.nom, n.trimestre`,
    params
  );
}

export function getNotesPourSaisie(
  classeId: number,
  matiereId: number,
  trimestre: number,
  type: TypeNote
): Map<number, number> {
  const rows = db
    .prepare(
      `SELECT n.eleve_id, n.valeur
       FROM notes n
       JOIN eleves el ON el.id = n.eleve_id
       WHERE el.classe_id = ? AND n.matiere_id = ? AND n.trimestre = ? AND n.type = ?`
    )
    .all(classeId, matiereId, trimestre, type) as unknown as {
    eleve_id: number;
    valeur: number;
  }[];
  return new Map(rows.map((r) => [r.eleve_id, r.valeur]));
}

export interface SaisieNote {
  eleveId: number;
  valeur: number | null;
}

export function enregistrerNotesEnMasse(
  matiereId: number,
  trimestre: number,
  type: TypeNote,
  enseignantId: number | null,
  saisies: SaisieNote[]
): void {
  const upsert = db.prepare(
    `INSERT INTO notes (eleve_id, matiere_id, enseignant_id, trimestre, type, valeur, date)
     VALUES (?, ?, ?, ?, ?, ?, date('now'))
     ON CONFLICT(eleve_id, matiere_id, trimestre, type)
     DO UPDATE SET valeur = excluded.valeur, enseignant_id = excluded.enseignant_id, date = excluded.date`
  );
  const clear = db.prepare(
    `DELETE FROM notes WHERE eleve_id = ? AND matiere_id = ? AND trimestre = ? AND type = ?`
  );

  db.exec("BEGIN");
  try {
    for (const s of saisies) {
      if (s.valeur === null) {
        clear.run(s.eleveId, matiereId, trimestre, type);
      } else {
        upsert.run(
          s.eleveId,
          matiereId,
          enseignantId,
          trimestre,
          type,
          s.valeur
        );
      }
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function deleteNote(id: number): void {
  db.prepare(`DELETE FROM notes WHERE id = ?`).run(id);
}

export interface MoyenneMatiere {
  matiereId: number;
  matiereNom: string;
  coefficient: number;
  devoir: number | null;
  composition: number | null;
  moyenne: number;
}

export function calculerBulletin(
  eleveId: number,
  trimestre: number
): { matieres: MoyenneMatiere[]; moyenneGenerale: number | null } {
  const rows = db
    .prepare(
      `SELECT m.id AS matiere_id, m.nom AS matiere_nom, m.coefficient,
              n.type, n.valeur
       FROM matieres m
       LEFT JOIN notes n ON n.matiere_id = m.id AND n.eleve_id = ? AND n.trimestre = ?
       ORDER BY m.nom`
    )
    .all(eleveId, trimestre) as unknown as {
    matiere_id: number;
    matiere_nom: string;
    coefficient: number;
    type: TypeNote | null;
    valeur: number | null;
  }[];

  const parMatiere = new Map<
    number,
    { nom: string; coefficient: number; devoir: number | null; composition: number | null }
  >();

  for (const row of rows) {
    if (!parMatiere.has(row.matiere_id)) {
      parMatiere.set(row.matiere_id, {
        nom: row.matiere_nom,
        coefficient: row.coefficient,
        devoir: null,
        composition: null,
      });
    }
    const entry = parMatiere.get(row.matiere_id)!;
    if (row.type === "devoir") entry.devoir = row.valeur;
    if (row.type === "composition") entry.composition = row.valeur;
  }

  const matieres: MoyenneMatiere[] = [];
  let sommePonderee = 0;
  let sommeCoefficients = 0;

  for (const [matiereId, entry] of parMatiere) {
    const { devoir, composition, coefficient, nom } = entry;
    let moyenne: number | null = null;
    if (devoir !== null && composition !== null) {
      moyenne = (devoir + composition * 2) / 3;
    } else if (composition !== null) {
      moyenne = composition;
    } else if (devoir !== null) {
      moyenne = devoir;
    }

    if (moyenne !== null) {
      matieres.push({
        matiereId,
        matiereNom: nom,
        coefficient,
        devoir,
        composition,
        moyenne: Math.round(moyenne * 100) / 100,
      });
      sommePonderee += moyenne * coefficient;
      sommeCoefficients += coefficient;
    }
  }

  matieres.sort((a, b) => a.matiereNom.localeCompare(b.matiereNom));

  return {
    matieres,
    moyenneGenerale:
      sommeCoefficients > 0
        ? Math.round((sommePonderee / sommeCoefficients) * 100) / 100
        : null,
  };
}
