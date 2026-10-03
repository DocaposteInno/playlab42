# Bot Specification

## Purpose

Les Bots sont des IA qui jouent à la place des joueurs humains. C'est un aspect central de Playlab42 :

- **Mode standalone** : Les slots non-humains sont automatiquement remplis par des bots
- **Entraînement** : Bot vs Bot pour tester des stratégies
- **Pédagogie** : Les participants créent leurs propres bots pendant les formations
- **ML/IA** : Base pour l'entraînement de réseaux de neurones

**Contrainte importante** : Comme les GameEngines, les Bots sont **isomorphes** et doivent pouvoir tourner côté client ET serveur.

## Requirements

### Requirement: Bot Interface

The system SHALL define a standard interface for all bots.

#### Scenario: Bot implementation
- **WHEN** a developer creates a bot
- **THEN** they implement the `Bot` interface

#### Scenario: Bot interoperability
- **WHEN** a bot is plugged into a game
- **THEN** it works with any compatible GameEngine

### Requirement: Default Bots

The system SHALL provide default bots for standalone mode.

#### Scenario: Solo game launch
- **WHEN** a user starts a 2-player game alone
- **THEN** a default bot fills the second slot

#### Scenario: Missing players
- **WHEN** a game requires N players but only M humans are present (M < N)
- **THEN** N-M bots are automatically added

### Requirement: Player Slots

The system SHALL support configurable player slots.

#### Scenario: Slot configuration
- **WHEN** a game is configured
- **THEN** each slot can be: human, bot (with bot selection), or disabled

#### Scenario: Multiplayer disabled
- **WHEN** running in standalone mode
- **THEN** multiplayer slots are grayed out (future feature)

### Requirement: Bot Determinism

The system SHALL ensure bots are deterministic when using SeededRandom.

#### Scenario: Replay with bot
- **WHEN** a game with bots is replayed with the same seed
- **THEN** the bots make the same decisions

### Requirement: Bot Isomorphism

The system SHALL ensure bots run identically on client and server.

#### Scenario: Client execution
- **WHEN** a bot runs in a browser (standalone mode)
- **THEN** it produces valid actions

#### Scenario: Server execution
- **WHEN** a bot runs on the server (future multiplayer mode)
- **THEN** it produces the same actions as in browser

#### Scenario: No I/O
- **WHEN** a bot computes its action
- **THEN** it does not access DOM, network, or filesystem

## Interface

### Bot Interface

```typescript
/**
 * Interface pour tous les bots (IA).
 * Un bot reçoit une vue du jeu et retourne une action.
 *
 * @typeParam TPlayerView - Type de la vue joueur (ce que le bot "voit")
 * @typeParam TAction - Type des actions jouables
 */
interface Bot<TPlayerView, TAction> {
  /**
   * Nom du bot (affiché dans l'interface).
   */
  readonly name: string;

  /**
   * Description du bot (stratégie utilisée).
   */
  readonly description: string;

  /**
   * Niveau de difficulté (pour l'affichage).
   */
  readonly difficulty: "easy" | "medium" | "hard" | "expert";

  /**
   * Choisit une action à jouer.
   *
   * @param view - Vue du jeu (fog of war appliqué)
   * @param validActions - Liste des actions valides
   * @param rng - Générateur aléatoire (pour le déterminisme)
   * @returns L'action choisie
   */
  chooseAction(
    view: TPlayerView,
    validActions: TAction[],
    rng: SeededRandom
  ): TAction;

  /**
   * Appelé au début de la partie (optionnel).
   * Permet d'initialiser l'état interne du bot.
   *
   * @param playerId - ID assigné au bot
   * @param config - Configuration de la partie
   */
  onGameStart?(playerId: string, config: unknown): void;

  /**
   * Appelé à la fin de la partie (optionnel).
   * Permet de faire du logging, apprentissage, etc.
   *
   * @param view - Vue finale
   * @param won - Le bot a-t-il gagné ?
   */
  onGameEnd?(view: TPlayerView, won: boolean): void;
}
```

### Bot Registry

