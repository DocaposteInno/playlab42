# Tetris — Neon Stack

Jeu solo de blocs tombants, sans framework, sans CDN et sans backend.
La direction artistique, les illustrations et les sons sont créés pour Playlab42.
Le nom du jeu désigne ici les règles de blocs tombants ; aucune affiliation à
un éditeur du jeu historique n'est revendiquée.

## Jouer

Depuis le catalogue Playlab42, choisir **Tetris — Neon Stack**, ou ouvrir
`games/tetris/index.html` depuis le serveur HTTP du projet. Les modules ES
nécessitent un serveur, pas une ouverture `file://`.

Choisir **Marathon** (survivre avec une gravité progressive), **Sprint**
(40 lignes le plus vite possible) ou **Ultra** (maximiser le score en 120 secondes).
Les records sont locaux au navigateur : score maximal en Marathon/Ultra,
temps minimal d'un Sprint réussi. Quitter ou recommencer une partie inachevée
ne remplace pas un record.

| Commande | Clavier |
|---|---|
| Déplacement | Flèches gauche/droite |
| Chute douce | Flèche bas |
| Rotation horaire | Flèche haut ou X |
| Rotation antihoraire | Z |
| Chute immédiate | Espace |
| Réserve | C |
| Pause/reprise | P ou Échap |

Les mêmes actions sont disponibles sur les boutons tactiles et restent utilisables
au clavier. Les déplacements maintenus utilisent une répétition contrôlée par
le jeu, indépendante des préférences du système.

La perte de focus, un onglet masqué, une interruption de rendu supérieure à
250 ms ou une pause du portail suspendent la partie. **La reprise est volontaire** :
le retour dans l'onglet ne fait pas tomber une pièce à l'insu du joueur.
Le bouton son est désactivé par défaut et respecte les préférences du portail.
Les animations respectent `prefers-reduced-motion`.

## Règles

- Terrain visible : 10 colonnes et 20 lignes. Sept tetrominos I, O, T, S, Z, J, L.
- Chaque sac contient une fois chaque pièce ; cinq pièces à venir sont visibles.
- Les rotations suivent SRS avec décalages d'essai spécifiques à I et aux autres
  pièces. La projection en contour indique où la pièce sera posée.
- La réserve est utilisable une fois par pièce ; sa disponibilité revient après
  verrouillage. La pièce échangée revient dans son orientation initiale.
- Une pièce au sol se verrouille après 500 ms. Les ajustements réussis peuvent
  réinitialiser ce délai au plus 15 fois. La chute immédiate pose sans attendre.
- Les lignes complètes s'effacent simultanément. Le niveau augmente tous les
  10 lignes. Le dépassement du terrain ou un point d'apparition occupé termine le jeu.
- Une à quatre lignes rapportent 100, 300, 500, 800 points × niveau.
  Chute douce : 1 point par case ; chute immédiate : 2 points par case.
  Les T-spins et suites difficiles (back-to-back) augmentent les gains ; une série
  de pièces effaçant des lignes ajoute un bonus de combo.

Un T-spin nécessite une rotation et trois coins occupés autour du centre du T.
Deux coins avant occupés, ou le cinquième essai de décalage SRS, font un spin
complet ; sinon c'est un mini. Une translation manuelle réussie annule la rotation,
mais ni la gravité ni la chute immédiate ne l'annulent.

| Figure | 0 ligne | 1 ligne | 2 lignes | 3 lignes |
|---|---|---|---|---|
| T-spin | 400 | 800 | 1200 | 1600 |
| T-spin mini | 100 | 200 | 400 | — |

Ces bases sont multipliées par le niveau avant effacement. Une suite de clears
difficiles (quatre lignes ou T-spin avec lignes) multiplie la base par 1,5.
Une pièce sans effacement conserve cette suite mais coupe le combo ; un clear
simple, double ou triple sans T-spin la coupe. Chaque clear consécutif après
le premier ajoute `50 × index du combo × niveau`.

## Architecture

| Fichier | Responsabilité |
|---|---|
| `engine.js` | Règles pures et état JSON ; aucun accès au navigateur |
| `controller.js` | Simulation à 120 Hz, entrées, focus, modes et cycle de vie |
| `renderer.js` | Canvas haute densité, aperçus et formatage du temps |
| `audio.js` | Motifs Web Audio courts, activés après un geste |
| `records.js` | Records versionnés par mode via la persistance GameKit |
| `main.js` | Assemblage navigateur |
| `index.html`, `style.css` | Interface responsive et sémantique |
| `thumbnail.svg`, `thumb.png` | Vignette source et format attendu par le portail |

Le moteur expose le contrat GameEngine (`init`, `applyAction`, `isValidAction`,
`getValidActions`, `getPlayerView`, `isGameOver`, `getWinners`, `getCurrentPlayer`).
Les actions `tick` portent un `delta` explicite en millisecondes ; le PRNG et les
temporisateurs sont sérialisés dans l'état. Une seed et les mêmes actions donnent
les mêmes états, même après un aller-retour JSON.

```js
import { TetrisEngine } from './engine.js';

const engine = new TetrisEngine();
let state = engine.init({ seed: 42, playerIds: ['human'], mode: 'sprint' });
state = engine.applyAction(state, { type: 'tick', delta: 100 }, 'human');
state = engine.applyAction(state, { type: 'rotateCW' }, 'human');
state = engine.applyAction(state, { type: 'hardDrop' }, 'human');
```

La reprise après perte de focus ne compte pas la durée de pause. Les sauvegardes
contiennent seulement les records, pas une partie active. L'intégration SDK envoie
`ready`, les scores Marathon/Ultra, et `quit` dans le portail. `unload` arrête la
simulation et libère entrées, hooks et audio.

## Développement

Dans le conteneur de développement du projet :

```sh
npm test -- --runInBand games/tetris lib/gamekit.test.js
npx --no-install eslint games/tetris
npm run typecheck
npm run build:catalogue
```

Les tests Jest couvrent le moteur et le vrai contrôleur DOM (Canvas et audio
injectés). Aucun outil E2E supplémentaire n'est ajouté aux dépendances du projet.
OpenSpec : `openspec/changes/add-tetris-game/`. La proposition reste active
jusqu'à validation humaine et déploiement.
