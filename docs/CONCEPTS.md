# Playlab42 - Concepts et Glossaire

Définitions des termes et concepts utilisés dans le projet.

> **Specs techniques** : Voir `openspec/specs/` pour les spécifications détaillées.

---

## Entités principales

### Tool (Outil)

Un outil HTML standalone, inspiré des "HTML Tools" de Simon Willison :

- **Un fichier** : HTML + CSS + JS dans un seul fichier
- **Autonome** : Ouvrable directement (double-clic)
- **Sans backend** : Tout tourne dans le navigateur
- **Simple** : Quelques centaines de lignes max

```
tools/json-formatter.html    # Double-clic = ça marche !
```

**Exemples** : JSON formatter, Base64 encoder, Color picker, Regex tester...

> **Spec** : [manifests/spec.md](../openspec/specs/manifests/spec.md) - Format `tool.json`

---

### Game (Jeu)

Un jeu est un module complet comprenant :
- Un **moteur** (engine) : logique et règles
- Un **client** : interface utilisateur
- Un **manifest** : métadonnées et configuration
- Des **bots** (optionnel) : IA pour jouer en solo

Chaque jeu est identifié par un `id` unique (kebab-case).

> **Spec** : [manifests/spec.md](../openspec/specs/manifests/spec.md) - Format `game.json`

---

### Game Engine (Moteur de jeu)

Le moteur contient toute la logique du jeu :
- Règles de validation des actions
- Calcul des états successifs
- Détection de fin de partie

**Propriétés essentielles** :
- **Isomorphe** : tourne côté client ET serveur
- **Pur** : pas d'effets de bord, pas d'I/O
- **Déterministe** : même input = même output
- **Seedé** : utilise `SeededRandom` pour l'aléatoire

> **Spec** : [game-engine/spec.md](../openspec/specs/game-engine/spec.md)

---

### Bot (IA)

Un joueur automatique qui remplace les humains :
- **Isomorphe** : tourne client ET serveur
- **Déterministe** : utilise le `SeededRandom` fourni
- **Pluggable** : plusieurs niveaux de difficulté par jeu

En mode solo, les slots non-humains sont automatiquement remplis par le bot par défaut.

> **Spec** : [bot/spec.md](../openspec/specs/bot/spec.md)

---

### Portal (Portail)

L'interface principale de Playlab42 :
- Catalogue des tools et games
- Filtrage par tags, recherche
- Lancement en iframe sandboxé
- Préférences utilisateur (son, pseudo)
- Historique des jeux récents

> **Spec** : [portal/spec.md](../openspec/specs/portal/spec.md)

---

### GameKit (SDK)

Le SDK standardisé pour les jeux :
- Communication avec le portail
- Gestion des assets (images, sons)
- Scores et progression
- Hooks de cycle de vie (pause, resume)

> **Spec** : [gamekit/spec.md](../openspec/specs/gamekit/spec.md)

---

### Catalogue

Base de données JSON des tools et games, générée au build :
- Scanne les manifests (`tool.json`, `game.json`)
- Génère `data/catalogue.json`
- Utilisé par le portail pour afficher les entrées

> **Spec** : [catalogue/spec.md](../openspec/specs/catalogue/spec.md)

---

### SeededRandom

Générateur de nombres pseudo-aléatoires déterministe :
- Algorithme Mulberry32
- Même seed = même séquence
- Essentiel pour le replay et les bots

> **Spec** : [seeded-random/spec.md](../openspec/specs/seeded-random/spec.md)

---

## Configuration de partie

### Player Slot (Slot joueur)

Configuration d'un emplacement joueur :

| Type | Description |
|------|-------------|
| `human` | Joueur humain |
| `bot` | IA (avec choix du bot) |
| `disabled` | Slot désactivé |

En mode standalone, "Multijoueur" est grisé (version future).

---

### Player View (Vue joueur)

Ce qu'un joueur voit de l'état du jeu.
Permet le **fog of war** (informations cachées).

Exemple au poker : un joueur voit ses cartes mais pas celles des autres.

---

## Types de jeux

### Tour par tour (turn-based)

- Un joueur joue à la fois
- `getCurrentPlayer()` détermine qui joue
- Timeout par tour configurable
- Exemples : Tic-Tac-Toe, Échecs, Poker

### Temps réel (real-time)

- Tous les joueurs jouent simultanément
- Game loop avec ticks réguliers
- Actions bufferisées entre ticks
- Exemples : Snake, Pong, course

---

## Modes d'exécution

### Version actuelle (standalone)

| Mode | Description |
|------|-------------|
| Solo + bots | Humain vs IA en local |
| Hot-seat | Plusieurs humains même écran |

### Version future (avec backend)

| Mode | Description |
|------|-------------|
| Multijoueur | Joueurs distants via WebSocket |
| Entraînement | Bot vs bot accéléré pour ML |

---

## Persistence

### localStorage

En mode standalone, tout est stocké localement :

| Clé | Contenu |
|-----|---------|
| `player` | Profil utilisateur (pseudo) |
| `preferences` | Préférences (son) |
| `recent_games` | Historique jeux récents |
| `scores_{game}` | Scores par jeu |
| `progress_{game}` | Sauvegarde par jeu |

---

## Communication

### Portal ↔ Game

Communication par `postMessage` entre le portail et l'iframe du jeu :

**Game → Portal** :
- `ready` : Jeu chargé
- `score` : Nouveau score
- `quit` : Retour au catalogue

**Portal → Game** :
- `pause` / `resume` : Contrôle du jeu
- `unload` : Préparation fermeture
- `preference` : Changement de préférence

> **Spec** : [portal/spec.md](../openspec/specs/portal/spec.md#communication-protocol)

---

## Références specs

| Spec | Description |
|------|-------------|
| [platform](../openspec/specs/platform/spec.md) | Architecture, structure projet |
| [catalogue](../openspec/specs/catalogue/spec.md) | Format JSON, script de build |
| [seeded-random](../openspec/specs/seeded-random/spec.md) | PRNG déterministe |
| [game-engine](../openspec/specs/game-engine/spec.md) | Interface moteur de jeu |
| [bot](../openspec/specs/bot/spec.md) | Interface IA, slots joueurs |
| [manifests](../openspec/specs/manifests/spec.md) | Formats tool.json, game.json |
| [portal](../openspec/specs/portal/spec.md) | Interface utilisateur |
| [gamekit](../openspec/specs/gamekit/spec.md) | SDK pour les jeux |
