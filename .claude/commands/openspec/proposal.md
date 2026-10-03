Alias local de compatibilité pour préparer un change OpenSpec.
Le workflow officiel actuel est OPSX (`/opsx:propose` avec l'intégration Claude).

1. Lire `AGENTS.md`, `docs/guides/openspec-workflow.md` et `openspec/config.yaml`.
2. Réutiliser la demande utilisateur ; ne demander des précisions que si un
   élément réellement bloquant manque. Lire les specs et changes concernés.
3. Utiliser le CLI local épinglé dans Docker pour consulter les instructions
   `spec-driven` et créer, si nécessaire, le change avec `openspec new change`.
4. Rédiger `proposal.md`, `design.md`, `tasks.md` et les deltas avec les
   en-têtes exacts et des scénarios observables.
5. Consigner la base d'autorisation réelle. Une demande explicite
   d'implémentation autorise son périmètre, pas un merge ou un déploiement.
6. Valider avec `openspec validate <change-id> --strict --no-interactive`
   dans Docker. Garder les autres changes et les archives intacts.

Les artefacts restent modifiables. Les tâches indépendantes peuvent se mener
en parallèle ; ne pas imposer une séquence sans dépendance réelle.
