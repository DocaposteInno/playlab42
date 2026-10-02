# Actualiser et servir localement les bibliothèques navigateur

## Why

Les exercices musicaux et les slides mathématiques dépendent de CDN et de
versions anciennes. Leurs bibliothèques doivent être reproductibles, servies
avec le site statique et utilisables sans accès aux CDN.

## What Changes

- Épingler Tone 15.1.22, VexFlow 5.0.0 et MathJax 4.1.3.
- Générer des distributions locales avec esbuild existant et conserver licences,
  extensions et fontes réellement nécessaires.
- Adapter le rendu VexFlow et sécuriser les démarrages audio asynchrones.
- Remplacer les intégrations MathJax CDN et retirer le CDN highlight.js inutilisé.
- Documenter le build et vérifier les comportements réels dans le navigateur.

La demande explicite utilisateur autorise cette implémentation bornée. Aucune
revue, fusion, publication ni archive n'est déclarée.

## Capabilities

### New Capabilities
- `runtime-vendors`: génération reproductible et distribution locale des bibliothèques navigateur.

### Modified Capabilities
- Aucune modification des règles des exercices.

## Impact

Scripts de build, dépendances runtime, client Diese et Mat, slides mathématiques
et documentation. Neural Style, Magenta, TensorFlow, modèles ML et sources 3D
sont expressément exclus. Le serveur reste purement statique.
