# Références UI

Chemins relatifs à la racine du dépôt ; lire les sources avant d'utiliser une API.

| Besoin | Source |
|---|---|
| Couleurs, espaces, rayons, typo, thèmes | `lib/theme.css` |
| Initialisation et événements de thème | `lib/theme.js`, `lib/theme.test.js` |
| Focus visible, `.sr-only`, mouvement réduit | `lib/ui.css` |
| Sélection, création de noeuds, événements, saisie clavier | `lib/dom.js`, `lib/dom.test.js` |
| Composants et exemples accessibles | `tools/ui-kit/index.html` |
| Portail | `index.html`, `style.css`, `app.js`, `app/` |
| Slides | `parcours/_shared/slide-base.css`, `parcours/_shared/slide-template.html` |
| Outil autonome et manifeste | `docs/guides/create-tool.md` |
| Client de jeu et communication portail | `docs/guides/create-game-client.md`, `lib/gamekit.js` |
| Démarrage d'un nouveau module | `docs/guides/contribution-kit.md`, `templates/tool/` |

## Détails qui évitent les régressions

- `initTheme()` initialise chaque document autonome et synchronise les changements
  de stockage. Le thème du portail ne suffit pas à styler le document d'une iframe.
- `getEffectiveTheme()` résout le thème système ; `onThemeChange(callback)` fournit
  une fonction de désinscription. Consulter la source pour les rendus canvas.
- Les tokens comprennent `--color-bg`, `--color-text`, `--color-accent`,
  `--color-border`, `--space-md`, `--radius-md` et `--font-family`.
  Vérifier le contraste réel : un token sémantique n'est pas une garantie pour
  toutes les combinaisons texte/fond.
- `isEditableTarget(event.target)` protège input, textarea, select et contenteditable
  des raccourcis globaux. Un raccourci ne doit pas voler la saisie.
- `create()` peut construire du texte sans interpréter du HTML. Les possibilités
  `innerHTML` de certains helpers ne rendent pas une donnée utilisateur fiable.
- Depuis `tools/<id>/index.html` ou `games/<id>/index.html`, utiliser
  `../../lib/theme.css`, `../../lib/ui.css`, `../../lib/theme.js`.
- Depuis `parcours/epics/<id>/slides/<slide-id>/index.html`, utiliser
  `../../../../../lib/theme.css`, `../../../../../lib/theme.js` et
  `../../../../_shared/slide-base.css` ; ce dernier importe déjà `lib/ui.css`.
- Tester à la fois l'URL autonome et l'intégration portail, sans chemins absolus
  qui supposent un déploiement à la racine du domaine.
