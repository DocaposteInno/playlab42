## ADDED Requirements

### Requirement: Static Guide Publication

The system SHALL generate a navigable documentation website from canonical
Markdown under `docs/` without adding a framework or external runtime dependency.

#### Scenario: Documentation build
- **WHEN** `npm run build:guides`, the local build or the publication build completes
- **THEN** `docs/site/index.html` and document HTML pages exist
- **AND** the Markdown sources remain canonical and generated pages are ignored by Git

#### Scenario: Portal entry
- **WHEN** a user follows the portal's guides link
- **THEN** an editorial documentation index is displayed
- **AND** the user can navigate to readable HTML guides and back to the portal

#### Scenario: Learning entry
- **WHEN** a user follows the learning link from the guides index
- **THEN** the portal selects the Parcours catalogue explicitly
- **AND** a previously saved tools or games tab does not override this destination

### Requirement: Usable Guide Navigation

The system SHALL preserve document relationships, resources and readable
navigation in the generated site.

#### Scenario: Internal links and anchors
- **WHEN** a guide links to a published Markdown document or a heading
- **THEN** the link resolves to the corresponding HTML document or heading anchor
- **AND** relative paths work from nested document locations

#### Scenario: Images and source references
- **WHEN** a document references a local image or a repository file outside docs
- **THEN** the image resolves to its real local resource
- **AND** a source-file link is identified rather than presented as a generated guide

#### Scenario: Accessible reading
- **WHEN** a user reads a guide on desktop, mobile or with a keyboard
- **THEN** navigation and table of contents remain usable
- **AND** code and tables scroll locally without overflowing the page
- **AND** local styles respect the current theme and reduced-motion preference
