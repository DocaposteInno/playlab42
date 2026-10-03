## 1. Contrat et stockage

- [x] 1.1 Implémenter et tester validation, schéma latéral et migrations connues.
- [x] 1.2 Implémenter et tester export/import déterministe, exclusions et rollback.

## 2. Intégration

- [x] 2.1 Adapter préférences et ParcoursProgress avec erreurs observables.
- [x] 2.2 Ajouter outil autonome accessible, manifeste et documentation de l'API.
- [x] 2.3 Transmettre le contrat GameKit et coordonner l'API de synchronisation du thème.
- [x] 2.4 Câbler la persistance GameKit via les trois API, préserver corruption et schémas futurs (réalisé et validé par le parent).
- [x] 2.5 Ajouter et tester clearLocalData() avec le registre partagé, validation intégrale et rollback ; transmettre au parent pour les réglages.
- [x] 2.6 Raccorder les réglages au reset partagé, préserver les exclusions et actualiser les contrôles sans réécriture immédiate.

## 3. Validation

- [x] 3.1 Exécuter les tests Jest ciblés et le lint dans Docker isolé.
- [x] 3.2 Valider ce change avec le CLI OpenSpec épinglé dans Docker.
- [x] 3.3 Vérifier clavier, thèmes et mobile dans les tests navigateur du parent (exécution rapportée par le parent).

Preuves dans `playlab42-libs-validation`, `/home/node/site` :
Jest ciblé sur `lib/local-data.test.js`, `app/storage.test.js`,
`lib/parcours/__tests__/ParcoursProgress.unit.test.js`,
`lib/parcours/__tests__/progress.test.js` et les deux tests
`tools/local-data/__tests__/{controller,main}.test.js` : 6 suites, 121 tests réussis.
Le test `main` charge le vrai HTML et les vrais helpers de thème/préférences ;
les importations clair puis système actualisent l'état et `themechange`, sans
deuxième écriture du thème. Ce test jsdom n'est pas une validation navigateur.
ESLint des fichiers JavaScript possédés réussi.
`openspec validate version-local-data --strict --no-interactive` réussi.
Le parent annonce le câblage GameKit validé dans Docker par 54 tests :
lecture joueur/scores/progression avec avertissement et contrat historique,
score fini vérifié avant la limitation top 10, sauvegarde via l'API et
suppression explicite via `removeLocalData()`. Une progression corrompue reste
conservée ; un schéma futur 999 et ses données restent identiques octet par octet.
Ce résultat est rapporté par le parent, pas une exécution supplémentaire de cet agent.
Les E2E navigateur appartiennent au parent ; pas d'archivage, merge ou
déploiement déclaré.

Après ajout du reset : les six suites possédées et `lib/gamekit.test.js`
exécutées ensemble dans Docker, 7 suites et 194 tests réussis. ESLint ciblé de
la bibliothèque et de ses tests réussi ; OpenSpec strict réussi. Les tests de reset couvrent tout le
registre, métadonnée connue/future, corruption, états/récents exclus, quota,
suppressions partielles, rollback et modifications concurrentes.

Validation après intégration du thème par le parent : les six suites
possédées totalisent 139 tests réussis, dont 18 tests du reset. Tous les fichiers
JavaScript possédés passent ESLint et ce change passe OpenSpec strict.

Validation finale de l'invariant Unicode : 6 suites et 140 tests réussis dans
Docker, avec un nouveau test utilisant un vrai Blob/File, des caractères UTF-8
de 2/3/4 octets et un fichier exactement à 5 242 880 octets. Ce fichier est
exporté, réimporté et réexporté identiquement ; 5 242 881 octets sont refusés.
La bibliothèque compte déjà correctement les octets ; aucun correctif runtime
n'a été nécessaire. ESLint de la bibliothèque et de ses tests réussi.

Le parent rapporte 2 tests réellement réussis sous Chromium 151 dans
`e2e/local-data.spec.js` (son périmètre) : téléchargement natif/Blob JSON, sélection
clavier et restauration, réparation d'un score corrompu, préservation des états
exclus/étrangers, thème clair, refus future v2/clé étrangère sans mutation et
viewport mobile 320 px. Cet agent ne prétend pas avoir exécuté ce navigateur.

Le parent a ensuite exécuté les quatre scénarios navigateur de ce fichier :
les deux précédents plus reset confirmé avec contrôles actualisés et refus
d'un schéma futur sans mutation. Le reset refuse de s'effectuer pendant
qu'un jeu ou outil reste ouvert dans le portail.
