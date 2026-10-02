# Bibliothèques navigateur locales

Diese et Mat et les slides mathématiques utilisent les distributions réelles
suivantes, sans CDN :

| Bibliothèque | Version | Entrée locale |
|---|---|---|
| Tone | 15.1.22 | `assets/vendor/tone/tone.js` |
| VexFlow | 5.0.0 | `assets/vendor/vexflow/vexflow.js` |
| MathJax | 4.1.3 | `assets/vendor/mathjax/tex-mml-chtml.js` |
| Fonte MathJax NewCM | 4.1.3 | `assets/vendor/mathjax-newcm-font/` |

Les versions exactes sont déclarées dans `scripts/runtime-vendors.json`,
`package.json` et le lockfile. `MathJax` dépend de NewCM ; le build vérifie
également sa version pour empêcher une dérive des fontes.

## Construire et servir

Tout runtime passe par Docker. Après installation verrouillée des dépendances :

```sh
make npm CMD="ci"
make npm CMD="run build:runtime-vendors"
make serve
```

Le script sous-jacent est `node scripts/build-runtime-vendors.js`. Il n'effectue
aucun téléchargement : esbuild existant assemble Tone et VexFlow en ESM ; les
composants MathJax et les fontes sont copiés sans modification. Le serveur ne
fait que servir des fichiers statiques. Il faut construire les vendors avant
de servir les clients concernés ; les imports ESM nécessitent HTTP(S), pas
une ouverture directe `file://`.

`assets/vendor/` est généré, non versionné et doit accompagner le site déployé.
Le build échoue si une version installée diffère du contrat. Il nettoie seulement
les répertoires Tone, VexFlow, MathJax, NewCM et les licences de ses paquets,
pour ne pas conserver d'ancienne distribution. Les assets et licences produits
par un autre builder (Three/lil-gui notamment) restent intacts. Le manifest
`assets/vendor/manifest.json` liste les paquets, leurs licences et l'empreinte
SHA-256 de chaque fichier, sans horodatage ni chemin absolu.
Son inventaire est limité aux fichiers de ce builder ; un manifest 3D distinct
peut coexister dans le même répertoire.

Les commandes npm/Make et le pipeline du site doivent appeler ce build avant
le service local, les tests navigateur et la publication. Une installation
`npm ci` reste nécessaire pour la préparation ; « sans CDN » ne signifie pas
que l'installation npm fonctionne sans réseau.

## Compatibilité navigateur

- Tone utilise réellement Web Audio. Une action utilisateur autorise le
  démarrage, avec un seul démarrage concurrent et un état de contrôle cohérent.
  Le relâchement ou la fermeture annule les notes encore en attente. L'échec
  audio n'est pas présenté comme une lecture réussie.
- VexFlow 5 utilise FontFace et `document.fonts`. Son entrée complète embarque
  les fontes Bravura et Academico. Le renderer attend leur chargement avant
  toute mesure. Ne pas appeler `VexFlow.loadFonts()` sans source locale : cette
  API emploie par défaut un hébergeur externe.
  Les exercices existants conservent leur `StaffRenderer` léger ; le
  `ScoreRenderer` VexFlow est une surface distincte, à tester réellement avec
  notes, accords et mesures. Un SVG du renderer léger ne prouve pas que
  VexFlow a chargé ses fontes.
- MathJax 4 demande des fontes et extensions dynamiques. La configuration
  classique `parcours/_shared/mathjax-config.js` doit précéder son script
  asynchrone. Elle résout les chemins depuis sa propre URL, y compris quand le
  site est publié sous un préfixe ; les réglages TeX du parcours sont conservés.
  Les ressources d'accessibilité/mathmaps restent dans la distribution locale.

Le gabarit partagé ne charge plus highlight.js 11.9.0 : ce CDN n'avait aucun
consommateur réel autre que le gabarit et n'était pas nécessaire à sa structure.
Le thème CSS local reste disponible ; aucun autre moteur de coloration n'est
ajouté ni prétendu actif. Un futur besoin réel de coloration doit déclarer son
paquet et ses langages explicitement.

## Licences et périmètre

Les commentaires légaux des bundles sont conservés. `assets/vendor/licenses/`
contient les licences, attributions et manifests npm des paquets effectivement
inclus, y compris les dépendances transitoires de Tone.

Le paquet NewCM 4.1.3 déclare Apache-2.0 mais ne publie pas de fichier LICENSE
séparé. Le build conserve cette déclaration, le texte Apache-2.0 fourni par
MathJax, une notice de provenance explicite et les fontes originales avec leurs
métadonnées. Les fontes embarquées VexFlow restent intégralement préservées.
Une mise à jour doit contrôler les notices de la nouvelle distribution, pas
simplement recopier les noms des licences.

**Exclus** : Neural Style, Magenta, TensorFlow, modèles ML, Three.js, lil-gui et
Relativity Lab. Ce build ne télécharge ni ne transforme leurs ressources.
Le contrat JSON peut accueillir d'autres bibliothèques dans une demande
distincte ; chaque ajout nécessite un pin exact, une destination locale,
les licences et une validation réelle de son consommateur.

## Vérifier

Dans Docker, exécuter ensemble les tests ciblés :

```sh
make npm CMD="test -- --runInBand --runTestsByPath scripts/build-runtime-vendors.test.js parcours/_shared/mathjax-config.test.js games/diese-et-mat/src/audio/SynthManager.test.js games/diese-et-mat/src/audio/Metronome.test.js games/diese-et-mat/src/controllers/PianoController.test.js"
```

Les tests de cycle de vie isolent la concurrence ; leurs doublures ne prouvent
pas la compatibilité des distributions. Les tests Playwright doivent charger
les vraies bibliothèques avec les requêtes externes bloquées et vérifier :
notation SVG et fontes, contexte Web Audio démarré après interaction,
relâchement rapide et arrêt du métronome, formules CHTML et fontes/extensions.
Les règles musicales et le contenu des formules ne changent pas.

Ces contrôles réels sont pérennisés dans `e2e/runtime-libraries.spec.js` :

```sh
make npm CMD="exec -- playwright test e2e/runtime-libraries.spec.js"
```

Les trois scénarios couvrent le geste audio, le relâchement pendant
l'initialisation, les 15 presets, l'état accessible du métronome, le vrai
ScoreRenderer et les 16 slides avec extensions et fontes dynamiques. Ils
réutilisent les fixtures communes et refusent toute requête HTTP(S) externe.
