# Proposal: add-triomino-game

## Pourquoi ?

Le Triomino est un jeu de société classique basé sur des tuiles triangulaires numérotées, combinant stratégie de placement et calcul de score. Il s'inscrit parfaitement dans la collection de jeux tour-par-tour de Playlab42 et offre une complexité de placement intéressante (gestion d'un plateau 2D, règles de correspondance de chiffres, détection de formes géométriques spéciales).

C'est également un excellent support pédagogique pour illustrer :
- La gestion d'un plateau avec des pièces triangulaires (orientation, voisinage)
- Les algorithmes de détection de formes (pont, hexagone, double hexagone)
- La stratégie basée sur l'unicité des tuiles

## Quoi ?

Ajouter le jeu Triomino dans `games/triomino/` avec :

- **`engine.ts`** : Moteur isomorphe TypeScript (gestion des tuiles, plateau, scores, pioche)
- **`index.html`** : Interface jouable en solo (1 joueur humain vs 1-3 bots) ou multi local (2-4 joueurs)
- **`game.json`** : Manifest du jeu
- **`README.md`** : Règles et documentation
- **`engine.test.ts`** : Tests unitaires du moteur
- **`bots/random.ts`** : Bot aléatoire (difficulté easy)
- **`bots/greedy.ts`** : Bot maximisant le score immédiat (difficulté medium)

## Règles implémentées

### Matériel
- 56 tuiles triangulaires uniques (valeurs de 0 à 5 sur chaque sommet)
- 4 réglettes joueurs

### Préparation
- 2 joueurs : 9 tuiles chacun
- 3-4 joueurs : 7 tuiles chacun
- Le reste constitue la pioche

### Début de partie
- Chaque joueur pioche une tuile, celui avec le total le plus élevé commence
- Le premier joueur pose une tuile au centre et marque la somme de ses 3 chiffres

### Gameplay (tour par tour)
- Placer une tuile adjacente à une tuile existante, les 2 chiffres des pointes en contact doivent correspondre
- Un seul Triomino posé par tour

### Score
- Score de base : somme des 3 chiffres de la tuile posée
- Bonus Pont : +40 pts
- Bonus Hexagone : +50 pts
- Bonus Double hexagone : +60 pts
- Malus pioche : -5 pts par tuile piochée
- Malus triple pioche : -10 pts supplémentaires (total -25 pour 3 tuiles)
- Bonus fin de partie : +25 pts pour le joueur qui pose sa dernière tuile
- En cas de partie bloquée : chaque joueur soustrait la somme de ses tuiles restantes

### Pioche
- Maximum 3 piochages par tour
- Si la pioche est vide, le joueur passe son tour sans pénalité

### Fin de partie
- Un joueur pose sa dernière tuile (bonus +25 pts + total des tuiles restantes des adversaires)
- Partie bloquée : personne ne peut jouer

### Variantes supportées
- Mode score cible (ex: atteindre 400 pts en plusieurs parties)
- Mode simplifié (points fixes : pose=1pt, pont=1pt, hexagone=1pt, etc.)
- Mode enfants (pas de comptage de points, gagnant = premier à poser toutes ses tuiles)

## Impact sur les specs existantes

| Spec | Impact |
|------|--------|
| `game-engine` | Aucune modification, le moteur Triomino suit le contrat existant |
| `manifests` | Aucune modification, `game.json` suit le schéma existant |
| `bot` | Aucune modification, les bots suivent l'interface existante |
| `catalogue` | Le jeu apparaîtra automatiquement via `build-catalogue` |

## Décisions techniques

Voir `design.md` pour les détails sur :
- Représentation interne des tuiles triangulaires (orientation, coordonnées)
- Algorithme de détection des formes spéciales (pont, hexagone)
- Modélisation du plateau (grille triangulaire)

## Hors scope

- Mode multijoueur réseau (WebSocket) — future itération
- Replay animé
- Éditeur de variantes de règles
