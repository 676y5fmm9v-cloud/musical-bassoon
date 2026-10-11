# Kalan — Toute l'école dans une seule application

Kalan (« étude » / « leçon » en bambara) est une application web de gestion
scolaire multi-rôles : **Élève**, **Professeur**, **Parent** et **École**
(direction/secrétariat), chacun avec son propre espace et son authentification.

## Fonctionnalités

### Authentification
Connexion par identifiant + mot de passe (le rôle et les droits sont
déterminés côté serveur à partir de l'identifiant, jamais par le client).
Sessions signées (JWT, cookie `httpOnly`), chaque route et chaque action est
protégée par rôle.

### Espace École (direction, secrétariat, comptabilité)
Tableau de bord, gestion des élèves/enseignants/classes/matières, affectation
des enseignants aux classes/matières, saisie de notes, annonces (toute
l'école / une classe / parents / professeurs), messagerie.

### Espace Professeur
Ses classes (scopées à ses affectations), publication de cours, création de
devoirs et notation des copies rendues, saisie de notes, appel (absences),
cahier de textes, messagerie.

### Espace Élève
Bulletin par trimestre (devoir + composition, moyenne pondérée par
coefficient), devoirs à faire/rendus avec soumission, cours publiés, cahier
de textes, absences, messagerie.

### Espace Parent
Sélecteur d'enfant (si plusieurs enfants liés au compte), notes et absences
de chaque enfant, annonces de l'école, messagerie avec les enseignants et la
direction.

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Proxy, TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com)
- [`node:sqlite`](https://nodejs.org/api/sqlite.html) (module natif de
  Node.js, expérimental) pour la persistance — aucune dépendance native à
  compiler ni service de base de données externe à installer.
- [`jose`](https://github.com/panva/jose) pour les sessions JWT signées, et
  `node:crypto` (scrypt) pour le hachage des mots de passe.

La base de données SQLite est créée automatiquement (schéma + données de
démonstration) au premier démarrage, dans `data/kalan.db` (ignoré par git).
Le secret de signature des sessions est lui aussi généré et stocké
automatiquement dans `data/.session-secret` (ou défini via la variable
d'environnement `SESSION_SECRET`).

## Démarrage

Prérequis : Node.js 22.16+ (pour `node:sqlite`).

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous serez redirigé
vers la page de connexion. Des données de démonstration (classes,
enseignants, élèves, parents, notes, devoirs, cours, absences, annonces et
messages fictifs) sont générées automatiquement au premier lancement, avec un
compte par rôle :

| Rôle | Identifiant | Mot de passe |
| --- | --- | --- |
| Élève | `KLNE2026-0001` | `kalan2026` |
| Professeur | `KLNP2026-0001` | `kalan2026` |
| Parent (2 enfants) | `KLNPA2026-0001` | `kalan2026` |
| Direction | `KLND2026-0001` | `kalan2026` |
| Secrétariat | `KLNS2026-0001` | `kalan2026` |
| Comptabilité | `KLNC2026-0001` | `kalan2026` |

Pour repartir d'une base vide, supprimez le dossier `data/` puis relancez
l'application.

## Portée actuelle et prochaines étapes

Cette version est volontairement **mono-école**. Elle couvre les 4 rôles
(Élève, Professeur, Parent, École) avec authentification réelle. Sont
explicitement hors-périmètre pour l'instant, à ajouter dans une phase
ultérieure si besoin :

- **Multi-écoles** : plusieurs établissements clients + un rôle Super Admin
  Kalan avec vue globale et abonnements.
- **Finances** : paiements de scolarité, factures, relances, Mobile Money.
- **Emploi du temps** : grille horaire par classe.
- **Quiz interactifs**, **génération de documents PDF** (attestations,
  bulletins officiels) et **notifications SMS** aux parents.

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
