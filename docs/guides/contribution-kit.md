# Kit de contribution

Le kit donne trois contributions **déjà utilisables**, à adapter plutôt qu'un nouveau
framework. Les fichiers générés restent du HTML, du CSS et des modules JavaScript
ordinaires. Les gabarits sont conservés dans `templates/` avec le suffixe `.tpl` :
ils ne sont ni catalogués, ni exécutés comme tests, ni transpilés avant génération.

## Générer une contribution

Dans le shell du conteneur de développement, depuis la racine du dépôt :

```sh
node scripts/scaffold.js game ma-course --title "Ma course"
node scripts/scaffold.js tool compteur-atelier --title "Compteur d'atelier"
node scripts/scaffold.js epic premiere-strategie --title "Première stratégie"
```

La forme exacte est
`node scripts/scaffold.js <game|tool|epic> <id-kebab-case> --title "Titre"`.
Le raccourci npm équivalent est
`npm run scaffold -- tool compteur-atelier --title "Compteur d'atelier"`.
Ne pas exécuter Node/npm sur l'hôte.

| Type | Destination | Point d'entrée |
|---|---|---|
| `game` | `games/<id>/` | `index.html` |
| `tool` | `tools/<id>/` | `index.html` |
| `epic` | `parcours/epics/<id>/` | `slides/01-introduction/index.html` |

L'identifiant contient de 1 à 64 caractères : lettre minuscule initiale, puis
minuscules, chiffres et tirets simples entre segments. Le titre contient de 1 à
120 caractères, sans caractères de contrôle ni espaces aux extrémités. Les titres
sont échappés selon leur contexte HTML ou JSON, jamais interpolés dans du code.

Le générateur refuse les options inconnues, les chemins, les liens symboliques
dans la destination, les dossiers existants (même vides) et les collisions avec
les anciens outils plats `<id>.html` ou `<id>.json`. Il n'existe pas d'option
`--force`. Choisir un nouvel identifiant en cas de collision.

Tous les assets sont lus, rendus et les JSON analysés **avant** la création de la
contribution. Le dossier final est réservé exclusivement ; si une écriture
échoue, ce seul dossier nouvellement créé est supprimé et l'erreur est affichée
avec un code de sortie non nul. Il ne s'agit pas d'une transaction résistante à
une interruption brutale du processus : après une interruption, inspecter le
dossier créé avant de le supprimer ou de reprendre manuellement.

## Ce qui fonctionne immédiatement

**Jeu :** une course aux pierres contre un bot déterministe. Retirer une ou deux
pierres ; prendre la dernière pour gagner. La seed fixe le nombre initial de
pierres. Le moteur implémente le contrat `GameEngine` existant
(`lib/types/game-engine.ts`) : initialisation, validation, application pure,
actions légales, vue joueur, tour, fin et gagnants. Il emploie
`lib/seeded-random.js`, sans DOM, horloge ni `Math.random()`. Le bot ne reçoit
que la vue et les actions légales. L'interface utilise le vrai `GameKit` pour
la disponibilité, la pause et le score ; `engine.test.js` couvre replay,
immutabilité, sérialisation, actions interdites et fin de partie.

**Outil :** un compteur de mots et de caractères qui analyse le texte localement,
avec effacement, libellés et résultat annoncé. Les caractères sont comptés par
points de code Unicode, non par graphèmes ; les mots sont séparés par des espaces.
Le HTML est autonome, sans dépendance CDN ni backend. Comme les autres modules
ESM du projet, le servir en HTTP plutôt qu'en ouvrant une URL `file://`.

**Epic :** deux slides reliées, une explication puis une question avec feedback.
Dans le viewer, utiliser ses commandes Précédent/Suivant pour conserver l'URL
et la progression ; les liens directs entre slides ne sont affichés qu'en mode autonome.
Les manifests `epic.json` et `slide.json` sont fournis. Les slides importent
`parcours/_shared/slide-base.css`, `slide-layout.css` et `slide-utils.js` pour
le thème et le footer numéroté. Personnaliser la description, les objectifs,
la taxonomie, l'auteur et la date `metadata.created` (date fixe du gabarit, pas
une horloge cachée du générateur).

Tous les types réemploient `lib/theme.css`, `lib/ui.css`, les composants opt-in
de `lib/components.css` et le thème existant. Les styles locaux ne définissent
que les particularités du contenu. Conserver les tests de contrat en remplaçant
les règles de démonstration.

## Composants partagés

