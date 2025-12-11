# Playlab42 - Features MVP

Liste complète des fonctionnalités à implémenter, organisées par phase.

> **Specs techniques** : Voir `openspec/specs/` pour les spécifications détaillées.

---

## Phase 1 : Catalogue statique (sans backend)

### F1. Tools (HTML standalone)

> **Spec** : [manifests/spec.md](../openspec/specs/manifests/spec.md)

- [ ] Structure `tools/` pour les outils
- [ ] Premier tool exemple (JSON formatter ou autre)
- [ ] Convention : un fichier HTML = un outil
- [ ] Manifest `tool.json` pour métadonnées

### F2. Portail et catalogue

> **Specs** : [portal/spec.md](../openspec/specs/portal/spec.md), [catalogue/spec.md](../openspec/specs/catalogue/spec.md)

- [ ] Page d'accueil listant Tools + Games
- [ ] Filtres par tags
- [ ] Recherche par nom, description
- [ ] Chargement en iframe sandboxé
- [ ] Section "Joué récemment"
- [ ] Script de build pour générer `data/catalogue.json`
- [ ] 100% statique, déployable sur GitHub Pages

### F3. Préférences utilisateur

> **Spec** : [portal/spec.md](../openspec/specs/portal/spec.md)

- [ ] Pseudo éditable
- [ ] Son on/off
- [ ] Persistence localStorage
- [ ] Écran Settings

---

## Phase 2 : Games standalone

### F4. Game Engine (isomorphe)

> **Spec** : [game-engine/spec.md](../openspec/specs/game-engine/spec.md)

- [ ] Interface `GameEngine` commune à tous les jeux
- [ ] TypeScript/JavaScript pur, zéro dépendance I/O
- [ ] Tourne côté client ET serveur
- [ ] État 100% sérialisable JSON
- [ ] Fonctions pures et déterministes
- [ ] Random seedé via `SeededRandom`
- [ ] `getValidActions()` pour lister les coups (bots)
- [ ] `getPlayerView()` pour fog of war

### F5. SeededRandom

> **Spec** : [seeded-random/spec.md](../openspec/specs/seeded-random/spec.md)

- [ ] Implémentation Mulberry32
- [ ] Méthodes : `random()`, `int()`, `pick()`, `shuffle()`, `chance()`
- [ ] Clone et sérialisation de l'état

### F6. GameKit SDK

> **Spec** : [gamekit/spec.md](../openspec/specs/gamekit/spec.md)

- [ ] `GameKit.init(name)`
- [ ] Asset Loader (images, sons, JSON)
- [ ] `saveScore()` / `getHighScores()`
- [ ] `saveProgress()` / `loadProgress()`
- [ ] Hooks : `onGamePause`, `onGameResume`, `onSoundChange`, `onGameDispose`
- [ ] Communication postMessage avec le portail

### F7. Bots (IA)

> **Spec** : [bot/spec.md](../openspec/specs/bot/spec.md)

- [ ] Interface `Bot` abstraite
- [ ] Configuration slots joueurs (humain/bot/disabled)
- [ ] Bot Random (par défaut)
- [ ] Bot Greedy (heuristique)
- [ ] Bot Minimax (optionnel, pour jeux 2 joueurs)
- [ ] Game Runner pour orchestrer humains et bots
- [ ] Déclaration des bots dans `game.json`

### F8. Jeu exemple : Tic-Tac-Toe

- [ ] Moteur isomorphe complet
- [ ] Client UI standalone (grille cliquable)
- [ ] Jouable en solo (humain vs bot)
- [ ] Jouable en hot-seat (2 humains)
- [ ] 3 bots : Random, Blocker, Perfect
- [ ] Tests unitaires moteur
- [ ] Documentation règles

---

## Phase 3 : Backend et multi-joueur (future)

> Ces features seront développées dans une version ultérieure.

### F9. Backend API

- [ ] Serveur Node.js (Hono)
- [ ] Auth : register, login, profil
- [ ] Scores et leaderboard partagés
- [ ] Persistence JSON files

### F10. Communication WebSocket

- [ ] Protocole temps réel
- [ ] Sessions de jeu multi-joueurs
- [ ] Gestion des tours et timeout

### F11. PlayLabSDK

- [ ] `window.playlab` injecté par la plateforme
- [ ] Détection auto standalone vs plateforme
- [ ] Communication avec le backend

---

## Phase 4 : Enrichissements (future)

### F12. Jeu exemple 2 : Snake (temps réel)

- [ ] Moteur isomorphe avec tick
- [ ] Client canvas
- [ ] 1-4 joueurs
- [ ] Config : taille terrain, vitesse

### F13. Historique & Records

- [ ] Stockage : seed, joueurs, actions, résultat
- [ ] Replay déterministe
- [ ] Export pour ML

### F14. Entraînement accéléré

- [ ] API bot vs bot
- [ ] Runner CLI
- [ ] Datasets pour ML

---

## Documentation

### Guides

- [ ] Architecture générale
- [ ] Créer un outil (HTML tool)
- [ ] Créer un moteur de jeu
- [ ] Créer un client de jeu
- [ ] Créer un bot

### Templates

- [ ] Template outil HTML
- [ ] Template moteur tour par tour
- [ ] Template moteur temps réel
- [ ] Template bot

---

## Qualité code

- [ ] Code commenté en français
- [ ] Tests unitaires (moteurs, SDK)
- [ ] ESLint strict configuré
- [ ] Types TypeScript exhaustifs
- [ ] Nommage explicite
- [ ] README par module
- [ ] Docker-first (tout containerisé)

---

## Références specs

| Spec | Chemin |
|------|--------|
| Platform | [openspec/specs/platform/spec.md](../openspec/specs/platform/spec.md) |
| Catalogue | [openspec/specs/catalogue/spec.md](../openspec/specs/catalogue/spec.md) |
| SeededRandom | [openspec/specs/seeded-random/spec.md](../openspec/specs/seeded-random/spec.md) |
| GameEngine | [openspec/specs/game-engine/spec.md](../openspec/specs/game-engine/spec.md) |
| Bot | [openspec/specs/bot/spec.md](../openspec/specs/bot/spec.md) |
| Manifests | [openspec/specs/manifests/spec.md](../openspec/specs/manifests/spec.md) |
| Portal | [openspec/specs/portal/spec.md](../openspec/specs/portal/spec.md) |
| GameKit | [openspec/specs/gamekit/spec.md](../openspec/specs/gamekit/spec.md) |
