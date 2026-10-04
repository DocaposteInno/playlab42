# Contrat et références du jeu

Chemins relatifs à la racine du dépôt.

| Sujet | Référence à lire |
|---|---|
| Contrat moteur | `openspec/specs/game-engine/spec.md`, `lib/types/game-engine.ts` |
| Implémentation simple | `games/tictactoe/engine.js`, `games/tictactoe/engine.test.js` |
| Guide moteur | `docs/guides/create-game-engine.md` |
| RNG et reprise | `lib/seeded-random.js`, `lib/seeded-random.test.js` |
| Bots | `openspec/specs/bot/spec.md`, `docs/guides/create-bot.md`, `games/tictactoe/bots/` |
| Client et SDK | `docs/guides/create-game-client.md`, `lib/gamekit.js` |
| Manifeste | `openspec/specs/manifests/spec.md`, `games/tictactoe/game.json` |
| Validation réelle du catalogue | `scripts/build-catalogue.js` |
| Gabarit et CLI | `templates/game/`, `docs/guides/contribution-kit.md` |

## Signatures à préserver

```text
init(config) -> state
applyAction(state, action, playerId) -> newState
isValidAction(state, action, playerId) -> boolean
getValidActions(state, playerId) -> actions[]
getPlayerView(state, playerId) -> playerView
isGameOver(state) -> boolean
getWinners(state) -> string[] | null
getCurrentPlayer(state) -> playerId
```

Lire les types pour les cas de jeu simultané et les valeurs autorisées.
`applyAction` rejette une action invalide par une erreur sans changer l'état
entrant. `getValidActions` et `isValidAction` doivent être cohérents.

## Déterminisme vérifiable

Initialiser un RNG local avec `SeededRandom.fromState(state.rngState)`, utiliser
ses méthodes réelles (`int`, `pick`, `shuffle`...), puis reporter `getState()`
dans le nouvel état. `shuffle` mute son tableau : copier le tableau entrant.
Ne pas conserver une instance RNG partagée entre deux parties.

Comparer tous les états de deux replays, pas seulement le gagnant. Intercaler
`JSON.parse(JSON.stringify(state))` au milieu du replay et vérifier la même suite.
Vérifier aussi l'absence de mutation d'un tableau ou objet imbriqué reçu en entrée.

## Jeux temps réel

Lire aussi la section « Jeux temps réel » de `docs/guides/create-game-client.md`.
Le moteur reste une machine de transitions pure : le client lui transmet un temps
explicite, par exemple une action `{ type: 'tick', delta: 100 }`. Cette action est
propre au jeu, pas une nouvelle méthode du SDK commun.

- Stocker les temporisateurs de règles dans l'état JSON : gravité, verrouillage,
  limite de partie et budgets de réinitialisation. Valider les deltas et documenter
  leur unité, leurs bornes et la priorité des événements simultanés.
- Définir le comportement si un tick traverse plusieurs événements. Tester les
  limites exactes, la reprise JSON et les partitions de temps pertinentes ; ne
  supposer ni une fréquence d'écran ni un nombre de frames.
- Garder les répétitions de touches, requestAnimationFrame, Canvas et audio côté
  client. Relâcher les entrées au blur, en pause, à pointercancel et au démontage.
- Ne pas inclure le temps de pause dans un défi chronométré. Choisir explicitement
  la politique de reprise après retour d'onglet et celle des interruptions longues.
- Classer les records selon l'objectif : un temps de Sprint se minimise, alors
  qu'un score se maximise. Ne pas mélanger ces classements ou les modes dans le
  tri descendant générique de `GameKit.saveScore`.

Les tests Jest du moteur ne remplacent pas les parcours navigateur : garder dans
`e2e/` les contrôles natifs, la pause, le focus et l'intégration portail réellement
vérifiés. Lire les helpers de stockage actuels avant d'ajouter une récupération
maison : un JSON corrompu ou un schéma futur doit rester disponible pour restauration.

## Manifeste

Les champs requis sont `id`, `name`, `description`, `players.min`,
`players.max`, `type`, `tags`. `type` vaut `turn-based` ou `real-time`.
Lire la validation actuelle avant d'ajouter les champs optionnels.
Si des bots sont déclarés, `bots.default` désigne un nom de `bots.available`
et chaque `file` pointe sur un fichier livré.

TypeScript est optionnel : lire `AGENTS.md`, le gabarit et le build existant
pour les chemins source/transpilés. Ne pas déclarer un moteur `.ts` en supposant
que le navigateur saura l'exécuter directement.
