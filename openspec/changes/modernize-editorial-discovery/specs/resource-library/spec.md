## ADDED Requirements

### Requirement: Readable Resource Library

The system SHALL present all published external resources with descriptions,
domains and useful category context without requiring hover previews.

#### Scenario: Browsing resources
- **WHEN** a user opens the links section
- **THEN** resource titles, descriptions and destinations are readable
- **AND** their native external links preserve safe new-window attributes

#### Scenario: Searching and filtering
- **WHEN** a user searches or selects a resource tag
- **THEN** shared normalized word matching and secondary filter controls are used
- **AND** the number of visible resources is announced

#### Scenario: Distinct resource states
- **WHEN** there are no resources, no matches or a failed catalogue request
- **THEN** each state has its own explanatory message
- **AND** an error is not replaced by success-shaped fallback content

#### Scenario: Mobile and keyboard consultation
- **WHEN** a user browses with a keyboard or a 320px viewport
- **THEN** resource navigation and descriptions remain available without hover
- **AND** the page has no horizontal overflow

#### Scenario: Category shortcuts
- **WHEN** a user opens the optional category navigation and selects a category
- **THEN** the corresponding heading receives focus through its native fragment
- **AND** the shortcuts collapse again so they do not displace the resource cards
