<div align="center">

![Playlab42 — le laboratoire du développement assisté par IA](../assets/banner.png)

# Playlab42

**Comprendre l’IA. Expérimenter en jouant. Construire ensemble.**

Un laboratoire pédagogique ouvert, porté par **Docaposte**, où les parcours de formation<br/>
rencontrent les mini-jeux, les outils et le développement assisté par IA.

[**Explorer la plateforme →**](https://docaposteinno.github.io/playlab42/) · [Contribuer](../docs/guides/contributing.md) · [Documentation](#documentation)

[![CI](https://github.com/DocaposteInno/playlab42/actions/workflows/ci.yml/badge.svg)](https://github.com/DocaposteInno/playlab42/actions/workflows/ci.yml)
[![Deploy](https://github.com/DocaposteInno/playlab42/actions/workflows/deploy.yml/badge.svg)](https://github.com/DocaposteInno/playlab42/actions/workflows/deploy.yml)
[![Security Audit](https://github.com/DocaposteInno/playlab42/actions/workflows/security-audit.yml/badge.svg)](https://github.com/DocaposteInno/playlab42/actions/workflows/security-audit.yml)
[![Licence : CC BY-NC-SA 4.0](https://img.shields.io/badge/CC_BY--NC--SA-4.0-64748b.svg)](../LICENSE)

</div>

## Un terrain de jeu, un vrai projet

**Playlab42 se découvre dans le navigateur et s’enrichit dans le dépôt.** Pas de compte à créer, pas de backend à déployer : la plateforme est entièrement statique. Les préférences, scores et progressions restent dans le navigateur, sans synchronisation entre appareils.

Pendant une formation, on explore un concept, on l’expérimente, puis on crée quelque chose avec l’aide d’un agent IA. Un outil, un jeu, un parcours ou une amélioration de la documentation : chaque contribution peut devenir une ressource pour les sessions suivantes.

## Explorer

| Univers | Ce qu’on y trouve | Quelques portes d’entrée |
|---------|-------------------|--------------------------|
| **Parcours** | Des slides structurées pour apprendre à son rythme. | [Agents de code](../parcours/epics/coding-agents-2025/), [Deep learning](../parcours/epics/deep-learning-intro/), [OpenSpec](../parcours/epics/openspec-usage-guide/) |
| **Outils & simulations** | Des expériences interactives pour manipuler les concepts. | [JSON Formatter](https://docaposteinno.github.io/playlab42/tools/json-formatter.html), [Particle Life](https://docaposteinno.github.io/playlab42/tools/particle-life/), [Relativity Lab 3D](https://docaposteinno.github.io/playlab42/tools/relativity-lab/) |
| **Jeux** | Des moteurs de règles et des bots pour explorer la logique et la stratégie. | [Morpion](https://docaposteinno.github.io/playlab42/games/tictactoe/), [Mastermind](https://docaposteinno.github.io/playlab42/games/mastermind/), [Go 9×9](https://docaposteinno.github.io/playlab42/games/go-9x9/) |
| **Bookmarks** | Des ressources sélectionnées sur l’écosystème IA et le développement. | [Modèles & API](../bookmarks/models-apis.json), [MCP](../bookmarks/mcp-protocols.json), [Prompt engineering](../bookmarks/prompt-engineering.json) |

**Première visite ?** Ouvrez [la plateforme Docaposte](https://docaposteinno.github.io/playlab42/) et commencez par le parcours **« PlayLab42 — Guide et usine logicielle »**.

## Apprendre aussi par le code

Le dépôt est un support de formation à part entière : applications autonomes, moteurs de jeux déterministes, tests de comportement et contrats partagés avec **GameKit**.

| Pratique | Mise en œuvre |
|----------|---------------|
| Développement assisté par IA | [Instructions communes](../AGENTS.md) et [skills de projet](../docs/guides/project-skills.md) |
| Spécification des changements | [OpenSpec / OPSX](../docs/guides/openspec-workflow.md), avec une CLI locale épinglée |
| Qualité du code | Jest, Playwright, ESLint, Biome, TypeScript ; suivi de la couverture, de la duplication et de la complexité |
| Fabrication reproductible | Node.js **26** dans Docker et la CI (minimum **24**), esbuild, comparaison de deux builds et vérification de l’archive |
| Livraison | CI sélective selon l’impact, preuves originales vérifiées pour les entrées inchangées, tests de l’archive puis publication de cette même archive sur GitHub Pages |

La sélection CI reste conservative : documentation avec HTML, chemins inconnus ou empreintes différentes peuvent imposer une nouvelle analyse complète. Les audits de vulnérabilités restent frais. Voir [l’usine logicielle et ses limites](../docs/guides/software-factory.md) : aucun indicateur vert ne garantit l’absence de défauts.

## Développer et contribuer

**Prérequis :** Git, Docker avec Docker Compose et Make. L’environnement est **Docker-first** : les dépendances et commandes Node.js s’exécutent dans le conteneur.

```bash
git clone https://github.com/DocaposteInno/playlab42.git
cd playlab42

make init
make npm CMD="run build:local"
make info
make serve
```

Ouvrez l’URL affichée par `make info` ; le port local varie selon le dossier. `build:local` prépare les contenus sans enrichissement des bookmarks.

Créez une branche ou un fork, suivez le guide adapté, puis ouvrez une Pull Request. Pour vérifier votre contribution : `make test`, `make lint`, `make typecheck` et, selon le périmètre, `make test-e2e` ou `make openspec-validate`.

| Vous souhaitez… | Commencer ici |
|-----------------|---------------|
| Créer un outil | [Guide de création d’un outil](../docs/guides/create-tool.md) |
| Développer un jeu ou un bot | [Moteur de règles](../docs/guides/create-game-engine.md), [interface](../docs/guides/create-game-client.md) et [bots](../docs/guides/create-bot.md) |
| Écrire un parcours | [Guide de création d’un epic](../docs/guides/create-epic.md) |
| Partir d’un gabarit | [Kit de contribution et galerie des composants](../docs/guides/contribution-kit.md) |

## Documentation

| Pour… | Référence |
|-------|-----------|
| Comprendre l’architecture et se repérer dans le dépôt | [README complet partagé avec le dépôt source](../README.md) |
| Comprendre les notions du projet | [Concepts & glossaire](../docs/CONCEPTS.md) |
| Consulter les contrats techniques | [Spécifications OpenSpec](../openspec/specs/) |
| Comprendre la stratégie de tests | [Stratégie de tests](../docs/TESTING_STRATEGY.md) |
| Comprendre la qualité et la chaîne de livraison | [Guide qualité](../docs/guides/software-quality.md) et [usine logicielle](../docs/guides/software-factory.md) |
| Déployer ou dépanner | [Déploiement](../docs/DEPLOYMENT.md) et [dépannage](../docs/TROUBLESHOOTING.md) |
| Consulter l’évolution du projet | [Changelog](../CHANGELOG.md) |

## Le fork Docaposte et la synchronisation

Ce dépôt est le fork de [z4ppy/playlab42](https://github.com/z4ppy/playlab42). Les contenus, le code et le **README racine** sont partagés avec le dépôt source.

**Cet accueil est volontairement propre à Docaposte.** GitHub affiche `.github/README.md` en priorité : sa bannière, ses badges et ses liens dirigent vers cette instance, sans modifier le README racine. Cette séparation a été établie dans la [PR #1](https://github.com/DocaposteInno/playlab42/pull/1).

Lors d’une synchronisation, **conservez `.github/README.md` et ses liens Docaposte** ; ne le remplacez pas par le README du dépôt source. La synchronisation par fusion préserve ce fichier tant que la source ne crée pas un fichier au même emplacement. Une remise à zéro forcée sur la source ne le préserverait pas.

## Licence

Playlab42 est un projet collaboratif porté par **Docaposte**, distribué sous licence [**CC BY-NC-SA 4.0**](../LICENSE) : attribution, usage non commercial et partage des adaptations sous la même licence.

---

*Pourquoi « 42 » ? Un clin d’œil à Douglas Adams et à la grande question sur la vie, l’univers et le reste. Ici, on commence par expérimenter.*
