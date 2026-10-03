# Brouillons historiques non normalises

Ce dossier conserve des documents anciens qui ne constituent pas des changes
actifs valides pour le CLI OpenSpec 1.14.0.

`changes/_archives/parcours-post-mvp/` conserve sans modification la proposal
et les taches auparavant dans `openspec/changes/_archives/parcours-post-mvp/`.
Le wrapper `_archives` etait pris pour un change par le CLI, mais les documents
imbriques etaient invisibles. Le placement hors de `openspec/changes/` corrige
cette ambiguite sans inventer des deltas, une livraison ou un archivage.

Ces documents restent des **brouillons historiques avec travail ouvert**.
Leurs cases ne sont pas completees par cette migration. Ils ne sont pas
deplaces dans `openspec/changes/archive/`, et aucune date de livraison n'est
ajoutee. Les archives existantes restent intactes.

Si un besoin reporte est repris, creer un change actif explicite directement
sous `openspec/changes/`, avec son scope actuel et ses deltas, puis referencer
ces documents comme contexte. Ne pas reactiver implicitement tous les besoins
reportes dans le cadre d'une actualisation d'outillage.
