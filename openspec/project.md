# Playlab42 - Références du projet

Ce fichier est conservé pour les liens historiques et les anciens alias
OpenSpec. Il n'est plus la source de configuration du workflow officiel OPSX.

- [AGENTS.md](../AGENTS.md) est la source commune de la stack, des conventions,
  des commandes Docker et des règles de contribution.
- [config.yaml](config.yaml) sélectionne le schéma OpenSpec et injecte les
  références et règles propres aux artefacts.
- [Workflow OpenSpec](../docs/guides/openspec-workflow.md) décrit le CLI épinglé,
  OPSX, la validation stricte et les alias de compatibilité.
- [Architecture](../docs/guides/architecture.md) décrit la plateforme standalone.
- [Contribuer](../docs/guides/contributing.md) décrit la contribution par PR.

Les scripts du projet vivent dans `scripts/`, pas dans `src/scripts/`.
Le serveur de développement se lance avec `make serve`, pas `make dev`.
Les anciens projets de multijoueur réseau restent des perspectives, pas la
description d'un backend ou d'un service WebSocket actuellement exploité.
