## Why

Les données locales historiques ne sont ni validées ni exportables de façon
explicite. Une erreur JSON ne doit pas effacer une progression ou autoriser une
restauration partielle.

## What Changes

- Ajouter une API partagée de validation et versionnement par métadonnée latérale,
  compatible avec les lecteurs des clés historiques.
- Intégrer préférences et progression des parcours ; publier le contrat pour GameKit.
- Ajouter un outil statique de sauvegarde et restauration explicites, sans réseau.
- Préserver les données invalides et annoncer les erreurs de stockage.
- Exposer une réinitialisation explicite du même registre, avec validation,
  préservation des exclusions et retour arrière ; le parent câble les réglages.

## Capabilities

### New Capabilities

- `local-data`: stockage local validé, migration et sauvegarde portable.

### Modified Capabilities

Aucune exigence existante n'est remplacée.

## Impact

Périmètre : `lib/local-data.js`, `app/storage.js`, `lib/parcours/ParcoursProgress.js`,
leurs tests, `tools/local-data/` et `docs/guides/local-data.md`.
GameKit et le helper de thème sont intégrés par leurs propriétaires.
Neural Style, Relativity, données étrangères, dépendances et backend exclus.

La demande explicite d'implémentation autorise ce périmètre. Ce change ne prétend
ni revue, ni merge, ni déploiement, ni archivage.
