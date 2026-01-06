# Tâches d'implémentation

## Fichier source

**Lire le contenu depuis** : `../playlab42/tmp/guide-developpement-parallele-agents-ia.md`

Ce fichier contient l'article complet en Markdown. Chaque section correspond à une slide. Le texte doit être conservé intégralement et converti en HTML.

## Phase 1 : Structure de l'epic

- [x] Créer le dossier `parcours/epics/dev-parallele-agents-ia/`
- [x] Créer `epic.json` avec les métadonnées
- [x] Créer `glossary.json` avec les termes techniques (voir liste ci-dessous)
- [x] Créer `thumbnail.svg` (icône représentant Git + agents)
- [x] Créer les 10 dossiers de slides dans `slides/`

### Termes du glossaire

| Terme | Catégorie |
|-------|-----------|
| Git Worktree | Git |
| Bare repository | Git |
| Staging area | Git |
| Multiplexeur terminal | Outils |
| tmux | Outils |
| screen | Outils |
| zellij | Outils |
| Coding agent | IA |
| LLM | IA |
| Spec-driven development | Méthodologie |
| CLAUDE.md | Méthodologie |
| AGENTS.md | Méthodologie |
| OpenSpec | Méthodologie |
| Context-switching | Cognitif |
| Mémoire de travail | Cognitif |
| Hot-seat | Méthodologie |
| Review | Workflow |
| Merge | Git |

## Phase 2 : Slides

### Slide 01 - Introduction
- [x] Créer `slides/01-introduction/slide.json`
- [x] Créer `slides/01-introduction/index.html`
  - Hero avec titre et tagline
  - Présentation du guide
  - Objectifs d'apprentissage
  - Table des matières visuelle (chips cliquables)

### Slide 02 - Le problème à résoudre
- [x] Créer `slides/02-probleme/slide.json`
- [x] Créer `slides/02-probleme/index.html`
  - Section "Plusieurs tâches en parallèle"
  - Liste des problèmes classiques (stash, clones, branches)
  - Amplification avec agents IA
  - Ce qu'il nous faut

### Slide 03 - Git Worktree
- [x] Créer `slides/03-git-worktree/slide.json`
- [x] Créer `slides/03-git-worktree/index.html`
  - Le principe
  - Schéma de la structure de dossiers
  - Avantages (économie disque, commits partagés)
  - Mise en place (2 options)
  - Commandes essentielles
  - Services Docker Compose

### Slide 04 - Multiplexeur terminal
- [x] Créer `slides/04-multiplexeur/slide.json`
- [x] Créer `slides/04-multiplexeur/index.html`
  - tmux (config, commandes)
  - GNU Screen (alternative)
  - Zellij (moderne)
  - Outils d'orchestration (Claude Squad, git-worktree-runner)

### Slide 05 - Contexte et specs
- [x] Créer `slides/05-contexte-specs/slide.json`
- [x] Créer `slides/05-contexte-specs/index.html`
  - Le problème du contexte
  - Approche spec-driven
  - Structure des fichiers
  - CLAUDE.md global
  - Spec par tâche
  - Lancer un agent avec sa spec
  - Outils (OpenSpec, Spec Kit, AGENTS.md)
  - Tableau comparatif

### Slide 06 - Workflow complet
- [x] Créer `slides/06-workflow/slide.json`
- [x] Créer `slides/06-workflow/index.html`
  - Vue d'ensemble (diagramme)
  - Étape 1 : Préparer
  - Étape 2 : Lancer
  - Étape 3 : Surveiller
  - Étape 4 : Review
  - Étape 5 : Merger
  - Étape 6 : Nettoyer

### Slide 07 - Spécificités Windows
- [x] Créer `slides/07-windows/slide.json`
- [x] Créer `slides/07-windows/index.html`
  - Windows Terminal
  - Configuration Git critique
  - Exclusions antivirus
  - WSL2
  - Agents sous Windows

### Slide 08 - Les pièges à éviter
- [x] Créer `slides/08-pieges/slide.json`
- [x] Créer `slides/08-pieges/index.html`
  - Erreurs de décomposition
  - Erreurs de supervision
  - Erreurs techniques

### Slide 09 - Limites humaines
- [x] Créer `slides/09-limites-humaines/slide.json`
- [x] Créer `slides/09-limites-humaines/index.html`
  - La mémoire de travail (Miller, Cowan)
  - Le coût du context-switching
  - Le parallélisme humain réel
  - Implication pour le multi-agent
  - Références scientifiques

### Slide 10 - Références et annexes
- [x] Créer `slides/10-references/slide.json`
- [x] Créer `slides/10-references/index.html`
  - Documentation officielle
  - Spec-driven development
  - Outils d'orchestration
  - Articles et retours d'expérience
  - Script de démarrage (Annexe A)
  - Script de nettoyage (Annexe B)
  - Templates (Annexe C)

## Phase 3 : Validation

- [x] Vérifier que tous les fichiers sont créés
- [x] Lancer `make build-parcours` pour générer le catalogue
- [x] Vérifier l'absence d'erreurs de build
- [ ] Tester la navigation dans le viewer de parcours
- [ ] Vérifier le rendu responsive (mobile/desktop)
- [ ] Vérifier la coloration syntaxique des blocs de code
- [ ] Vérifier que les liens externes fonctionnent

## Phase 4 : Bookmarks

Ajouter les références de l'article aux bookmarks existants.

### bookmarks/coding-tools.json

- [x] Ajouter Claude Squad
- [x] Ajouter git-worktree-runner
- [x] Ajouter CCManager

### bookmarks/methodologies.json

- [x] Ajouter OpenSpec
- [x] Ajouter Spec Kit
- [x] Ajouter article GitHub Blog

### bookmarks/resources.json

- [x] Ajouter Git Worktree documentation
- [x] Ajouter tmux wiki
- [x] Ajouter article Parallel AI Coding
- [x] Ajouter article Git Worktree + Claude Code Playbook

## Phase 5 : Finalisation

- [x] Lancer `make build-bookmarks` pour régénérer le catalogue
- [ ] Commit avec message descriptif
- [ ] Archiver la proposition (`/openspec:archive`)
