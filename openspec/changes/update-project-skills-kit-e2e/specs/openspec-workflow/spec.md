## ADDED Requirements

### Requirement: Pinned official CLI

The project SHALL declare an exact OpenSpec CLI development dependency and
execute it through its Docker-first local npm tooling.

#### Scenario: Reproducible validation
- **WHEN** a contributor invokes the documented OpenSpec validation wrapper
- **THEN** the installed local CLI runs `validate --all --strict --no-interactive`
- **AND** a validation failure is reported as a failure
- **AND** no undeclared global CLI or floating package download is required

#### Scenario: Supported runtime
- **WHEN** the CLI dependency is updated
- **THEN** its official Node requirement is checked against the project's development container
- **AND** the retained exact version and lockfile identify the executable used

### Requirement: Official artifact-guided workflow

The project SHALL configure the official `spec-driven` schema and distinguish
OPSX agent workflows from CLI inspection and validation commands.

#### Scenario: Planning instructions
- **WHEN** an agent requests artifact instructions for a change
- **THEN** `openspec/config.yaml` provides the schema, shared references and artifact rules
- **AND** the agent reads root `AGENTS.md` for the actual stack and conventions

#### Scenario: Independent work
- **WHEN** a change contains independent implementation scopes
- **THEN** agents coordinate real dependencies and file ownership
- **AND** artifact dependencies do not impose artificial serial execution of unrelated tasks

### Requirement: Preserved legacy compatibility

The project SHALL preserve the three existing Claude OpenSpec commands as
explicitly documented local compatibility aliases and retain historical archives
and unrelated active changes.

#### Scenario: Legacy command invocation
- **WHEN** a contributor invokes `/openspec:proposal`, `/openspec:apply` or `/openspec:archive`
- **THEN** the alias references the current common conventions and workflow guide
- **AND** it does not claim to be the official current OPSX integration

#### Scenario: Official integration refresh
- **WHEN** the maintainer regenerates OpenSpec skills
- **THEN** the pinned CLI generates them in an isolated temporary project
- **AND** only the authorized `openspec-*` integration files are copied to the repository
- **AND** compatibility aliases, common conventions, unrelated skills and historical specs are not automatically reset

#### Scenario: Canonical portable integration
- **WHEN** generated OpenSpec skills are added to the project
- **THEN** their canonical bodies are stored in `.github/skills/openspec-*`
- **AND** the existing `.claude/skills` symlink exposes the same bodies without duplication
- **AND** the skill link does not claim to install separate OPSX slash commands

### Requirement: Evidence-based completion and archiving

The project SHALL distinguish implementation authorization, verified task
completion, structural CLI validation, review and actual delivery.

#### Scenario: Explicit implementation request
- **WHEN** the user explicitly requests implementation
- **THEN** the proposal records that request as authorization for its scope
- **AND** it does not fabricate review approval, successful validation, merge or deployment

#### Scenario: Task completion
- **WHEN** an agent updates `tasks.md`
- **THEN** it checks only completed and verified work
- **AND** pending validation and delivery remain visible

#### Scenario: Archive decision
- **WHEN** a change has not been merged or deployed where applicable
- **THEN** it remains active and its new capability deltas are not presented as archived main specs
- **AND** archiving waits for delivery and an explicit decision

### Requirement: Actual strict validation

The project SHALL use the pinned CLI's strict validator for changes and main
specifications, rather than substitute a manual or custom approximation.

#### Scenario: Change handoff
- **WHEN** a change is handed off for integration
- **THEN** its CLI validation command and any remaining validation blockers are identified
- **AND** an unexecuted command is not described as a successful validation

#### Scenario: Historical format errors
- **WHEN** strict validation identifies a malformed existing main specification
- **THEN** only the necessary normative formatting is repaired
- **AND** historical archives and unrelated capability scope are preserved
