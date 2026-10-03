# Conception

## Frontières

JavaScript ESM sans framework ni CDN, conforme aux jeux du dépôt. Le moteur ne
connaît ni le DOM ni l'horloge : l'UI lui transmet des actions `tick` en millisecondes.
L'état inclut le PRNG sérialisé et tous les délais. Un replay est donc reproductible.
Canvas 2D haute densité pour la grille ; HTML sémantique pour les contrôles et scores.

## Contrat moteur/UI

`TetrisEngine.init({seed, playerIds: ['human'], mode})` et les méthodes GameEngine.
Actions : `left`, `right`, `rotateCW`, `rotateCCW`, `softDrop`, `hardDrop`, `hold`,
`tick` avec `delta` (0 à 1000 ms). Une collision est une action permise sans déplacement.
Exports : `getCells(piece)` retourne des `{x,y}` absolus ; `getGhostPiece(state)`,
`getDropInterval(level)`, `PIECES` (matrices initiales).

État : `board` 20×10 de types ou null ; `active` `{type,rotation,x,y}` ;
`queue`, `hold`, `canHold`, `score`, `lines`, `level`, `elapsed`, `mode`,
`gameOver`, `winners`, `piecesPlaced`, `combo`, `backToBack`, `lastClear`
`{lines,label,points}`, `currentPlayerId`, `rngState`.

## Règles et modes

SRS avec tables spécifiques I/JLSTZ ; O immobile autour de son centre.
Gravité progressive ; délai de verrouillage 500 ms et au plus 15 resets par pièce.
Réserve utilisable une fois par pièce. Hard drop immédiat et soft drop récompensé.
La chute immédiate conserve la rotation pour détecter les T-spins ; une translation
manuelle réussie l'annule. L'UI annonce également les T-spins sans ligne effacée.
Marathon infini jusqu'au dépassement ; Sprint gagne à 40 lignes ; Ultra s'arrête à
120 secondes. Scores de lignes 100/300/500/800 × niveau ; T-spins, combo et
back-to-back documentés. Les records Sprint utilisent le temps minimal,
jamais le classement descendant du SDK.

## Présentation

Palette encre/cyan/lime, tetrominos biseautés, grille lisible, projection en contours,
réserve et file de cinq pièces, chronomètre, jauge de progression et bilan.
Pas de police distante ni de musique reprise. Son créé avec Web Audio après geste
utilisateur. Pause manuelle après perte de focus ; jamais de reprise automatique
qui surprendrait le joueur. Le mode se choisit avant de commencer une nouvelle partie.

## Validation

Jest pour moteur, invariants, reprise JSON et interaction DOM. Navigation réelle
si un navigateur est disponible ; ne pas ajouter de framework E2E au dépôt.
Build catalogue, lint ciblé et typecheck existants dans le conteneur de l'agent.

## Anomalie partagée isolée et intégration de main

Un `SecurityError` de localStorage faisait échouer `GameKit.loadProgress` pendant
le nettoyage tenté par son catch. Correction et régressions créées dans le worktree
`fix/gamekit-storage`, commit `a2ec898`, puis intégrées comme dépendance indépendante
dans cette branche. Les erreurs inattendues restent propagées ; un refus d'accès
est journalisé et ne provoque pas de suppression.

Après la refonte SDK de main, la résolution du conflit conserve `readLocalData`
et son stockage versionné. La régression du refus d'accès vérifie désormais la
cause `SecurityError` de `LocalDataError`. Le nettoyage des JSON corrompus n'est
pas réintroduit : les données restent disponibles pour sauvegarde/restauration.
La politique du SDK courant remplace celle du correctif historique.

## Résultat de réalisation

136 scénarios moteur, 20 scénarios contrôleur/records et 5 scénarios présentation.
Les scénarios GameKit couvrent aussi la correction isolée. Les parcours
Chromium couvrent clavier, boutons, modes, pause/reprise, unload, affichage à 320 px,
réduction des animations et stockage refusé. Vignette PNG 380×180, moins de 50 Ko,
générée depuis le SVG original ; aucune dépendance ajoutée au projet.

Les parcours initialement exécutés depuis les artefacts de session sont désormais
versionnés dans `e2e/tetris.spec.js`, avec les fixtures et la CI Playwright ajoutées
depuis sur main. Ils ne dépendent plus du script temporaire pour être reproductibles.

Les horloges fractionnaires peuvent présenter des écarts de quelques ulps entre
partitions différentes ; les mêmes ticks restent strictement déterministes.
Les événements temporels utilisent une tolérance de 1e-9 ms.
