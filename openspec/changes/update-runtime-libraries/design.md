# Design

Les paquets npm sont épinglés dans le manifest et le lockfile, sous la
responsabilité de l'agent intégrateur. Un script ESM utilise esbuild déjà présent
pour Tone et VexFlow et copie MathJax avec ses extensions et fontes. Le résultat
est `assets/vendor/`, généré et non versionné, sans requête réseau au build
(après `npm ci`). Un manifest décrit les versions et les licences copiées.
Le nettoyage et l'inventaire sont limités aux distributions déclarées et
aux licences de leurs paquets. Les fichiers, licences et manifests des autres
builders sont préservés, indépendamment de l'ordre des hooks runtime et 3D.

Les importmaps musicaux utilisent des URL relatives au site. VexFlow 5 charge
ses fontes embarquées avant de créer un renderer. L'audio conserve un seul
démarrage en vol et invalide les notes demandées puis relâchées avant sa fin.
Les composants détruits ne doivent pas recréer de ressources à la résolution
d'une promesse.

MathJax 4 utilise une configuration partagée classique, évaluée avant son script
asynchrone. Les chemins loader, fontes et fontes dynamiques pointent vers les
distributions locales ; les formules restent inchangées.

Les bibliothèques 3D peuvent rejoindre ultérieurement ce mécanisme, mais aucun
paquet, source ou import 3D n'est modifié ici. Les distributions ML historiques
ne sont jamais incluses dans le manifest.
