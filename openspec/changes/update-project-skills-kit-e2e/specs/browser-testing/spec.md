## ADDED Requirements

### Requirement: Reproducible static browser tests

The project SHALL run Playwright tests against a locally prepared static build
with generated catalogues and TypeScript output where needed.

#### Scenario: Fresh browser run
- **WHEN** the documented E2E command is executed in the dedicated Docker environment
- **THEN** the static build and local web server are prepared before browser interactions start
- **AND** each test runs with isolated browser state
- **AND** a build, server or test failure produces an unsuccessful result

#### Scenario: Offline catalogue preparation
- **WHEN** the local test build prepares bookmark data
- **THEN** it uses the existing local build path that skips remote preview collection
- **AND** external preview services are not required to exercise the portal

### Requirement: Critical user journeys

Browser tests SHALL verify observable user interactions across the portal,
embedded content, parcours viewer, theme preferences and UI gallery.

#### Scenario: Portal keyboard navigation
- **WHEN** a user switches catalogue tabs with supported keyboard controls
- **THEN** the active tab, focus and visible content agree
- **AND** text editing does not trigger unrelated navigation shortcuts

#### Scenario: Search and content opening
- **WHEN** a user searches or filters the catalogue and opens a matching tool or game
- **THEN** the displayed entries reflect the selection and the correct content opens
- **AND** closing the content returns the user to the catalogue

#### Scenario: Parcours viewer
- **WHEN** a user opens a parcours, moves between slides and closes the viewer
- **THEN** the expected slide and navigation state are observable
- **AND** the catalogue is restored after closing

#### Scenario: Theme preference
- **WHEN** a user changes a theme preference and reloads the page
- **THEN** the selected preference persists
- **AND** initialized standalone content reflects the effective theme

#### Scenario: UI gallery interaction
- **WHEN** a user opens the UI gallery and operates its examples with the keyboard
- **THEN** the expected control states and visible focus can be observed in the browser

### Requirement: Browser CI integration

The project SHALL execute browser tests in GitHub Actions using compatible
Playwright and browser versions and retain diagnostic artifacts on failure.

#### Scenario: Pull request check
- **WHEN** a pull request triggers the configured browser check
- **THEN** the workflow prepares the same local static test site and runs the E2E suite
- **AND** a failed test fails the workflow step

#### Scenario: Failure diagnosis
- **WHEN** browser tests fail in CI
- **THEN** the workflow retains the configured report and available trace or screenshot artifacts
- **AND** contributors can diagnose the failure without relying on an unsupported manual success claim

#### Scenario: Execution boundary
- **WHEN** a contributor runs browser tests locally
- **THEN** the documented command uses the dedicated Docker environment rather than host npm or node
