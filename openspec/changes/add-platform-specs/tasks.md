# Tasks: add-platform-specs

## Scope

**Version standalone** : Tools et games autonomes uniquement, pas de backend.

## Phase 1 : Specs fondamentales

- [x] Créer `openspec/specs/platform/spec.md`
  - Architecture globale (standalone)
  - Stack technique justifié
  - Structure des dossiers
  - Système de build

- [x] Créer `openspec/specs/catalogue/spec.md`
  - Format du fichier `catalogue.json`
  - Structure des entrées (tools et games)
  - Script de génération (scan des manifests)
  - Utilisation par le frontend

- [x] Créer `openspec/specs/seeded-random/spec.md`
  - Interface SeededRandom
  - Algorithme (Mulberry32 ou autre)
  - Exemples d'utilisation

## Phase 2 : Specs des composants

- [x] Créer `openspec/specs/game-engine/spec.md`
  - Interface GameEngine<TState, TAction, TPlayerView, TConfig>
  - Contraintes (isomorphisme, pureté, déterminisme)
  - Gestion des tours (tour par tour)
  - Gestion des ticks (temps réel)
  - Méthodes obligatoires vs optionnelles

- [x] Créer `openspec/specs/bot/spec.md`
  - Interface Bot abstraite (isomorphe client/serveur)
  - Configuration slots joueurs (humain/bot/disabled)
  - Types de bots (Random, Greedy, Minimax)
  - Game Runner pour orchestrer la partie
  - Bots par défaut en mode solo

- [x] Créer `openspec/specs/manifests/spec.md`
  - Interface ToolManifest
  - Interface GameManifest (+ controls, orientation, bots)
  - Schémas JSON (validation)
  - Exemples complets

## Phase 2b : Specs interface utilisateur

- [x] Créer `openspec/specs/portal/spec.md`
  - Écrans (catalogue, jeu, settings)
  - Game Loader (iframe sandboxé)
  - Filtrage et recherche
  - Communication iframe ↔ portail
  - Préférences utilisateur

- [x] Créer `openspec/specs/gamekit/spec.md`
  - API GameKit (init, scores, progression)
  - Asset Loader (images, sons, JSON)
  - Hooks de cycle de vie
  - Template de jeu minimal

## Phase 3 : Mise à jour documentation

- [ ] Mettre à jour `docs/CONCEPTS.md`
  - Ajouter références vers les specs
  - Ajouter concept de Catalogue

- [ ] Mettre à jour `docs/FEATURES.md`
  - Lier les features aux specs concernées

- [ ] Mettre à jour `CLAUDE.md`
  - Ajouter section références specs techniques

## Phase 4 : Validation

- [ ] Relire toutes les specs pour cohérence
- [ ] Vérifier que les interfaces TypeScript compilent
- [ ] S'assurer que les exemples sont fonctionnels

## Specs reportées (version avec backend)

Les tâches suivantes seront créées dans une future proposal :

- Créer `openspec/specs/sdk/spec.md` (PlayLabSDK)
- Créer `openspec/specs/websocket/spec.md` (protocole temps réel)
