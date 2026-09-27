# GymTrack — suivi de séances + nutrition

App perso : suivi de séances de musculation (1324 exercices via le dataset
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset))
+ suivi nutritionnel avec scan de codes-barres (API [OpenFoodFacts](https://world.openfoodfacts.org), gratuite, sans clé).

Stack : Next.js 14 (App Router, TS) + Prisma + Postgres (Vercel Postgres / Neon) + Tailwind + html5-qrcode.

## 1. Installation locale

```bash
npm install
cp .env.example .env.local   # remplis avec les URLs de ta DB (étape 2)
npm run db:push              # crée les tables
npm run import:exercises     # importe les 1324 exercices (~1-2 min)
npm run dev
```

## 2. Créer la base de données (Vercel Postgres)

1. Sur ton projet Vercel → onglet **Storage** → **Create Database** → **Postgres** (propulsé par Neon, gratuit sur le plan Hobby).
2. Vercel génère automatiquement les variables `POSTGRES_PRISMA_URL` et
   `POSTGRES_URL_NON_POOLING` et les injecte dans le projet — récupère-les
   dans **Settings → Environment Variables** pour ton `.env.local` en local.

## 3. Déployer sur ton nom de domaine

1. Pousse le repo sur GitHub, importe-le sur [vercel.com/new](https://vercel.com/new).
2. Ajoute les variables d'env (ou laisse Vercel les lier automatiquement si la DB est créée depuis le même projet).
3. Dans les Build Settings, le build command est déjà `prisma generate && next build` (voir `package.json`).
4. Une fois déployé : **Settings → Domains** → ajoute ton domaine, suis les instructions DNS (CNAME/A record chez ton registrar).
5. Connecte-toi en SSH/Vercel CLI une fois pour lancer `npm run import:exercises` contre la DB de prod (ou exécute-le en local en pointant `POSTGRES_*` vers la prod).

## Fonctionnalités v1

- **Exercices** : recherche + filtre par catégorie/équipement, fiche détail avec GIF + instructions en français (dataset multilingue).
- **Séances** : création de séance, ajout d'exercices, log des séries (poids × reps), historique.
- **Nutrition** : scan de code-barres (caméra du téléphone, via `html5-qrcode`) → lookup OpenFoodFacts → log automatique des macros ; ajout manuel possible ; totaux du jour vs objectifs (`/api/goals`).

## Pistes pour la v2

- Authentification (actuellement mono-utilisateur, pas d'auth — à ajouter avant de partager le lien).
- Graphiques de progression (charge max par exercice, évolution du poids de corps).
- PWA (installable, mode hors-ligne pour le scan).
- Templates de séances réutilisables.
