# Theme Specification

## Overview

Le système de thèmes gère l'apparence visuelle de Playlab42 (clair/sombre). Il :

- Supporte trois modes : DARK, LIGHT, SYSTEM
- Persiste le choix utilisateur en localStorage
- Réagit aux préférences système (`prefers-color-scheme`)
- Notifie les composants via un événement custom

**Fichier** : `lib/theme.js`

## Requirements

### Requirement: Theme Modes

The system SHALL support three theme modes.

#### Scenario: Dark mode
- **WHEN** theme is set to DARK
- **THEN** `data-theme="dark"` is applied to document

#### Scenario: Light mode
- **WHEN** theme is set to LIGHT
- **THEN** `data-theme="light"` is applied to document

#### Scenario: System mode
- **WHEN** theme is set to SYSTEM
- **THEN** theme follows `prefers-color-scheme` media query

### Requirement: Persistence

The system SHALL persist theme preference in localStorage.

#### Scenario: Save preference
- **WHEN** user changes theme
- **THEN** choice is saved to `playlab42_theme` key

#### Scenario: Restore preference
- **WHEN** page loads
- **THEN** saved preference is applied before first paint

### Requirement: System Preference Detection

The system SHALL detect and react to system preference changes.

#### Scenario: System preference change
- **WHEN** user changes OS dark/light mode
- **AND** theme is set to SYSTEM
- **THEN** effective theme updates automatically

### Requirement: Change Notification

The system SHALL notify components of theme changes.

#### Scenario: Theme change event
- **WHEN** effective theme changes
- **THEN** `themechange` CustomEvent is dispatched on window
- **AND** event.detail contains `{ theme, effectiveTheme }`

## Interface

```typescript
/**
 * Modes de thème disponibles.
 */
type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Thème effectif (résolu).
 */
type EffectiveTheme = 'dark' | 'light';

/**
 * Retourne le mode de thème actuel.
 */
function getTheme(): ThemeMode;

/**
 * Définit le mode de thème.
 * @param theme - Le mode à appliquer
 */
function setTheme(theme: ThemeMode): void;

/**
 * Bascule entre dark et light (ignore system).
 */
function toggleTheme(): void;

/**
 * Retourne le thème effectif (résolu depuis system si nécessaire).
 */
function getEffectiveTheme(): EffectiveTheme;

/**
 * Initialise le système de thèmes.
 * À appeler au plus tôt pour éviter le flash.
 */
function initTheme(): void;

/**
 * Enregistre un callback pour les changements de thème.
 * @param callback - Fonction appelée avec le nouveau thème effectif
 * @returns Fonction pour se désinscrire
 */
function onThemeChange(callback: (theme: EffectiveTheme) => void): () => void;
```

## Constantes

```typescript
const THEME_STORAGE_KEY = 'playlab42_theme';
const THEME_MODES = ['dark', 'light', 'system'] as const;
const DEFAULT_THEME: ThemeMode = 'system';
```

## Exemples

### Initialisation précoce (éviter flash)

```html
<head>
  <script>
    // Inline dans le head pour éviter FOUC
    (function() {
      const saved = localStorage.getItem('playlab42_theme');
      const theme = saved || 'system';
      let effective = theme;
      if (theme === 'system') {
        effective = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', effective);
    })();
  </script>
</head>
```

### Utilisation dans un composant

```javascript
import { getEffectiveTheme, onThemeChange } from './lib/theme.js';

// Lire le thème actuel
const theme = getEffectiveTheme(); // 'dark' ou 'light'

// Réagir aux changements
const unsubscribe = onThemeChange((newTheme) => {
  console.log('Thème changé:', newTheme);
  updateComponentStyles(newTheme);
});

// Se désinscrire plus tard
unsubscribe();
```

### Toggle dans l'UI

```javascript
import { toggleTheme, getTheme } from './lib/theme.js';

themeButton.addEventListener('click', () => {
  toggleTheme();
  updateButtonIcon(getTheme());
});
```

## Intégration CSS

```css
/* Variables par thème */
:root[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #1a1a2e;
  --accent-color: #6c5ce7;
}

:root[data-theme="dark"] {
  --bg-color: #1a1a2e;
  --text-color: #e0e0e0;
  --accent-color: #a29bfe;
}

/* Utilisation */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

## Bonnes Pratiques

### ✅ À faire

- Initialiser le thème dans le `<head>` pour éviter le flash
- Utiliser les variables CSS pour tous les styles liés au thème
- Écouter `themechange` pour les composants dynamiques

### ❌ À éviter

- Ne pas utiliser `@media (prefers-color-scheme)` directement en CSS (géré par JS)
- Ne pas stocker le thème ailleurs que dans localStorage
- Ne pas modifier `data-theme` directement (utiliser `setTheme()`)

## Couleurs d'accent adaptatives

Pour les contenus pédagogiques (parcours, slides), il est courant d'utiliser des couleurs d'accent thématiques (jaune pour supervisé, cyan pour non-supervisé, etc.). Ces couleurs doivent être **lisibles dans les deux thèmes**.

### Problème

Les classes Tailwind comme `text-yellow-400` ou `text-purple-300` sont conçues pour le thème sombre et manquent de contraste sur fond clair.

### Solution

Créer des classes utilitaires avec des variantes par thème :

```css
/* Couleur par défaut (light mode) : teintes foncées -700 */
.dl-accent-yellow { color: #b45309 !important; }  /* amber-700 */
.dl-accent-purple { color: #6d28d9 !important; }  /* violet-700 */

/* En thème sombre : teintes claires -400 */
:root:not([data-theme="light"]) .dl-accent-yellow { color: #fbbf24 !important; }
:root:not([data-theme="light"]) .dl-accent-purple { color: #a78bfa !important; }

/* Support prefers-color-scheme pour les utilisateurs sans JS */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) .dl-accent-yellow { color: #fbbf24 !important; }
  :root:not([data-theme]) .dl-accent-purple { color: #a78bfa !important; }
}
```

### Palette recommandée

| Couleur | Light mode (-700) | Dark mode (-400) | Usage exemple |
|---------|-------------------|------------------|---------------|
| Yellow | `#b45309` | `#fbbf24` | Supervisé, highlights |
| Cyan | `#0e7490` | `#22d3ee` | Non-supervisé |
| Green | `#047857` | `#34d399` | Analogies, succès |
| Red | `#b91c1c` | `#f87171` | Renforcement, erreurs |
| Purple | `#6d28d9` | `#a78bfa` | Auto-supervisé, code |
| Blue | `#1d4ed8` | `#60a5fa` | Liens, concepts |
| Orange | `#c2410c` | `#fb923c` | Warnings, biais |

### Implémentation parcours

Le parcours `deep-learning-intro` implémente ces classes dans `_shared/deep-learning.css`. Elles peuvent servir de référence pour d'autres parcours nécessitant des couleurs thématiques.
