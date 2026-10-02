# Parcours - Spécification MVP

> Système de contenus pédagogiques pour PlayLab42.
> 100% statique, compatible GitHub Pages.

## Purpose

Le système de parcours publie des contenus pédagogiques sous forme d'epics
et de slides dans un catalogue statique. Le viewer permet leur consultation,
la navigation entre slides et le suivi local de progression sans backend.
Les sections détaillées ci-dessous restent la référence du contrat existant.

## Requirements

### Requirement: Static Epic Publication

The system SHALL publish epics and their ordered slides from manifests through
the existing static parcours build.

#### Scenario: Parcours build
- **WHEN** the parcours build reads epic and slide manifests
- **THEN** it generates the parcours catalogue for the frontend
- **AND** the referenced slides remain static content

### Requirement: Slide Navigation

The system SHALL allow users to open an epic and navigate its slides through
the parcours viewer without an application backend.

#### Scenario: Sequential navigation
- **WHEN** a user selects the next or previous slide in an open epic
- **THEN** the viewer displays the corresponding slide and updates navigation state

#### Scenario: Direct slide navigation
- **WHEN** a user selects an available slide in the table of contents
- **THEN** the viewer opens that slide and identifies it as active

### Requirement: Local Parcours Progress

The system SHALL track parcours progress locally in the browser as described
in the progression contract below.

#### Scenario: Visited slide
- **WHEN** a user visits a slide
- **THEN** the local progression records the visit
- **AND** the viewer can show the epic's updated progression

---

## Table des matières

