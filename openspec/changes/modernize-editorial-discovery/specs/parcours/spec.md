## ADDED Requirements

### Requirement: Editorial Learning Presentation

The system SHALL present the learning catalogue and reader through readable,
responsive shared styles without changing pedagogical content.

#### Scenario: Learning catalogue
- **WHEN** a user browses the learning catalogue
- **THEN** an epic is not repeated across visible home sections
- **AND** its description and local progression are readable
- **AND** filters are available through the shared secondary controls

#### Scenario: Reading a course
- **WHEN** a user opens an epic or a direct slide link
- **THEN** the reader exposes its current position, plan and navigation clearly
- **AND** shared slide content remains readable on desktop and small screens

#### Scenario: Closing the plan and reader
- **WHEN** a user presses Escape while the plan is open
- **THEN** the plan closes before the reader
- **AND** closing the reader returns focus to the originating epic when available

#### Scenario: Persisted progression
- **WHEN** a user returns to a previously visited epic
- **THEN** the stored progression remains usable
- **AND** the editorial presentation does not replace or reset legacy data