```typescript
/**
 * Registre des bots disponibles pour un jeu.
 */
interface BotRegistry<TPlayerView, TAction> {
  /**
   * Bot par défaut (utilisé automatiquement en solo).
   */
  readonly defaultBot: Bot<TPlayerView, TAction>;

  /**
   * Liste de tous les bots disponibles.
   */
  readonly availableBots: Bot<TPlayerView, TAction>[];

  /**
   * Récupère un bot par son nom.
   */
  getBot(name: string): Bot<TPlayerView, TAction> | undefined;
}
```

### Player Slots

```typescript
/**
 * Type de slot joueur.
 */
type PlayerSlotType = "human" | "bot" | "disabled";

/**
 * Configuration d'un slot joueur.
 */
interface PlayerSlot {
  /** Type de slot */
  type: PlayerSlotType;

  /** Nom du bot (si type === "bot") */
  botName?: string;

  /** Label affiché */
  label: string;
}

/**
 * Configuration de lancement de partie.
 */
interface GameLaunchConfig {
  /** Seed pour le générateur aléatoire */
  seed: number;

  /** Configuration des slots joueurs */
  slots: PlayerSlot[];

  /** Options spécifiques au jeu */
  options?: Record<string, unknown>;
}
```

## Configuration de Partie

### Interface de lancement

```
┌─────────────────────────────────────────────────────────────┐
│                    Tic-Tac-Toe                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Joueur 1:  [👤 Humain        ▼]                           │
│                                                              │
│  Joueur 2:  [🤖 Bot: Random   ▼]                           │
│             ├─ 👤 Humain                                    │
│             ├─ 🤖 Bot: Random (Facile)                      │
│             ├─ 🤖 Bot: Minimax (Expert)                     │
│             └─ 🔒 Multijoueur (bientôt)  [grisé]           │
│                                                              │
│  Seed: [  12345  ] [🎲 Aléatoire]                          │
│                                                              │
│              [ ▶ Démarrer la partie ]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Logique de remplissage automatique

```typescript
/**
 * Remplit automatiquement les slots vides avec des bots.
 */
function fillEmptySlots<TPlayerView, TAction>(
  slots: PlayerSlot[],
  requiredPlayers: { min: number; max: number },
  botRegistry: BotRegistry<TPlayerView, TAction>
): PlayerSlot[] {
  const filledSlots = [...slots];

  // Compter les joueurs actifs (humain ou bot)
  const activePlayers = filledSlots.filter(
    (s) => s.type === "human" || s.type === "bot"
  ).length;

  // Remplir avec des bots jusqu'au minimum requis
  for (let i = 0; i < filledSlots.length && activePlayers < requiredPlayers.min; i++) {
    if (filledSlots[i].type === "disabled") {
      filledSlots[i] = {
        type: "bot",
        botName: botRegistry.defaultBot.name,
        label: `Bot ${i + 1}`,
      };
    }
  }

  return filledSlots;
}
```

## Types de Bots

### Bot Random

Le bot le plus simple : choisit une action au hasard parmi les actions valides.

```typescript
class RandomBot<TPlayerView, TAction> implements Bot<TPlayerView, TAction> {
  readonly name = "Random";
  readonly description = "Joue au hasard";
  readonly difficulty = "easy" as const;

  chooseAction(
    _view: TPlayerView,
    validActions: TAction[],
    rng: SeededRandom
  ): TAction {
    return rng.pick(validActions);
  }
}
```

### Bot Greedy

Évalue chaque action et choisit la meilleure selon une heuristique simple.

```typescript
abstract class GreedyBot<TPlayerView, TAction> implements Bot<TPlayerView, TAction> {
  readonly name = "Greedy";
  readonly description = "Choisit le meilleur coup immédiat";
  readonly difficulty = "medium" as const;

  /**
   * Évalue une action (score plus élevé = meilleur).
   * À implémenter pour chaque jeu.
   */
  abstract evaluateAction(view: TPlayerView, action: TAction): number;