1. [Concepts](#1-concepts)
2. [Page d'accueil](#2-page-daccueil)
3. [Navigation](#3-navigation)
4. [Epic & Slides](#4-epic--slides)
5. [Assets & Médias](#5-assets--médias)
6. [Taxonomie](#6-taxonomie)
7. [Build & Aggregation](#7-build--aggregation)
8. [Progression utilisateur](#8-progression-utilisateur)
9. [Accessibilité](#9-accessibilité)
10. [Responsive](#10-responsive)
11. [Contraintes techniques](#11-contraintes-techniques)
12. [Structure des fichiers](#12-structure-des-fichiers)
13. [Architecture du Viewer](#13-architecture-du-viewer)
14. [Communication slide ↔ viewer](#14-communication-slide--viewer)
15. [Glossaire](#15-glossaire)

---

## 1. Concepts

### Epic

Collection ordonnée de slides formant un parcours cohérent.

- Unité de publication dans le catalogue
- Contient 1 à N slides
- Possède ses métadonnées (titre, auteur, vignette, etc.)
- Placé dans une hiérarchie de catégories
- Taggé pour le filtrage

### Slide

Unité de contenu au sein d'un epic.

- N'existe pas seule dans le catalogue
- Appartient à un seul epic
- Types : `page` (HTML/MD), `image`, `interactive`
- Peut être optionnelle

### Hierarchy

Arborescence de catégories pour l'exploration.

- Dynamique : nœuds avec < 3 epics → absorbés dans "autres"
- MVP : `playlab42` et `autres` uniquement
- S'enrichit au fur et à mesure des contributions

### Tags

Labels plats pour le filtrage transversal.

- Traversent toute la hiérarchie
- Agrégés au build avec compteurs

---

## 2. Page d'accueil

### Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🧭 Parcours (actif)  │  🛠️ Outils  │  🎮 Jeux                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Rechercher...                                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─── ⭐ MIS EN AVANT ──────────────────────────────────────────│
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │ 🎮         │ │ 📖         │ │ ✏️         │                  │
│  │ Hello      │ │ Créer un   │ │ Contribuer │                  │
│  │ PlayLab42  │ │ jeu        │ │            │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
│                                                                  │
│  ─── 📁 EXPLORER ──────────────────────────────────────────────│
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐                     │
│  │ 🎮 PlayLab42     │ │ 📚 Autres        │                     │
│  │ 3 parcours       │ │ 8 parcours       │                     │
│  │ [vignette]       │ │ [vignette]       │                     │
│  └──────────────────┘ └──────────────────┘                     │
│                                                                  │
│  ─── 🕐 RÉCENTS ───────────────────────────────────────────────│
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │ Epic 1     │ │ Epic 2     │ │ Epic 3     │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Éléments

| Élément | Description |
|---------|-------------|
| Recherche | Filtre sur titre, description, tags |
| Mis en avant | Epics définis dans `index.json` |
| Explorer | Catégories de premier niveau (threshold >= 3) |
| Récents | N derniers epics ajoutés/modifiés |

### Recherche

Filtrage côté client sur :
- `title` (poids fort)
- `description` (poids moyen)
- `tags` (poids moyen)
- `author` (poids faible)

```typescript
interface SearchResult {
  epic: ParcoursEntry;
  score: number;
  matches: {
    field: string;
    snippet: string;
  }[];
}
```

---

## 3. Navigation

### Menu latéral

```
┌──────────────────────┐
│ 📑 Sommaire     [✕]  │
├──────────────────────┤
│                      │
│ ▼ 👋 Introduction    │  ← Section dépliée
│   ├─ ✓ Bienvenue     │  ← Slide visitée
│   └─ ● Prérequis     │  ← Slide active
│                      │
│ ▶ ✏️ Créer du contenu │  ← Section repliée
│                      │
│ ▶ ✅ Bonnes pratiques│
│   (optionnel)        │
│                      │
├──────────────────────┤
│ Progression: 2/8     │
│ ▓▓▓░░░░░░░░░░░░ 25%  │
└──────────────────────┘

Légende:
✓ = visitée
● = active
○ = non visitée
▶ = section repliée
▼ = section dépliée
(optionnel) = peut être sautée
```

### États du menu

| État | Desktop | Mobile |
|------|---------|--------|
| Ouvert | Sidebar fixe à gauche | Drawer overlay |
| Fermé | Masqué, bouton ☰ visible | Masqué, bouton ☰ visible |
| Auto | S'ouvre au chargement epic | Fermé par défaut |

### Navigation séquentielle

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Catalogue]  [☰]  Guide Contribution           2/8  ▓▓░░░░░░ │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Breadcrumb: Introduction > Prérequis                            │
│                                                                  │
│                    ┌────────────────────────┐                   │
│                    │                        │                   │
│                    │     CONTENU SLIDE      │                   │
│                    │                        │                   │
│                    └────────────────────────┘                   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [← Bienvenue]                                [Créer du contenu →]│
└─────────────────────────────────────────────────────────────────┘
```

### Comportement navigation

| Action | Effet |
|--------|-------|
| Clic "Suivant" | Slide suivante, menu auto-déplie la section |
| Clic "Précédent" | Slide précédente |
| Clic sur slide dans menu | Navigation directe, surbrillance |
| Clic sur section | Toggle repli/dépli |
| Touche `←` | Slide précédente |
| Touche `→` | Slide suivante |
| Touche `Escape` | Fermer menu (mobile) ou retour catalogue |
| Touche `m` | Toggle menu |

### Breadcrumb

```
🏠 > 🎮 PlayLab42 > Guide Contribution > Introduction > Prérequis
     │              │                    │              │
     │              │                    │              └── Slide
     │              │                    └── Section
     │              └── Epic
     └── Catégorie
```

Chaque niveau est cliquable.

### URLs (hash routing)

```
/#/parcours/                          # Catalogue (page d'accueil)
/#/parcours/{epicId}/                 # Epic (index ou première slide)
/#/parcours/{epicId}/{slideId}        # Slide spécifique
```

Compatibilité GitHub Pages via hash routing.

---

## 4. Epic & Slides

### Epic Manifest (`epic.json`)

```typescript
interface EpicManifest {
  /** Identifiant unique = nom du dossier */
  id: string;

  /** Titre */
  title: string;

  /** Description (1-3 phrases) */
  description: string;

  /** Position dans la hiérarchie */
  hierarchy: string[];

  /** Tags pour filtrage */
  tags: string[];

  /** Métadonnées */
  metadata: {
    author: string;
    created: string;        // ISO 8601
    updated?: string;
    duration?: string;      // "15 min", "2h"
    difficulty?: "beginner" | "intermediate" | "advanced";
    language?: string;      // "fr", "en"
  };

  /** Icône emoji */
  icon?: string;

  /** Vignette (chemin relatif) */
  thumbnail?: string;

  /** Slide d'index (si absent, auto-généré) */
  index?: string;

  /** Contenu : slides ou sections */
  content: (SlideRef | Section)[];

  /** Références vers autres epics */
  references?: {
    prerequisites?: string[];
    next?: string[];
    related?: string[];
  };

  /** Brouillon (non publié) */
  draft?: boolean;

  /** Mis en avant */
  featured?: boolean;
}

interface SlideRef {
  id: string;
  optional?: boolean;
  label?: string;         // Si optionnel, ex: "Approfondissement"
}

interface Section {
  id: string;
  title: string;
  icon?: string;
  optional?: boolean;
  content: SlideRef[];    // Slides uniquement (pas de sous-sections)
}
```

### Slide Manifest (`slide.json`)

```typescript
interface SlideManifest {
  /** Identifiant = nom du dossier */
  id: string;

  /** Titre */
  title: string;

  /** Description courte */
  description?: string;

  /** Type */
  type: "page" | "image" | "interactive";

  /** Format (auto-détecté si absent) */
  format?: "html" | "markdown";

  /** Durée estimée */
  duration?: string;

  /** Icône */
  icon?: string;

  /** Pour type "image" */
  imageSrc?: string;
  imageAlt?: string;

  /** Références */
  references?: {
    slides?: string[];    // Même epic
    epics?: string[];     // Autres epics
  };
}
```

### Formats de contenu

| Format | Fichier | Usage |
|--------|---------|-------|
| HTML | `index.html` | Contrôle total, interactivité |
| Markdown | `index.md` | Articles, tutoriels simples |

Détection automatique : `html` prioritaire sur `md`.

### Markdown supporté

```markdown
---
title: Mon titre
duration: 5 min
---

# Titre

Paragraphe avec **gras** et *italique*.

## Section

- Liste
- À puces

```javascript
const code = "coloré";
```

> Citation

| Tableau | Support |
|---------|---------|
| Oui     | Basique |

![Image](./image.png)

[Lien vers slide](#slide:autre-slide)
[Lien vers epic](#epic:autre-epic)
```

### Index auto-généré

Si `index` n'est pas défini dans l'epic, le système génère automatiquement un sommaire cliquable à partir de la structure `content`.

---

## 5. Assets & Médias

### Structure

Chaque Epic possède un dossier `assets/` pour les médias partagés entre slides :

```
parcours/epics/mon-epic/
├── epic.json
├── thumbnail.png           # Vignette 380x180 (19:9), < 50KB, optionnel
├── assets/                 # Médias de l'epic
│   ├── images/
│   │   ├── schema.png
│   │   └── capture.jpg
│   ├── videos/
│   │   └── demo.mp4
│   └── audio/
│       └── narration.mp3
└── slides/
    └── 01-intro/
        ├── slide.json
        ├── index.html
        └── assets/         # Médias spécifiques à la slide (optionnel)
            └── local-image.png
```

### Types de médias supportés

| Type | Extensions | Usage |
|------|------------|-------|
| Images | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg` | Illustrations, schémas, captures |
| Vidéos | `.mp4`, `.webm` | Démonstrations, tutoriels |
| Audio | `.mp3`, `.ogg`, `.wav` | Narration, effets sonores |

### Référencement dans les slides

**Depuis HTML :**
```html
<!-- Asset de l'epic (chemin relatif depuis la slide) -->
<img src="../../assets/images/schema.png" alt="Schéma">

<!-- Asset local à la slide -->
<img src="./assets/local-image.png" alt="Image locale">

<!-- Vidéo -->
<video controls>
  <source src="../../assets/videos/demo.mp4" type="video/mp4">
</video>

<!-- Audio -->
<audio controls src="../../assets/audio/narration.mp3"></audio>
```

**Depuis Markdown :**
```markdown
<!-- Image -->
![Schéma](../../assets/images/schema.png)

<!-- Pas de support natif vidéo/audio en Markdown, utiliser HTML inline -->
<video controls src="../../assets/videos/demo.mp4"></video>
```

### Limites de taille

| Élément | Limite | Raison |
|---------|--------|--------|
| Image | < 500KB | Performance web |
| Vidéo | < 10MB | GitHub Pages, temps de chargement |
| Audio | < 5MB | Idem |
| Vignette (`thumbnail.*`) | 380x180px (19:9), < 50KB | Affichage catalogue |
| Total Epic | < 50MB | Taille repo GitHub |

### Bonnes pratiques

1. **Optimiser les images** : Utiliser WebP quand possible, compresser PNG/JPEG
2. **Vidéos courtes** : Préférer des clips de < 2 minutes
3. **Hébergement externe** : Pour les médias volumineux, utiliser YouTube/Vimeo et intégrer via iframe
4. **Alt text** : Toujours fournir des descriptions pour l'accessibilité
5. **Lazy loading** : Les images/vidéos sont chargées à la demande

### Validation au build

| Règle | Niveau |
|-------|--------|
| Fichier référencé existe | Erreur |
| Extension supportée | Warning |
| Taille < limite | Warning |
| Alt text présent (images) | Info |

---

## 6. Taxonomie

### Système dual

```
HIÉRARCHIE (exploration)          TAGS (filtrage)
────────────────────────          ────────────────
📁 PlayLab42 (3)                  [howto] [javascript]
📁 Autres (8)                     [débutant] [recette]
   ├── (Cuisine absorbé: 2)       [photo] [python]
   └── (Photo absorbé: 1)
```

### Règles hiérarchie

| Règle | Description |
|-------|-------------|
| Threshold | Catégorie visible si >= 3 epics |
| Absorption | Sous le threshold → "autres" du parent |
| Fallback | `hierarchy` vide ou invalide → racine "autres" |
| MVP | Seulement `playlab42` + `autres` au démarrage |

### Configuration (`index.json`)

```json
{
  "taxonomy": {
    "threshold": 3,
    "hierarchy": [
      {
        "id": "playlab42",
        "label": "PlayLab42",
        "icon": "🎮",
        "order": 1
      },
      {
        "id": "autres",
        "label": "Autres",
        "icon": "📚",
        "order": 99
      }
    ],
    "tagLabels": {
      "howto": "Tutoriels",
      "debutant": "Débutant"
    }
  },
  "featured": {
    "showRecent": true,
    "recentCount": 3,
    "sections": [
      {
        "id": "getting-started",
        "title": "Pour commencer",
        "icon": "🚀",
        "epics": ["hello-playlab42", "creer-un-jeu"]
      }
    ]
  }
}
```

### Vignette catégorie

MVP : première vignette d'epic trouvée dans la catégorie.

---

## 7. Build & Aggregation

### Commande

```bash
npm run build:parcours
# ou
make build:parcours
```

### Algorithme

```
1. LOAD index.json (config)

2. SCAN parcours/epics/*/epic.json
   Pour chaque epic :
   a. Valider le manifest
   b. Parser content (slides + sections)
   c. Vérifier existence des slides référencées
   d. Compter slides (total, optionnelles)
   e. Calculer durée totale
   f. Collecter tags
   g. Assigner à la hiérarchie

3. BUILD hierarchy
   a. Compter epics par nœud
   b. Appliquer threshold
   c. Absorber nœuds < threshold dans "autres"
   d. Sélectionner vignette par catégorie

4. AGGREGATE tags
   a. Collecter tous les tags
   b. Compter occurrences
   c. Appliquer labels

5. BUILD featured
   a. Résoudre sections depuis index.json
   b. Extraire récents si activé

6. OUTPUT data/parcours.json

7. REPORT
   - Epics: N trouvés, M publiés
   - Tags: N uniques
   - Erreurs/warnings
```

### Validation

| Règle | Niveau |
|-------|--------|
| Epic a au moins 1 slide | Erreur |
| Slides référencées existent | Erreur |
| Slide a `index.html` ou `index.md` | Erreur |
| Champs requis présents | Erreur |
| Vignette existe si spécifiée | Warning |
| Epic draft | Info (ignoré) |

### Output (`data/parcours.json`)

```typescript
interface ParcoursCatalogue {
  version: "1.0";
  generatedAt: string;

  epics: ParcoursEntry[];

  taxonomy: {
    hierarchy: HierarchyNode[];
    tags: TagEntry[];
  };

  featured: {
    recent?: ParcoursEntry[];
    sections: FeaturedSection[];
  };
}

interface ParcoursEntry {
  id: string;
  title: string;
  description: string;
  path: string;
  hierarchy: string[];
  tags: string[];
  author: string;
  created: string;
  updated?: string;
  duration?: string;
  difficulty?: string;
  icon?: string;
  thumbnail?: string;
  slideCount: number;
  optionalSlideCount: number;
  hasIndex: boolean;
  structure: StructureNode[];
}

interface HierarchyNode {
  id: string;
  label: string;
  icon?: string;
  count: number;
  thumbnail?: string;
  visible: boolean;
  children: HierarchyNode[];
}

interface TagEntry {
  id: string;
  label: string;
  count: number;
}

interface StructureNode {
  type: "slide" | "section";
  id: string;
  title: string;
  icon?: string;
  optional?: boolean;
  children?: StructureNode[];
}

interface FeaturedSection {
  id: string;
  title: string;
  icon?: string;
  epics: ParcoursEntry[];
}
```

---

## 8. Progression utilisateur

### Storage

```typescript
// localStorage key: "parcours-progress"

interface ParcoursProgress {
  [epicId: string]: EpicProgress;
}

interface EpicProgress {
  /** Slides visitées */
  visited: string[];

  /** Slide actuelle */
  current: string | null;

  /** Complété (toutes les non-optionnelles vues) */
  completed: boolean;

  /** Dernière visite ISO 8601 */
  lastVisited: string;
}
```

### Comportement

| Action | Effet |
|--------|-------|
| Ouvrir epic | Reprendre à `current` ou début |
| Voir slide | Ajouter à `visited` |
| Quitter | Sauvegarder `current` |
| Toutes slides vues | Marquer `completed: true` |

---

## 9. Accessibilité

### ARIA

```html
<!-- Navigation principale -->
<nav aria-label="Navigation parcours">
  <button aria-expanded="false" aria-controls="menu-parcours">
    ☰ Menu
  </button>
</nav>

<!-- Menu latéral -->
<aside id="menu-parcours" role="navigation" aria-label="Sommaire">
  <ul role="tree">
    <li role="treeitem" aria-expanded="true">
      <span>Introduction</span>
      <ul role="group">
        <li role="treeitem" aria-current="page">Prérequis</li>
      </ul>
    </li>
  </ul>
</aside>

<!-- Contenu principal -->
<main role="main" aria-labelledby="slide-title">
  <h1 id="slide-title">Prérequis</h1>
</main>

<!-- Navigation slides -->
<nav aria-label="Navigation entre slides">
  <button aria-label="Slide précédente">←</button>
  <span aria-live="polite">2 sur 8</span>
  <button aria-label="Slide suivante">→</button>
</nav>
```

### Clavier

| Touche | Action |
|--------|--------|
| `Tab` | Navigation entre éléments focusables |
| `Enter` / `Space` | Activer élément focusé |
| `←` | Slide précédente |
| `→` | Slide suivante |
| `Escape` | Fermer menu / retour |
| `m` | Toggle menu |
| `Home` | Première slide |
| `End` | Dernière slide |

### Focus

- Focus visible sur tous les éléments interactifs
- Focus trap dans le menu mobile ouvert
- Retour du focus après fermeture modale

---

## 10. Responsive

### Breakpoints

| Breakpoint | Nom | Comportement |
|------------|-----|--------------|
| < 640px | Mobile | Menu drawer, navigation empilée |
| 640-1024px | Tablet | Menu overlay, layout flexible |
| > 1024px | Desktop | Menu sidebar fixe |

### Mobile (< 640px)

```
┌─────────────────────────┐
│ [☰] Guide       2/8 ▓▓░│
├─────────────────────────┤
│                         │
│   Breadcrumb: Intro >   │
│   Prérequis             │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   CONTENU SLIDE     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ [← Préc]    [Suiv →]    │
└─────────────────────────┘

Menu (drawer depuis la gauche) :
┌──────────────────┐
│ 📑 Sommaire  [✕] │
├──────────────────┤
│ ▼ Introduction   │
│   ├─ ✓ Bienvenue │
│   └─ ● Prérequis │
│ ▶ Créer contenu  │
└──────────────────┘
```

### Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Catalogue]           Guide Contribution           2/8 ▓▓░░░ │
├────────────────────┬────────────────────────────────────────────┤
│ 📑 Sommaire        │                                            │
│                    │  Breadcrumb: Introduction > Prérequis      │
│ ▼ Introduction     │                                            │
│   ├─ ✓ Bienvenue   │  ┌────────────────────────────────────┐   │
│   └─ ● Prérequis   │  │                                    │   │
│                    │  │         CONTENU SLIDE              │   │
│ ▶ Créer contenu    │  │                                    │   │
│                    │  └────────────────────────────────────┘   │
│ ▶ Bonnes pratiques │                                            │
│                    ├────────────────────────────────────────────┤
│ ──────────────     │ [← Bienvenue]          [Créer contenu →]   │
│ Progression: 25%   │                                            │
└────────────────────┴────────────────────────────────────────────┘
```

---

## 11. Contraintes techniques

### GitHub Pages

| Contrainte | Solution |
|------------|----------|
| Pas de serveur | 100% statique, JS côté client |
| Pas de rewrite URL | Hash routing (`/#/parcours/...`) |
| Pas de build dynamique | Catalogue pré-généré |

### Performance

| Métrique | Cible |
|----------|-------|
| First paint | < 1s |
| Catalogue chargé | < 2s |
| Navigation slide | < 200ms |

### Lazy loading

```
Chargé:     [current]
Préchargé:  [prev] [next]
À la demande: [...autres...]
```

### Tailles

| Élément | Limite |
|---------|--------|
| Vignette | 380x180px (19:9), < 50KB |
| Slide | < 500KB total |
| Epic | < 5MB total |
| Catalogue JSON | < 500KB |

---

## 12. Structure des fichiers

```
playlab42/
├── parcours/
│   ├── index.json                  # Config globale
│   │
│   ├── _shared/                    # Assets partagés globaux
│   │   ├── slide-base.css
│   │   └── slide-utils.js
│   │
│   └── epics/
│       ├── hello-playlab42/
│       │   ├── epic.json
│       │   ├── thumbnail.png       # Vignette de l'epic
│       │   ├── assets/             # Médias de l'epic
│       │   │   ├── images/
│       │   │   │   └── schema.png
│       │   │   ├── videos/
│       │   │   │   └── demo.mp4
│       │   │   └── audio/
│       │   │       └── narration.mp3
│       │   └── slides/
│       │       ├── 01-bienvenue/
│       │       │   ├── slide.json
│       │       │   ├── index.html
│       │       │   └── assets/     # Médias locaux à la slide
│       │       │       └── local.png
│       │       └── 02-premier-pas/
│       │           ├── slide.json
│       │           └── index.md
│       │
│       └── autre-epic/
│           ├── epic.json
│           ├── thumbnail.jpg
│           ├── assets/
│           │   └── images/
│           └── slides/
│               └── 01-intro/
│                   ├── slide.json
│                   └── index.md
│
├── data/
│   ├── catalogue.json              # Tools + Games
│   └── parcours.json               # Epics (généré)
│
├── lib/
│   ├── parcours-viewer.js          # Viewer de parcours (orchestrateur)
│   ├── parcours-viewer.css         # Styles du viewer
│   ├── parcours-slide.css          # Styles communs slides
│   └── parcours/                   # Modules du viewer
│       ├── ParcoursProgress.js     # Gestion progression utilisateur
│       ├── ParcoursNavigation.js   # Navigation entre slides
│       └── ParcoursUI.js           # Rendu HTML du viewer
│
└── index.html                      # SPA entry point
```

### Conventions nommage

| Élément | Format |
|---------|--------|
| Dossier epic | `kebab-case` |
| Dossier slide | `NN-kebab-case` (préfixe numéro optionnel) |
| Fichiers config | `epic.json`, `slide.json`, `index.json` |
| Contenu | `index.html` ou `index.md` |
| Vignette | `thumbnail.{png,jpg,webp}` |

---

## 13. Architecture du Viewer

Le viewer de parcours utilise une architecture modulaire pour séparer les responsabilités.

### Vue d'ensemble

```
lib/
├── parcours-viewer.js          # Orchestrateur principal
└── parcours/
    ├── ParcoursProgress.js     # Gestion de la progression
    ├── ParcoursNavigation.js   # Navigation entre slides
    └── ParcoursUI.js           # Rendu HTML
```

### ParcoursViewer (orchestrateur)

Classe principale qui coordonne les trois modules.

```typescript
class ParcoursViewer {
  private progress: ParcoursProgress;
  private navigation: ParcoursNavigation;
  private ui: ParcoursUI;

  /**
   * Charge un epic et affiche la première slide.
   */
  async load(epicId: string): Promise<void>;

  /**
   * Ferme le viewer et retourne au catalogue.
   */
  close(): void;

  /**
   * Libère les ressources.
   */
  dispose(): void;
}
```

### ParcoursProgress

Gère la progression utilisateur dans les epics.

```typescript
class ParcoursProgress {
  /**
   * Marque une slide comme visitée.
   */
  markVisited(epicId: string, slideId: string): void;

  /**
   * Retourne la liste des slides visitées pour un epic.
   */
  getVisited(epicId: string): string[];

  /**
   * Retourne la dernière slide visitée pour un epic.
   */
  getCurrent(epicId: string): string | null;

  /**
   * Sauvegarde la progression en localStorage.
   */
  save(): void;

  /**
   * Charge la progression depuis localStorage.
   */
  load(): void;
}
```

**Clé localStorage** : `playlab42_parcours_progress`

**Format de stockage** :
```typescript
interface StoredProgress {
  [epicId: string]: {
    visited: string[];
    current: string | null;
  };
}
```

### ParcoursNavigation

Gère la navigation entre slides et les raccourcis clavier.

```typescript
class ParcoursNavigation {
  /**
   * Va à la slide précédente.
   */
  prev(): void;

  /**
   * Va à la slide suivante.
   */
  next(): void;

  /**
   * Va à une slide spécifique.
   */
  goTo(slideId: string): void;

  /**
   * Retourne l'index de la slide courante.
   */
  getCurrentIndex(): number;

  /**
   * Active les raccourcis clavier.
   */
  enableKeyboardNavigation(): void;

  /**
   * Désactive les raccourcis clavier.
   */
  disableKeyboardNavigation(): void;
}
```

**Raccourcis clavier** : Voir section 9. Accessibilité.

### ParcoursUI

Gère le rendu HTML du viewer.

```typescript
class ParcoursUI {
  /**
   * Rend le conteneur principal du viewer.
   */
  render(): HTMLElement;

  /**
   * Met à jour le contenu de la slide.
   */
  updateSlide(html: string): void;

  /**
   * Met à jour le breadcrumb.
   */
  updateBreadcrumb(epic: Epic, slide: Slide): void;

  /**
   * Met à jour la barre de progression.
   */
  updateProgress(current: number, total: number): void;

  /**
   * Affiche/masque le menu latéral.
   */
  toggleMenu(): void;

  /**
   * Rend le sommaire des slides.
   */
  renderTableOfContents(slides: Slide[], visited: string[]): void;
}
```

### Communication entre modules

```
┌─────────────────────────────────────────────────────────────┐
│                    ParcoursViewer                           │
│                    (orchestrateur)                          │
├─────────────────────────────────────────────────────────────┤
│                          │                                  │
│    ┌─────────────────────┼─────────────────────┐           │
│    │                     │                     │           │
│    ▼                     ▼                     ▼           │
│ ┌──────────┐      ┌──────────────┐      ┌──────────┐      │
│ │ Progress │◄────►│  Navigation  │◄────►│    UI    │      │
│ └──────────┘      └──────────────┘      └──────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- **Progress** notifie Navigation quand la progression change
- **Navigation** notifie UI pour mettre à jour l'affichage
- **UI** notifie Navigation des clics utilisateur
- **ParcoursViewer** coordonne l'initialisation et le cleanup

---

## 14. Communication slide ↔ viewer

Les slides chargées dans l'iframe peuvent communiquer avec le viewer parent via `postMessage`.

### 14.1 Protocole

#### Messages slide → viewer

| Type | Payload | Description |
|------|---------|-------------|
| `slide:toc` | `{ items: TocItem[] }` | Envoie la table des matières interne |
| `slide:toc:clear` | - | Efface la TOC (optionnel, auto au changement) |

#### Messages viewer → slide

| Type | Payload | Description |
|------|---------|-------------|
| `viewer:scroll-to` | `{ anchor: string }` | Demande de scroller vers une ancre |

### 14.2 Format TocItem

```typescript
interface TocItem {
  /** Identifiant de l'ancre (ex: "intro", "backprop") */
  id: string;

  /** Texte affiché dans la navigation (tronqué si trop long) */
  label: string;

  /** Emoji optionnel */
  icon?: string;

  /** Niveau de profondeur (1 = h2, 2 = h3) */
  level?: number;
}
```

### 14.3 Limites

| Limite | Valeur | Raison |
|--------|--------|--------|
| Max items TOC | 15 | Éviter surcharge du menu |
| Troncature labels | CSS `text-overflow: ellipsis` | Corrigé par redimensionnement |
| Niveaux max | 2 (h2, h3) | Limiter la profondeur |

### 14.4 API slide-utils.js

```typescript
/**
 * Envoie la table des matières interne au viewer.
 * La TOC sera affichée dans le menu latéral comme enfants de la slide.
 */
function sendTOC(items: TocItem[]): void;

/**
 * Efface la TOC du viewer.
 * Appelé automatiquement au changement de slide.
 */
function clearTOC(): void;

/**
 * Détecte automatiquement la TOC depuis les headings.
 * @param selector - Sélecteur CSS pour les headings (défaut: 'h2[id], h3[id]')
 */
function autoDetectTOC(selector?: string): TocItem[];
```

### 14.5 Comportement viewer

#### Intégration dans le menu latéral

```
Menu (sidebar) :
├── ✓ Slide 1
├── ▼ ● Slide 2 (avec TOC)      ← slide courante, expandable
│   ├── ○ Intro                  ← ancres intra-slide
│   ├── ○ Chapitre 1
│   ├── ● Chapitre 2             ← ancre active
│   └── ○ Conclusion
└── ○ Slide 3
```

#### Comportement

- Quand une slide envoie `slide:toc`, elle devient **expansible** dans le menu
- Les items TOC apparaissent comme **enfants** de la slide
- La slide est automatiquement **dépliée** pour montrer ses ancres
- Clic sur un item → envoie `viewer:scroll-to` à la slide
- La slide scrolle vers l'ancre avec `scrollIntoView({ behavior: 'smooth' })`

#### Reset

- Au changement de slide, les sous-items TOC sont **retirés** du menu
- L'ancienne slide redevient un item simple (non expansible)
- La nouvelle slide peut envoyer sa propre TOC

### 14.6 Sécurité

- Vérification de l'origine des messages (même origin)
- Validation du format des payloads
- Pas d'exécution de code arbitraire

### 14.7 Menu redimensionnable (Desktop)

```
┌──────────────────┬─║─────────────────────────────────────────┐
│ Sidebar          │ ║ Contenu                                  │
│ (200-400px)      │ ║                                          │
│                  │ ║  Drag la bordure pour redimensionner     │
└──────────────────┴─║─────────────────────────────────────────┘
                     ↑
                  Resize handle
```

**Comportement** :
- Bordure droite de la sidebar draggable
- Largeur min: 200px, max: 400px
- Curseur `col-resize` au survol du handle
- Largeur persistée en `localStorage` (`parcours-menu-width`)
- Restaurée au prochain chargement

---

## 15. Glossaire

Le glossaire permet de définir des termes techniques qui seront affichés au survol dans les slides.

### 15.1 Concepts

**Niveaux de définition :**
- **Global** : `parcours/glossary.json` - Termes partagés entre tous les epics
- **Epic** : `epic.json` (champ `glossary`) ou `glossary.json` dans le dossier epic

**Priorité** : Epic > Global (l'epic peut redéfinir un terme global)

### 15.2 Format du glossaire

```typescript
interface Glossary {
  [term: string]: GlossaryEntry;
}

interface GlossaryEntry {
  /** Définition courte (affichée dans le tooltip) */
  short: string;

  /** Définition longue (affichée dans la page glossaire) */
  long?: string;

  /** Termes liés */
  see?: string[];

  /** Catégorie pour regroupement */
  category?: string;
}
```

**Exemple :**

```json
{
  "régression": {
    "short": "Prédire une valeur numérique continue",
    "long": "En machine learning, la régression consiste à prédire une valeur numérique continue (prix, température, âge) par opposition à la classification qui prédit des catégories.",
    "see": ["classification"],
    "category": "Machine Learning"
  }
}
```

### 15.3 Fichiers glossaire

**Glossaire global :**
```
parcours/
└── glossary.json    # Optionnel, termes partagés
```

**Glossaire epic (deux options) :**

Option A - Dans `epic.json` :
```json
{
  "id": "mon-epic",
  "title": "Mon Epic",
  "glossary": {
    "terme1": { "short": "..." },
    "terme2": { "short": "..." }
  }
}
```

Option B - Fichier séparé :
```
parcours/epics/mon-epic/
├── epic.json
└── glossary.json    # Glossaire de l'epic
```

### 15.4 Marquage des termes dans les slides

**Important** : Le marquage est **explicite**. Les termes ne sont pas auto-détectés. L'auteur doit marquer chaque occurrence qu'il souhaite rendre interactive.

**HTML :**
```html
<!-- Terme simple -->
<dfn>régression</dfn>

<!-- Terme avec texte différent -->
<dfn data-term="régression">régresser</dfn>

<!-- Classe alternative -->
<span class="term" data-term="régression">régression</span>
```

**Markdown :**
```markdown
<!-- Syntaxe wiki-like -->
La [[régression]] consiste à prédire...

<!-- Terme avec texte différent -->
La [[régression|forme régressive]] consiste à...
```

**Transformation Markdown → HTML :**
- `[[terme]]` → `<dfn>terme</dfn>`
- `[[terme|texte]]` → `<dfn data-term="terme">texte</dfn>`

### 15.5 Affichage tooltip

```
Comportement :
1. Terme affiché avec underline pointillé
2. Au hover (desktop) ou tap (mobile) : tooltip apparaît
3. Tooltip contient : terme + définition courte + "voir aussi"
4. Clic sur "Plus" → navigation vers page glossaire (si existe)

Positionnement :
- Par défaut : au-dessus du terme
- Si débordement haut : en-dessous
- Si débordement latéral : ajustement horizontal
```

**Styles :**
```css
dfn, .term {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--color-accent);
  text-underline-offset: 2px;
  cursor: help;
}

.glossary-tooltip {
  position: absolute;
  max-width: 300px;
  padding: 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}
```

### 15.6 Page glossaire auto-générée

**Déclaration dans `epic.json` :**
```json
{
  "content": [
    { "id": "01-intro" },
    { "id": "glossaire", "type": "glossary", "optional": true }
  ]
}
```

**Comportement :**
- Le type `glossary` génère automatiquement le contenu
- Pas besoin de créer de fichier `index.html`
- Termes triés alphabétiquement
- Regroupement par catégorie (si définie)
- Liens vers les termes liés ("voir aussi")
- Ancres pour chaque terme (`#term-regression`)

**Template généré :**
```html
<section class="glossary">
  <h2>Glossaire</h2>

  <div class="glossary-category">
    <h3>Machine Learning</h3>

    <dl>
      <dt id="term-classification">Classification</dt>
      <dd>
        <p class="short">Prédire une catégorie parmi plusieurs.</p>
        <p class="long">Tâche de machine learning consistant à...</p>
        <p class="see">Voir aussi : <a href="#term-regression">régression</a></p>
      </dd>

      <dt id="term-regression">Régression</dt>
      <dd>...</dd>
    </dl>
  </div>
</section>
```

### 15.7 Build & Validation

**Chargement au build :**
```
1. Charger parcours/glossary.json (si existe)
2. Pour chaque epic :
   a. Charger epic.glossary ou glossary.json
   b. Fusionner avec global (epic prioritaire)
   c. Stocker dans le catalogue
```

**Validation :**

| Règle | Niveau |
|-------|--------|
| Terme référencé dans `see` existe | Warning |
| Terme marqué dans slide existe dans glossaire | Warning |
| Définition `short` présente | Erreur |
| Définition `short` < 200 caractères | Warning |

**Output `data/parcours.json` :**
```typescript
interface ParcoursEntry {
  // ... champs existants ...

  /** Glossaire de l'epic (fusionné avec global) */
  glossary?: Glossary;

  /** Nombre de termes définis */
  glossaryTermCount?: number;
}
```

### 15.8 API JavaScript

**Module `ParcoursGlossary.js` :**
```typescript
class ParcoursGlossary {
  /**
   * Charge le glossaire pour un epic.
   */
  async load(epicId: string): Promise<Glossary>;

  /**
   * Récupère la définition d'un terme.
   */
  get(term: string): GlossaryEntry | undefined;

  /**
   * Vérifie si un terme est défini.
   */
  has(term: string): boolean;

  /**
   * Liste tous les termes.
   */
  terms(): string[];

  /**
   * Attache les tooltips aux éléments dfn d'un conteneur.
   */
  attachTooltips(container: HTMLElement): void;

  /**
   * Détache les tooltips.
   */
  detachTooltips(): void;
}
```

**Helper `slide-utils.js` :**
```typescript
/**
 * Marque automatiquement les termes du glossaire dans le contenu.
 * @param container - Élément contenant le texte
 * @param terms - Liste des termes à marquer
 */
function markGlossaryTerms(container: HTMLElement, terms: string[]): void;
```

### 15.9 Accessibilité

- Tooltips accessibles au clavier (focus sur le terme)
- `role="tooltip"` et `aria-describedby` pour les lecteurs d'écran
- Animation respecte `prefers-reduced-motion`
- Contraste suffisant pour le underline

### 15.10 Mobile

- Tap sur le terme affiche le tooltip
- Tap ailleurs ferme le tooltip
- Pas de hover (incompatible tactile)
- Tooltip positionné pour éviter le clavier virtuel

---

## Exemples

### Epic minimal

```json
// parcours/epics/mon-article/epic.json
{
  "id": "mon-article",
  "title": "Mon premier article",
  "description": "Un article simple pour tester.",
  "hierarchy": ["autres"],
  "tags": ["test"],
  "metadata": {
    "author": "moi",
    "created": "2025-01-15"
  },
  "content": [
    { "id": "01-intro" }
  ]
}
```

```json
// parcours/epics/mon-article/slides/01-intro/slide.json
{
  "id": "01-intro",
  "title": "Introduction",
  "type": "page"
}
```

```markdown
<!-- parcours/epics/mon-article/slides/01-intro/index.md -->
# Introduction

Bienvenue dans mon article !
```

### Epic structuré

```json
// parcours/epics/guide-contribution/epic.json
{
  "id": "guide-contribution",
  "title": "Guide de Contribution",
  "description": "Apprenez à contribuer à PlayLab42.",
  "hierarchy": ["playlab42"],
  "tags": ["howto", "contribution"],
  "metadata": {
    "author": "cyrille",
    "created": "2025-01-15",
    "duration": "30 min",
    "difficulty": "beginner"
  },
  "icon": "📖",
  "thumbnail": "thumbnail.png",
  "content": [
    {
      "id": "intro",
      "title": "Introduction",
      "icon": "👋",
      "content": [
        { "id": "bienvenue" },
        { "id": "prerequis" }
      ]
    },
    {
      "id": "creation",
      "title": "Créer du contenu",
      "icon": "✏️",
      "content": [
        { "id": "creer-outil" },
        { "id": "creer-jeu" },
        { "id": "creer-parcours" }
      ]
    },
    {
      "id": "avance",
      "title": "Pour aller plus loin",
      "icon": "🚀",
      "optional": true,
      "content": [
        { "id": "bonnes-pratiques" }
      ]
    }
  ],
  "references": {
    "related": ["hello-playlab42"]
  }
}
```

---

*Spec MVP — PlayLab42 Parcours — v1.0*
