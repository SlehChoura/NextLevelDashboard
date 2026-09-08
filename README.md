# NextLevelDashboard

Application web pour consultants en cybersécurité : transformez un fichier Excel ou CSV de
suivi en dashboard de reporting, analysé par l'IA (Claude), avec une charte graphique
personnalisable.

Les rapports générés restent stockés dans le navigateur (`localStorage`), rien n'est envoyé à
un serveur applicatif. En revanche, générer un dashboard envoie le contenu du fichier analysé à
l'API d'Anthropic, avec la clé API personnelle de l'utilisateur (voir « Analyse IA » ci-dessous).

## Fonctionnalités

- **Analyse IA** (nécessite une clé API Anthropic personnelle) : dépôt d'un fichier `.xlsx` /
  `.xls` / `.csv` quelconque, sans template ni format de colonnes imposé. L'IA (Claude) détermine
  elle-même les critères pertinents à suivre — utile par exemple pour un portefeuille de cas
  d'usage IA suivi selon des critères comme la portabilité, la documentation, la formation ou
  l'adoption par la communauté. Elle peut aussi déduire une valeur qui n'est pas une colonne
  explicite du fichier (ex : un niveau de maturité à partir d'un commentaire libre). La clé API
  et le modèle choisi sont stockés uniquement dans le `localStorage` du navigateur ; le contenu
  du fichier est envoyé directement du navigateur vers l'API Anthropic (pas de backend
  intermédiaire).
- **Relecture et correction avant génération** : l'analyse de l'IA n'est jamais appliquée à
  l'aveugle. Un écran de relecture affiche sa synthèse, les critères qu'elle a détectés (libellé,
  type, rôle, modifiables ou supprimables), un comparatif entre le nombre de lignes non vides du
  fichier et le nombre de lignes retenues comme données réelles (avec alerte si l'écart est
  important — l'IA a pu en oublier), et les données ligne par ligne (éditables, lignes
  ajoutables/supprimables) — utile par exemple pour retirer une ligne de légende que l'IA aurait
  mal identifiée comme une donnée, ou pour compléter des lignes manquantes, avant de confirmer la
  génération du dashboard.
- **Édition après génération** : le bouton « Modifier les données » du dashboard rouvre le même
  écran de relecture/édition sur un rapport déjà généré — pour ajouter, corriger ou supprimer des
  lignes ou des critères à tout moment, sans avoir à relancer une analyse IA.
- **Dashboard généré** : synthèse RAG, indicateurs clés, graphiques (barres/anneau) par
  critère, tableau de données, export PDF (impression navigateur).
- **Charte graphique** : thème par défaut inspiré de l'identité Wavestone (encre foncée +
  framboise), 3 autres palettes neutres, et un éditeur complet (couleurs, logo, nom) pour
  s'adapter à n'importe quelle charte — la vôtre ou celle d'un client.

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

## Stack technique

- React + TypeScript + Vite
- Tailwind CSS v4 (thème piloté par variables CSS, appliquées dynamiquement par `ThemeProvider`)
- `xlsx` (SheetJS, build CDN patché — la version npm publique porte des CVE non corrigées) pour
  la lecture des fichiers Excel
- `@anthropic-ai/sdk` (appelé directement depuis le navigateur) + `zod` pour l'analyse IA et la
  génération du schéma de dashboard (sortie structurée validée)
- `recharts` pour les graphiques
- `zustand` (avec persistance `localStorage`) pour l'état des rapports, du thème et des
  paramètres IA
- `react-router-dom` pour la navigation

## Structure

```
src/
  types.ts            Modèle de données (critères, dashboard, rapports, thème)
  themes/               Palettes prédéfinies + application des variables CSS
  store/                État global (rapports, thème, paramètres IA), persisté en localStorage
  lib/                  Parsing Excel, appel à l'API Anthropic + schéma de sortie structurée
  components/           Composants réutilisables (dashboard, graphiques, thème)
  pages/                Pages routées (accueil, analyse IA, dashboard, mes rapports, thème)
```

## Notes de conception

- **Charte Wavestone** : la palette fournie est une base indicative (encre foncée + framboise),
  pas une reproduction officielle de la charte graphique du cabinet. Pour un rendu fidèle,
  utilisez l'éditeur de thème (page « Charte graphique ») pour saisir vos codes couleur et
  importer votre logo officiels.
- **Export PDF** : réalisé via l'impression navigateur (`window.print()`) avec une feuille de
  style dédiée à l'impression plutôt qu'une librairie de rendu canvas, pour un rendu texte net
  et un poids d'application réduit.
- **Fichiers volumineux** : seules les 300 premières lignes du fichier sont envoyées à l'IA pour
  analyse (coût et fiabilité de la réponse) ; le dashboard le signale si le fichier a été tronqué.