  chooseAction(
    view: TPlayerView,
    validActions: TAction[],
    rng: SeededRandom
  ): TAction {
    let bestScore = -Infinity;
    let bestActions: TAction[] = [];

    for (const action of validActions) {
      const score = this.evaluateAction(view, action);
      if (score > bestScore) {
        bestScore = score;
        bestActions = [action];
      } else if (score === bestScore) {
        bestActions.push(action);
      }
    }

    // En cas d'égalité, choisir au hasard (déterministe)
    return rng.pick(bestActions);
  }
}
```

### Bot Minimax

Pour les jeux à 2 joueurs, recherche le meilleur coup avec anticipation.

```typescript
abstract class MinimaxBot<TState, TAction, TPlayerView>
  implements Bot<TPlayerView, TAction>
{
  readonly name = "Minimax";
  readonly description = "Anticipe les coups adverses";
  readonly difficulty = "expert" as const;

  constructor(
    private readonly engine: GameEngine<TState, TAction, TPlayerView, unknown>,
    private readonly maxDepth: number = 5
  ) {}

  /**
   * Évalue un état terminal ou à profondeur max.
   * Score positif = favorable au bot.
   */
  abstract evaluateState(state: TState, botPlayerId: string): number;

  /**
   * Reconstruit l'état complet depuis la vue.
   * Nécessaire car le bot n'a que sa vue.
   */
  abstract viewToState(view: TPlayerView): TState;

  private botPlayerId: string = "";

  onGameStart(playerId: string): void {
    this.botPlayerId = playerId;
  }

  chooseAction(
    view: TPlayerView,
    validActions: TAction[],
    _rng: SeededRandom
  ): TAction {
    const state = this.viewToState(view);
    let bestAction = validActions[0];
    let bestScore = -Infinity;

    for (const action of validActions) {
      const newState = this.engine.applyAction(state, action, this.botPlayerId);
      const score = this.minimax(newState, this.maxDepth - 1, false, -Infinity, Infinity);

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    return bestAction;
  }

  private minimax(
    state: TState,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    if (depth === 0 || this.engine.isGameOver(state)) {
      return this.evaluateState(state, this.botPlayerId);
    }

    const currentPlayer = this.engine.getCurrentPlayer(state);
    if (!currentPlayer) return this.evaluateState(state, this.botPlayerId);

    const validActions = this.engine.getValidActions(state, currentPlayer);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const action of validActions) {
        const newState = this.engine.applyAction(state, action, currentPlayer);
        const score = this.minimax(newState, depth - 1, false, alpha, beta);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Élagage alpha-beta
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const action of validActions) {
        const newState = this.engine.applyAction(state, action, currentPlayer);
        const score = this.minimax(newState, depth - 1, true, alpha, beta);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Élagage alpha-beta
      }
      return minScore;
    }
  }
}
```

## Exemple: Bots Tic-Tac-Toe

```typescript
// Bot Random (par défaut)
class TicTacToeRandomBot extends RandomBot<TicTacToeView, TicTacToeAction> {}

// Bot qui bloque les alignements adverses
class TicTacToeBlockerBot implements Bot<TicTacToeView, TicTacToeAction> {
  readonly name = "Blocker";
  readonly description = "Bloque les alignements adverses";
  readonly difficulty = "medium" as const;

  chooseAction(
    view: TicTacToeView,
    validActions: TicTacToeAction[],
    rng: SeededRandom
  ): TicTacToeAction {
    // 1. Gagner si possible
    for (const action of validActions) {
      if (this.wouldWin(view, action)) {
        return action;
      }
    }

    // 2. Bloquer l'adversaire
    for (const action of validActions) {
      if (this.wouldBlockWin(view, action)) {
        return action;
      }
    }

    // 3. Prendre le centre si libre
    const centerAction = validActions.find((a) => a.position === 4);
    if (centerAction) return centerAction;

    // 4. Sinon, jouer au hasard
    return rng.pick(validActions);
  }

  private wouldWin(view: TicTacToeView, action: TicTacToeAction): boolean {
    // Simuler l'action et vérifier si ça gagne
    // ...
    return false;
  }

  private wouldBlockWin(view: TicTacToeView, action: TicTacToeAction): boolean {
    // Vérifier si cette case bloquerait une victoire adverse
    // ...
    return false;
  }
}

// Bot parfait (Minimax)
class TicTacToePerfectBot extends MinimaxBot<
  TicTacToeState,
  TicTacToeAction,
  TicTacToeView
