## ADDED Requirements

### Requirement: Shared project conventions

Project skills SHALL reference root `AGENTS.md` as the common source of stack,
architecture, Docker-first execution and contribution conventions.

#### Scenario: Skill activation
- **WHEN** an agent uses a `playlab-*` project skill
- **THEN** it reads `AGENTS.md` and the relevant existing guides and specifications
- **AND** the skill does not substitute React, mandatory TypeScript, a backend or WebSocket runtime for the actual project

#### Scenario: Convention update
- **WHEN** a common project convention changes
- **THEN** the shared rule is maintained in `AGENTS.md`
- **AND** skills reference that rule rather than maintain conflicting copies

### Requirement: Scoped contribution guidance

Project skills SHALL provide actionable guidance for their declared contribution
scope, including relevant paths, existing helpers and appropriate validation.

#### Scenario: Selecting a skill
- **WHEN** a contributor requests work covered by a project skill
- **THEN** its metadata identifies the relevant scope
- **AND** its instructions guide the agent to existing manifests, shared primitives and targeted validation

#### Scenario: Parallel ownership
- **WHEN** independent skills or agents contribute to the same change
- **THEN** file ownership and real dependencies determine coordination
- **AND** independent tasks are not forced into a serial workflow

### Requirement: Discoverable project skills

The project SHALL document the installed project skills, their entry points,
limits and relationship to OpenSpec in `docs/guides/project-skills.md`, and SHALL
keep their canonical bodies in `.github/skills/` without divergent client copies.

#### Scenario: Contributor discovers a skill
- **WHEN** a contributor follows the project-skills reference in `AGENTS.md`
- **THEN** the guide points to the actual installed `playlab-*` skills and their relevant guides
- **AND** it distinguishes domain guidance from the official `openspec-*` workflow skills

#### Scenario: Installation boundary
- **WHEN** a project skill describes a validation or generation command
- **THEN** it uses the existing Docker-first execution mechanism
- **AND** it does not assume undeclared global tools are already installed

#### Scenario: Claude skill discovery
- **WHEN** Claude reads the project `.claude/skills` entry point
- **THEN** the relative symlink exposes the canonical `.github/skills` tree
- **AND** no second copy of the skill bodies is maintained for Claude
