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
- `npm run start` — démarre le build de production (écoute sur `$PORT`, ou 3000 par défaut)
- `npm run lint` — ESLint

## Déploiement

L'application stocke ses données dans un fichier SQLite local
(`data/kalan.db`) via un processus Node long-vivant : elle a donc besoin
d'un **disque persistant**, contrairement à une plateforme purement
serverless (Vercel, Netlify Functions) où le système de fichiers est
réinitialisé entre les requêtes et où les données seraient perdues.

Plateformes adaptées : [Railway](https://railway.app),
[Render](https://render.com) (avec un disque persistant, plan payant) ou
[Fly.io](https://fly.io) (avec un volume).

### Railway

1. Créez un compte sur [railway.app](https://railway.app) et connectez votre
   compte GitHub.
2. **New Project → Deploy from GitHub repo**, sélectionnez ce dépôt et la
   branche souhaitée.
3. Railway détecte Next.js automatiquement (`npm install`, `npm run build`,
   `npm run start`) et lit `.node-version` pour la version de Node.
4. Ajoutez un **volume** (onglet *Volumes*) monté sur `/app/data` pour que
   la base SQLite survive aux redéploiements.
5. Railway fournit automatiquement la variable `PORT` ; le script `start`
   l'utilise déjà.
6. Une fois déployé, Railway génère une URL publique (`*.up.railway.app`).

### Render

1. **New → Web Service**, connectez le dépôt GitHub.
2. Build command : `npm install && npm run build` — Start command :
   `npm run start`.
3. Onglet *Disks* : ajoutez un disque persistant monté sur `/opt/render/project/src/data`
   (ou l'équivalent du dossier `data/` à la racine du projet).

### Fly.io

1. `fly launch` détecte Next.js et génère un `Dockerfile` (nécessite Node
   22.16+ dans l'image).
2. `fly volumes create kalan_data --size 1` puis montez-le sur `/app/data`
   dans `fly.toml`.
3. `fly deploy`.
