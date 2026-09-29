# NextLevelDashboard

Application web pour consultants en cybersécurité : transformez un fichier Excel ou CSV de
suivi de cas d'usage en dashboard de reporting, à la charte graphique officielle Wavestone.

L'application ne prend en charge qu'**un seul format de fichier** : la première colonne liste
les éléments suivis (ex : des agents/cas d'usage IA), les colonnes suivantes portent leurs
critères de reporting (statut, portabilité, documentation…), associés à chacun. L'import est
entièrement local et déterministe (aucune IA, aucune clé API requise) ; une IA optionnelle peut
ensuite clarifier les quelques valeurs de cellules ambiguës que l'import n'aurait pas su
interpréter avec certitude.

Les rapports générés et le fichier importé restent dans le navigateur (`localStorage`), rien
n'est envoyé à un serveur applicatif. Deux exceptions : (1) si des valeurs ambiguës existent et
qu'une clé API est configurée, ces quelques valeurs (jamais le fichier entier) sont envoyées à
l'API d'Anthropic pour être clarifiées ; (2) si la synchronisation SharePoint (optionnelle) est
configurée et utilisée, le fichier Excel est lu directement depuis le navigateur via l'API
Microsoft Graph, avec le compte et les autorisations de l'utilisateur connecté — voir
[Synchronisation SharePoint](#synchronisation-sharepoint).

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
- **Mise à jour depuis un nouveau fichier** : le bouton « Mettre à jour avec un fichier » du
  dashboard réimporte un fichier plus récent (même suivi, export à jour) et remplace les critères
  et données du rapport après relecture — sans créer un nouveau rapport ni perdre son titre/client.
- **Dashboard généré** : synthèse RAG, indicateurs clés, mise en avant des éléments dont le statut
  est « présentable » ou « déployable » en contexte client, graphiques (barres/anneau) par
  critère, tableau de données, export PDF (impression navigateur).
- **Charte graphique Wavestone** : couleurs, logo et police (Poppins) conformes à la charte
  graphique officielle Wavestone, fixes (aucun éditeur de thème dans l'application).
- **Synchronisation SharePoint (optionnelle)** : en se connectant avec son propre compte
  Microsoft, récupère automatiquement les dernières valeurs du fichier Excel de pilotage IA4CYB
  partagé sur SharePoint — à la connexion, à l'ouverture de la page et à intervalle régulier.
  Nécessite une configuration préalable (app registration Azure AD) — voir
  [Synchronisation SharePoint](#synchronisation-sharepoint).

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

## Synchronisation SharePoint

Fonctionnalité optionnelle : récupère automatiquement les valeurs du fichier Excel de pilotage
IA4CYB partagé sur SharePoint (mêmes onglets que le modèle combiné — « Suivi pilotage »,
« Actions », « Agents IA4CYB »), **avec le compte et les autorisations de l'utilisateur
connecté** (jamais un compte de service). Techniquement : connexion Microsoft déléguée
(OAuth2/PKCE, [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js)) puis
lecture du fichier via l'API Microsoft Graph (`GET /shares/{shareId}/driveItem/content`), le tout
directement depuis le navigateur — cohérent avec une application 100 % statique, sans backend.
Aucun mot de passe ni jeton n'est géré ou stocké par l'application elle-même : l'authentification
et les jetons d'accès sont entièrement gérés par MSAL.js face à Microsoft.

Sans configuration, cette fonctionnalité est simplement **désactivée** (la carte « Synchronisation
SharePoint » de la page d'accueil l'indique) — l'import manuel du fichier Excel reste disponible
dans tous les cas.

### 1. Créer une app registration Azure AD (Entra ID)

Cette étape ne peut être réalisée que par vous (ou un administrateur de votre tenant Microsoft
365) — elle nécessite un accès au [portail Azure](https://portal.azure.com) de l'organisation
propriétaire du fichier SharePoint (ici `digiplace.sharepoint.com`).

1. **Azure Portal → Microsoft Entra ID → App registrations → New registration.**
2. Nom : par exemple `Dashboard IA4CYB`.
3. Comptes pris en charge : *Comptes dans cet annuaire organisationnel uniquement* (recommandé,
   limite la connexion aux comptes du tenant propriétaire du fichier).
4. Redirect URI : plateforme **Single-page application (SPA)**, valeur = l'URL exacte à laquelle
   le dashboard est/sera publié (ex. `https://<org>.github.io/NextLevelDashboard/`, slash final
   inclus). Ajoutez aussi `http://localhost:5173/` si vous testez en local (`npm run dev`).
5. Une fois créée, notez sur la page *Overview* : **Application (client) ID** et
   **Directory (tenant) ID**.
6. **API permissions → Add a permission → Microsoft Graph → Delegated permissions →
   `Files.Read.All`** → Add permissions. Si votre tenant l'exige, un administrateur doit ensuite
   cliquer sur **Grant admin consent**.
7. Aucun secret client n'est nécessaire (l'app est un client public SPA, authentification par
   PKCE) — ne créez pas de "Client secret".

### 2. Configurer l'application

- **En local** : copiez `.env.example` en `.env.local` et renseignez `VITE_MSAL_CLIENT_ID` (et
  `VITE_MSAL_TENANT_ID`, sinon la valeur par défaut `organizations` est utilisée — à réserver
  aux tenants qui l'acceptent, sinon renseignez l'ID précis obtenu à l'étape précédente).
- **Pour le déploiement GitHub Pages** (`deploy-pages.yml` / `publish-static-site.yml`) : ajoutez
  deux secrets au dépôt (*Settings → Secrets and variables → Actions → New repository secret*) :
  `MSAL_CLIENT_ID` et `MSAL_TENANT_ID`. Les workflows les injectent automatiquement au build
  suivant. Un déploiement sans ces secrets reste valide, la fonctionnalité est alors désactivée.

Le fichier SharePoint synchronisé est déclaré en dur dans `src/lib/sharePointSync.ts`
(`SHAREPOINT_FILE_URL`) — changez cette constante si l'emplacement du fichier de pilotage évolue.

## Stack technique

- React + TypeScript + Vite
- Tailwind CSS v4 (charte graphique pilotée par variables CSS, définies dans `src/index.css`)
- `xlsx` (SheetJS, build CDN patché — la version npm publique porte des CVE non corrigées) pour
  la lecture des fichiers Excel
- `@anthropic-ai/sdk` (appelé directement depuis le navigateur) + `zod` pour le nettoyage IA
  optionnel des valeurs ambiguës (sortie structurée validée)
- `recharts` pour les graphiques
- `zustand` (avec persistance `localStorage`) pour l'état des rapports et des paramètres IA
- `react-router-dom` pour la navigation
- `@azure/msal-browser` pour la connexion Microsoft déléguée (synchronisation SharePoint,
  optionnelle)

## Structure

```
src/
  types.ts            Modèle de données (critères, dashboard, rapports)
  store/                État global (rapports, pilotage, actions, paramètres IA), persisté en
                          localStorage
  hooks/
    useFileImport.ts     Import + nettoyage IA optionnel, partagé entre nouveau rapport et
                          mise à jour d'un rapport existant
    useCombinedImport.ts Application du fichier combiné aux stores, partagée entre l'import
                          manuel (accueil, pilotage) et la synchronisation SharePoint
    useSharePointSync.ts Connexion Microsoft, synchronisation à l'ouverture et périodique
  lib/
    excelImport.ts       Lecture brute d'un classeur Excel/CSV
    fixedFormatImport.ts Mapping déterministe colonne → critère, inférence de type, détection
                          des valeurs ambiguës, détection des statuts "prêts client"
    aiAnalysis.ts         Nettoyage IA optionnel des valeurs ambiguës (sortie structurée)
    aiTemplateEdit.ts     Édition du schéma/des données (relecture, dashboard déjà généré)
    combinedImport.ts     Import/export du fichier combiné (pilotage, actions, dashboard)
    sharePointSync.ts     Connexion Microsoft (MSAL.js) et lecture du fichier SharePoint
                          (Microsoft Graph), avec le compte de l'utilisateur connecté
  components/           Composants réutilisables (dashboard, graphiques, relecture IA)
  pages/                Pages routées (accueil, nouveau rapport, dashboard, mes rapports,
                          pilotage, actions, KPI)
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
