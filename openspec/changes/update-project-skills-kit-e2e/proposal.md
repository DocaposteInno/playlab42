# Actualiser les skills, le kit de contribution et les parcours navigateur

## Why

Les contributions doivent reutiliser les conventions reelles de Playlab42,
les primitives UI partagees et des exemples executables. Les anciens fichiers
OpenSpec decrivent encore une stack TypeScript obligatoire, Node 25, un runtime
WebSocket et des commandes absentes. Les trois commandes Claude locales ne
constituent pas a elles seules une integration du workflow officiel actuel.

La demande utilisateur autorise explicitement l'implementation des skills de
projet, du kit de contribution, des tests navigateur en CI et de l'actualisation
OpenSpec. **Base d'autorisation : cette demande**, dans son perimetre. Cela
n'atteste ni une revue, ni une validation executee, ni un merge ou deploiement.

## What Changes

- Fournir des skills metier references depuis une source commune `AGENTS.md`,
  avec une documentation de leur usage et de leurs scopes.
- Ajouter des gabarits game/tool/epic, un scaffold avec type/id/title et une
  galerie UI standalone qui montre les styles et interactions existants.
- Couvrir des parcours utilisateur critiques avec Playwright et une execution
  navigateur en CI, sur un build local statique reproductible.
- Adopter le CLI officiel OpenSpec epingle et le schema OPSX `spec-driven`,
  avec configuration, guide et skills officiels generes de facon isolee.
- Garder les trois anciens alias Claude, les changes actifs et l'historique.
- Corriger les descriptions factuelles de la stack et uniquement les formats
  normatifs indispensables au validateur strict actuel.

## Capabilities

### New Capabilities

- `project-skills`: skills metier coherents avec les conventions communes.
- `contribution-kit`: gabarits, scaffold et galerie des primitives UI.
- `browser-testing`: parcours navigateur reproductibles et integration CI.
- `openspec-workflow`: CLI epingle, OPSX et compatibilite historique.

### Modified Capabilities

- `platform`: clarifier standalone, service statique, JavaScript ESM et
  TypeScript optionnel transpile ; ne pas promettre l'execution native de TS
  dans le navigateur ou de tous les modules via `file://`.

## Impact

| Scope | Proprietaire |
|-------|--------------|
| `.github/skills/playlab-*`, `docs/guides/project-skills.md` | Agent skills |
| `templates/{game,tool,epic}`, `scripts/scaffold.js`, `tools/ui-kit/` et guide du kit | Agent kit |
| `e2e/`, `playwright.config.js`, execution navigateur et CI | Agent navigateur |
| `openspec/`, aliases `.claude/commands/openspec/`, guide OpenSpec et ajouts communs `AGENTS.md` | Agent OpenSpec |
| Dependances, lockfile, installation, Makefile, generation officielle isolee et integration finale | Coordinateur |

La pile reste celle de `AGENTS.md` : HTML/CSS, JavaScript ES modules,
TypeScript strict optionnel, Node 26 pour les outils, application statique
dans le navigateur. Aucun framework, backend applicatif, runtime WebSocket
ou changement de programme pedagogique n'est introduit.

Les nouveaux deltas restent dans ce change jusqu'a sa livraison. Les
normalisations de titres ou d'exigences existantes servent seulement a rendre
le format lisible par le validateur ; elles ne reinitialisent pas les specs
ni ne changent les archives. Les anciens changes non lies restent actifs.
Le wrapper historique invalide `_archives/parcours-post-mvp` est conserve
sans modification de contenu dans `openspec/legacy/`, hors de la decouverte
des changes actifs. Ses taches restent ouvertes, sans nouveau statut de
livraison. La checklist pedagogique residuelle sans contrat logiciel modifie
declare explicitement `skip_specs: true` et reste active.

## Delivery Status

Implementation autorisee ; preuves de validation, revue, merge et deploiement
non presumees. `tasks.md` suit les resultats reels ; le coordinateur finalise
les cases apres controle. Ce change n'est pas archive.
