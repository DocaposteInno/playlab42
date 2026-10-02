Alias local de compatibilité pour implémenter un change autorisé.
Le workflow officiel actuel est OPSX (`/opsx:apply` avec l'intégration Claude).

1. Lire `AGENTS.md` et `docs/guides/openspec-workflow.md`.
2. Identifier le change depuis la demande ou `openspec list` dans Docker,
   puis lire sa proposal, son design, ses deltas et ses tâches.
3. Consulter `openspec instructions apply --change <change-id> --json`
   avec le CLI local épinglé, dans Docker.
4. Vérifier la base d'autorisation consignée ; implémenter dans ce périmètre.
   Respecter les dépendances réelles et la propriété des fichiers.
5. Adapter les artefacts aux décisions prises, sans modifier les changes
   étrangers. Cocher seulement les tâches réalisées et vérifiées.
6. Exécuter les validations pertinentes dans Docker et la validation stricte
   OpenSpec. Rapporter explicitement les tâches et blocages restants.

Ne pas imposer un commit par tâche, une exécution séquentielle artificielle,
un archivage ou un déploiement. Les actions Git suivent la demande et les
règles du projet.
