# Références parcours

Chemins relatifs à la racine du dépôt.

| Besoin | Source |
|---|---|
| Format et exemples | `docs/guides/create-epic.md` |
| Contrat du viewer/parcours | `openspec/specs/parcours/spec.md` |
| Exemple avec sections | `parcours/epics/hello-playlab42/epic.json` |
| Hiérarchie autorisée | `parcours/index.json` |
| Styles et conversion Markdown | `parcours/_shared/slide-base.css`, `parcours/_shared/slide-template.html` |
| Validation/build effectifs | `scripts/build-parcours.js`, `scripts/parcours-utils.js` |
| Tests de structure | `scripts/parcours-utils.test.js` |
| Gabarit et générateur | `templates/epic/`, `docs/guides/contribution-kit.md` |

## Vérifier la structure réelle

Un epic est dans `parcours/epics/<id>/`.
Une feuille `{ "id": "01-intro" }` de `content` correspond à
`slides/01-intro/slide.json` et `slides/01-intro/index.html` ou `index.md`.
Une section comporte `id`, `title` et un tableau `content` de sous-éléments.
Consulter le guide avant d'utiliser `optional`, `draft` ou d'autres options.

Depuis une slide HTML située à cette profondeur :

```html
<link rel="stylesheet" href="../../../../../lib/theme.css">
<link rel="stylesheet" href="../../../../_shared/slide-base.css">
<script type="module">
  import { initTheme } from '../../../../../lib/theme.js';
  initTheme();
</script>
```

Le style partagé importe `lib/ui.css`. Utiliser un conteneur `article.slide`
et les composants effectivement définis dans la feuille partagée.
Les images dans `assets/` de l'epic sont accessibles depuis la slide avec
`../../assets/...`.

## Publication et sorties générées

`make build-parcours` lit les manifests, valide les références et convertit
Markdown avec le template existant. Examiner erreurs et avertissements ; une
simple présence de `data/parcours.json` peut provenir d'un build antérieur.
Un epic `draft: true` n'est pas publié dans le catalogue : utiliser cette option
seulement si une contribution non publiée est demandée.
La hiérarchie peut agréger les catégories selon le seuil du catalogue ;
ne pas inventer une catégorie pour forcer une apparition dans le menu.
