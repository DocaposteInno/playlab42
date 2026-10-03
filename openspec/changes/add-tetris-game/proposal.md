# Ajouter Tetris — Neon Stack

## Pourquoi

Ajouter au catalogue un jeu solo de blocs tombants complet, fluide et pédagogique,
avec une direction artistique originale plutôt qu'une reproduction d'assets existants.

## Quoi

- Moteur isomorphe pur : sept tetrominos, sacs de sept, rotations SRS, réserve,
  projection, délai de verrouillage, combos et T-spins.
- Trois modes : Marathon, Sprint 40 lignes et Ultra 120 secondes.
- Interface responsive « Neon Stack », clavier et commandes tactiles, effets
  lumineux, sons synthétisés facultatifs, réduction des animations.
- Pause sûre, records séparés par mode, intégration GameKit et catalogue.
- Tests du moteur et des parcours UI avec le runner existant.

## Impact

Nouvelle capability `tetris`, nouveau dossier `games/tetris`. Aucune modification
des règles des jeux existants ni du SDK commun. Les anomalies partagées éventuelles
seront corrigées sur une branche et un worktree distincts.

## Autorisation

La demande utilisateur du 3 octobre 2026 autorise la réalisation autonome de A à Z,
les choix techniques et visuels, et les corrections isolées. Pas de déploiement
ni de fusion automatique. La proposition reste active jusqu'au déploiement.
