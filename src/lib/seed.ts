import "server-only";
import type { DatabaseSync } from "node:sqlite";

const ANNEE_SCOLAIRE = "2025-2026";

const ENSEIGNANTS = [
  { nom: "Sidibé", prenom: "Aboubacar", specialite: "Mathématiques", email: "a.sidibe@kalan.ml" },
  { nom: "Traoré", prenom: "Fatoumata", specialite: "Français", email: "f.traore@kalan.ml" },
  { nom: "Diarra", prenom: "Moussa", specialite: "Sciences Physiques", email: "m.diarra@kalan.ml" },
  { nom: "Keïta", prenom: "Aïssata", specialite: "Anglais", email: "a.keita@kalan.ml" },
  { nom: "Coulibaly", prenom: "Ibrahim", specialite: "Histoire-Géographie", email: "i.coulibaly@kalan.ml" },
  { nom: "Diallo", prenom: "Mariam", specialite: "SVT", email: "m.diallo@kalan.ml" },
  { nom: "Touré", prenom: "Sékou", specialite: "Éducation Physique et Sportive", email: "s.toure@kalan.ml" },
  { nom: "Camara", prenom: "Kadiatou", specialite: "Informatique", email: "k.camara@kalan.ml" },
];

const MATIERES = [
  { nom: "Mathématiques", coefficient: 4 },
  { nom: "Français", coefficient: 4 },
  { nom: "Anglais", coefficient: 2 },
  { nom: "Sciences Physiques", coefficient: 3 },
  { nom: "SVT", coefficient: 2 },
  { nom: "Histoire-Géographie", coefficient: 2 },
  { nom: "Éducation Civique et Morale", coefficient: 1 },
  { nom: "Éducation Physique et Sportive", coefficient: 1 },
  { nom: "Informatique", coefficient: 2 },
];

const CLASSES = [
  { nom: "6ème A", niveau: "6ème" },
  { nom: "6ème B", niveau: "6ème" },
  { nom: "5ème A", niveau: "5ème" },
  { nom: "4ème A", niveau: "4ème" },
  { nom: "3ème A", niveau: "3ème" },
  { nom: "Terminale A", niveau: "Terminale" },
];

const PRENOMS_GARCONS = [
  "Ibrahim", "Moussa", "Oumar", "Bakary", "Sékou", "Mamadou", "Adama",
  "Souleymane", "Yacouba", "Boubacar", "Amadou", "Modibo", "Cheick",
];
const PRENOMS_FILLES = [
  "Aminata", "Fatoumata", "Aïssata", "Mariam", "Kadiatou", "Djénéba",
  "Assitan", "Rokia", "Awa", "Salimata", "Bintou", "Hawa",
];
const NOMS_FAMILLE = [
  "Traoré", "Diarra", "Coulibaly", "Keïta", "Diallo", "Touré", "Camara",
  "Cissé", "Konaté", "Sidibé", "Doumbia", "Diakité", "Sissoko", "Maïga",
  "Bagayoko", "Kanté",
];

