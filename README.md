# NextLevelDashboard

Application web de pilotage des agents IA4CYB, à la charte graphique officielle Wavestone : page
d'accueil avec les KPI clés (agents, agents industrialisés, missions réalisées, agents prêts pour
un client), un dashboard unique des agents, les objectifs du pilotage et les actions associées.

Toutes les données proviennent d'**un seul fichier Excel à 3 onglets** (« Suivi pilotage »,
« Actions », « Agents IA4CYB »). L'encart « Mettre à jour les données » (accueil, dashboard,
pilotage) réimporte ce fichier et rafraîchit tout en une fois. L'import est entièrement local et
déterministe : les données restent dans le navigateur (`localStorage`), rien n'est envoyé à un
serveur.

## Fonctionnalités

- **Mise à jour par import** : le fichier de suivi fait foi. Il met à jour les valeurs et cibles
  du pilotage, remplace la liste des actions et met à jour le dashboard des agents. « Télécharger
  le fichier actuel » fournit le même fichier pré-rempli avec les données en place (agents
  compris), à compléter puis réimporter.
- **Onglet agents** : la première colonne identifie chaque agent, les colonnes suivantes (dont
  l'en-tête n'est pas vide) deviennent ses critères. Une ligne est retenue si sa première colonne
  est renseignée, ce qui exclut les blocs de légende. Le type de chaque critère (pourcentage,
  statut à choix, texte libre) est déduit de ses valeurs, sauf « Propale type » (toujours Oui/Non,
  vide = Non) et les compteurs « Nombre de… » (toujours un nombre, vide = 0).
- **Un seul dashboard** : pas de liste de rapports. « Modifier les données » ouvre un écran de
  correction (critères et lignes éditables) ; le titre et les informations du dashboard se
  modifient depuis son en-tête.
- **Dashboard généré** : synthèse RAG, indicateurs clés, mise en avant des éléments dont le statut
  est « présentable » ou « déployable » en contexte client, graphiques (barres/anneau) par
  critère, tableau de données, export PDF (impression navigateur).
- **Charte graphique Wavestone** : couleurs, logo et police (Poppins) conformes à la charte
  graphique officielle Wavestone, fixes (aucun éditeur de thème dans l'application).

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrez `http://localhost:5173`.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (`tsc -b && vite build`)
- `npm run preview` — prévisualisation du build
- `npm run lint` — lint (oxlint)
- `npm test` — tests automatiques (Vitest) : import du fichier combiné, contrôle de cohérence,
  déduction des types de colonnes, calcul des statuts du pilotage, migration des données
  enregistrées dans le navigateur. Le workflow `.github/workflows/ci.yml` lance lint, tests et
  build sur chaque PR ; les workflows de déploiement ne publient que si les tests passent.

### Import des actions : le fichier fait foi

L'onglet « Actions » remplace intégralement la liste des actions : chaque ligne est rattachée à une
action existante par sa « Clé », ou à défaut par son titre, et une action absente du fichier est
retirée. Réimporter le même fichier (même avec la colonne « Clé » vide) ne crée donc jamais de
doublon. Un onglet « Actions » sans aucune ligne est ignoré plutôt que de tout effacer.

### Contrôle de cohérence du fichier importé

À chaque import global, le fichier est contrôlé et les incohérences qui feraient perdre ou mal
interpréter une donnée sont listées sous le message d'import : colonne sans en-tête ou en-tête
décalé dans l'onglet agents, clé et libellé d'objectif qui ne désignent pas le même objectif,
statut ou échéance illisible, doublon, valeur non numérique… L'import est appliqué malgré tout.

## Déploiement

Le build (`npm run build`) génère un site 100 % statique dans `public/` (HTML/CSS/JS compilés,
chemins relatifs — fonctionne quel que soit le sous-dossier ou domaine sous lequel il est servi,
sans configuration particulière). C'est **uniquement ce dossier** qui doit être exposé
publiquement : jamais la racine du dépôt (code source, `package.json`, configuration
TypeScript/Vite…), qui n'a aucune raison d'être accessible depuis le site publié.

Attention : `public/` porte ici le résultat du build (`build.outDir`), pas le dossier
d'assets statiques bruts habituel de Vite — celui-ci a été renommé en `static/` (favicon…) pour
éviter le conflit.

- **GitHub Pages** : le workflow `.github/workflows/deploy-pages.yml` build et publie `public/`
  automatiquement à chaque push sur `main`, sans passer par une branche.
- **Hébergement pointant directement vers le dépôt Git** (sans étape de build de son côté) :
  - *Avec choix de branche* : le workflow `.github/workflows/publish-static-site.yml` build à
    chaque push sur `main` et publie le contenu sur une branche dédiée `site` (historique à
    plat, régénéré à chaque publication) — pointez votre hébergement sur cette branche plutôt
    que sur `main`.
  - *Avec choix d'un dossier sur `main`* : le dossier `public/` est aussi versionné directement
    sur `main` — pointez votre hébergement sur `main` + dossier `public`. **Ce dossier n'est pas
    régénéré automatiquement** : après toute modification du code, relancez `npm run build` et
    committez le nouveau contenu de `public/` avant de publier (ou demandez la mise en place
    d'une régénération automatique si cet usage devient la norme).
- **Hébergement capable d'exécuter une commande de build** (Netlify, Vercel, PaaS interne…) :
  configurez la commande `npm run build` et le dossier de publication `public`.

## Stack technique

- React + TypeScript + Vite
- Tailwind CSS v4 (charte graphique pilotée par variables CSS, définies dans `src/index.css`)
- `xlsx` (SheetJS, build CDN patché — la version npm publique porte des CVE non corrigées) pour
  la lecture des fichiers Excel
- `recharts` pour les graphiques
- `zustand` (avec persistance `localStorage`) pour l'état du dashboard, du pilotage et des actions
- `react-router-dom` pour la navigation

## Structure

```
src/
  types.ts            Modèle de données (critères, dashboard)
  store/                État global (dashboard, pilotage, actions), persisté en
                          localStorage
  hooks/
    useCombinedImport.ts Application de l'import du fichier de suivi aux stores
  lib/
    excelImport.ts       Lecture brute d'un classeur Excel/CSV
    fixedFormatImport.ts Mapping déterministe colonne → critère, inférence de type, détection
                          des valeurs ambiguës, détection des statuts "prêts client"
    aiTemplateEdit.ts     Édition du schéma/des données (relecture, dashboard déjà généré)
    combinedImport.ts     Import/export du fichier combiné (pilotage, actions, dashboard)
  components/           Composants réutilisables (dashboard, graphiques, écran de correction)
  pages/                Pages routées (accueil, dashboard, pilotage, actions, KPI)
```

## Notes de conception

- **Un seul format** : l'application ne devine pas la structure d'un fichier quelconque — elle
  attend toujours la même forme (1re colonne = élément suivi, colonnes suivantes = critères). Ce
  choix élimine les erreurs d'analyse (confusion avec un bloc de légende, oubli de lignes) qu'une
  IA à qui l'on demanderait de reconstruire le schéma à chaque import peut produire.
- **Charte Wavestone** : couleurs (Vibrant Blue `#451DC7`, Deep Blue `#250F6B`), logo et police
  (Poppins) conformes aux Wavestone Brand Guidelines, fixés dans `src/index.css` — aucun éditeur
  de thème dans l'application, cet outil étant à usage interne exclusivement.
- **Export PDF** : réalisé via l'impression navigateur (`window.print()`) avec une feuille de
  style dédiée à l'impression plutôt qu'une librairie de rendu canvas, pour un rendu texte net
  et un poids d'application réduit.
