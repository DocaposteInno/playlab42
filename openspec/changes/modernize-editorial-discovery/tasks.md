# Tasks

Les scopes 1 a 4 ont avance en parallele. L'integration depend de leurs
contrats effectifs, pas d'un ordre de travail. Les cases ci-dessous refletent
uniquement les resultats effectivement observes.

## Preuves d'integration locale

Dans `playlab42-editorial-validation`, sans credentials ni reseau :
400 tests Jest pertinents dans 22 suites, lint, typecheck, `build:local` et
OpenSpec strict (20 items) ont reussi. Les executions Chromium CDP ont couvert
24 scenarios distincts du portail, des parcours, des liens et des guides,
sans retry. Les derniers correctifs ont ete reexecutes sur les lecteurs
(12 scenarios) et les ressources (3 scenarios).

Les captures clair/sombre, desktop et mobile ont ete examinees. La navigation
par categories des liens est elle aussi a la demande : sur 390x844, la premiere
ressource est visible sans scroll, avec au moins 50 % de sa surface exposee.
Aucun filtre secondaire n'est visible au chargement du portail. Les controles
existants restent disponibles au clavier.

Les 25 pages documentaires generees exposent 1 639 liens/ressources locaux
verifies : aucun fichier manquant, lien vers un dossier non consultable,
fragment interne invalide ou identifiant duplique. Les references aux sources
Markdown et aux scripts sont identifiees ; les liens vers les cinq anciens
dossiers non servis ont ete remplaces par des fichiers utiles.

Le diff final sous `games/` et `tools/` est vide. Aucun merge, deploiement ou
archivage n'est affirme. La CI native et la publication sont consignees apres
leurs resultats reels.

## 1. Portail et mutualisation

- [x] 1.1 Moderniser le chrome et les cartes de selection jeux/outils.
- [x] 1.2 Mutualiser recherche normalisee, filtres stables et compteur.
- [x] 1.3 Integrer un unique panneau secondaire et une remise a zero accessible.
- [x] 1.4 Preserver onglets, routes, themes, preferences et chargements iframe.

## 2. Parcours pedagogiques

- [x] 2.1 Simplifier le catalogue, sans doublons ni perte de progression.
- [x] 2.2 Moderniser lecteur, plan et styles des slides partagees.
- [x] 2.3 Couvrir reprise, navigation, focus et responsive par des regressions.

## 3. Bibliotheque de liens

- [x] 3.1 Rendre descriptions, domaines et categories lisibles sans survol.
- [x] 3.2 Conserver liens reels et catalogues complets, avec recherche et filtres.
- [x] 3.3 Distinguer vide, zero resultat et erreur ; regresser clavier/mobile.

## 4. Guides de developpement

- [x] 4.1 Reorganiser les entrees et guides Markdown utiles.
- [x] 4.2 Generer des pages HTML statiques, sommaires et navigation locale.
- [x] 4.3 Resoudre liens Markdown, ancres, images et references hors docs.
- [x] 4.4 Brancher generation npm/Make et builds, ignorer les sorties generees.
- [x] 4.5 Regresser generation, navigation, themes et responsive.

## 5. Integration et preuves

- [x] 5.1 Executer les tests unitaires pertinents, lint, types et build dans Docker.
- [x] 5.2 Executer Chromium sur les scenarios existants et nouveaux sans retry.
- [x] 5.3 Examiner le rendu clair/sombre et mobile, ainsi que les liens generes.
- [x] 5.4 Confirmer les jeux, outils internes et simulateurs exclus inchanges.
- [x] 5.5 Valider strictement ce change et les autres contrats OpenSpec.
- [ ] 5.6 Livrer la branche et la PR sans merge ni deploiement.

## 6. Livraison ulterieure

- [ ] 6.1 Faire relire et merger la PR sur decision humaine.
- [ ] 6.2 Confirmer le deploiement si applicable.
- [ ] 6.3 Synchroniser les deltas et archiver sur decision explicite.
