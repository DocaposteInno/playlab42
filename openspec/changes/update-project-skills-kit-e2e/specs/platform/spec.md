## MODIFIED Requirements

### Requirement: Standalone First

The system SHALL run tools and games as frontend-only applications without an
application backend; a static HTTP server may serve modules and resources.
JavaScript modules and resource loading do not guarantee universal `file://`
execution.

#### Scenario: Double-click execution
- **WHEN** a user double-clicks a self-contained HTML tool that requires no module imports or fetched resources
- **THEN** the tool can run directly in the browser without an application backend
- **AND** modular tools and games are documented to use the local static server

#### Scenario: File protocol
- **WHEN** a contributor opens a tool or game via `file://`
- **THEN** direct-file support depends on its module, resource and browser storage requirements
- **AND** the contributor uses `make serve` for modules or resources requiring HTTP

#### Scenario: Static hosted execution
- **WHEN** the portal, a generated module or the UI gallery is served over static HTTP
- **THEN** its local browser code and resources work without a backend or WebSocket service

### Requirement: Single File Tools

The system SHALL support simple single-file HTML tools and standalone tools
organized in folders with local modules, shared styles and a manifest.

#### Scenario: Tool structure
- **WHEN** a developer creates a simple tool
- **THEN** its HTML, CSS and JavaScript may live in one HTML entry point
- **AND** shared styles or more complex code may be organized as local modules under `tools/<id>/`

#### Scenario: No build step
- **WHEN** a JavaScript-only tool is modified
- **THEN** it can be exercised through the local static server without transpilation
- **AND** optional TypeScript modules use the existing transpilation step

### Requirement: TypeScript Support

The system SHALL support optional strict TypeScript for tools, games and epics
by transpiling source files to browser-loadable JavaScript with the existing build
tooling; it SHALL NOT require TypeScript for JavaScript contributions.

#### Scenario: TypeScript in development
- **WHEN** a developer creates a TypeScript module for a tool or game
- **THEN** `make build-ts` or the existing TypeScript watch script transpiles it to JavaScript
- **AND** the browser imports the generated JavaScript rather than executing a TypeScript source file natively

#### Scenario: TypeScript in production
- **WHEN** the TypeScript build script runs
- **THEN** supported TypeScript entries are transpiled to JavaScript in their generated `dist/` folders
- **AND** the static deployment serves those outputs

#### Scenario: Type checking
- **WHEN** `make typecheck` is executed
- **THEN** TypeScript source files selected by `tsconfig.json` are checked in strict mode without emitting files

### Requirement: Mixed JS/TS Support

The system SHALL allow JavaScript ES modules and optional TypeScript sources to
coexist without a framework migration or a backend runtime.

#### Scenario: JS imports TS
- **WHEN** browser JavaScript uses functionality authored in TypeScript
- **THEN** it imports the generated JavaScript output after the existing build step
- **AND** it does not require native browser execution of TypeScript

#### Scenario: TS imports JS
- **WHEN** TypeScript source imports a JavaScript module
- **THEN** it uses the existing ES module conventions with optional declaration files
- **AND** JavaScript-only modules remain supported
