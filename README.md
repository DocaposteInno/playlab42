# Playlab42

![Playlab42 Banner](assets/banner.png)

[![CI](https://github.com/z4ppy/playlab42/actions/workflows/ci.yml/badge.svg)](https://github.com/z4ppy/playlab42/actions/workflows/ci.yml)
[![Deploy](https://github.com/z4ppy/playlab42/actions/workflows/deploy.yml/badge.svg)](https://github.com/z4ppy/playlab42/actions/workflows/deploy.yml)
[![Security Audit](https://github.com/z4ppy/playlab42/actions/workflows/security-audit.yml/badge.svg)](https://github.com/z4ppy/playlab42/actions/workflows/security-audit.yml)
[![codecov](https://codecov.io/gh/z4ppy/playlab42/graph/badge.svg)](https://codecov.io/gh/z4ppy/playlab42)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE)
[![Node.js 24+](https://img.shields.io/badge/node-24%2B-brightgreen.svg)](https://nodejs.org/)

Plateforme pédagogique complète pour la formation au développement assisté par IA : supports de cours, base de connaissance, outils et jeux collaboratifs.

**[Voir la démo live](https://z4ppy.github.io/playlab42/)**

## Vision

**Playlab42** est à la fois un **support de formation**, un **démonstrateur technique** et un **projet collaboratif vivant**.

### 📚 Consulter - Base de connaissance

Le site met à disposition des **ressources pédagogiques** sélectionnées par les formateurs :
- **Parcours thématiques** : Slides et contenus structurés (histoire de l'IA, transformers, agents, etc.)
- **Documentation** : Guides pratiques, howto, tutoriels
- **Concepts clés** : Explications accessibles de notions techniques
- **Bookmarks** : Liens vers des ressources externes de qualité

### 🔍 Apprendre par l'exemple - Le projet comme démonstrateur

Playlab42 n'est pas qu'un catalogue : **son code source illustre les bonnes pratiques** du développement moderne assisté par IA :
- **Prompts pré-configurés** : Instructions pour agents IA (AGENTS.md, CLAUDE.md)
- **OpenSpec** : Workflow de spécification et gestion des changements
- **Agents spécialisés** : Commandes slash pour différents contextes
- **CI/CD** : Intégration continue avec GitHub Actions
- **Qualité** : Linting, tests automatisés, couverture de code
- **Conteneurisation** : Environnement Docker reproductible

### 🚀 Contribuer - Enrichir le projet

Chaque session de formation se conclut par une **contribution réelle** via Pull Request :
- Créer un mini-jeu, développer un outil, rédiger une documentation
- Le projet s'enrichit au fil des sessions, créant une base de connaissances collaborative

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYLAB42 (statique)                     │
│  Catalogue unifié : Tools + Games + Parcours                │
│  [🔧 Outils]  [🎮 Jeux]  [📚 Parcours]  [Recherche...]      │
└─────────────────────────────────────────────────────────────┘
                              │
                         iframe / lien
                              │
┌─────────────────────────────────────────────────────────────┐
│              CONTENUS AUTONOMES                             │
│  JSON Formatter │ Base64 │ Tic-Tac-Toe │ Slides │ ...      │
└─────────────────────────────────────────────────────────────┘
                              │
                      (optionnel, multi-joueur)
                              │
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                               │
│  Auth │ API REST │ WebSocket │ Sessions │ Scores            │
└─────────────────────────────────────────────────────────────┘
```

La version actuelle est **100% frontend**, avec stockage local dans le navigateur.
Le bloc backend du schéma représente une évolution possible, pas un service existant.

## Structure du projet

```
playlab42/
├── tools/                  # 🔧 Outils HTML standalone (un fichier = un outil)
│   └── mon-outil/
│       ├── index.html      #    Ouvrable directement dans le navigateur
│       └── tool.json       #    Manifest (titre, description, tags)
│
├── games/                  # 🎮 Jeux autonomes avec moteur isomorphe
│   └── mon-jeu/
│       ├── index.html      #    Point d'entrée jouable
│       ├── engine.js       #    Moteur pur, déterministe (client & serveur)
│       ├── bots.js         #    IA pluggables pour remplacer les humains
│       └── game.json       #    Manifest
│
├── parcours/               # 📚 Contenus pédagogiques en slides HTML
│   ├── index.json          #    Config taxonomie et featured
│   └── epics/
│       └── mon-epic/
│           ├── epic.json   #    Manifest (titre, tags, structure)
│           ├── thumbnail.svg
│           └── slides/     #    Slides HTML numérotées
│
├── lib/                    # Bibliothèques partagées (thème, gamekit, utils)
├── data/                   # Données générées (catalogue.json, parcours.json)
├── docs/                   # Documentation
├── templates/              # Gabarits de jeux, outils et parcours
├── e2e/                    # Parcours navigateur Playwright
├── openspec/               # Spécifications et changes
├── .github/skills/         # Skills de projet versionnés
└── .claude/                # Configuration Claude Code (commandes slash)
```

## Démarrage rapide

**Tout tourne dans Docker**, rien sur le host :

```bash
# Cloner et initialiser
cd playlab42
make init

# Lancer le serveur de dev
make serve

# Ou lancer Claude Code directement
make claude
```

### Commandes utiles

```bash
make shell              # Shell dans le container
make npm CMD="..."      # Commandes npm (ex: "install lodash")
make build-ts           # Transpiler les sources TypeScript optionnelles
make lint               # Vérification qualité
make test               # Tests Jest
make test-e2e           # Parcours navigateur dans une image Docker dédiée
make npm CMD="run build:local" # Catalogues et sources TS sans enrichissement réseau
make openspec-validate  # Validation stricte avec la CLI épinglée
make info               # Infos de l'instance (port, container)
```

### Multi-worktree

Le projet supporte le développement parallèle via git worktrees. Chaque worktree obtient automatiquement :
- Un nom de projet Docker unique (basé sur le nom du dossier)
- Un port dédié (plage 5200-5299)

```bash
# Vérifier l'instance courante
make info
```

## Documentation

| Guide | Description |
|-------|-------------|
| [AGENTS.md](./AGENTS.md) | Instructions pour agents IA (Claude Code, Copilot, Cursor) |
| [Features MVP](./docs/FEATURES.md) | Liste complète des fonctionnalités |
| [Concepts](./docs/CONCEPTS.md) | Définitions et glossaire |
| [Créer un outil](./docs/guides/create-tool.md) | Guide pas à pas |
| [Créer un jeu](./docs/guides/create-game.md) | Guide pas à pas |
| [Contribuer](./docs/guides/contributing.md) | Workflow de contribution |
| [Kit de contribution](./docs/guides/contribution-kit.md) | Gabarits et galerie des composants partagés |
| [Skills de projet](./docs/guides/project-skills.md) | Utilisation et scénarios des skills Playlab42 |
| [Workflow OpenSpec](./docs/guides/openspec-workflow.md) | Commandes et validation des spécifications |
| [Parcours navigateur](./docs/TESTING_STRATEGY.md) | Stratégie de qualité et suite E2E |

## Le "42"

Référence à Douglas Adams : la réponse à la grande question sur la vie, l'univers et le reste.

---

*Projet collaboratif - Docaposte*
