# NextLevelDashboard

Application web pour consultants en cybersécurité : transformez un fichier Excel de suivi
(ou une saisie manuelle) en dashboard de reporting, à partir de templates adaptés à des
situations types (suivi de projet, audit/pentest, vulnérabilités, comité de pilotage,
incidents), avec une charte graphique personnalisable.

Application 100 % côté client : aucune donnée (fichiers importés, saisies, rapports) n'est
envoyée à un serveur, tout reste dans le navigateur (`localStorage`) — à l'exception, optionnelle,
de l'analyse IA (voir ci-dessous), qui transmet des extraits de données à l'API Anthropic.

## Fonctionnalités

- **Templates de reporting** : 5 modèles par défaut définissant les critères importants à
  suivre pour une situation donnée (suivi de projet SSI, audit de sécurité / pentest, suivi de
  vulnérabilités, comité de pilotage sécurité, reporting incidents).
- **Import Excel** : dépôt d'un fichier `.xlsx` / `.xls` / `.csv`, reconnaissance automatique
  des colonnes par correspondance avec les libellés/alias de chaque critère, mappage manuel
  ajustable, aperçu avant génération. Un modèle Excel vierge est téléchargeable pour chaque
  template.
- **Saisie via formulaire** (optionnel) : mêmes critères que l'import Excel, saisis ligne par
  ligne, sans fichier.
- **Dashboard généré** : synthèse RAG, indicateurs clés, graphiques (barres/anneau) par
  critère, tableau de données, export PDF (impression navigateur).
- **Charte graphique** : thème par défaut inspiré de l'identité Wavestone (encre foncée +
  framboise), 3 autres palettes neutres, et un éditeur complet (couleurs, logo, nom) pour
  s'adapter à n'importe quelle charte — la vôtre ou celle d'un client.
- **Analyse IA** (optionnelle, page « Assistant IA ») : une fois une clé API Anthropic
  configurée, l'IA peut choisir le template le plus adapté à un fichier Excel déposé et proposer
  une correspondance de colonnes plus fine que la reconnaissance par en-tête seule (elle tient
  compte du sens des en-têtes et des valeurs d'exemple). Utilisable soit dans le flux d'import
  d'un template déjà choisi (bouton « Analyser avec l'IA »), soit via l'entrée dédiée « Laisser
  l'IA choisir » qui détermine aussi le template.

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
  la lecture/génération de fichiers Excel
- `recharts` pour les graphiques
- `zustand` (avec persistance `localStorage`) pour l'état des rapports, du thème et des réglages IA
- `react-router-dom` pour la navigation
- `@anthropic-ai/sdk` + `zod` (sorties structurées) pour l'analyse IA, appelée directement depuis
  le navigateur (option `dangerouslyAllowBrowser`, cf. Notes de conception)

## Structure

```
src/
  types.ts            Modèle de données (critères, templates, rapports, thème)
  templates/           Les 5 templates de reporting par défaut + jeux d'options RAG/sévérité
  themes/               Palettes prédéfinies + application des variables CSS
  store/                État global (rapports, thème, réglages IA), persisté en localStorage
  lib/                  Import Excel, génération de modèle Excel, formatage, mapping de colonnes, analyse IA
  components/           Composants réutilisables (dashboard, graphiques, formulaire, thème)
  pages/                Pages routées (accueil, templates, import, formulaire, dashboard, thème, IA)
```

## Notes de conception

- **Charte Wavestone** : la palette fournie est une base indicative (encre foncée + framboise),
  pas une reproduction officielle de la charte graphique du cabinet. Pour un rendu fidèle,
  utilisez l'éditeur de thème (page « Charte graphique ») pour saisir vos codes couleur et
  importer votre logo officiels.
- **Export PDF** : réalisé via l'impression navigateur (`window.print()`) avec une feuille de
  style dédiée à l'impression plutôt qu'une librairie de rendu canvas, pour un rendu texte net
  et un poids d'application réduit.
- **Validation des critères obligatoires** : les critères marqués obligatoires sont signalés
  visuellement (import et formulaire) mais ne bloquent pas la génération du dashboard — un choix
  volontaire pour ne pas freiner un reporting produit dans l'urgence.
- **Clé API IA côté navigateur** : par cohérence avec l'architecture 100 % client de
  l'application, la clé API est stockée en clair dans le `localStorage` du navigateur et les
  appels partent directement du poste de l'utilisateur (SDK Anthropic avec
  `dangerouslyAllowBrowser: true`). C'est un compromis assumé pour un usage personnel/local par
  un consultant sur son propre poste — l'interface avertit explicitement de ne pas configurer sa
  clé sur un poste partagé ou de déployer l'application publiquement avec une clé préconfigurée. Seuls
  les en-têtes de colonnes et un échantillon limité de lignes (8 lignes, valeurs tronquées) sont
  transmis à l'API, jamais le fichier complet.
