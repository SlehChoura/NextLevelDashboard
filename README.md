# NextLevelDashboard

Application web pour consultants en cybersécurité : transformez un fichier Excel de suivi
(ou une saisie manuelle) en dashboard de reporting, à partir de templates adaptés à des
situations types (suivi de projet, audit/pentest, vulnérabilités, comité de pilotage,
incidents), avec une charte graphique personnalisable.

Application 100 % côté client : aucune donnée (fichiers importés, saisies, rapports) n'est
envoyée à un serveur, tout reste dans le navigateur (`localStorage`).

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
- `zustand` (avec persistance `localStorage`) pour l'état des rapports et du thème
- `react-router-dom` pour la navigation

## Structure

```
src/
  types.ts            Modèle de données (critères, templates, rapports, thème)
  templates/           Les 5 templates de reporting par défaut + jeux d'options RAG/sévérité
  themes/               Palettes prédéfinies + application des variables CSS
  store/                État global (rapports, thème), persisté en localStorage
  lib/                  Import Excel, génération de modèle Excel, formatage, mapping de colonnes
  components/           Composants réutilisables (dashboard, graphiques, formulaire, thème)
  pages/                Pages routées (accueil, templates, import, formulaire, dashboard, thème)
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
