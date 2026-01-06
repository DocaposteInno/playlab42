# Design technique

## Fichier source

**Chemin** : `../playlab42/tmp/guide-developpement-parallele-agents-ia.md`

Le fichier source est un article Markdown structuré avec :
- Une introduction et table des matières
- 9 sections numérotées (§1 à §9)
- 3 annexes (A, B, C)

## epic.json proposé

```json
{
  "id": "dev-parallele-agents-ia",
  "title": "Développement parallèle avec agents IA",
  "description": "Guide pratique pour utiliser plusieurs agents de code en parallèle sur le même projet sans conflits.",
  "hierarchy": ["agentique"],
  "tags": ["ia", "dev", "git", "agent", "avance", "worktree", "tmux"],
  "metadata": {
    "author": "cyrille",
    "created": "2025-12-01",
    "duration": "45 min",
    "difficulty": "intermediate",
    "language": "fr"
  },
  "icon": "🔀",
  "thumbnail": "thumbnail.svg",
  "content": [
    { "id": "01-introduction" },
    { "id": "02-probleme" },
    { "id": "03-git-worktree" },
    { "id": "04-multiplexeur" },
    { "id": "05-contexte-specs" },
    { "id": "06-workflow" },
    { "id": "07-windows" },
    { "id": "08-pieges" },
    { "id": "09-limites-humaines" },
    { "id": "10-references" }
  ]
}
```

## glossary.json proposé

