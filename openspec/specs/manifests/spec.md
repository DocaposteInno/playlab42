# Manifests Specification

## Overview

Les manifests sont des fichiers JSON qui décrivent les tools et games. Ils sont utilisés par le script de build pour générer le catalogue.

- **tool.json** : Décrit un outil HTML standalone
- **game.json** : Décrit un jeu avec son moteur

## Requirements

### Requirement: Tool Manifest

The system SHALL support `tool.json` files for tools.

#### Scenario: Tool discovery
- **WHEN** the build script scans `tools/`
- **THEN** it finds all `*.json` files and reads them as tool manifests

#### Scenario: Tool without manifest
- **WHEN** a tool has no `tool.json`
- **THEN** it is not included in the catalogue

### Requirement: Game Manifest

The system SHALL support `game.json` files for games.

#### Scenario: Game discovery
- **WHEN** the build script scans `games/*/`
- **THEN** it finds `game.json` in each subdirectory

#### Scenario: Game without manifest
- **WHEN** a game folder has no `game.json`
- **THEN** it is not included in the catalogue

### Requirement: Validation

The system SHALL validate manifests against their schemas.

#### Scenario: Valid manifest
- **WHEN** a manifest has all required fields
- **THEN** it passes validation

#### Scenario: Invalid manifest
- **WHEN** a manifest is missing required fields
- **THEN** the build fails with a descriptive error

## Tool Manifest

### Interface

```typescript
interface ToolManifest {
  /** Identifiant unique (doit correspondre au nom du fichier HTML) */
  id: string;

  /** Nom affiché dans le catalogue */
  name: string;

  /** Description courte (1-2 phrases) */
  description: string;

  /** Tags pour le filtrage (ex: ["math", "utility"]) */
  tags: string[];

  /** Auteur (optionnel) */
  author?: string;

  /** Icône emoji (optionnel, ex: "🧮") */
  icon?: string;

  /** Version (optionnel, ex: "1.0.0") */
  version?: string;
}
```

### Champs

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | string | ✅ | Identifiant unique, doit correspondre au fichier HTML |
| `name` | string | ✅ | Nom affiché |
| `description` | string | ✅ | Description courte |
| `tags` | string[] | ✅ | Tags pour filtrage (peut être vide) |
| `author` | string | ❌ | Auteur de l'outil |
| `icon` | string | ❌ | Emoji représentant l'outil |
| `version` | string | ❌ | Version semver |

### Exemple

Fichier : `tools/calculator.json`

```json
{
  "id": "calculator",
  "name": "Calculatrice",
  "description": "Calculatrice scientifique avec historique",
  "tags": ["math", "utility"],
  "author": "Cyrille",
  "icon": "🧮",
  "version": "1.0.0"
}
```

Le fichier HTML correspondant : `tools/calculator.html`

### Structure de fichiers

```
tools/
├── calculator.html      # L'outil
├── calculator.json      # Son manifest
├── json-formatter.html
├── json-formatter.json
└── timer.html           # Pas de manifest = pas dans le catalogue
```

## Game Manifest

### Interface

```typescript
interface GameManifest {
  /** Identifiant unique (doit correspondre au nom du dossier) */
  id: string;

  /** Nom affiché dans le catalogue */
  name: string;

  /** Description courte (1-2 phrases) */
  description: string;

  /** Configuration des joueurs */
  players: {
    /** Nombre minimum de joueurs */
    min: number;
    /** Nombre maximum de joueurs */
    max: number;
  };

  /** Type de jeu */
  type: "turn-based" | "real-time";

  /** Tags pour le filtrage */
  tags: string[];

  /** Auteur (optionnel) */
  author?: string;

  /** Icône emoji (optionnel) */
  icon?: string;

  /** Version (optionnel) */
  version?: string;

  /** Fichier du moteur TypeScript (optionnel, défaut: "engine.ts") */
  engine?: string;

  /** Configuration par défaut (optionnel) */
  defaultConfig?: Record<string, unknown>;
}
```