function randomItem<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function seedIfEmpty(database: DatabaseSync): void {
  // BEGIN IMMEDIATE grabs the write lock before the emptiness check, so
  // concurrent processes (e.g. Next.js build workers) serialize on it
  // instead of racing to insert duplicate seed data.
  database.exec("BEGIN IMMEDIATE");
  try {
    const { n } = database
      .prepare(`SELECT COUNT(*) AS n FROM eleves`)
      .get() as { n: number };
    if (n > 0) {
      database.exec("COMMIT");
      return;
    }

    const insertEnseignant = database.prepare(
      `INSERT INTO enseignants (nom, prenom, email, telephone, specialite, date_embauche)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const enseignantIds: number[] = [];
    ENSEIGNANTS.forEach((e, i) => {
      const result = insertEnseignant.run(
        e.nom,
        e.prenom,
        e.email,
        `+223 7${String(i).padStart(1, "0")} 00 00 0${i}`,
        e.specialite,
        "2022-09-01"
      );
      enseignantIds.push(Number(result.lastInsertRowid));
    });

    const insertMatiere = database.prepare(
      `INSERT INTO matieres (nom, coefficient) VALUES (?, ?)`
    );
    const matiereIds: number[] = [];
    MATIERES.forEach((m) => {
      const result = insertMatiere.run(m.nom, m.coefficient);
      matiereIds.push(Number(result.lastInsertRowid));
    });

    const insertClasse = database.prepare(
      `INSERT INTO classes (nom, niveau, annee_scolaire, enseignant_principal_id, capacite)
       VALUES (?, ?, ?, ?, ?)`
    );
    const classeIds: number[] = [];
    CLASSES.forEach((c, i) => {
      const result = insertClasse.run(
        c.nom,
        c.niveau,
        ANNEE_SCOLAIRE,
        enseignantIds[i % enseignantIds.length],
        40
      );
      classeIds.push(Number(result.lastInsertRowid));
    });

    const insertEleve = database.prepare(
      `INSERT INTO eleves
        (matricule, nom, prenom, date_naissance, genre, classe_id, nom_parent, telephone_parent, email_parent, adresse, date_inscription, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'actif')`
    );

    const eleveIdsParClasse = new Map<number, number[]>();
    let compteur = 0;
    const anneeNaissanceBase = 2013;

    classeIds.forEach((classeId, classeIndex) => {
      const eleveIds: number[] = [];
      const effectif = 8 + (classeIndex % 3) * 2;
      for (let i = 0; i < effectif; i++) {
        compteur++;
        const estGarcon = compteur % 2 === 0;
        const prenom = estGarcon
          ? randomItem(PRENOMS_GARCONS, compteur)
          : randomItem(PRENOMS_FILLES, compteur);
        const nom = randomItem(NOMS_FAMILLE, compteur * 3 + classeIndex);
        const matricule = `KLN-2025-${String(compteur).padStart(4, "0")}`;
        const anneeNaissance = anneeNaissanceBase - classeIndex;
        const dateNaissance = `${anneeNaissance}-0${(compteur % 9) + 1}-1${compteur % 9}`;
        const nomParent = `${randomItem(NOMS_FAMILLE, compteur + 7)} ${estGarcon ? "Sanogo" : "Théra"}`;

        const result = insertEleve.run(
          matricule,
          nom,
          prenom,
          dateNaissance,
          estGarcon ? "M" : "F",
          classeId,
          nomParent,
          `+223 6${String(compteur).padStart(2, "0")} 00 00 00`,
          null,
          "Bamako, Mali",
          "2025-09-15"
        );
        eleveIds.push(Number(result.lastInsertRowid));
      }
      eleveIdsParClasse.set(classeId, eleveIds);
    });

    const insertNote = database.prepare(
      `INSERT INTO notes (eleve_id, matiere_id, enseignant_id, trimestre, type, valeur, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    classeIds.slice(0, 3).forEach((classeId) => {
      const eleveIds = eleveIdsParClasse.get(classeId) ?? [];
      matiereIds.slice(0, 5).forEach((matiereId, mIndex) => {
        eleveIds.forEach((eleveId, eIndex) => {
          const base = 8 + ((eIndex + mIndex) % 10);
          const devoir = Math.min(20, base + 2);
          const composition = Math.min(20, base + ((eIndex * 3 + mIndex) % 6));
          insertNote.run(
            eleveId,
            matiereId,
            enseignantIds[mIndex % enseignantIds.length],
            1,
            "devoir",
            devoir,
            "2025-11-10"
          );
          insertNote.run(
            eleveId,
            matiereId,
            enseignantIds[mIndex % enseignantIds.length],
            1,
            "composition",
            composition,
            "2025-12-05"
          );
        });
      });
    });

    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}
