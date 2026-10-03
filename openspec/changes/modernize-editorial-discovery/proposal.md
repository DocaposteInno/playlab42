# Why

Le portail accumule des filtres permanents, des listes de liens peu lisibles et
des guides principalement consultables en Markdown. Une presentation sobre et
editoriale doit aider a choisir un contenu avant de montrer les options avancees.

La demande explicite de l'utilisateur autorise cette implementation : moderniser
l'UX generale, les deux familles de guides et les liens, avec les filtres
secondaires a la demande. Les jeux restent inchanges hors selection commune.
Elle n'autorise ni merge, ni deploiement, ni archivage.

# What Changes

- Simplifier le chrome du portail, la navigation et la selection jeux/outils.
- Proposer un seul panneau secondaire de filtres, ferme initialement, avec
  selection active visible, compteur et remise a zero.
- Mutualiser la recherche insensible aux accents et les boutons de filtre
  stables au clavier entre catalogues.
- Reorganiser le catalogue des parcours et rendre le lecteur et les slides
  partagees plus lisibles, sans changer leur contenu pedagogique.
- Remplacer la bibliotheque de liens arborescente et ses apercus flottants
  par des ressources lisibles sur desktop comme sur mobile.
- Generer un site de guides statique depuis les Markdown canoniques, avec
  navigation, sommaires, liens internes et styles locaux.
- Etendre les regressions unitaires et navigateur et les commandes de build.

# Capabilities

## New Capabilities

- `resource-library`: consultation editoriale des ressources externes.
- `developer-guides`: publication HTML statique des guides Markdown.

## Modified Capabilities

- `portal`: decouverte progressive, recherche et selection commune.
- `parcours`: presentation du lecteur et des slides partagees.

# Impact

Le travail part de `origin/main` apres le merge de #125. Il concerne les fichiers
du portail, les styles partages de parcours, la documentation, ses outils de
generation et les contrats OpenSpec. Aucun nouveau framework ni paquet.

Les fichiers de `games/`, les interfaces internes des outils, Neural Style et
le simulateur de relativite de #126 sont hors perimetre. Les donnees locales,
les deeplinks, les sandbox, les themes et les preferences restent compatibles.
Les nouveaux HTML de `docs/site/` sont generes au build et non versionnes.
