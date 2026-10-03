# Checklist pedagogique residuelle

Le fichier `tasks.md` preexistant est conserve tel quel, avec ses taches
ouvertes. Il concerne la redaction, les slides et les controles du parcours
pedagogique existant, pas une modification de contrat logiciel de la plateforme.

La metadata `.openspec.yaml` declare `skip_specs: true` pour ce suivi
documentaire sans delta de capability. Cette declaration permet au CLI actuel
de lire le dossier ; elle n'indique pas que ses taches sont terminees ou que
son contenu a ete revu, merge ou deploye. Le change reste actif.

L'archive homonyme deja presente dans `openspec/changes/archive/` reste intacte.
La migration ne deduit aucun statut de livraison de son existence et ne
complete aucune des taches residuelles. Si une modification de comportement
du viewer ou de la plateforme est demandee, elle necessite un change avec
des deltas explicites, pas un usage de `skip_specs` pour la contourner.
