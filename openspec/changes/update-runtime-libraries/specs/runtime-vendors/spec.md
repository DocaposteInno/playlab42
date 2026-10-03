## ADDED Requirements

### Requirement: Local reproducible browser libraries
The system SHALL generate local browser distributions from exactly pinned npm
packages using the existing build tooling, retaining their license notices.

#### Scenario: Static local serving
- **WHEN** the vendor build runs after a locked dependency installation
- **THEN** Tone 15.1.22, VexFlow 5.0.0 and MathJax 4.1.3 are served from the site
- **AND** their browser entry points, fonts and dynamic extensions require no CDN

#### Scenario: Version mismatch
- **WHEN** an installed runtime package differs from the declared vendor version
- **THEN** the vendor build fails with an actionable version error

#### Scenario: Independent vendor builders
- **WHEN** the runtime vendor build runs beside a separate 3D vendor build
- **THEN** only its own distributions and package license directories are cleaned
- **AND** unrelated assets, licenses and manifests remain unchanged
- **AND** its manifest inventories only its own generated files

#### Scenario: Excluded machine learning and 3D
- **WHEN** the runtime vendor build runs
- **THEN** Neural Style and its ML assets remain unchanged
- **AND** unrelated 3D dependencies are not downloaded or included

### Requirement: Music lifecycle compatibility
The system SHALL retain musical exercise rules while rendering with VexFlow 5
and starting Tone 15 only following a user gesture.

#### Scenario: Rapid release during initialization
- **WHEN** a note is released before asynchronous audio initialization finishes
- **THEN** that note does not begin playing after initialization

#### Scenario: Disposal during initialization
- **WHEN** an audio component is destroyed during initialization
- **THEN** completion does not resurrect its resources or produce hanging notes

### Requirement: Local mathematical rendering
The system SHALL render existing mathematical slides using real MathJax 4
with locally available fonts and extensions.

#### Scenario: External requests blocked
- **WHEN** a mathematical slide is opened with external network requests blocked
- **THEN** its existing formulas produce mathematical output using local assets
