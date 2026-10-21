# NextLevelDashboard

Application web de pilotage des agents IA4CYB, à la charte graphique officielle Wavestone : page
d'accueil avec les KPI clés (agents, agents industrialisés, missions réalisées, agents prêts pour
un client), un dashboard unique des agents, les objectifs du pilotage et les actions associées.

Toutes les données proviennent d'**un seul fichier Excel à 3 onglets** (« Suivi pilotage »,
« Actions », « Agents IA4CYB »). La page dédiée « Mise à jour des données » (`#/donnees`,
accessible par le lien discret « Données JJ/MM » de l'en-tête) réimporte ce fichier et rafraîchit
tout en une fois ; elle propose aussi le fichier actuel à télécharger et l'historique des mises à
jour. L'import est entièrement local et
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
  statut à choix, texte libre) est déduit de ses valeurs, sauf « Propale type » et « Agent
  industrialisé » (toujours Oui/Non,
  vide = Non, « En cours » si la propale est en préparation) et les compteurs « Nombre de… » (toujours un nombre, vide = 0).
- **Un seul dashboard** : pas de liste de rapports. « Modifier les données » ouvre un écran de
  correction (critères et lignes éditables) ; le titre et les informations du dashboard se
  modifient depuis son en-tête.
- **Historique des mises à jour** : chaque import enregistre une photo des chiffres. L'accueil et
  la synthèse affichent « Depuis la dernière mise à jour » : progrès des objectifs et des agents,
  et **cibles révisées** signalées à part. Sur la page Pilotage, une carte indique quand un
  objectif n'est atteint que grâce à une cible abaissée.
- **Synthèse comité** (`#/synthese`) : une page A4 imprimable (chiffres clés, évolutions,
  objectifs, actions à arbitrer, agents prêts pour un client), avec le détail par agent en annexe
  sur la page suivante.
- **Navigation** : les tuiles KPI de l'accueil mènent à leur détail ; l'indicateur « Agents
  industrialisés » (accueil, carte du pilotage, page KPI, dashboard) ouvre la liste des agents
  marqués « Oui » en « Agent industrialisé » (colonne K de l'onglet agents). La page Actions filtre
  les actions en retard et les regroupe par porteur.
- **Dashboard généré** : synthèse RAG, indicateurs clés, mise en avant des éléments dont le statut
  est « présentable » ou « déployable » en contexte client, graphiques (barres/anneau) par
  critère, tableau de données, export PDF (impression navigateur).
- **Interface aux couleurs Wavestone** : barre latérale et bandeaux sur le dégradé bleu signature,
  « line concept » (deux lignes qui se rejoignent), Energy Green en touche d'accent, cartes à rayon
  18 px et ombres bleutées, pictogrammes au trait (Lucide, à la place des emojis que la charte
  proscrit), tuiles KPI avec mini-courbe de l'historique. Navigation en tiroir sur mobile.

## Sécurité et confidentialité

- **Données intégrées au site** : les données de référence (`src/lib/seedData.ts`,
  `src/lib/pilotage.ts`) sont compilées dans le site publié. Tant que le dépôt et GitHub Pages
  sont publics, elles (noms des porteurs compris) sont lisibles par tous.
- **Politique de sécurité du contenu** : injectée dans le site publié (`vite.config.ts`). Seuls
  les fichiers du site et la police Poppins (Google Fonts) sont autorisés ; aucun appel réseau
  vers un autre service n'est possible.
- **Import** : fichiers de plus de 5 Mo refusés sans être lus.
- **Poste partagé** : « Effacer les données de ce navigateur » (page Données) supprime imports,
  actions, historique et corrections enregistrés localement.

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
statut ou échéance illisible, doublon, valeur non numérique… Les chiffres saisis dans deux onglets
sont aussi comparés (« Agents disponibles » et nombre d'agents listés, « Publication AI Showcase » et
nombre de « Oui » dans l'onglet agents, « Agents industrialisés » et colonne « Agent
industrialisé ») et tout écart est signalé « à vérifier ». Une clé d'action utilisée deux fois
est aussi signalée. L'import est
appliqué malgré tout.

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

### Mise en ligne d'une nouvelle version

Chaque page est chargée depuis un fichier dont le nom change à chaque build. Pour qu'un onglet
ouvert avant une mise en ligne ne tombe pas sur une page blanche :

- toutes les pages sont préchargées dès l'ouverture du site ;
- un fichier introuvable déclenche un rechargement unique de la dernière version, en contournant
  le cache de la page d'accueil (`src/lib/staleVersion.ts`) ;
- une page en erreur affiche un message (recharger, ou effacer les données du navigateur) sans
  faire disparaître le menu ni les autres pages (`PageErrorBoundary`).

## Stack technique

- React + TypeScript + Vite
- Tailwind CSS v4 (charte graphique pilotée par variables CSS, définies dans `src/index.css`)
- `xlsx` (SheetJS, build CDN patché — la version npm publique porte des CVE non corrigées) pour
  la lecture des fichiers Excel
- `recharts` pour les graphiques, `lucide-react` pour les pictogrammes
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
  components/           Composants réutilisables (ui/ : carte, en-tête de page, line concept,
                          mini-courbe, anneau de progression ; dashboard, graphiques, correction)
  pages/                Pages routées (accueil, dashboard, synthèse, pilotage, actions, KPI,
                          mise à jour des données)
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
