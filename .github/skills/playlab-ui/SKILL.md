---
name: playlab-ui
description: >-
  Développer ou corriger les interfaces Playlab42 : portail, outils HTML autonomes,
  clients de jeux et slides interactives. Utiliser pour une UI responsive,
  l'accessibilité clavier, le focus, les formulaires, les thèmes clair/sombre
  ou la réutilisation des primitives partagées. Ne pas utiliser pour modifier
  les règles d'un moteur, créer un parcours éditorial ou gérer une release.
---

# Interface Playlab42

## Lire juste ce qui est nécessaire

Lire [AGENTS.md](../../../AGENTS.md), les fichiers concernés et les tests voisins.
Les chemins en code ci-dessous sont relatifs à la racine du dépôt.
Consulter [les références UI](references/ui.md) pour choisir les helpers, puis
`tools/ui-kit/index.html` pour les exemples de la galerie.
Pour une nouvelle fonctionnalité significative, suivre `openspec/AGENTS.md`
et le changement approuvé ; une correction simple ne nécessite pas de proposal.

## Implémenter

1. Identifier la surface et le comportement à conserver : page autonome, iframe
   du portail, formulaire, grille de jeu ou slide. Lire avant de modifier.
2. Garder HTML sémantique, CSS et JavaScript ESM. TypeScript reste optionnel.
   Ne pas introduire React, Tailwind, backend ou nouveau bundler pour une UI.
3. Charger `lib/theme.css` et `lib/ui.css` avec des chemins relatifs à la page.
   Appeler `initTheme()` depuis `lib/theme.js` dans les pages autonomes.
   Réutiliser les tokens existants plutôt qu'une palette locale figée.
   Utiliser `lib/components.css` pour les boutons, cartes, champs et dialogues
   opt-in `ui-*` montrés dans la galerie et repris par les gabarits.
4. Préférer les contrôles natifs. Associer les labels aux champs, donner un nom
   accessible aux boutons icônes, conserver le focus visible et annoncer les
   résultats dynamiques avec une région de statut adaptée.
5. Assurer clavier et tactile : ne pas intercepter les raccourcis pendant une
   saisie (`isEditableTarget`), rendre le focus après fermeture d'une modale,
   gérer Escape et ne pas annoncer chaque image d'une animation.
6. Préserver les thèmes clair/sombre, le zoom, les petits écrans et
   `prefers-reduced-motion`. Ne pas remplacer le focus par un simple survol.
7. Réutiliser `lib/dom.js` quand utile ; insérer les données utilisateur avec
   `textContent` ou des noeuds, pas du HTML non fiable.

Dans un jeu, corriger le rendu et les interactions côté client. **Ne pas changer
`engine.js`, les bots ou les règles pour contourner un défaut visuel.** Si la
demande porte réellement sur les règles, utiliser `playlab-create-game`.
Pour créer un outil, partir du kit de contribution plutôt que recopier une page
sans rapport ; consulter `docs/guides/contribution-kit.md`.

## Vérifier dans l'environnement autorisé

Tout runtime passe par Docker, jamais `npm`, `node` ou les scripts sur le host.
Si le rôle ne permet pas Docker, transmettre les commandes au parent/opérateur
et signaler ce qui n'a pas été exécuté.

- Lancer ensemble les tests Jest ciblés existants via
  `make npm CMD="test -- --runTestsByPath lib/dom.test.js lib/theme.test.js"`
  seulement si ces helpers sont concernés ; choisir les vrais tests de la surface
  pour les autres changements.
- Faire le lint des fichiers JavaScript modifiés avec
  `make npm CMD="exec -- eslint chemin/du/fichier.js"`, en remplaçant le chemin.
- Pour un changement TypeScript, suivre `AGENTS.md` : `make typecheck` et
  `make build-ts`.
- Servir avec `make serve`, connaître l'URL par `make info`, puis contrôler
  navigation clavier, noms accessibles, focus, thèmes et affichage mobile.
  Utiliser `make test-e2e` pour les parcours navigateur existants concernés.

## Livrer

Résumer les fichiers et comportements changés, les éventuelles limites et les
vérifications réellement effectuées. Ne pas prétendre qu'une inspection du HTML
prouve le bon fonctionnement clavier dans un navigateur.
