# Tasks

Les scopes 1 a 4 sont independants et peuvent avancer en parallele. Les
dependances reelles sont precisees ci-dessous. Les cases restent a finaliser
par le coordinateur apres verification des livrables et des commandes.
La demande utilisateur autorise l'implementation, pas un merge ou archivage.

## Resultat de validation structurelle

Le 2 octobre 2026, le vrai CLI OpenSpec 1.14.0 a execute
`validate --all --strict --no-interactive --json` dans le conteneur isole
autorise : **16 items valides sur 16**, soit 12 specs et 4 changes actifs.
Le seul diagnostic restant est informatif : `skip_specs` sur la checklist
pedagogique residuelle. Cela ne prouve ni la conformite des implementations
metier, ni la generation des skills officiels, ni une livraison.
Les cases restent a finaliser par le coordinateur et sa validation independante.

Les six skills officiels core ont ensuite ete generes dans le scratch Docker
dedie avec un HOME isole et le CLI absolu 1.14.0, puis seuls leurs dossiers
ont ete copies dans `.github/skills/`. Leurs noms correspondent au guide,
leur metadata indique le generateur 1.14.0 et les empreintes des fichiers
copies correspondent a celles du scratch. Aucune commande init n'a ete
executee dans le vrai depot et aucun corps de skill metier n'a ete remplace.

L'integration a ensuite execute 75 tests Jest cibles et les 20 scenarios
Chromium dans Docker, avec le vrai serveur gere par Playwright. Les trois
gabarits ont ete generes dans une copie isolee, construits, catalogues et
exerces dans le navigateur ; les liens autonomes des slides ne court-circuitent
pas la navigation du viewer. Deux demandes de skills ont ete comparees avec
et sans skill, sans gain statistique revendique.
Le navigateur a ete connecte via CDP : le telechargement local de l'image
Playwright officielle etait bloque par le DNS du proxy Docker. La CI native
reste a observer sur la PR ; aucun merge, deploiement ou archivage n'est affirme.

## 1. Skills de projet - agent skills

- [x] 1.1 Creer les skills `.github/skills/playlab-*` avec scopes, references et procedures utiles.
- [x] 1.2 Referencer `AGENTS.md` comme source commune sans imposer React, TypeScript ou un backend.
- [x] 1.3 Documenter l'usage et les limites dans `docs/guides/project-skills.md`.
- [x] 1.4 Verifier les chemins references et l'accord entre skills et livrables reels.

## 2. Kit de contribution - agent kit

- [x] 2.1 Fournir les gabarits `templates/game`, `templates/tool`, `templates/epic` conformes aux manifests et guides existants.
- [x] 2.2 Implementer `scripts/scaffold.js` avec type/id/title, controle des entrees et refus d'ecrasement.
- [x] 2.3 Ajouter les tests cibles du scaffold et des sorties generees.
- [x] 2.4 Creer `tools/ui-kit/` avec manifest et exemples accessibles des primitives partagees.
- [x] 2.5 Documenter la generation et la galerie sans introduire de pile concurrente.
- [x] 2.6 Verifier dans Docker les modules generes, leur inclusion dans les catalogues et les interactions de la galerie.

## 3. Parcours navigateur - agent navigateur

- [x] 3.1 Ajouter la configuration Playwright et un serveur statique sur un build local reproductible.
- [x] 3.2 Couvrir la navigation clavier du portail, recherche/filtrage et ouverture/fermeture de contenu.
- [x] 3.3 Couvrir le viewer de parcours, les preferences de theme et la galerie UI dans un navigateur.
- [x] 3.4 Integrer l'execution navigateur a la CI avec rapports et traces d'echec.
- [x] 3.5 Executer les tests E2E dans l'environnement Docker dedie et examiner leurs resultats.

## 4. OpenSpec - agent OpenSpec

- [x] 4.1 Verifier la release officielle, le minimum Node, les commandes CLI et les chemins d'integration.
- [x] 4.2 Ajouter `openspec/config.yaml` avec le schema officiel et les references communes.
- [x] 4.3 Corriger le contexte obsolete et transformer les anciens fichiers en points d'entree de compatibilite.
- [x] 4.4 Actualiser les trois alias Claude et documenter la distinction avec OPSX.
- [x] 4.5 Creer `docs/guides/openspec-workflow.md` et les references communes dans `AGENTS.md`.
- [x] 4.6 Rediger proposal/design/tasks et les deltas des quatre nouvelles capabilities et de platform.
- [x] 4.7 Normaliser uniquement les formats existants indispensables au validateur strict, sans toucher aux archives.

## 5. Integration et validation - coordinateur

Depend de la disponibilite des livrables concernes, pas d'un ordre entre les
scopes 1 a 4.

- [x] 5.1 Epingler et installer les dependances CLI/navigateur et actualiser le lockfile dans Docker.
- [x] 5.2 Ajouter les scripts npm et wrappers Make coherents avec les commandes reellement disponibles.
- [x] 5.3 Generer les skills officiels core dans un projet Docker isole et copier uniquement `.github/skills/openspec-*`.
- [x] 5.4 Executer `openspec status --change update-project-skills-kit-e2e --json` et les instructions apply avec le CLI epingle.
- [x] 5.5 Executer `openspec validate update-project-skills-kit-e2e --strict --no-interactive` dans Docker.
- [x] 5.6 Executer `openspec validate --all --strict --no-interactive` et distinguer les erreurs historiques non liees.
- [x] 5.7 Executer les tests cibles scaffold/navigateur et les controles de qualite existants pertinents dans Docker.
- [x] 5.8 Relire les liens, scopes et deltas face aux fichiers livres ; cocher seulement les taches effectivement verifiees.

## 6. Livraison ulterieure - coordinateur

- [ ] 6.1 Faire relire et merger la PR ; consigner les references et resultats reels.
- [ ] 6.2 Confirmer le deploiement si applicable.
- [ ] 6.3 Sur decision explicite apres livraison, synchroniser les deltas et archiver avec le workflow officiel.
