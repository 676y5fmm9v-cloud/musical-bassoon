# Kalan — Gestion Scolaire

Kalan (« étude » / « leçon » en bambara) est une application web de gestion
d'école : élèves, enseignants, classes, matières et notes, avec calcul
automatique des bulletins par trimestre.

## Fonctionnalités

- **Tableau de bord** : effectifs, moyenne générale, répartition par classe.
- **Élèves** : inscription, recherche/filtrage, fiche détaillée avec bulletin
  (devoir + composition, moyenne pondérée par coefficient) par trimestre.
- **Enseignants** : fiche, classes dont ils sont titulaires.
- **Classes** : effectif, titulaire, liste des élèves inscrits.
- **Matières** : nom et coefficient, utilisés dans le calcul des moyennes.
- **Notes** : saisie en masse par classe/matière/trimestre, avec liste et
  filtres.

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com)
- [`node:sqlite`](https://nodejs.org/api/sqlite.html) (module natif de
  Node.js, expérimental) pour la persistance — aucune dépendance native à
  compiler ni service de base de données externe à installer.

La base de données SQLite est créée automatiquement (schéma + données de
démonstration) au premier démarrage, dans `data/kalan.db` (ignoré par git).

## Démarrage

Prérequis : Node.js 22.16+ (pour `node:sqlite`).

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Des données de
démonstration (classes, enseignants, matières, élèves et notes maliens
fictifs) sont générées automatiquement au premier lancement.

Pour repartir d'une base vide, supprimez le dossier `data/` puis relancez
l'application.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — démarre le build de production
- `npm run lint` — ESLint
