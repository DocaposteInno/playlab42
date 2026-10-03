## Why

Les montages repetes accumulent des ecouteurs et les chemins d'assets
supposent un deploiement a la racine. Le SDK doit liberer sa propre session
sans retirer les abonnements des consommateurs ni perdre une sauvegarde
effectuee dans le hook de nettoyage.

## What Changes

- Nettoyer les ecouteurs GameKit et rendre sa reutilisation deterministe.
- Rendre l'initialisation du theme idempotente et son nettoyage explicite.
- Synchroniser un theme importe sans reecrire le stockage.
- Respecter le prefixe du site dans les URLs d'assets et annuler les
  chargements en cours au nettoyage.
- Ajouter les types optionnels du protocole portail/jeu.

La persistence versionnee est decrite dans `version-local-data`.

## Impact

- Specifications : `gamekit`, `theme`.
- Code : `lib/gamekit.js`, `lib/assets.js`, `lib/theme.js`, `lib/types/`.
- Aucun changement du moteur ou des modeles de Neural Style.