```json
{
  "$schema": "../../glossary.schema.json",
  "terms": {
    "Git Worktree": {
      "short": "Plusieurs répertoires de travail partageant la même base Git",
      "long": "Fonctionnalité Git (depuis 2.5) permettant d'avoir plusieurs répertoires de travail distincts qui partagent le même .git. Chaque worktree a son propre HEAD, index et fichiers, mais les commits sont partagés instantanément. Économise ~85% d'espace disque par rapport à des clones multiples.",
      "see": ["bare repository", "staging area"],
      "category": "Git"
    },
    "bare repository": {
      "short": "Dépôt Git sans répertoire de travail, uniquement la base de données",
      "long": "Un bare repository contient uniquement la base de données Git (.git) sans les fichiers de travail. Utilisé comme repository central ou comme base pour les worktrees. Créé avec git clone --bare.",
      "see": ["Git Worktree"],
      "category": "Git"
    },
    "staging area": {
      "short": "Zone intermédiaire où les changements sont préparés avant commit",
      "long": "Aussi appelée 'index'. Zone où les modifications sont ajoutées (git add) avant d'être commitées. Permet de sélectionner précisément ce qui sera inclus dans le prochain commit. Chaque worktree a sa propre staging area.",
      "see": ["Git Worktree"],
      "category": "Git"
    },
    "multiplexeur terminal": {
      "short": "Outil permettant de gérer plusieurs terminaux dans une même fenêtre",
      "long": "Programme qui permet de diviser un terminal en plusieurs panes/fenêtres, de les organiser, et de détacher/rattacher des sessions. Permet de surveiller plusieurs agents simultanément. Exemples : tmux, GNU screen, zellij.",
      "see": ["tmux", "screen", "zellij"],
      "category": "Outils"
    },
    "tmux": {
      "short": "Multiplexeur terminal populaire avec gestion de sessions persistantes",
      "long": "Terminal MUltipleXer. Permet de créer des sessions persistantes avec plusieurs fenêtres et panes. Les sessions survivent à la déconnexion (Ctrl-A d pour détacher, tmux attach pour réattacher). Configuration via ~/.tmux.conf.",
      "see": ["multiplexeur terminal", "screen"],
      "category": "Outils"
    },
    "screen": {
      "short": "Multiplexeur terminal historique, préinstallé sur de nombreux serveurs",
      "long": "GNU Screen. Multiplexeur terminal plus ancien que tmux, mais souvent préinstallé sur les serveurs Linux. Fonctionnalités similaires : sessions détachables, multiples fenêtres. Préfixe par défaut : Ctrl-A.",
      "see": ["multiplexeur terminal", "tmux"],
      "category": "Outils"
    },
    "zellij": {
      "short": "Multiplexeur terminal moderne avec configuration déclarative en KDL",
      "long": "Alternative moderne à tmux/screen écrite en Rust. Interface plus intuitive, configuration déclarative (KDL), layouts prédéfinis. Supporte les plugins WebAssembly.",
      "see": ["multiplexeur terminal", "tmux"],
      "category": "Outils"
    },
    "coding agent": {
      "short": "Agent IA autonome capable de lire, écrire du code et exécuter des commandes",
      "long": "Système combinant un LLM avec des capacités d'action : lecture/écriture de fichiers, exécution de commandes shell, navigation dans le code. Exemples : Claude Code, Aider, Cline, Cursor. Représente l'évolution des assistants de code vers des agents autonomes.",
      "see": ["LLM"],
      "category": "IA"
    },
    "LLM": {
      "short": "Large Language Model : modèle de langage entraîné sur de vastes corpus de texte",
      "long": "Grand modèle de langage. Réseau de neurones (généralement Transformer) entraîné à prédire le texte suivant. Capable de générer du code, répondre à des questions, suivre des instructions. Exemples : GPT-4, Claude, Llama.",
      "see": ["coding agent"],
      "category": "IA"
    },
    "spec-driven development": {
      "short": "Méthodologie où les spécifications guident le développement par les agents",
      "long": "Approche où chaque tâche est définie dans une spec (spécification) avant d'être confiée à un agent. La spec décrit l'objectif, le scope, les fichiers concernés et les critères de succès. Permet une source unique de vérité et des specs versionnées.",
      "see": ["CLAUDE.md", "OpenSpec"],
      "category": "Méthodologie"
    },
    "CLAUDE.md": {
      "short": "Fichier de conventions projet lu automatiquement par Claude Code",
      "long": "Fichier Markdown à la racine du projet contenant les instructions pour l'agent : stack technique, conventions de code, structure du projet, règles spécifiques. Lu automatiquement par Claude Code au démarrage.",
      "see": ["AGENTS.md", "spec-driven development"],
      "category": "Méthodologie"
    },
    "AGENTS.md": {
      "short": "Convention émergente pour un fichier d'instructions compatible multi-outils",
      "long": "Fichier d'instructions standardisé compatible avec plusieurs outils IA (Claude Code, Cursor, Codex, etc.). Similaire à CLAUDE.md mais avec une convention de nommage plus générique.",
      "see": ["CLAUDE.md"],
      "category": "Méthodologie"
    },
    "OpenSpec": {
      "short": "Framework léger pour le spec-driven development avec agents IA",
      "long": "Outil open-source qui structure le workflow : proposal → apply → archive. Génère des specs et des tâches automatiquement. Compatible Claude Code, Cursor, Copilot, Cline. Créé par Fission AI.",
      "see": ["spec-driven development"],
      "category": "Méthodologie"
    },
    "context-switching": {
      "short": "Basculement entre tâches, coûteux cognitivement (jusqu'à 40% du temps)",
      "long": "Passage d'une tâche à une autre nécessitant un changement de contexte mental. Les études (Rubinstein, Meyer, Evans 2001) montrent un coût de 15-40% du temps productif. Gloria Mark (UC Irvine) mesure ~23 minutes pour retrouver la concentration après interruption.",
      "see": ["mémoire de travail"],
      "category": "Cognitif"
    },
    "mémoire de travail": {
      "short": "Capacité cognitive limitée à ~4 éléments simultanés (Cowan, 2001)",
      "long": "Système cognitif de stockage temporaire à capacité limitée. Miller (1956) estimait 7±2 éléments, révisé à ~4 chunks par Cowan (2001). Explique pourquoi superviser plus de 4-6 agents devient difficile.",
      "see": ["context-switching"],
      "category": "Cognitif"
    },
    "hot-seat": {
      "short": "Mode de jeu où plusieurs joueurs partagent le même écran à tour de rôle",
      "long": "Terme du jeu vidéo désignant un mode multijoueur local où les joueurs utilisent le même ordinateur en alternance. Par extension, développement où plusieurs personnes travaillent sur le même poste.",
      "category": "Méthodologie"
    },
    "review": {
      "short": "Relecture critique du code avant intégration (code review)",
      "long": "Processus d'examen du code par un humain avant merge. Avec les agents IA, la review devient le goulot d'étranglement (~50% du temps total). Vérifie la logique métier, la sécurité, et le respect du scope.",
      "see": ["merge"],
      "category": "Workflow"
    },
    "merge": {
      "short": "Fusion d'une branche dans une autre, intégrant les modifications",
      "long": "Opération Git qui combine les modifications de deux branches. L'ordre de merge est important quand plusieurs agents travaillent en parallèle : types d'abord, puis backend, API, frontend.",
      "see": ["Git Worktree", "review"],
      "category": "Git"
    }
  }
}
```

## Mapping contenu source → slides

| Section source | Slide | Notes |
|----------------|-------|-------|
| Intro + Table des matières | 01-introduction | Hero + chips de navigation |
| §1 Le problème à résoudre | 02-probleme | Complète |
| §2 La solution : Git Worktree | 03-git-worktree | Complète avec schémas ASCII |
| §3 Superviser : multiplexeur | 04-multiplexeur | Complète |
| §4 Configurer vos agents | 05-contexte-specs | Renommé pour clarté |
| §5 Workflow complet | 06-workflow | Complète |
| §6 Spécificités Windows | 07-windows | Complète |
| §7 Les pièges à éviter | 08-pieges | Format cards avec ❌ / ✅ |
| §8 Limites humaines | 09-limites-humaines | Complète |
| §9 Références + Annexes A/B/C | 10-references | Fusionné en une slide |

## Décisions de style

### Consistance avec coding-agents-2025

Les slides suivent le même template :
- `<link rel="stylesheet" href="../../../../../lib/theme.css">`
- `<link rel="stylesheet" href="../../../../_shared/slide-base.css">`
- `<script type="module">` pour `initTheme()`
- `<article class="slide">` comme conteneur principal

