# Design

## Context

La plateforme est statique et dispose deja de styles communs dans `lib/`,
de manifests, de scripts de build et de tests Jest. Le kit doit reutiliser ces
mecanismes plutot que creer une seconde pile frontend. Les conventions sont
centralisees dans `AGENTS.md` ; les skills et guides apportent des procedures
specialisees, pas des prescriptions contradictoires.

OpenSpec 1.14.0 et son workflow OPSX ont ete verifies dans les metadata npm
et la documentation du tag officiel. Le minimum Node 20.19.0 est compatible
avec Node 26. Le paquet local epingle rend le CLI reproductible via les
scripts npm et wrappers Docker, contrairement a une installation globale
ou un telechargement flottant implicite.

## Goals / Non-Goals

Objectifs : guider les agents, rendre les nouveaux modules coherents, montrer
des composants accessibles existants et detecter les regressions utilisateur
dans un navigateur reel.

Exclusions : migration React ou autre framework, backend, WebSocket,
conversion obligatoire en TypeScript, refonte du contenu du cours,
reecriture des archives, livraison ou archivage simules.

## Decisions

### Source commune et scopes

`AGENTS.md` est le point commun. Les skills `playlab-*` y renvoient ainsi
qu'aux guides concernes. Les skills `openspec-*` sont les integrations
officielles du workflow, pas une duplication des skills metier. Chaque agent
possede des fichiers distincts ; les changements communs sont coordonnes.
Les corps de tous les skills sont canoniques dans `.github/skills/`.
Le lien `.claude/skills -> ../.github/skills` les expose a Claude sans copie.
Les futurs fichiers OpenSpec generes rejoignent cette meme source ;
le lien ne genere pas de commandes slash OPSX.

### Gabarits et scaffold

Les trois gabarits reproduisent les structures game/tool/epic deja comprises
par les scripts de build. Le scaffold remplace type/id/title, valide ses
entrees et refuse d'ecraser une destination existante. Un nouveau moteur
est deterministe, serialisable, sans I/O, compatible navigateur et Node.
La galerie est un tool standalone avec manifest, pas une application React.

### Tests navigateur et CI

Playwright couvre des interactions et leurs resultats observables, pas
seulement un chargement HTTP ou des captures. Les catalogues et les sorties
TypeScript sont generes avant de servir le site. La preparation locale
utilise `build:local`, qui evite la collecte reseau des previews bookmarks.
Le serveur reste statique. Le contexte navigateur est isole pour ne pas
dependre du localStorage d'un autre test.

La version de Playwright et l'image navigateur doivent rester alignees.
La CI conserve les rapports et traces necessaires au diagnostic d'echec,
avec des attentes sur l'etat de la page plutot que des pauses arbitraires.

### Migration OpenSpec non destructive

`openspec/config.yaml` selectionne `spec-driven` et reference les conventions
communes. `project.md` et `openspec/AGENTS.md` deviennent des pointeurs
historiques. Les trois alias Claude restent des wrappers locaux documentes.

La migration officielle `init`/`update` nettoie des fichiers legacy ; elle
ne doit donc pas etre executee en force dans le worktree. Le coordinateur
genere le profil core, livraison skills-only, pour `github-copilot` dans un
projet Docker temporaire, puis copie seulement `.github/skills/openspec-*`.
Le cloud coding agent reste desactive ; aucune generation CI annexe.

### Normalisation et deltas

Les nouveaux comportements vivent dans quatre capabilities ajoutees. Les
corrections du contrat plateforme utilisent des blocs `MODIFIED` complets
qui conservent les noms des scenarios existants. Les specs principales ne
recoivent pas les nouveaux comportements avant livraison.

Le validateur actuel exige `Purpose`, `Requirements`, des exigences
normatives et des scenarios non vides. Adapter seulement les formes
existantes necessaires ; les details historiques et le contenu du cours
restent intacts. Rapporter les erreurs de changes non lies, sans inventer
une autorisation de les archiver ou de modifier leur scope.

Le dossier legacy `_archives/parcours-post-mvp` est un wrapper de documents
imbriques, pas un change actif valide. Ses deux fichiers sont conserves sans
modification dans `openspec/legacy/changes/_archives/parcours-post-mvp/`,
avec une explication du changement de chemin ; ils ne sont ni livres ni
archives par cette migration. La checklist pedagogique active
`add-algorithm-complexity-epic`, sans modification de contrat logiciel,
utilise le marqueur officiel `skip_specs: true`. Aucun de ses etats de tache
n'est change, et les archives preexistantes ne sont pas touchees.

## Dependencies and Parallel Work

La configuration et les artefacts OpenSpec peuvent etre rediges en parallele
des skills, du kit et des tests. Les dependances npm sont gerees par le
coordinateur. La validation du scaffold et de la galerie depend de leur
implementation ; la validation des parcours navigateur depend aussi du build
statique et des navigateurs. La revue finale de conformite attend ces preuves.
Aucune dependance ne force les trois scopes independants a s'executer en serie.

## Risks / Trade-offs

- Le CLI global peut differer : employer exclusivement la version locale
  epinglee et verifier sa version dans Docker.
- Une generation officielle dans le depot peut effacer les alias : generer
  ailleurs et copier uniquement les fichiers autorises.
- Les vieux formats peuvent bloquer `--all --strict` : conserver le rapport
  CLI et traiter les erreurs de format sans reinitialiser l'historique.
- Des tests navigateur dependants du reseau sont fragiles : servir un build
  local et ne pas faire de la collecte externe une condition du parcours.
- Les skills officiels sont generes : ne pas y maintenir des conventions
  locales divergentes qui seront ecrasees a la prochaine regeneration.

## Rollback and Delivery

Les nouveaux skills, gabarits et tests sont additifs. Un rollback retire les
ajouts du change et ses dependances sans alterer les modules existants ni
leurs archives. La correction du contexte obsolet ne justifie pas de
restaurer des descriptions factuellement fausses.

Apres verification, le coordinateur documente les resultats, prepare la PR
et attend le merge et le deploiement si applicable. L'archivage et la fusion
des deltas sont des actions ulterieures explicites, pas incluses dans la
demande d'implementation.
