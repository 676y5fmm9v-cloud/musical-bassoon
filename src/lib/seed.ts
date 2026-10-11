import "server-only";
import type { DatabaseSync } from "node:sqlite";
import { scryptSync, randomBytes } from "node:crypto";

const ANNEE_SCOLAIRE = "2025-2026";
const MOT_DE_PASSE_DEMO = "kalan2026";

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

// Seed dates are relative to the day the app first starts, so the demo
// (upcoming vs. overdue devoirs, recent absences, etc.) stays meaningful
// no matter when this environment's seed actually runs.
function decaler(jours: number): string {
  const d = new Date();
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

// node:crypto's scrypt and scryptSync produce identical output for the same
// inputs, so this mirrors src/lib/auth/password.ts's hashPassword() format
// ("salt:key", both hex, 64-byte key) without needing an async seed function.
function hashPasswordSync(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
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

    const motDePasseHash = hashPasswordSync(MOT_DE_PASSE_DEMO);

    const insertEnseignant = database.prepare(
      `INSERT INTO enseignants (nom, prenom, email, telephone, specialite, date_embauche)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const enseignantIds: number[] = [];
    const enseignantIdParSpecialite = new Map<string, number>();
    ENSEIGNANTS.forEach((e, i) => {
      const result = insertEnseignant.run(
        e.nom,
        e.prenom,
        e.email,
        `+223 7${String(i).padStart(1, "0")} 00 00 0${i}`,
        e.specialite,
        "2022-09-01"
      );
      const id = Number(result.lastInsertRowid);
      enseignantIds.push(id);
      enseignantIdParSpecialite.set(e.specialite, id);
    });

    const insertMatiere = database.prepare(
      `INSERT INTO matieres (nom, coefficient) VALUES (?, ?)`
    );
    const matiereIds: number[] = [];
    const matiereIdParNom = new Map<string, number>();
    MATIERES.forEach((m) => {
      const result = insertMatiere.run(m.nom, m.coefficient);
      const id = Number(result.lastInsertRowid);
      matiereIds.push(id);
      matiereIdParNom.set(m.nom, id);
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
    const elevesOrdonnes: { id: number; nom: string; prenom: string }[] = [];
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
        const eleveId = Number(result.lastInsertRowid);
        eleveIds.push(eleveId);
        elevesOrdonnes.push({ id: eleveId, nom, prenom });
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

    // ── Affectations : chaque enseignant donne sa spécialité dans toutes les classes ──
    const insertAffectation = database.prepare(
      `INSERT OR IGNORE INTO affectations (enseignant_id, classe_id, matiere_id) VALUES (?, ?, ?)`
    );
    for (const [specialite, enseignantId] of enseignantIdParSpecialite) {
      const matiereId = matiereIdParNom.get(specialite);
      if (!matiereId) continue;
      for (const classeId of classeIds) {
        insertAffectation.run(enseignantId, classeId, matiereId);
      }
    }

    // ── Comptes : connexion pour chaque rôle ──
    const insertCompte = database.prepare(
      `INSERT INTO comptes (identifiant, mot_de_passe_hash, role, sous_role, nom, telephone, eleve_id, enseignant_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const compteIdParEleveId = new Map<number, number>();
    elevesOrdonnes.forEach((e, i) => {
      const identifiant = `KLNE2026-${String(i + 1).padStart(4, "0")}`;
      const result = insertCompte.run(
        identifiant,
        motDePasseHash,
        "eleve",
        null,
        `${e.prenom} ${e.nom}`,
        null,
        e.id,
        null
      );
      compteIdParEleveId.set(e.id, Number(result.lastInsertRowid));
    });

    const compteIdParEnseignantId = new Map<number, number>();
    ENSEIGNANTS.forEach((e, i) => {
      const identifiant = `KLNP2026-${String(i + 1).padStart(4, "0")}`;
      const result = insertCompte.run(
        identifiant,
        motDePasseHash,
        "prof",
        null,
        `${e.prenom} ${e.nom}`,
        null,
        null,
        enseignantIds[i]
      );
      compteIdParEnseignantId.set(enseignantIds[i], Number(result.lastInsertRowid));
    });

    const DIRECTION = [
      { identifiant: "KLND2026-0001", sousRole: "directeur", nom: "M. le Directeur" },
      { identifiant: "KLNS2026-0001", sousRole: "secretaire", nom: "Mme la Secrétaire" },
      { identifiant: "KLNC2026-0001", sousRole: "comptable", nom: "M. le Comptable" },
      { identifiant: "KLNA2026-0001", sousRole: "superecole", nom: "M. le Fondateur" },
    ] as const;
    const compteDirecteurId = (() => {
      let id = 0;
      DIRECTION.forEach((d) => {
        const result = insertCompte.run(
          d.identifiant,
          motDePasseHash,
          "ecole",
          d.sousRole,
          d.nom,
          null,
          null,
          null
        );
        if (d.sousRole === "directeur") id = Number(result.lastInsertRowid);
      });
      return id;
    })();

    // Comptes parents : un parent par élève, le premier ayant deux enfants
    // (frère/sœur dans la même classe) pour démontrer le sélecteur d'enfant.
    const insertParentEleve = database.prepare(
      `INSERT OR IGNORE INTO parent_eleve (compte_id, eleve_id) VALUES (?, ?)`
    );
    let parentCompteur = 0;
    const compteIdPremierParent = (() => {
      let premierId = 0;
      elevesOrdonnes.forEach((e, i) => {
        if (i === 1) {
          // Le 2e élève est rattaché au même parent que le 1er (fratrie).
          insertParentEleve.run(premierId, e.id);
          return;
        }
        parentCompteur++;
        const identifiant = `KLNPA2026-${String(parentCompteur).padStart(4, "0")}`;
        const result = insertCompte.run(
          identifiant,
          motDePasseHash,
          "parent",
          null,
          `Parent de ${e.prenom} ${e.nom}`,
          `+223 6${String(70 + i).padStart(2, "0")} 00 00 00`,
          null,
          null
        );
        const compteId = Number(result.lastInsertRowid);
        insertParentEleve.run(compteId, e.id);
        if (i === 0) premierId = compteId;
      });
      return premierId;
    })();

    // ── Cours, devoirs, cahier de textes pour les 3 premières classes ──
    const insertCours = database.prepare(
      `INSERT INTO cours (titre, classe_id, matiere_id, enseignant_id, date) VALUES (?, ?, ?, ?, ?)`
    );
    const insertDevoir = database.prepare(
      `INSERT INTO devoirs (titre, consignes, classe_id, matiere_id, enseignant_id, date_limite) VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertRendu = database.prepare(
      `INSERT INTO devoir_rendus (devoir_id, eleve_id, rendu_le, commentaire, note) VALUES (?, ?, ?, ?, ?)`
    );
    const insertCahier = database.prepare(
      `INSERT INTO cahier_texte (classe_id, matiere_id, enseignant_id, date, contenu_seance, travail_donne) VALUES (?, ?, ?, ?, ?, ?)`
    );

    const mathId = matiereIdParNom.get("Mathématiques")!;
    const profMath = enseignantIdParSpecialite.get("Mathématiques")!;
    const francaisId = matiereIdParNom.get("Français")!;
    const profFrancais = enseignantIdParSpecialite.get("Français")!;

    classeIds.slice(0, 2).forEach((classeId, idx) => {
      insertCours.run(
        idx === 0 ? "Les fractions — Partie 2" : "Résolution d'équations",
        classeId,
        mathId,
        profMath,
        decaler(-20 + idx)
      );
      insertCours.run(
        "La conjugaison du présent",
        classeId,
        francaisId,
        profFrancais,
        decaler(-17 + idx)
      );

      insertCahier.run(
        classeId,
        mathId,
        profMath,
        decaler(-20 + idx),
        "Correction des exercices sur les fractions. Introduction des fractions équivalentes.",
        "Exercices n°5 à 10 page 42."
      );

      const devoirResult = insertDevoir.run(
        "Exercices n°11 à 20",
        "Résous les exercices et montre toutes les étapes de calcul.",
        classeId,
        mathId,
        profMath,
        idx === 0 ? decaler(-5) : decaler(10)
      );
      const devoirId = Number(devoirResult.lastInsertRowid);

      const eleves = (eleveIdsParClasse.get(classeId) ?? []).slice(0, 6);
      eleves.forEach((eleveId, i) => {
        if (i < 3) {
          insertRendu.run(
            devoirId,
            eleveId,
            `${decaler(-7)} 10:00:00`,
            null,
            i === 0 ? 15.5 : null
          );
        }
      });
    });

    // ── Absences (appel) pour la première classe ──
    const insertAbsence = database.prepare(
      `INSERT INTO absences (eleve_id, classe_id, matiere_id, enseignant_id, date, statut, justifiee, motif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const premiereClasse = classeIds[0];
    const elevesPremiereClasse = eleveIdsParClasse.get(premiereClasse) ?? [];
    if (elevesPremiereClasse[0]) {
      insertAbsence.run(
        elevesPremiereClasse[0],
        premiereClasse,
        mathId,
        profMath,
        decaler(-25),
        "absent",
        1,
        "Maladie (certificat fourni)"
      );
    }
    if (elevesPremiereClasse[1]) {
      insertAbsence.run(
        elevesPremiereClasse[1],
        premiereClasse,
        mathId,
        profMath,
        decaler(-18),
        "retard",
        0,
        null
      );
    }

    // ── Annonces ──
    const insertAnnonce = database.prepare(
      `INSERT INTO annonces (titre, message, cible, classe_id, auteur_compte_id) VALUES (?, ?, ?, ?, ?)`
    );
    insertAnnonce.run(
      "Réunion parents-professeurs",
      "Une réunion parents-professeurs se tiendra le 15 décembre à 15h dans la cour principale.",
      "ecole",
      null,
      compteDirecteurId
    );
    insertAnnonce.run(
      "Reprise des cours",
      "Les cours reprendront normalement le lundi 6 janvier 2026.",
      "ecole",
      null,
      compteDirecteurId
    );
    insertAnnonce.run(
      "Sortie pédagogique",
      "Les élèves de 6ème A participeront à une sortie au musée national le 20 décembre.",
      "classe",
      classeIds[0],
      compteDirecteurId
    );

    // ── Messages (quelques échanges pour démarrer) ──
    const insertMessage = database.prepare(
      `INSERT INTO messages (expediteur_id, destinataire_id, contenu, lu, created_at) VALUES (?, ?, ?, ?, ?)`
    );
    const compteEleve1 = compteIdParEleveId.get(elevesOrdonnes[0].id)!;
    const compteProfMath = compteIdParEnseignantId.get(profMath)!;

    insertMessage.run(
      compteEleve1,
      compteProfMath,
      "Professeur, pouvez-vous réexpliquer les fractions équivalentes ?",
      1,
      `${decaler(-6)} 10:30:00`
    );
    insertMessage.run(
      compteProfMath,
      compteEleve1,
      "Bien sûr, on reprendra ça au prochain cours. N'hésite pas à revoir tes exercices en attendant.",
      0,
      `${decaler(-6)} 16:40:00`
    );
    insertMessage.run(
      compteIdPremierParent,
      compteDirecteurId,
      "Bonjour, je voulais savoir si le bulletin du trimestre 1 est disponible.",
      0,
      `${decaler(-5)} 09:00:00`
    );

    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}