### Composants visuels réutilisés

| Composant | Usage |
|-----------|-------|
| `.hero` | Slide d'introduction |
| `.stat-card` / `.stats-grid` | Statistiques (économie disque, etc.) |
| `.timeline` | Évolution des pratiques |
| `.callout` | Notes importantes |
| `.code-block` | Blocs de code avec titre |
| `.warning` / `.error` | Pièges à éviter |

### Nouveaux composants

| Composant | Description |
|-----------|-------------|
| `.diagram-ascii` | Préserve les diagrammes ASCII du source |
| `.comparison-table` | Tableaux comparatifs (approches) |
| `.step-card` | Étapes du workflow |
| `.pitfall-card` | Erreurs courantes avec icône ❌ |
| `.flow-diagram` | Diagramme de flux interactif |
| `.architecture-visual` | Visualisation de la structure worktree |

## Visualisations recommandées

Transformer les diagrammes ASCII et concepts complexes en visualisations élégantes :

### Slide 02 - Le problème

**Visualisation** : Comparaison visuelle avant/après
- Gauche : chaos (fichiers qui se chevauchent, flèches croisées)
- Droite : isolation propre (worktrees séparés)

### Slide 03 - Git Worktree

**Visualisation** : Architecture des worktrees
```
┌─────────────────────────────────────────────────────────┐
│                    .bare/ (partagé)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  refs   │  │ objects │  │  HEAD   │  │  hooks  │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │  main/  │   │ agent-1 │   │ agent-2 │
    │ (vous)  │   │  auth   │   │  api    │
    └─────────┘   └─────────┘   └─────────┘
```
→ Transformer en SVG avec couleurs thème et animations hover

### Slide 04 - Multiplexeur

**Visualisation** : Layout tmux 4 panes
- Représentation visuelle d'un écran divisé
- Chaque pane avec un label agent
- Animation montrant la navigation

### Slide 05 - Contexte et specs

**Visualisation** : Flux spec → agent
```
   specs/auth.md  ──────┐
                        ▼
   CLAUDE.md ────► [Agent] ────► Code
                        ▲
   Codebase ────────────┘
```
→ Diagramme avec flèches animées

### Slide 06 - Workflow

**Visualisation** : Pipeline en 6 étapes
```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ PRÉPARER│ → │ LANCER  │ → │SURVEILLER│ → │ REVIEW  │ → │ MERGER  │ → │NETTOYER │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```
→ Progress bar interactive avec descriptions au hover

### Slide 08 - Pièges

**Visualisation** : Cards ❌ / ✅
- Format visuellement distinct
- Rouge pour les erreurs
- Vert pour les solutions
- Icônes expressives

### Slide 09 - Limites humaines

**Visualisation** : Graphique mémoire de travail
- Jauge montrant la capacité (4 chunks)
- Timeline du context-switching (23 min)
- Comparaison humain vs agents

### Blocs de code

Tous les blocs de code conservent :
- Le langage (bash, yaml, json, markdown, kdl, powershell)
- Les commentaires explicatifs
- L'indentation originale

### Liens

Les liens externes sont conservés avec `target="_blank" rel="noopener"`.
Les liens internes vers d'autres slides utilisent le format `#slide:XX-nom`.

## thumbnail.svg

Proposition de design :
- Fond : gradient dégradé (couleurs theme)
- Icône centrale : branche Git qui se divise en 3
- Petits emojis agents (🤖) au bout de chaque branche
- Style minimaliste cohérent avec les autres thumbnails

```svg
<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg">
  <!-- Branche centrale -->
  <path d="M190 160 L190 80" stroke="var(--color-accent)" stroke-width="4" fill="none"/>
  <!-- Branches -->
  <path d="M190 80 L100 30" stroke="var(--color-accent)" stroke-width="3" fill="none"/>
  <path d="M190 80 L190 30" stroke="var(--color-accent)" stroke-width="3" fill="none"/>
  <path d="M190 80 L280 30" stroke="var(--color-accent)" stroke-width="3" fill="none"/>
  <!-- Points (commits) -->
  <circle cx="190" cy="80" r="8" fill="var(--color-accent)"/>
  <circle cx="100" cy="30" r="6" fill="var(--color-accent)"/>
  <circle cx="190" cy="30" r="6" fill="var(--color-accent)"/>
  <circle cx="280" cy="30" r="6" fill="var(--color-accent)"/>
  <!-- Agents -->
  <text x="100" y="20" text-anchor="middle" font-size="16">🤖</text>
  <text x="190" y="20" text-anchor="middle" font-size="16">🤖</text>
  <text x="280" y="20" text-anchor="middle" font-size="16">🤖</text>
</svg>
```

## Estimation d'effort

| Phase | Effort estimé |
|-------|---------------|
| Structure (epic.json, dossiers) | 5 min |
| Slides 01-05 | 60 min |
| Slides 06-10 | 60 min |
| Thumbnail SVG | 10 min |
| Validation et tests | 15 min |
| **Total** | ~2h30 |
