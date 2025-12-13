# Tasks: parcours-post-mvp

## Phase 1: Conversion Markdown

- [x] Choisir bibliothèque markdown (marked vs micromark) → **marked**
- [x] Installer dépendance npm → `npm install marked`
- [x] Modifier `build-parcours.js`
  - [x] Détecter `index.md` vs `index.html`
  - [x] Convertir Markdown → HTML
  - [x] Injecter dans template HTML
- [x] Créer template `parcours/_shared/slide-template.html`
- [x] Ajouter syntax highlighting (optionnel)
  - [x] Choisir lib (Prism.js, highlight.js) → **highlight.js via CDN**
  - [x] Intégrer au build → thème adaptatif clair/sombre
- [x] Tester avec slide Markdown de démo
- [x] Documenter dans guide → `parcours/README.md`

## Phase 2: Tests unitaires

### build-parcours.js → parcours-utils.js

- [x] Setup jest pour scripts/ → refactoring en module `parcours-utils.js`
- [x] Test `extractSlideIds()`
- [x] Test `countSlides()`
- [x] Test `buildStructure()`
- [x] Test `buildHierarchy()` avec threshold
- [x] Test `aggregateTags()`
- [x] Test `buildFeatured()`
- [x] Test `validateEpicFields()`
- [x] Test `convertMarkdown()` et `injectInTemplate()`
- [ ] Test intégration (génération complète) - Optionnel

### parcours-viewer.js

- [x] Test `flattenStructure()` - fonction pure sans DOM
- [ ] Tests DOM (reportés) - nécessite jest-dom
  - [ ] Test `showSlide()`
  - [ ] Test `prev()` / `next()` / `goTo()`
  - [ ] Test `toggleMenu()`
  - [ ] Test `loadProgress()` / `saveProgress()`
  - [ ] Test `handleKeydown()`
  - [ ] Test `handleHashRoute()`

## Phase 3: Documentation

- [x] Créer `docs/guides/create-epic.md`
  - [x] Introduction (qu'est-ce qu'un Epic)
  - [x] Structure de fichiers
  - [x] Format `epic.json` avec tous les champs
  - [x] Format `slide.json` avec exemples
  - [x] Gestion assets (tailles, formats)
  - [x] Sections et optionnels
  - [x] Exemple minimal
  - [x] Exemple complet
  - [x] Checklist de validation
- [x] Mettre à jour `docs/guides/architecture.md`
  - [x] Ajouter section Parcours
  - [x] Diagramme ASCII structure

## Phase 4: Fonctionnalités avancées (optionnel)

- [ ] Mode présentation
  - [ ] Hotkey `p` pour toggle
  - [ ] Masquer header/footer
  - [ ] Curseur caché après inactivité
- [ ] Thèmes de slides
  - [ ] CSS variables pour variantes
  - [ ] Sélecteur dans settings
- [ ] Analytics localStorage
  - [ ] Temps par slide
  - [ ] Nombre de visites
  - [ ] Dashboard dans l'Epic