`lib/components.css` importe les tokens de `theme.css` et les primitives de
`ui.css`. Ses nouvelles règles ciblent uniquement les classes préfixées `ui-*` :
charger cette feuille ne restyle pas les boutons ou cartes existants sans ces
classes. Elle ne modifie ni le portail ni les règles des feuilles précédentes.
Les gabarits et la galerie utilisent réellement ces mêmes composants.

| Classes | Usage |
|---|---|
| `ui-page`, `ui-container`, `ui-header` | Page autonome, largeur de lecture et en-tête adaptable ; les slides gardent leur conteneur `slide`. |
| `ui-card` | Carte avec fond, bordure, rayon et espacements partagés. |
| `ui-button`, `ui-button-primary` | Bouton natif ; ajouter la seconde classe à la première pour l'action principale. |
| `ui-form`, `ui-actions` | Formulaire empilé ou groupe horizontal qui revient à la ligne. |
| `ui-label`, `ui-field`, `ui-help` | Libellé, input/select/textarea et aide associée avec `aria-describedby`. |
| `ui-fieldset`, `ui-choice` | Groupe de choix avec legend ; label contenant une case ou un bouton radio natif. |
| `ui-status`, `ui-status-success`, `ui-status-warning`, `ui-status-error` | Message textuel ; les variantes s'ajoutent à la classe de base, sans utiliser la couleur seule. |
| `ui-dialog` | Style d'un `<dialog>` natif, sans modifier sa visibilité ni intercepter Échap. |
| `ui-badge`, `ui-code`, `ui-skip-link` | Badge textuel, bloc de code et lien d'évitement visible au focus. |

Exemple à reprendre, avec un chemin relatif adapté au point d'entrée :

```html
<link rel="stylesheet" href="../../lib/components.css">
<section class="ui-card" aria-labelledby="example-title">
  <h2 id="example-title">Ma contribution</h2>
  <form class="ui-form">
    <label class="ui-label" for="example-name">Nom</label>
    <input class="ui-field" id="example-name" name="name" required>
    <button class="ui-button ui-button-primary" type="submit">Valider</button>
  </form>
  <p class="ui-status" role="status" aria-live="polite"></p>
</section>
```

Les classes sont visuelles : elles ne créent pas de rôle ARIA, de validation ou
de gestionnaire d'événement. Garder les éléments natifs et leurs libellés.
Pour un dialogue, utiliser `dialog.showModal()` depuis son bouton d'ouverture,
`aria-labelledby` et un `<form method="dialog">` pour fermer. Le navigateur
assure le confinement du focus, Échap et le retour au déclencheur ; aucun
nouveau helper JavaScript n'est requis. La galerie en montre un exemple réel.

## Galerie utilisable

Ouvrir **`/tools/ui-kit/index.html`** sur le serveur local, ou l'entrée
**Galerie UI Playlab42** après reconstruction du catalogue.

La galerie permet de changer de thème (système, clair, sombre), activer des
boutons, modifier une carte depuis un formulaire, choisir un statut, ajuster
son espacement et ouvrir un dialogue natif dont le contenu est inspectable.
L'inspecteur montre les valeurs effectives des tokens et télécharge une règle
CSS référençant la variable sélectionnée, sans dupliquer sa valeur.

Utiliser Tab/Maj+Tab, Entrée/Espace et Échap pour parcourir les démos.
Les statuts sont textuels, les contrôles ont des libellés, le dialogue restitue
le focus, les mises en page se replient sur petit écran et les primitives
partagées respectent `prefers-reduced-motion`. Lire les fichiers de cette
galerie pour reprendre un exemple ; elle n'ajoute aucune dépendance ni SDK.
Son CSS local se limite à la grille, la largeur et les particularités de
prévisualisation : boutons, champs, cartes, statuts et dialogues sont partagés.

## Vérifier et publier

Dans le conteneur, après personnalisation :

```sh
npm test -- --runInBand scripts/scaffold.test.js tools/ui-kit/gallery.test.js
npm test -- --runInBand games/ma-course/engine.test.js
npm run lint
npm run build:catalogue
npm run build:parcours
```

Ouvrir ensuite le point d'entrée et sa version intégrée dans le portail.
Vérifier clavier, thème clair/sombre, petite largeur, résultats et erreurs
réelles. Le kit n'inscrit pas automatiquement un epic dans une sélection
éditoriale ; son manifest valide est découvert par le build des parcours.
Ne pas versionner les catalogues générés dans `data/`.
