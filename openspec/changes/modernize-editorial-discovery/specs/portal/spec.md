## MODIFIED Requirements

### Requirement: Catalog Display

The system SHALL display all tools and games from the catalogue through the
shared editorial discovery interface without changing their internal clients.

#### Scenario: Initial load
- **WHEN** the portal loads
- **THEN** it fetches `catalogue.json` and displays cards for each entry of the active section
- **AND** it announces the number of matching entries

#### Scenario: Filtering by tags
- **WHEN** a user opens the secondary controls and selects a tag
- **THEN** only matching entries are displayed
- **AND** the chosen filter remains identifiable when the controls are collapsed

#### Scenario: Search
- **WHEN** a user types in the search field
- **THEN** every query word matches across name, description and tags
- **AND** matching ignores case and diacritics

#### Scenario: Empty and unavailable catalogues
- **WHEN** a catalogue is empty, unavailable or has no matching results
- **THEN** the corresponding state is explained explicitly
- **AND** a loading failure is not presented as a successful empty result

### Requirement: Parcours Display

The system SHALL display all pedagogical epics through a readable catalogue
with local continuation and without repeating cards between home collections.

#### Scenario: Parcours home
- **WHEN** the Parcours tab is active with no search or filter
- **THEN** started but unfinished epics are displayed in the continuation collection
- **AND** all other epics are displayed once in the discovery collection
- **AND** collections without entries are omitted

#### Scenario: Category filters
- **WHEN** a user opens secondary controls and selects a category
- **THEN** only epics from that category are displayed
- **AND** the complete unfiltered catalogue is available through reset

#### Scenario: Open epic
- **WHEN** a user clicks on an epic card
- **THEN** the parcours viewer opens at its stored reading position or first slide
- **AND** the portal header and footer are hidden for immersive reading

#### Scenario: Keyboard epic opening
- **WHEN** the user focuses a parcours card and presses Enter
- **THEN** its native hash link opens the viewer
- **AND** focus moves to the viewer close control and returns to the card on close

#### Scenario: Readable progression
- **WHEN** a parcours card is displayed
- **THEN** its progress is exposed as text, not only a colored bar
- **AND** identifiers remain unique when a card is recreated

## ADDED Requirements

### Requirement: Progressive Discovery Controls

The system SHALL keep secondary filters in one initially collapsed disclosure
for the active section while keeping navigation and search visible.

#### Scenario: Default discovery
- **WHEN** a user opens the catalogue
- **THEN** no secondary tag or category filter is visible until requested
- **AND** only the active section's filters are available inside the disclosure

#### Scenario: Resetting a selection
- **WHEN** a user activates the reset action
- **THEN** the current search and filter are cleared
- **AND** focus returns to search and the unfiltered result count is announced

#### Scenario: Changing sections
- **WHEN** a user changes the active catalogue tab
- **THEN** the search label identifies the new section
- **AND** the query is retained but previous tag and category selections are cleared
- **AND** inactive catalogue loads do not overwrite the active result count

#### Scenario: Keyboard filter updates
- **WHEN** a filter or search causes filter controls to be updated
- **THEN** an available focused filter keeps its identity and keyboard focus
- **AND** each filter exposes its selected state using `aria-pressed`
