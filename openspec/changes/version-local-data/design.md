# Décisions

Les clés existantes gardent leurs valeurs brutes (JSON ou chaîne pour thème et
onglet). `playlab42.local-data.schema` porte `{ "version": 1 }`. Son absence ou
la version 0 est un schéma historique ; la prochaine écriture réussie migre
uniquement la métadonnée, sans envelopper les valeurs ni effacer de données.
Un schéma futur ou invalide est refusé, même lors d'un import.

L'API lève une erreur explicite. Les adaptateurs historiques conservent leurs
valeurs initiales en cas d'échec de lecture et retournent `false`, avec un
avertissement ; aucune corruption n'est supprimée. La progression d'un jeu
reste du JSON opaque : seule sa sérialisabilité est garantie, pas ses règles.

Une sauvegarde version 1 contient `format: "playlab42-local-data"`, `version: 1`
et `entries`, table de clés gérées vers leurs chaînes brutes. Le thème absent
est représenté par `null` pour restaurer le mode système. La version 0 connue
contient `data`, des valeurs typées ; une migration explicite produit `entries`.
Aucun autre format, clé étrangère ou version future n'est accepté.

L'import prévalide toutes les entrées, capture les anciennes valeurs, puis écrit
les seules clés présentes et la métadonnée. Il ne remplace pas tout le stockage :
les clés absentes sont conservées. En cas d'échec, retour arrière limité aux
écritures effectuées ; si celui-ci échoue, l'erreur le signale. Pas de transaction
résistante à la fermeture du navigateur ni garantie contre un autre onglet qui
écrit simultanément : fermer les autres instances avant une restauration.

Les identifiants Neural Style et Relativity sont exclus des clés dynamiques et
des récents exportés ; leur stockage n'est pas lu/modifié. Les clés de site,
largeurs de panneaux, catalogues et métadonnées non reconnues ne sont pas exportées.
Le JSON de sauvegarde est canonique (clés triées), sans horodatage volatil.

La demande complémentaire du parent autorise `clearLocalData(storage?)`.
Le reset partage le registre et l'énumération validée de l'export, puis réutilise
le moteur de retour arrière. Il refuse les valeurs corrompues et les schémas
futurs avant suppression. La métadonnée connue est supprimée, le schéma absent
restant compatible avec les lecteurs historiques. Les références récentes
Neural Style/Relativity sont conservées ; seules les références autorisées sont
retirées d'un historique mixte. Le parent possède les notifications des réglages
et le reset de leurs caches ; aucune nouvelle API DOM ou événement applicatif
n'est introduit dans la bibliothèque.

L'outil utilise les contrôles natifs, `textContent`, les primitives `ui-*`, les
tokens de thème et une région `role=status`. Après import il recharge les
préférences via `loadPreferences()` et synchronise le thème via l'API du
propriétaire de `theme.js`, sans deuxième écriture de stockage.
