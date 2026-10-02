## ADDED Requirements

### Requirement: Protected Theme Persistence

The theme module SHALL use the shared versioned local-data helpers for
reading, writing and removing its preference while keeping its legacy raw
storage representation compatible with first-paint initialization.

#### Scenario: Unsupported storage or corrupt preference
- **WHEN** a theme write encounters corrupt data or an unsupported schema version
- **THEN** it reports the error without mutating the stored bytes or document
- **AND** it does not emit a successful `themechange`

### Requirement: Repeatable Theme Initialization

Theme initialization SHALL reuse its internal listeners until cleanup and
SHALL preserve independently registered theme subscribers.

#### Scenario: Repeated initialization
- **WHEN** `initTheme` is called multiple times before cleanup
- **THEN** a system preference or storage change is handled once
- **AND** cleanup removes only initialization-owned listeners

### Requirement: Read-only Theme Synchronization

The theme module SHALL expose `syncTheme` to apply an already stored
preference and notify subscribers without writing storage.

#### Scenario: Imported preference
- **WHEN** a successful import is followed by `syncTheme`
- **THEN** the document reflects the stored theme and emits `themechange`
- **AND** the synchronization does not mutate localStorage
