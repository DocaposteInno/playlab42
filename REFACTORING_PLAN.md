# Plan de Refactoring - Playlab42

## Objectif
Découper app.js (1350 lignes) et ParcoursViewer (609 lignes) en modules maintenables.

## Architecture Cible

### app.js → modules
```
app/
├── state.js          ✅ État global
├── storage.js        ✅ localStorage operations  
├── dom-cache.js      ✅ Cache éléments DOM
├── ui/
│   ├── tabs.js       - Gestion tabs
│   ├── catalogue.js  - Rendu catalogue (tools/games)
│   ├── parcours.js   - Rendu parcours
│   ├── bookmarks.js  - Rendu bookmarks
│   └── game.js       - Interface jeu
├── router.js         - Routing hash
└── main.js           - Point d'entrée
```

### ParcoursViewer → classes
```
lib/parcours/
├── ParcoursViewer.js    - Orchestration principale
├── ParcoursUI.js        - Rendu HTML
├── ParcoursNavigation.js - Navigation
└── ParcoursProgress.js   - Gestion progression
```

## Étape 1 : Modules de base ✅
- state.js
- storage.js  
- dom-cache.js

## Étape 2 : Créer app-new.js
Nouveau point d'entrée qui importe les modules et reconstruit la logique.

## Étape 3 : Tests
Vérifier que tout fonctionne.

## Étape 4 : ParcoursViewer
Découper en classes séparées.

## Étape 5 : Migration finale
Remplacer app.js par la version modulaire.
