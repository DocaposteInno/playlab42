# OpenSpec - Compatibilité des instructions historiques

Les règles communes vivent dans [AGENTS.md](../AGENTS.md) à la racine.
Le workflow actuel est documenté dans
[docs/guides/openspec-workflow.md](../docs/guides/openspec-workflow.md).
La configuration officielle OPSX est [config.yaml](config.yaml).

Ce fichier reste un point d'entrée pour les anciens liens et les trois alias
locaux `.claude/commands/openspec/`. Il n'est pas un fichier généré par le CLI
actuel. Ne pas le supprimer via une migration automatique non revue.

Avant une nouvelle fonctionnalité, lire les specs concernées et les changes
actifs. Utiliser un identifiant kebab-case avec un verbe, par exemple
`update-project-skills-kit-e2e`. Conserver les changes étrangers à la demande
et tout l'historique d'archive.

Un change `spec-driven` contient `proposal.md`, `design.md`, `tasks.md` et les
deltas dans `specs/<capability>/spec.md`. Une demande utilisateur explicite peut
autoriser son implémentation ; consigner cette autorisation, sans prétendre
qu'une revue ou une livraison a eu lieu. Les tâches sont ordonnées uniquement
par leurs dépendances réelles et sont cochées après vérification.

Pour les nouvelles exigences, employer les en-têtes OpenSpec exacts :

```markdown
## ADDED Requirements

### Requirement: Example behavior
The system SHALL expose the requested behavior.

#### Scenario: Observable result
- **WHEN** the user performs the relevant action
- **THEN** the observable result matches the requirement
```

Un bloc `MODIFIED` remplace une exigence entière : conserver ses scénarios
existants, sauf retrait explicitement justifié. Les specs principales ont une
section `## Purpose` et une section `## Requirements`.

La validation réelle utilise le CLI épinglé dans Docker :
`make openspec-validate`. Un examen manuel ne la remplace pas. Ne pas archiver
un change avant sa livraison et une décision explicite.
