Alias local de compatibilité pour archiver un change livré.
Le workflow officiel actuel est OPSX (`/opsx:archive` avec l'intégration Claude).

1. Lire `AGENTS.md` et `docs/guides/openspec-workflow.md`.
2. Identifier le change et vérifier l'achèvement réel de ses tâches,
   les résultats de validation, le merge et le déploiement si applicable.
3. Obtenir une décision explicite d'archivage ; ne pas la déduire de la
   demande initiale d'implémentation.
4. Consulter `openspec instructions archive --change <change-id> --json`
   dans Docker. Cette commande est en lecture seule et n'archive rien.
5. Valider strictement le change, puis utiliser le workflow d'archivage
   officiel ou `openspec archive <change-id>` dans Docker.
6. Contrôler les specs fusionnées et la destination
   `openspec/changes/archive/YYYY-MM-DD-<change-id>/`.

Ne pas déplacer les dossiers à la main à la place de la fusion des deltas,
réécrire les archives historiques, sauter la validation ou créer un commit
sans autorisation.
