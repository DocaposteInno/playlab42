# Tasks: add-triomino-game

## Checklist d'implémentation

### 1. Moteur de jeu (`engine.ts`)
- [x] Définir les types TypeScript : `Triomino`, `Position`, `Board`, `PlayerState`, `GameState`, `TriominoConfig`, `Action`
- [x] Implémenter `generateAllTiles()` : génération des 56 tuiles uniques normalisées
- [x] Implémenter `SeededRandom` shuffle pour la pioche
- [x] Implémenter `init(config, seed)` : initialisation du plateau, distribution des tuiles, détermination du premier joueur
- [x] Implémenter les règles de voisinage et correspondance de chiffres (`isValidPlacement`)
- [x] Implémenter `applyAction(state, action)` pour les actions : `PLACE`, `DRAW`, `PASS`
- [x] Implémenter le calcul de score de base (somme des 3 chiffres)
- [x] Implémenter la détection de bonus : `isBridge`, `isHexagon`, `isDoubleHexagon`
- [x] Implémenter les pénalités de pioche (-5 / -10 supplémentaire)
- [x] Implémenter la fin de partie : bonus +25 pts, récupération des points adversaires
- [x] Implémenter la détection de partie bloquée
- [x] Implémenter les variantes de score (`simplified`, `kids`, `targetScore`)
- [x] Implémenter `getPlayerView(state, playerId)` (masquer tuiles adversaires)
- [x] Implémenter `getLegalActions(state, playerId)` : positions valides ou obligation de piocher

### 2. Tests unitaires (`engine.test.ts`)
- [x] Tests de génération des 56 tuiles (unicité, normalisation)
- [x] Tests de placement valide / invalide
- [x] Tests de calcul de score (cas standard, bonus pont/hexagone/double hexagone)
- [x] Tests de pénalités de pioche (1, 2, 3 tirages)
- [x] Tests de fin de partie (dernier Triomino, partie bloquée)
- [x] Tests des variantes (simplified, kids)
- [x] Tests de déterminisme (même seed = même partie)
- [x] Tests de sérialisation JSON de l'état

### 3. Bots
- [x] `bots/random.ts` : Choisit une action légale au hasard (easy)
- [x] `bots/greedy.ts` : Choisit le placement qui maximise le score immédiat (medium)

### 4. Manifest et documentation
- [x] `game.json` : Compléter avec players, type, tags, bots
- [x] `README.md` : Règles complètes, exemples de placement, explication des bonus

### 5. Interface (`index.html`)
- [x] Rendu du plateau triangulaire (SVG)
- [x] Affichage de la réglette du joueur courant
- [x] Sélection et placement d'une tuile
- [x] Affichage des scores et du tour en cours
- [x] Bouton Piocher (avec compteur de piochages)
- [x] Affichage des bonus obtenus (animation)
- [x] Écran de fin de partie avec classement
- [x] Support des variantes (choix au démarrage)

## Dépendances

- `lib/seeded-random.js` : existant ? (algorithme inliné dans engine.ts pour compatibilité ts-jest)
- `lib/gamekit.js` : existant ?
- TypeScript : existant ?

## Ordre recommandé

1. Types + `generateAllTiles` + tests de génération (fondation) ?
2. `isValidPlacement` + tests de placement (cœur du jeu) ?
3. `applyAction` + calcul de score standard + tests ?
4. Détection des bonus + tests ?
5. Fin de partie + tests ?
6. Bots ?
7. `game.json` + `README.md` ?
8. `index.html` ?
