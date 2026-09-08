# NextLevelDashboard

Application web pour consultants en cybersécurité : transformez un fichier Excel ou CSV de
suivi de cas d'usage en dashboard de reporting, avec une charte graphique personnalisable.

L'application ne prend en charge qu'**un seul format de fichier** : la première colonne liste
les éléments suivis (ex : des agents/cas d'usage IA), les colonnes suivantes portent leurs
critères de reporting (statut, portabilité, documentation…), associés à chacun. L'import est
entièrement local et déterministe (aucune IA, aucune clé API requise) ; une IA optionnelle peut
ensuite clarifier les quelques valeurs de cellules ambiguës que l'import n'aurait pas su
interpréter avec certitude.

Les rapports générés et le fichier importé restent dans le navigateur (`localStorage`), rien
n'est envoyé à un serveur applicatif. Seule exception : si des valeurs ambiguës existent et
qu'une clé API est configurée, ces quelques valeurs (jamais le fichier entier) sont envoyées à
l'API d'Anthropic pour être clarifiées.

## Fonctionnalités

- **Import déterministe** : la première colonne du fichier identifie chaque élément suivi, les
  colonnes suivantes (dont l'en-tête n'est pas vide) deviennent ses critères de reporting. Une
  ligne est reconnue comme donnée réelle si sa première colonne est renseignée — ce qui exclut
  naturellement les blocs de légende ou de notes qui suivent souvent un tableau Excel, sans avoir
  à les deviner. Le type de chaque critère (pourcentage, statut à choix, texte libre) est déduit
  automatiquement des valeurs de sa colonne.
- **Nettoyage IA optionnel** : les valeurs qui ne correspondent pas clairement au type attendu de
  leur critère (ex : `"~99%"`, une faute de frappe, une note en texte libre à la place d'un
  pourcentage) sont proposées à une IA (Claude) pour normalisation, si une clé API personnelle
  est configurée — sinon elles restent éditables manuellement. La clé API et le modèle choisi
  sont stockés uniquement dans le `localStorage` du navigateur ; seules les valeurs ambiguës
  identifiées (pas le fichier) sont envoyées à l'API Anthropic, directement depuis le navigateur.
- **Relecture et correction, avant et après génération** : un écran de relecture affiche les
  critères détectés (libellé, type, rôle — modifiables ou supprimables) et les données ligne par
  ligne (éditables, lignes ajoutables/supprimables) avant de confirmer la génération du dashboard.
  Le bouton « Modifier les données » du dashboard rouvre le même écran sur un rapport déjà
  généré, à tout moment.
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
- `@anthropic-ai/sdk` (appelé directement depuis le navigateur) + `zod` pour le nettoyage IA
  optionnel des valeurs ambiguës (sortie structurée validée)
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
  lib/
    excelImport.ts       Lecture brute d'un classeur Excel/CSV
    fixedFormatImport.ts Mapping déterministe colonne → critère, inférence de type, détection
                          des valeurs ambiguës
    aiAnalysis.ts         Nettoyage IA optionnel des valeurs ambiguës (sortie structurée)
    aiTemplateEdit.ts     Édition du schéma/des données (relecture, dashboard déjà généré)
  components/           Composants réutilisables (dashboard, graphiques, thème, relecture IA)
  pages/                Pages routées (accueil, nouveau rapport, dashboard, mes rapports, thème)
```

## Notes de conception

- **Un seul format** : l'application ne devine pas la structure d'un fichier quelconque — elle
  attend toujours la même forme (1re colonne = élément suivi, colonnes suivantes = critères). Ce
  choix élimine les erreurs d'analyse (confusion avec un bloc de légende, oubli de lignes) qu'une
  IA à qui l'on demanderait de reconstruire le schéma à chaque import peut produire.
- **Charte Wavestone** : la palette fournie est une base indicative (encre foncée + framboise),
  pas une reproduction officielle de la charte graphique du cabinet. Pour un rendu fidèle,
  utilisez l'éditeur de thème (page « Charte graphique ») pour saisir vos codes couleur et
  importer votre logo officiels.
- **Export PDF** : réalisé via l'impression navigateur (`window.print()`) avec une feuille de
  style dédiée à l'impression plutôt qu'une librairie de rendu canvas, pour un rendu texte net
  et un poids d'application réduit.
