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

## Manifeste

Les champs requis sont `id`, `name`, `description`, `players.min`,
`players.max`, `type`, `tags`. `type` vaut `turn-based` ou `real-time`.
Lire la validation actuelle avant d'ajouter les champs optionnels.
Si des bots sont déclarés, `bots.default` désigne un nom de `bots.available`
et chaque `file` pointe sur un fichier livré.

TypeScript est optionnel : lire `AGENTS.md`, le gabarit et le build existant
pour les chemins source/transpilés. Ne pas déclarer un moteur `.ts` en supposant
que le navigateur saura l'exécuter directement.