### Champs

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | string | ✅ | Identifiant unique, doit correspondre au dossier |
| `name` | string | ✅ | Nom affiché |
| `description` | string | ✅ | Description courte |
| `players` | object | ✅ | Configuration joueurs |
| `players.min` | number | ✅ | Minimum de joueurs |
| `players.max` | number | ✅ | Maximum de joueurs |
| `type` | string | ✅ | "turn-based" ou "real-time" |
| `tags` | string[] | ✅ | Tags pour filtrage |
| `author` | string | ❌ | Auteur du jeu |
| `icon` | string | ❌ | Emoji représentant le jeu |
| `version` | string | ❌ | Version semver |
| `engine` | string | ❌ | Chemin vers le moteur (défaut: engine.ts) |
| `defaultConfig` | object | ❌ | Configuration par défaut |

### Exemple

Fichier : `games/tictactoe/game.json`

```json
{
  "id": "tictactoe",
  "name": "Tic-Tac-Toe",
  "description": "Le classique morpion, premier à aligner 3 symboles gagne",
  "players": {
    "min": 2,
    "max": 2
  },
  "type": "turn-based",
  "tags": ["strategy", "classic", "2-players"],
  "author": "Cyrille",
  "icon": "⭕",
  "version": "1.0.0",
  "defaultConfig": {
    "boardSize": 3,
    "turnTimeout": 30000
  }
}
```

### Structure de fichiers

```
games/
├── tictactoe/
│   ├── index.html       # Point d'entrée standalone
│   ├── engine.ts        # Moteur de jeu
│   ├── game.json        # Manifest
│   └── README.md        # Règles du jeu
├── snake/
│   ├── index.html
│   ├── engine.ts
│   ├── game.json
│   └── README.md
└── wip-game/            # Pas de game.json = pas dans le catalogue
    └── index.html
```

## JSON Schema

### Tool Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "tool.schema.json",
  "title": "ToolManifest",
  "type": "object",
  "required": ["id", "name", "description", "tags"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Identifiant unique (kebab-case)"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "description": "Nom affiché"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Description courte"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[a-z0-9-]+$"
      },
      "description": "Tags pour filtrage"
    },
    "author": {
      "type": "string",
      "description": "Auteur"
    },
    "icon": {
      "type": "string",
      "maxLength": 2,
      "description": "Emoji"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Version semver"
    }
  },
  "additionalProperties": false
}
```

### Game Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "game.schema.json",
  "title": "GameManifest",
  "type": "object",
  "required": ["id", "name", "description", "players", "type", "tags"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Identifiant unique (kebab-case)"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "description": "Nom affiché"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Description courte"
    },
    "players": {
      "type": "object",
      "required": ["min", "max"],
      "properties": {
        "min": {
          "type": "integer",
          "minimum": 1,
          "description": "Minimum de joueurs"
        },
        "max": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum de joueurs"
        }
      },
      "additionalProperties": false
    },
    "type": {
      "type": "string",
      "enum": ["turn-based", "real-time"],
      "description": "Type de jeu"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[a-z0-9-]+$"
      },
      "description": "Tags pour filtrage"
    },
    "author": {
      "type": "string",
      "description": "Auteur"
    },
    "icon": {
      "type": "string",
      "maxLength": 2,
      "description": "Emoji"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Version semver"
    },
    "engine": {
      "type": "string",
      "description": "Chemin vers le moteur"
    },
    "defaultConfig": {
      "type": "object",
      "description": "Configuration par défaut"
    }
  },
  "additionalProperties": false
}
```

## Validation

### Règles de validation

1. **ID unique** : Pas de doublons dans le catalogue
2. **ID = nom fichier/dossier** : `calculator.json` → `id: "calculator"`
3. **Fichier HTML existe** : Le manifest doit avoir un fichier HTML correspondant
4. **Champs requis** : Tous les champs marqués ✅ doivent être présents
5. **Format tags** : kebab-case uniquement (`[a-z0-9-]+`)
6. **players.min ≤ players.max** : Contrainte logique

### Messages d'erreur

```
❌ tools/calculator.json: Missing required field 'name'
❌ games/tictactoe/game.json: players.min (3) > players.max (2)
❌ games/snake/game.json: No index.html found in games/snake/
⚠️  tools/timer.html: No manifest found, skipping
```

## Bonnes Pratiques

### ✅ À faire

- Utiliser des IDs courts et descriptifs en kebab-case
- Écrire des descriptions concises mais informatives
- Ajouter des tags pertinents pour faciliter la recherche
- Versionner les manifests avec semver

### ❌ À éviter

- Ne pas mettre d'espaces ou caractères spéciaux dans les IDs
- Ne pas écrire de descriptions trop longues
- Ne pas oublier le manifest (sinon l'outil/jeu n'apparaît pas)