> {
  readonly name = "Perfect";
  readonly description = "Ne perd jamais (Minimax)";
  readonly difficulty = "expert" as const;

  constructor(engine: TicTacToeEngine) {
    super(engine, 9); // Profondeur max = toutes les cases
  }

  evaluateState(state: TicTacToeState, botPlayerId: string): number {
    if (!state.gameOver) return 0;
    if (state.winners === null) return 0; // Match nul
    return state.winners.includes(botPlayerId) ? 100 : -100;
  }

  viewToState(view: TicTacToeView): TicTacToeState {
    return view; // Pas de fog of war, view === state
  }
}

// Registry
const ticTacToeBotRegistry: BotRegistry<TicTacToeView, TicTacToeAction> = {
  defaultBot: new TicTacToeRandomBot(),
  availableBots: [
    new TicTacToeRandomBot(),
    new TicTacToeBlockerBot(),
    new TicTacToePerfectBot(new TicTacToeEngine()),
  ],
  getBot(name: string) {
    return this.availableBots.find((b) => b.name === name);
  },
};
```

## Game Runner

Le Game Runner orchestre une partie avec des bots :

```typescript
/**
 * Exécute une partie avec des humains et/ou des bots.
 */
class GameRunner<TState, TAction, TPlayerView, TConfig> {
  constructor(
    private readonly engine: GameEngine<TState, TAction, TPlayerView, TConfig>,
    private readonly bots: Map<string, Bot<TPlayerView, TAction>>,
    private readonly rng: SeededRandom
  ) {}

  /**
   * Joue le tour du joueur actuel s'il est un bot.
   * Retourne le nouvel état, ou l'état actuel si c'est un humain.
   */
  playBotTurnIfNeeded(state: TState): TState {
    const currentPlayer = this.engine.getCurrentPlayer(state);
    if (!currentPlayer) return state;

    const bot = this.bots.get(currentPlayer);
    if (!bot) return state; // C'est un humain

    const view = this.engine.getPlayerView(state, currentPlayer);
    const validActions = this.engine.getValidActions(state, currentPlayer);

    if (validActions.length === 0) return state;

    const action = bot.chooseAction(view, validActions, this.rng);
    return this.engine.applyAction(state, action, currentPlayer);
  }

  /**
   * Joue tous les tours de bots jusqu'au prochain tour humain ou fin de partie.
   */
  playUntilHumanTurn(state: TState): TState {
    let currentState = state;

    while (!this.engine.isGameOver(currentState)) {
      const currentPlayer = this.engine.getCurrentPlayer(currentState);
      if (!currentPlayer || !this.bots.has(currentPlayer)) {
        break; // Tour d'un humain
      }

      currentState = this.playBotTurnIfNeeded(currentState);
    }

    return currentState;
  }
}
```

## Manifest Extension

Le `game.json` peut spécifier les bots disponibles :

```json
{
  "id": "tictactoe",
  "name": "Tic-Tac-Toe",
  "players": { "min": 2, "max": 2 },
  "type": "turn-based",
  "bots": {
    "default": "Random",
    "available": [
      {
        "name": "Random",
        "file": "bots/random.ts",
        "difficulty": "easy"
      },
      {
        "name": "Blocker",
        "file": "bots/blocker.ts",
        "difficulty": "medium"
      },
      {
        "name": "Perfect",
        "file": "bots/perfect.ts",
        "difficulty": "expert"
      }
    ]
  }
}
```

## Bonnes Pratiques

### ✅ À faire

- Toujours utiliser le `rng` fourni (déterminisme)
- Implémenter au moins un bot `Random` par défaut
- Documenter la stratégie du bot
- Tester les bots contre eux-mêmes

### ❌ À éviter

- Ne pas utiliser `Math.random()` dans un bot
- Ne pas faire de requêtes réseau dans `chooseAction`
- Ne pas bloquer trop longtemps (timeout possible)
- Ne pas stocker d'état mutable entre les appels

## Tests

Chaque bot doit avoir des tests couvrant :

1. **Validité** : Le bot retourne toujours une action valide
2. **Déterminisme** : Même vue + même seed = même action
3. **Performance** : Le bot répond en temps raisonnable
4. **Comportement** : Le bot joue selon sa stratégie documentée
