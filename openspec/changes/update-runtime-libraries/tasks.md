## Implémentation autorisée

- [x] Générer les distributions locales et licences avec versions vérifiées.
- [x] Intégrer Tone 15 et VexFlow 5 sans changer les règles.
- [x] Sécuriser annulation, concurrence et destruction pendant le démarrage audio.
- [x] Servir MathJax 4 et ses fontes/extensions localement.
- [x] Retirer le CDN highlight.js inutilisé du gabarit.
- [x] Documenter le contrat de build et les exclusions.

## Validation

- [x] Exécuter les tests Jest ciblés et le lint dans Docker.
- [x] Vérifier le build réel et son manifest reproductible.
- [x] Vérifier audio, notation et mathématiques réels sans CDN dans Playwright.
- [x] Valider ce change avec le CLI OpenSpec épinglé.

Preuves du 2 octobre 2026 : 11 suites Jest / 94 tests passent ; ESLint ciblé
sans erreur. Deux builds produisent 314 fichiers et le même SHA-256 du manifest
(`f3bf69a40281ca52849edae0a1d8a1eb01331d9f3a5d592b9fef3fac5f5a0820`).
Le CLI valide ce change en mode strict.

Interoperabilité complétée à la demande de l'intégrateur : le builder ne
supprime plus la racine vendor. Un test filesystem préserve Three/lil-gui,
une licence tierce et un manifest 3D pendant deux builds, tout en retirant les
anciennes distributions et notices runtime. Les quatre tests du builder et
son lint passent ; la validation OpenSpec stricte passe. Les deux builds
réels produisent toujours 314 fichiers ; leur inventaire désormais limité
aux assets propres a le même SHA-256
(`85171693c7365cb8f54248f9489f3c38cb25564c27016fb7012abce30608e800`).

Smoke Playwright réel via Chromium 151/CDP dans Docker : Tone 15.1.22 démarre
Web Audio après une action clavier, le relâchement rapide ne laisse aucune
note active, le métronome démarre et s'arrête avec son UI.
Les 15 presets Tone réels ont aussi été joués sans erreur ; `aria-pressed`
du métronome passe effectivement de `true` à `false` à l'arrêt.
ScoreRenderer rend notes, accords et mesures avec VexFlow 5.0.0 et ses fontes embarquées.
Les 16 slides intégrées chargent MathJax 4.1.3 ; 176 formules CHTML sont rendues
(la slide entraînement ne contient pas de formule). Les extensions cancel,
unicode, enclose et les fontes dynamiques sont réellement chargées localement.
Aucune requête externe, ressource manquante ni erreur navigateur observée.

Les trois scénarios réels sont pérennisés dans `e2e/runtime-libraries.spec.js`,
ajout autorisé après coordination : ils passent dans Docker avec les fixtures
communes et Chromium CDP (33,5 secondes). Le fichier passe aussi ESLint.

Le raccordement npm/Make/build de publication et les fixtures E2E communes
restent sous la responsabilité de l'intégrateur, sur ses fichiers exclusifs.

La fusion, le déploiement et l'archivage restent hors de cette demande.
