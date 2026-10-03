# IA du Go 9×9 : correction et options navigateur

Recherche effectuée le 3 octobre 2026, à partir des documentations des projets.

## Pourquoi l'ancien adversaire jouait mal

Le jeu sélectionnait Random par défaut. Greedy évaluait uniquement les captures
immédiates et choisissait au hasard tous les autres placements. Il ne considérait
ni les libertés, ni les yeux, ni le territoire, ni la réponse adverse ; il remplissait
ses propres yeux et passait seulement lorsqu'il ne pouvait plus placer de pierre.

## Ce qui existe

| Solution | Intérêt | Contraintes pour Playlab42 |
| --- | --- | --- |
| [KataGo](https://github.com/lightvector/KataGo) | Une des références libres les plus fortes ; prend en charge le 9×9, le komi et différentes règles. Recherche guidée par un réseau neuronal. | Le moteur natif ne se charge pas directement comme un module JavaScript. Il faut un port navigateur et des poids adaptés. |
| [Web KaTrain](https://github.com/Sir-Teo/web-katrain), [documentation moteur](https://github.com/Sir-Teo/web-katrain/blob/main/docs/engine.md) | Exemple concret d'évaluation KataGo et de recherche dans le navigateur, TensorFlow.js WebGPU, replis WASM puis CPU, calcul dans un Web Worker. | Son petit modèle de test fait environ 3,6 Mo compressés et **n'est pas destiné à une analyse forte**. Le modèle b18 recommandé pour une vraie analyse fait environ 96 Mo. Le WASM multithread demande COOP/COEP et SharedArrayBuffer : vérifier l'hébergement et l'intégration iframe du portail. |
| [Pachi](https://github.com/pasky/pachi) | Recherche Monte-Carlo UCT/RAVE et simulations guidées par motifs et tactique, avec réseau facultatif. | Projet natif : un port WASM demanderait compilation, intégration GTP, adaptation des règles et validation des performances. Le niveau annoncé par le projet ne constitue pas un benchmark de son exécution dans le navigateur. |
| [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) | Infrastructure d'inférence WebGPU/WASM pour un futur petit réseau policy/value. | Ce n'est pas une IA de Go : il faut convertir et vérifier un modèle, reproduire son encodage et développer la recherche. |

Pour viser un adversaire de haut niveau entièrement local, la piste à privilégier
est un petit réseau KataGo éprouvé, associé à une recherche guidée, dans un Worker,
avec WebGPU et repli WASM. Les poids, leur licence, la compatibilité des opérateurs,
la latence sur mobile et les règles doivent être vérifiés avant de le distribuer.
Ajouter des simulations aléatoires à un bot sans bonne politique de jeu ne suffit
pas à reproduire la force de ces moteurs.

## Correction légère livrée

L'identifiant public `Greedy` est conservé et devient le défaut du manifeste et de
l'interface (« Tactique »). Random reste disponible comme adversaire facile.

Le bot évalue les chaînes avec leurs **libertés uniques**, pénalise les ataris et
les groupes à deux libertés, estime l'influence locale à distance limitée et
reconnaît les yeux simples, diagonales et bords compris. Il examine les douze
meilleurs placements/passes et toutes les réponses adverses : minimax à deux
demi-coups. Toute simulation passe par le moteur officiel, donc conserve le ko,
les captures et l'interdiction du suicide. Les yeux simples ne sont pas remplis.
La passe peut terminer une partie favorable ou éviter de détruire un territoire.

Aucun téléchargement, dépendance ou service n'est ajouté. Le nombre de coups
examinés est borné ; les égalités sont départagées par SeededRandom, sans limite
de temps dépendant du matériel. Les vues et les actions ne sont pas modifiées.
Les commandes humaines ne peuvent plus passer/résigner au nom du bot pendant
son tour ; le second joueur peut placer ses pierres en mode hot-seat.

## Validation et limites

Les tests couvrent capture, défense d'une chaîne en atari, auto-atari, ko,
préservation de deux yeux, passes gagnantes/perdantes, déterminisme, absence de
mutation, identifiants numériques et partie terminée.

La suite complète passe : **42 suites, 1 255 tests**, ainsi que le lint du dépôt.
Après intégration du `main` courant pour préparer la PR, les commandes humaines
utilisent le module partagé du jeu présent sur `main`. La vérification Docker
compte 74 suites réussies et 1 582 tests réussis ; une suite est bloquée par
l'absence de `yaml` dans l'image de revue. La réinstallation des dépendances
du lockfile est bloquée par des erreurs DNS `EAI_AGAIN` vers registry.npmjs.org.
Un scénario Chromium headless vérifie le défaut tactique, la réponse à un coup
humain, la protection des commandes pendant le tour du bot et le jeu hot-seat,
sans exception JavaScript. Les ressources locales sont relayées par DevTools
pour contourner le proxy réseau de l'environnement de test. Les catalogues des
jeux et des parcours se régénèrent correctement.

Comparaison avec le Greedy original de `efd34d3` : seeds 1 à 6, chaque seed jouée
avec les deux couleurs, komi 6,5, limite de 240 demi-coups. Le nouveau bot gagne
**12 parties sur 12**, toutes terminées (108 à 149 états/tours). Sur ce petit
échantillon, les décisions prennent environ **9 ms en médiane, 18 ms au 95e
percentile, 32 ms au maximum**, mesurées dans Node 26 en conteneur. Ces chiffres
ne mesurent pas les performances d'un téléphone ou de tous les navigateurs.

Ce résultat démontre une amélioration face à l'ancien bot, pas un classement kyu
ou dan. La lecture reste courte, sans résolution complète des échelles, de la
vie et de la mort ou du seki. L'influence est une estimation, pas une preuve de
territoire. Le décompte final conserve les règles existantes du jeu et ne propose
pas une négociation des pierres mortes. Pour une force élevée, il faut passer
à la piste neuronale décrite ci-dessus et la mesurer sur des appareils réels.
