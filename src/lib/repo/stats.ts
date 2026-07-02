import "server-only";
import { queryAll, queryOne } from "@/lib/db";

export interface StatsGenerales {
  totalEleves: number;
  totalEnseignants: number;
  totalClasses: number;
  totalMatieres: number;
  moyenneGenerale: number | null;
  repartitionGenre: { genre: string; total: number }[];
}

export interface EffectifClasse {
  classeId: number;
  nom: string;
  niveau: string;
  effectif: number;
  capacite: number | null;
}

export function getStatsGenerales(): StatsGenerales {
  const totalEleves = queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM eleves WHERE statut = 'actif'`
  )!.n;
  const totalEnseignants = queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM enseignants`
  )!.n;
  const totalClasses = queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM classes`
  )!.n;
  const totalMatieres = queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM matieres`
  )!.n;
  const moyenne = queryOne<{ m: number | null }>(
    `SELECT AVG(valeur) AS m FROM notes`
  )!;
  const repartitionGenre = queryAll<{ genre: string; total: number }>(
    `SELECT genre, COUNT(*) AS total FROM eleves WHERE statut = 'actif' GROUP BY genre`
  );

  return {
    totalEleves,
    totalEnseignants,
    totalClasses,
    totalMatieres,
    moyenneGenerale: moyenne.m !== null ? Math.round(moyenne.m * 100) / 100 : null,
    repartitionGenre,
  };
}

export function getEffectifsParClasse(): EffectifClasse[] {
  return queryAll<EffectifClasse>(
    `SELECT c.id AS classeId, c.nom, c.niveau, c.capacite,
            (SELECT COUNT(*) FROM eleves e WHERE e.classe_id = c.id AND e.statut = 'actif') AS effectif
     FROM classes c
     ORDER BY c.niveau, c.nom`
  );
}
