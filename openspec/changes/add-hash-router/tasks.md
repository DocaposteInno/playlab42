# Tasks: Système de Navigation Hash Router

## Phase 1: Infrastructure Router

- [x] Créer `lib/router.js` avec le module de routing
  - [x] Parser le hash URL
  - [x] Matcher les routes avec paramètres
  - [x] Gérer l'événement `hashchange`
  - [x] Exposer `navigate(route)` et `getCurrentRoute()`

- [x] Ajouter tests unitaires pour le router
  - [x] Test parsing des routes
  - [x] Test extraction des paramètres
  - [x] Test matching des patterns

## Phase 2: Intégration dans le portail

- [x] Refactorer `app.js` pour utiliser le router
  - [x] Initialiser le router au démarrage
  - [x] Remplacer `loadGame()` par navigation hash
  - [x] Remplacer `showCatalogue()` par navigation hash
  - [x] Gérer la route initiale au chargement

- [x] Mettre à jour `index.html`
  - [x] Les liens sont générés dynamiquement via templates
  - [x] Les événements click utilisent navigate() via délégation

## Phase 3: Navigation parcours

- [x] Intégrer le router avec `parcours-viewer.js`
  - [x] Synchroniser le hash avec la slide courante (via replaceRoute)
  - [x] Permettre navigation directe vers une slide

## Phase 4: Nettoyage

- [x] Supprimer les chemins absolus inutiles des jeux/tools
  - [x] `games/checkers/index.html`
  - [x] `games/tictactoe/index.html`
  - [x] `tools/json-formatter.html`
  - [x] Slides des parcours (17 fichiers)
  - [x] Documentation (`docs/guides/*.md`)
  - [x] Specs (`openspec/specs/gamekit/spec.md`)

- [x] Mettre à jour la documentation
  - [x] `docs/guides/architecture.md` - commentaires sur chemins relatifs
  - [x] Les autres guides utilisent maintenant des chemins relatifs

## Phase 5: Specs

- [x] Mettre à jour `openspec/specs/portal/spec.md`
  - [x] Documenter le système de routing
  - [x] Ajouter les routes supportées
  - [x] Ajouter le requirement Hash Routing
  - [x] Documenter l'API du router

## Critères de validation

- [x] Module router créé avec tests (31 tests passent)
- [x] Tous les tests passent (254 tests)
- [x] Le bouton précédent/suivant du navigateur fonctionne
- [x] Les URLs sont partageables et bookmarkables
- [x] Pas de régression sur le chargement des jeux/tools
- [x] Les parcours naviguent correctement entre slides
- [ ] Validation manuelle sur GitHub Pages (à faire après déploiement)
