## ADDED Requirements

### Requirement: Compatible versioned local storage
The system SHALL validate managed local values while preserving their legacy raw
representation, migrate only known schemas, and reject future schema versions.

#### Scenario: Legacy reader compatibility
- **WHEN** a valid legacy score or progress is read and then written
- **THEN** its raw JSON remains readable by existing readers and schema metadata is version 1

#### Scenario: Corrupted persisted value
- **WHEN** a managed value is malformed or has the wrong type
- **THEN** the API reports an error and preserves the original value

### Requirement: Explicit bounded backup
The system SHALL export deterministic versioned JSON containing only managed
preferences, scores and progress, excluding Neural Style and Relativity.

#### Scenario: Unrelated local storage
- **WHEN** a backup is exported from storage containing foreign or excluded keys
- **THEN** none of those keys or excluded recent references appears in the backup

#### Scenario: Unsupported input
- **WHEN** an import contains an unknown key, invalid value, or future version
- **THEN** all existing stored values remain unchanged

#### Scenario: Supported migration
- **WHEN** a version 0 backup with the documented typed data map is imported
- **THEN** it is validated and migrated into compatible raw values with version 1 metadata

### Requirement: Failure-safe restore
The system SHALL prevalidate the complete import before writing and SHALL attempt
rollback of only its own successful writes if storage fails during restoration.

#### Scenario: Quota failure
- **WHEN** a write fails after an earlier import write succeeded
- **THEN** previous values are restored and an error, not success, is reported

#### Scenario: Disabled storage or failed rollback
- **WHEN** storage is inaccessible or rollback itself fails
- **THEN** the explicit error explains the failure without clearing unrelated data

### Requirement: Accessible standalone backup tool
The system SHALL provide labeled native controls for explicit export and file
import, announce results, and apply restored preferences and theme through APIs.

#### Scenario: Import through user action
- **WHEN** the user selects a valid backup and activates the import button
- **THEN** the managed data is restored and an accessible status announces the result

#### Scenario: Invalid file
- **WHEN** a file is malformed or has the wrong format
- **THEN** the status announces an error and storage is unchanged

### Requirement: Explicit managed reset
The system SHALL expose a reset using the same shared registry as backup export,
prevalidate all managed values and the schema before deletion, preserve excluded
and foreign data, and roll back only its own successful changes on failure.

#### Scenario: Reset all managed values
- **WHEN** the user explicitly requests reset of valid managed data
- **THEN** managed preferences, scores, progress, theme and known schema metadata are removed
- **AND** foreign keys and Neural Style/Relativity state and recent references remain preserved

#### Scenario: Future schema or corruption
- **WHEN** reset encounters a future schema, invalid metadata or corrupted managed data
- **THEN** reset reports an error before any deletion and retains the originals

#### Scenario: Mid-reset storage failure
- **WHEN** storage fails after reset has deleted or rewritten an earlier key
- **THEN** the reset restores its prior values or explicitly reports incomplete rollback
- **AND** no success result is returned
