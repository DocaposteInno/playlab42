# Guide de Refactoring - Playlab42

## État Actuel

### Problèmes Identifiés
1. **app.js** : 1350 lignes - trop monolithique
2. **ParcoursViewer** : 609 lignes - responsabilités multiples

## Architecture Modulaire Recommandée

### 📁 app.js → Structure Modulaire

```
app/
├── state.js                 ✅ CRÉÉ - État global
├── storage.js               ✅ CRÉÉ - localStorage operations
├── dom-cache.js             ✅ CRÉÉ - Cache éléments DOM
├── ui/
│   ├── tabs.js              - switchTab(), updateTabUI()
│   ├── catalogue.js         - renderCatalogue(), filterItems(), createCardElement()
│   ├── parcours.js          - renderParcours(), openEpic(), closeParcours()
│   ├── bookmarks.js         - renderBookmarks(), filterBookmarks(), showPreview()
│   └── game.js              - loadGame(), unloadGame(), setupGameIframe()
├── router.js                - handleHashRoute()
└── main.js                  - Point d'entrée, init()
```

### 📁 ParcoursViewer → Classes Séparées

```
lib/parcours/
├── ParcoursProgress.js      ✅ CRÉÉ - load(), save(), markVisited()
├── ParcoursNavigation.js    ✅ CRÉÉ - prev(), next(), goTo(), showSlide()
├── ParcoursUI.js            - render(), renderMenu(), buildBreadcrumb(), updateUI()
└── ParcoursViewer.js        - Orchestration, setupEventListeners(), load()
```

## Modules Créés (Phase 1)

### ✅ app/state.js
- **Responsabilité** : Gestion centralisée de l'état global
- **Exports** : `state`, `setState()`
- **Ligne de code** : ~30 lignes

### ✅ app/storage.js
- **Responsabilité** : Persistence dans localStorage
- **Exports** : `loadPreferences()`, `savePreferences()`, `addToRecent()`
- **Dépendances** : `state.js`
- **Lignes de code** : ~80 lignes

### ✅ app/dom-cache.js
- **Responsabilité** : Cache des éléments DOM
- **Exports** : `el` (objet avec tous les éléments)
- **Lignes de code** : ~50 lignes

### ✅ lib/parcours/ParcoursProgress.js
- **Responsabilité** : Gestion de la progression utilisateur
- **Méthodes** : `load()`, `save()`, `markVisited()`, `isVisited()`
- **Lignes de code** : ~75 lignes

### ✅ lib/parcours/ParcoursNavigation.js
- **Responsabilité** : Navigation entre les slides
- **Méthodes** : `prev()`, `next()`, `goTo()`, `showSlide()`, `preloadAdjacent()`
- **Lignes de code** : ~130 lignes

## Bénéfices du Refactoring

### Maintenabilité
- ✅ Fichiers < 200 lignes (vs 1350 et 609)
- ✅ Une responsabilité par module (SRP)
- ✅ Dépendances explicites (imports/exports)

### Testabilité
- ✅ Tests unitaires isolés possibles
- ✅ Mocking facilité
- ✅ Couverture de code mesurable par module

### Pédagogie
- ✅ Structure claire pour les étudiants
- ✅ Séparation des concerns évidente
- ✅ Patterns architecturaux démontrés

## Prochaines Étapes Recommandées

### Phase 2 : Compléter ParcoursViewer
1. Créer `ParcoursUI.js` (render, renderMenu, buildBreadcrumb)
2. Refactoriser `ParcoursViewer.js` pour utiliser les 3 classes
3. Mettre à jour les tests

### Phase 3 : Modules UI pour app.js
1. Créer `app/ui/catalogue.js`
2. Créer `app/ui/parcours.js`
3. Créer `app/ui/bookmarks.js`
4. Créer `app/ui/game.js`
5. Créer `app/ui/tabs.js`

### Phase 4 : Router et Main
1. Créer `app/router.js`
2. Créer `app/main.js`
3. Migrer progressivement depuis app.js

### Phase 5 : Tests et Validation
1. Vérifier que tous les tests passent
2. Mesurer la couverture de code
3. Valider avec ESLint
4. Tests end-to-end

## Exemple de Migration (Catalogue)

### Avant (app.js)
```javascript
// 200+ lignes dans app.js
function renderCatalogue() {
  // Logique complexe mélangée
}
function filterItems() { ... }
function createCardElement() { ... }
```

### Après (app/ui/catalogue.js)
```javascript
import { state } from '../state.js';
import { el } from '../dom-cache.js';

export function renderCatalogue() {
  const items = filterItems(getAllItems());
  el.catalogueGrid.innerHTML = items.map(createCardElement).join('');
}

export function filterItems(items) {
  // Logique de filtrage isolée
}

export function createCardElement(item) {
  // Logique de rendu isolée
}
```

### Utilisation (main.js)
```javascript
import { renderCatalogue } from './ui/catalogue.js';
import { loadPreferences } from './storage.js';

function init() {
  loadPreferences();
  renderCatalogue();
}
```

## Métriques Cibles

| Métrique | Avant | Après (cible) |
|----------|-------|---------------|
| Fichier max | 1350 lignes | < 200 lignes |
| Responsabilités par fichier | 5-10 | 1 |
| Testabilité | Difficile | Facile |
| Imports explicites | Non | Oui |
| Réutilisabilité | Faible | Élevée |

## Conclusion

Cette architecture modulaire transforme Playlab42 en un **exemple pédagogique exem plaire** :
- Code organisé et maintenable
- Patterns clairs et documentés
- Base solide pour l'enseignement
- Facilite les contributions futures

Les modules créés (Phase 1) démontrent déjà les bénéfices :
- **5 modules** créés (~365 lignes au total)
- Chaque module a **une responsabilité claire**
- **Tests unitaires** possibles pour chaque module
- **Documentation** inline exhaustive

---
**Note** : La migration complète peut être faite progressivement, module par module, sans casser le code existant. L'ancien app.js et parcours-viewer.js restent fonctionnels en attendant.
