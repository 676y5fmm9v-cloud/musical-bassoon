import "server-only";
import { db, queryAll } from "@/lib/db";
import type { AnnonceAvecDetails, Compte } from "@/lib/types";

const SELECT = `
  SELECT a.*, co.nom AS auteur_nom, cl.nom AS classe_nom
  FROM annonces a
  LEFT JOIN comptes co ON co.id = a.auteur_compte_id
  LEFT JOIN classes cl ON cl.id = a.classe_id
`;

export function listToutesAnnonces(): AnnonceAvecDetails[] {
  return queryAll<AnnonceAvecDetails>(`${SELECT} ORDER BY a.created_at DESC`);
}

export interface AnnonceInput {
  titre: string;
  message: string;
  cible: "ecole" | "parents" | "profs" | "classe";
  classe_id?: number | null;
}

export function creerAnnonce(auteurCompteId: number, input: AnnonceInput): number {
  const result = db
    .prepare(
      `INSERT INTO annonces (titre, message, cible, classe_id, auteur_compte_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.titre,
      input.message,
      input.cible,
      input.cible === "classe" ? input.classe_id ?? null : null,
      auteurCompteId
    );
  return Number(result.lastInsertRowid);
}

export function deleteAnnonce(id: number): void {
  db.prepare(`DELETE FROM annonces WHERE id = ?`).run(id);
}

function classeDeLeleve(eleveId: number): number | null {
  const row = db.prepare(`SELECT classe_id FROM eleves WHERE id = ?`).get(eleveId) as
    | { classe_id: number | null }
    | undefined;
  return row?.classe_id ?? null;
}

function classesDesEnfants(compteParentId: number): number[] {
  const rows = queryAll<{ classe_id: number | null }>(
    `SELECT e.classe_id FROM parent_eleve pe
     JOIN eleves e ON e.id = pe.eleve_id
     WHERE pe.compte_id = ?`,
    [compteParentId]
  );
  return rows.map((r) => r.classe_id).filter((id): id is number => id !== null);
}

export function listAnnoncesPourCompte(compte: Compte): AnnonceAvecDetails[] {
  const toutes = listToutesAnnonces();
  if (compte.role === "ecole") return toutes;

  if (compte.role === "prof") {
    return toutes.filter((a) => a.cible === "ecole" || a.cible === "profs" || a.cible === "classe");
  }

  if (compte.role === "eleve") {
    const classeId = compte.eleve_id ? classeDeLeleve(compte.eleve_id) : null;
    return toutes.filter(
      (a) => a.cible === "ecole" || (a.cible === "classe" && a.classe_id === classeId)
    );
  }

  if (compte.role === "parent") {
    const classes = classesDesEnfants(compte.id);
    return toutes.filter(
      (a) =>
        a.cible === "ecole" ||
        a.cible === "parents" ||
        (a.cible === "classe" && a.classe_id !== null && classes.includes(a.classe_id))
    );
  }

  return [];
}
