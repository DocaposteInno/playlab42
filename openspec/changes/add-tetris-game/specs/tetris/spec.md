## ADDED Requirements

### Requirement: Deterministic falling blocks
The system SHALL provide an immutable JSON-serializable solo engine with a seeded seven-bag randomizer, SRS rotation, ghost landing, hold and bounded lock delay.

#### Scenario: Replay and restore
- **WHEN** identical seeds and actions are used, including after JSON restoration
- **THEN** every resulting state is identical and input states remain unchanged

#### Scenario: Wall and floor rotation
- **WHEN** a piece rotates near an obstacle
- **THEN** SRS kick candidates are tried in order without crossing occupied cells

#### Scenario: Hold and lock
- **WHEN** hold is used twice before locking
- **THEN** the second hold is unavailable and the next lock restores availability

### Requirement: Modes and scoring
The system SHALL support Marathon, Sprint 40 lines and Ultra 120 seconds, line scoring, drop points, combos, back-to-back clears and T-spins.

#### Scenario: Sprint completion
- **WHEN** the player reaches at least 40 cleared lines in Sprint
- **THEN** the game ends in victory and records the elapsed time

#### Scenario: Ultra limit
- **WHEN** simulated elapsed time reaches 120000 milliseconds
- **THEN** Ultra ends and subsequent gameplay actions are rejected

#### Scenario: Top out
- **WHEN** a new piece cannot spawn or locks above the visible board
- **THEN** the game ends without overwriting settled cells

#### Scenario: T-spin after hard drop
- **WHEN** a successful T rotation is followed by a hard drop into a three-corner cavity
- **THEN** the rotation remains eligible for T-spin scoring and the UI announces it even without cleared lines

### Requirement: Playable accessible interface
The system SHALL provide responsive keyboard and touch controls, visible instructions, pause, optional synthesized audio and reduced-motion support.

#### Scenario: Focus loss
- **WHEN** the page loses focus, becomes hidden or receives portal pause
- **THEN** play pauses, held inputs are released and resume requires deliberate input

#### Scenario: Keyboard play
- **WHEN** the board is focused
- **THEN** arrows move/drop, up or X rotates clockwise, Z rotates counterclockwise, C holds, Space hard-drops and Escape or P pauses

#### Scenario: Mobile play
- **WHEN** the viewport is 320 pixels wide
- **THEN** the board and all essential touch controls remain usable without horizontal overflow

### Requirement: Platform integration and records
The system SHALL expose a catalogue manifest, standalone entry point, original thumbnail and mode-specific local records through GameKit persistence.

#### Scenario: Record ordering
- **WHEN** a completed Sprint is faster than the previous record
- **THEN** it becomes the Sprint record independently of Marathon and Ultra scores

#### Scenario: Unload
- **WHEN** the portal unloads the game
- **THEN** the animation loop, event listeners and audio resources are released

#### Scenario: Storage unavailable
- **WHEN** persistence fails
- **THEN** the game remains playable and visibly reports that records cannot be saved
