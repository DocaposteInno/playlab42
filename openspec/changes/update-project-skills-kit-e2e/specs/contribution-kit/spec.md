## ADDED Requirements

### Requirement: Contribution templates

The project SHALL provide game, tool and epic templates compatible with its
existing manifests, standalone architecture, shared styles and build scripts.

#### Scenario: New tool
- **WHEN** a contributor creates a tool from `templates/tool`
- **THEN** its HTML entry point and `tool.json` follow the existing tool structure
- **AND** its interface reuses the project theme and accessible shared styles

#### Scenario: New game
- **WHEN** a contributor creates a game from `templates/game`
- **THEN** its manifest, client, engine, bot and tests follow the existing game contracts
- **AND** its engine is deterministic, JSON-serializable and independent of DOM, filesystem and network I/O

#### Scenario: New epic
- **WHEN** a contributor creates an epic from `templates/epic`
- **THEN** its epic and slide manifests are compatible with the parcours build
- **AND** its HTML slides reuse the shared slide conventions without changing the teaching program

### Requirement: Safe module scaffolding

The scaffold SHALL accept a module type, kebab-case identifier and title, create
the corresponding module in its established content root and refuse unsafe or
conflicting destinations without overwriting existing files.

#### Scenario: Supported module creation
- **WHEN** a contributor supplies a supported type and valid id/title through the documented scaffold command
- **THEN** the selected template is instantiated under `games/`, `tools/` or `parcours/epics/`
- **AND** the supplied identity and title replace template placeholders consistently
- **AND** the generated manifest can be consumed by the existing catalogue or parcours build

#### Scenario: Invalid input
- **WHEN** the type, identifier or title is missing or invalid
- **THEN** the scaffold reports a descriptive error and exits unsuccessfully
- **AND** no partial module is created

#### Scenario: Existing destination or path escape
- **WHEN** the requested destination already exists or an input attempts to escape its content root
- **THEN** the scaffold refuses the request with an explicit error
- **AND** existing files remain unchanged

### Requirement: Standalone UI gallery

The project SHALL expose `tools/ui-kit/` as a catalogued standalone tool that
demonstrates existing shared UI primitives and accessible interactions.

#### Scenario: Gallery discovery
- **WHEN** the tools catalogue is built and opened
- **THEN** the UI gallery is discoverable through its valid tool manifest
- **AND** it can also be opened directly through the local static server

#### Scenario: Accessible examples
- **WHEN** a contributor explores the gallery in light or dark mode
- **THEN** the examples use shared styles and meaningful labels
- **AND** interactive controls work with keyboard input and visible focus
- **AND** essential state is not communicated only by color

### Requirement: Documented contribution kit

The project SHALL document template structure, scaffold usage, validation and
the gallery while referencing the shared conventions rather than a new stack.

#### Scenario: Contributor follows the kit
- **WHEN** a contributor follows `docs/guides/contribution-kit.md`
- **THEN** the documented type/id/title command matches the implemented interface
- **AND** the guide identifies the relevant module guides, build and targeted checks
