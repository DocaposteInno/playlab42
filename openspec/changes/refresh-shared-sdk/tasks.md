## 1. Cycle de vie

- [x] Retirer les ecouteurs GameKit au nettoyage et permettre une nouvelle session.
- [x] Preserver la sauvegarde finale du hook `onGameDispose`.
- [x] Ne pas dupliquer les ecouteurs de theme ni retirer les abonnements externes.

## 2. Assets et contrat

- [x] Resoudre les chemins relatifs avec le prefixe du site.
- [x] Annuler les chargements en cours et liberer les clones audio.
- [x] Fournir les types optionnels des messages portail/jeu.
- [x] Ajouter la synchronisation de theme sans ecriture.

## 3. Integration

- [x] Valider ensemble les regressions SDK et stockage versionne.
- [x] Valider le contrat TypeScript et le build integre.
