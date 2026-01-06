# Proposal: Ajouter l'epic "Développement parallèle avec agents IA"

## Source

**Fichier source** : `../playlab42/tmp/guide-developpement-parallele-agents-ia.md`

Ce fichier Markdown contient l'intégralité du guide à convertir en slides HTML. Le texte doit être conservé intégralement, seule la mise en forme change.

## Pourquoi

Le développement assisté par IA évolue vers l'utilisation simultanée de plusieurs agents de code. Cette pratique émergente nécessite des techniques spécifiques (Git Worktree, multiplexeurs terminal, spec-driven development) qui ne sont pas intuitivement maîtrisées.

Ce guide répond à une question fréquente : *"Comment faire travailler plusieurs agents en parallèle sur le même projet sans tout casser ?"*

Le contenu apporte une **valeur pédagogique directe** pour les formations Playlab42 :
- Techniques Git avancées (worktrees)
- Méthodologie de travail avec agents IA
- Bonnes pratiques de supervision et review
- Compréhension des limites cognitives humaines

## Quoi

### Nouvel epic : `dev-parallele-agents-ia`

**Métadonnées** :
- **Titre** : Développement parallèle avec agents IA
- **Description** : Guide pratique pour utiliser plusieurs agents de code en parallèle sur le même projet
- **Hiérarchie** : `agentique` (même catégorie que `coding-agents-2025`)
- **Tags** : `ia`, `dev`, `git`, `agent`, `avance`
- **Difficulté** : intermediate
- **Durée estimée** : 45 min

### Structure des slides (10 slides)

| # | ID | Titre | Contenu |
|---|-----|-------|---------|
| 1 | 01-introduction | Introduction | Présentation du guide, objectifs, prérequis |
| 2 | 02-probleme | Le problème à résoudre | Pourquoi le multi-agent pose problème |
| 3 | 03-git-worktree | Git Worktree | Solution d'isolation, setup, commandes |
| 4 | 04-multiplexeur | Supervision avec multiplexeur | tmux, screen, zellij, outils d'orchestration |
| 5 | 05-contexte-specs | Contexte et specs | Approche spec-driven, CLAUDE.md, OpenSpec |
| 6 | 06-workflow | Workflow complet | Étapes de la préparation au merge |
| 7 | 07-windows | Spécificités Windows | Configuration, WSL2, agents sous Windows |
| 8 | 08-pieges | Les pièges à éviter | Erreurs courantes et solutions |
| 9 | 09-limites-humaines | Comprendre les limites humaines | Mémoire de travail, context-switching |
| 10 | 10-references | Références et annexes | Liens, scripts, templates |

### Principe de conversion

Le texte original est **conservé intégralement**, remis en forme pour le format slide HTML :
- Titres convertis en `<h1>`, `<h2>`, `<h3>`
- Blocs de code avec `<pre><code>`
- Tableaux avec `<table>`
- Listes avec `<ul>`/`<ol>`
- Diagrammes ASCII conservés dans des blocs `<pre class="diagram">`
- Blockquotes pour les citations

## Impact

### Fichiers créés

```
parcours/epics/dev-parallele-agents-ia/
├── epic.json                    # Manifest de l'epic
├── glossary.json                # Glossaire des termes techniques
├── thumbnail.svg                # Vignette (icône Git + agents)
└── slides/
    ├── 01-introduction/
    │   ├── slide.json
    │   └── index.html
    ├── 02-probleme/
    │   ├── slide.json
    │   └── index.html
    ├── 03-git-worktree/
    │   ├── slide.json
    │   └── index.html
    ├── 04-multiplexeur/
    │   ├── slide.json
    │   └── index.html
    ├── 05-contexte-specs/
    │   ├── slide.json
    │   └── index.html
    ├── 06-workflow/
    │   ├── slide.json
    │   └── index.html
    ├── 07-windows/
    │   ├── slide.json
    │   └── index.html
    ├── 08-pieges/
    │   ├── slide.json
    │   └── index.html
    ├── 09-limites-humaines/
    │   ├── slide.json
    │   └── index.html
    └── 10-references/
        ├── slide.json
        └── index.html
```

### Bookmarks à ajouter

Enrichir les fichiers de bookmarks existants avec les références de l'article :

**bookmarks/coding-tools.json** (outils d'orchestration) :
- Claude Squad - TUI pour orchestrer plusieurs Claude Code
- git-worktree-runner - Automatisation worktrees par CodeRabbit
- CCManager - Gestionnaire multi-agents

**bookmarks/methodologies.json** (spec-driven development) :
- OpenSpec - Framework spec-driven development
- Spec Kit - Toolkit GitHub pour specs IA
- Spec-driven development article (GitHub Blog)

**bookmarks/resources.json** (articles et documentation) :
- Git Worktree documentation
- tmux wiki
- Parallel AI Coding with Git Worktrees
- The Git Worktree + Claude Code Playbook

### Specs impactées

- **parcours** : Aucune modification de spec requise, l'epic suit le format existant

### Build

Après implémentation :
```bash
make build-parcours
```

Le nouvel epic apparaîtra dans :
- La catégorie "Agentique" du catalogue
- La section "Récents" (si activée)

## Validation

- [ ] Le contenu original est préservé intégralement
- [ ] Le style HTML est cohérent avec les autres epics (coding-agents-2025)
- [ ] Les blocs de code sont syntaxiquement corrects
- [ ] Les liens internes/externes sont fonctionnels
- [ ] Le build parcours s'exécute sans erreur
