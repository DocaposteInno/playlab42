## ADDED Requirements

### Requirement: Repeatable SDK Lifecycle

GameKit SHALL own and remove its message and visibility listeners, preserve
the final disposal hook, and allow initialization after disposal.

#### Scenario: Repeated sessions
- **WHEN** a game initializes, disposes, and initializes again
- **THEN** only the current session receives lifecycle callbacks
- **AND** its paused and sound states are reset to their initial values

#### Scenario: Saved portal sound preference
- **WHEN** the active same-origin game frame announces a new ready session
- **THEN** the portal sends its current sound preference to that frame
- **AND** the SDK reflects the saved preference without requiring a manual toggle

#### Scenario: Final progress save
- **WHEN** `onGameDispose` saves progress
- **THEN** the game identifier remains available during that hook
- **AND** repeated disposal does not call the hook again

### Requirement: Prefix-safe Asset Lifecycle

The asset loader SHALL resolve relative paths against the game directory
under the deployed SDK root and release pending loads and audio clones.

#### Scenario: Prefixed site
- **WHEN** the SDK is served under `/lab/` and game `example` loads `card.png`
- **THEN** the URL resolves under `/lab/games/example/`
- **AND** absolute, data and blob URLs retain their explicit location

#### Scenario: Disposal during loading
- **WHEN** an asset load is pending at disposal
- **THEN** its promise rejects explicitly
- **AND** a late completion cannot repopulate the disposed cache

### Requirement: Optional Message Types

The SDK SHALL provide optional TypeScript types for portal and game messages
without requiring TypeScript in standalone HTML games.

#### Scenario: Typed consumer
- **WHEN** a TypeScript consumer imports the protocol types from `lib/types`
- **THEN** message payloads are discriminated by their `type` field
