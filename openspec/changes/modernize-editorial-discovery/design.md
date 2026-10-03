# Decisions

## Une interface editoriale, pas une nouvelle pile

Conserver HTML, CSS, ES modules et l'hebergement statique. Reutiliser les tokens
de `lib/theme.css` et les primitives existantes. Les CSS des parcours et liens
appartiennent a leurs modules ; le chrome et les controles de decouverte restent
dans `style.css`. Les styles des iframes de jeux et outils ne changent pas.

## Decouverte progressive commune

La recherche et les quatre onglets restent visibles. Un unique `details`
`#discovery-options`, ferme par defaut, contient seulement les filtres de la
section active. Son resume expose un filtre choisi meme apres fermeture.
Un compteur annonce les resultats et une action efface recherche et filtre.
Un changement d'onglet conserve la recherche et remet les filtres a zero.

`lib/catalogue-ui.js` mutualise la normalisation NFD, le matching de tous les
mots entre champs et la mise a jour de boutons sans perdre leur identite ni
le focus. Chaque catalogue rend son propre contenu et n'annonce son compteur
que lorsqu'il est actif. Aucun filtre/cache de section inactive n'est applique.

## Parcours et ressources

Conserver les contrats de navigation et progression des parcours. Eviter la
repetition d'un epic entre sections et proposer une lecture claire du plan,
de la position et des controles sur petit ecran.

Les ressources restent de vrais liens externes avec leur titre, description,
domaine et contexte. Leur lecture ne depend pas d'un survol. Distinguer un
catalogue vide, une recherche sans resultat et un echec de chargement.
La navigation par categories est un raccourci optionnel, distinct des filtres :
elle se deplie a la demande, puis se replie lorsque son titre cible recoit le focus.

## Guides generes depuis une source unique

`scripts/build-guides.js` utilise le renderer Markdown deja installe pour
produire `docs/site/` en conservant la sous-arborescence des documents.
Les fichiers Markdown de `docs/` restent la source canonique. Le build resout
les liens connus vers des HTML, conserve les ancres et les ressources locales,
et identifie les liens vers les fichiers source hors documentation.

La navigation, le sommaire et les themes ne requierent ni framework ni CDN.
Les tables et blocs de code defilent localement plutot que de deborder la page.
Les commandes npm/Make de generation et les builds de publication/local sont
branches explicitement. `docs/site/` est ignore par Git et au contexte Docker.

## Integration et limites

Trois scopes independants (ressources, parcours, guides) travaillent dans la
branche commune ; le coordinateur possede chrome, helper, build et OpenSpec.
Toute execution de code, build et test s'effectue dans Docker sans credentials.
Le clone operateur ne sert qu'a Git/GitHub.

Valider clavier, focus, deeplinks, themes, responsive 320/390/paysage/desktop
et sorties HTML des guides. Comparer le diff final sous `games/` et les outils
exclus pour confirmer l'absence de modifications internes.

Les changes de #125 et #126 restent independants. Ce change n'est pas archive
avant livraison et decision explicite de l'utilisateur.
