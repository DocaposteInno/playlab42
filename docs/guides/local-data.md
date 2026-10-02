# Données locales et sauvegardes

L'outil **Mes données locales** (`tools/local-data/`) exporte et restaure
explicitement un fichier JSON. Servir le projet en HTTP : les imports ESM ne
sont pas conçus pour `file://`. Aucun fichier n'est envoyé à un serveur, aucune
restauration n'est déclenchée au démarrage.

## Utilisation

1. Ouvrir l'outil sur l'origine qui contient vos données (protocole, domaine, port).
2. Télécharger une sauvegarde avant de remplacer des données. Elle contient le
   pseudo, les préférences, scores et progressions : ne pas la publier.
3. Fermer les autres onglets/jeux pour éviter les écritures concurrentes.
4. Choisir le fichier (maximum 5 Mio), puis activer **Importer**.
5. Lire le statut ; recharger le portail et les autres jeux déjà ouverts.

Les clés présentes remplacent leurs valeurs actuelles ; les clés absentes sont
conservées. Un import validé peut réparer une valeur corrompue. Une sauvegarde
peut être transférée entre deux origines mais ne transfère pas tous les états
du navigateur.

La limite est exactement **5 242 880 octets UTF-8**, enveloppe JSON comprise :
export et validation comptent les octets encodés, pas seulement `json.length`
(unités UTF-16). Le contrôle du fichier utilise `File.size` avec la même limite.
Un fichier à la limite est accepté ; un seul octet supplémentaire est refusé.

Les clés étrangères, tailles de panneaux et états de Neural Style/Relativity
sont exclus. Les références à ces outils sont également retirées des récents
exportés, sans changer l'historique sur l'appareil source. Un fichier contenant
ces clés/références est refusé, pas filtré silencieusement à l'import.

La réinitialisation depuis les réglages utilise le même registre et conserve
aussi les références récentes des outils exclus. Fermer d'abord le jeu ou
l'outil ouvert et les autres onglets : une sauvegarde tardive ne doit pas
réintroduire les données effacées. Un schéma futur ou une corruption bloque
l'opération avec un message explicite, sans effacement partiel. Après succès,
les contrôles, le thème et les préférences en mémoire sont actualisés sans
réécrire immédiatement le stockage.

## Contrat public (`lib/local-data.js`)

Toutes les fonctions accédant au stockage acceptent `storage` en dernier
argument, par défaut `globalThis.localStorage`.

```js
readLocalData(key, fallback, storage);    // valeur typée ; fallback seulement si absente
writeLocalData(key, value, storage);      // void ; lève une erreur en cas d'échec
writeLocalValues({ key: value }, storage);// écriture groupée validée + rollback
removeLocalData(key, storage);           // suppression explicite de cette seule clé
clearLocalData(storage);                 // {count}, réinitialisation explicite et validée
isManagedKey(key);                       // boolean
validateLocalValue(key, value);          // void ou LocalDataError
exportLocalData(storage);                // string JSON déterministe
validateBackup(json);                    // table key → rawString|null, sans écriture
importLocalData(json, storage);          // { count }, hors métadonnée de schéma
```

`LocalDataError` expose `code` (`invalid-data`, `future-version`, `storage`),
`cause` et `rollbackFailed`. L'API ne retourne jamais de succès en cas d'erreur.
`loadPreferences()` / `savePreferences()` et `ParcoursProgress.load()` / `save()`
retournent un booléen et avertissent via `console.warn`. `ParcoursProgress.lastError`
permet au client de rendre l'erreur. `getEpicProgress()` garde son fallback
historique mais avertit : ce fallback n'est pas une confirmation de lecture.

### Clés et formats compatibles

| Clé | Valeur brute conservée | Validation |
|---|---|---|
| `player` | JSON objet | `name` chaîne |
| `preferences` | JSON objet | `sound` booléen si présent |
| `recent_games` | JSON tableau | objets `id` chaîne, `type` game/tool, `timestamp` nombre fini positif ou nul |
| `playlab42.activeTab` | chaîne brute | tools/games/parcours/bookmarks |
| `playlab42.theme` | chaîne brute ou clé absente | dark/light ; system supprime la clé |
| `scores_<id>` | JSON tableau | `{score: nombre fini, date: nombre fini ≥ 0, player: chaîne}` |
| `progress_<id>` | JSON propre au jeu | JSON sérialisable, pas de validation des règles du jeu |
| `parcours-progress` | JSON table par epic | `{visited: chaîne[], current?: chaîne|null}` ; les anciennes valeurs sans `current` sont conservées |

Les identifiants dynamiques ont une lettre minuscule initiale, puis lettres
minuscules, chiffres, `_` et `-`, maximum 64 caractères ; ceux contenant
`neural-style`, `neural_style`, `neuralstyle` ou `relativity` sont exclus.
Pas de clé `score_<id>` singulière.
Les propriétés supplémentaires JSON sont préservées. Valeurs non finies,
`undefined`, dates/instances de classes, trous de tableau, références circulaires,
propriété `__proto__` et profondeur supérieure à 100 sont refusées.

### Versionnement et migration

`playlab42.local-data.schema` contient `{"version":1}`. Son absence ou
`{"version":0}` désigne le schéma historique. Une lecture valide n'écrit rien.
Une écriture réussie migre la métadonnée, **sans envelopper les valeurs
historiques** : les lecteurs existants restent compatibles. Un schéma futur ou
invalide bloque lecture, écriture, export et import. Aucun original corrompu
n'est supprimé automatiquement ; une sauvegarde normale ne l'écrase pas.
`removeLocalData()` est une suppression explicitement demandée.

### Réinitialisation du registre partagé

`clearLocalData(storage?)` est l'API à utiliser pour **Effacer mes données** ;
ne pas reconstruire les préfixes dans les réglages. Elle utilise exactement le
même registre et les mêmes validations que l'export. Elle exige
`length`, `key()`, `getItem()`, `setItem()` et `removeItem()` sur le stockage
injecté, contrairement aux trois API unitaires qui n'ont pas besoin d'énumérer.

Elle valide le schéma et toutes les valeurs gérées avant toute écriture.
Corruption ou schéma futur/invalide : erreur, aucune suppression. Elle supprime
les préférences, scores, progressions, onglet, thème et métadonnée du schéma
connu, sans `clear()` global. L'absence de métadonnée redevient le schéma
historique compatible ; la prochaine écriture recréera la version 1.

Les clés étrangères et les états Neural Style/Relativity ne sont ni lus ni
modifiés. Leurs références dans `recent_games` sont aussi préservées : un
historique mixte est filtré, un historique uniquement exclu reste identique
octet par octet. `{count}` compte les clés supprimées ou réécrites, hors
métadonnée ; ce n'est pas le nombre de références récentes supprimées.

Le retour arrière et `rollbackFailed` ont le même contrat que l'import.
Il n'existe pas d'événement applicatif, de toast ou d'accès aux caches du portail
dans cette bibliothèque : les changements natifs `storage` notifient les autres
documents. Le document appelant doit annoncer succès/erreur, réinitialiser ses
propres préférences en mémoire puis appeler `syncTheme()`. Attention :
`loadPreferences()` garde l'état courant pour les clés absentes ; ce n'est donc
pas à lui seul un reset des valeurs par défaut après suppression.

## Formats de sauvegarde

Version 1 (les valeurs JSON sont des **chaînes brutes**, pas des objets) :

```json
{
  "format": "playlab42-local-data",
  "version": 1,
  "entries": {
    "player": "{\"name\":\"Ada\"}",
    "preferences": "{\"sound\":false}",
    "playlab42.theme": null
  }
}
```

`null` est autorisé uniquement pour le thème : il restaure le mode système.
Les clés sont triées ; aucun horodatage volatil n'est ajouté. La métadonnée
locale n'est pas exportée (la version est dans l'enveloppe). Un export contenant
une valeur gérée corrompue échoue entièrement et la conserve.

Le seul ancien format de sauvegarde accepté est la version 0 documentée :

```json
{
  "format": "playlab42-local-data",
  "version": 0,
  "data": {
    "player": { "name": "Ada" },
    "preferences": { "sound": false },
    "playlab42.theme": "system"
  }
}
```

Cette migration explicite transforme la table typée `data` en chaînes brutes
compatibles. Pas de reconnaissance heuristique de formats opaques, pas de fusion
de données de jeux. Les champs d'enveloppe inconnus, mauvaises valeurs,
clés étrangères et versions futures sont refusés avant toute écriture.

## Échecs et cohérence de l'affichage

L'import valide tout le fichier, capture les valeurs précédentes, puis écrit.
Un échec de quota ou un stockage désactivé est annoncé dans la région de statut.
Le retour arrière ne concerne que les clés effectivement écrites. Si un autre
onglet a changé une de ces clés, ou si le stockage refuse aussi le retour arrière,
`rollbackFailed` est vrai et le message demande de vérifier les données.
Pas de `localStorage.clear()`, ni garantie transactionnelle après interruption
brutale du navigateur.

Après import, l'outil appelle `loadPreferences()` et `syncTheme()` du helper
de thème. Cette dernière applique la préférence déjà persistée et notifie
`themechange` sans réécriture. Les événements natifs `storage` synchronisent le
thème des autres documents initialisés. `loadPreferences()` actualise uniquement
l'état du document de l'outil : ses imports ESM ne partagent pas leur état en
mémoire avec le portail parent. L'outil n'envoie aucun `postMessage` d'import et
ne modifie pas directement le DOM ou les caches du portail. Le pseudo et le son
du portail, ainsi que les jeux conservant un état en mémoire, sont donc actualisés
par le rechargement explicite demandé dans l'interface. Une intégration du portail
peut écouter les événements `storage` sur `player` et `preferences`, appeler son
propre `loadPreferences()`, puis actualiser ses contrôles et transmettre le son
par son protocole existant ; elle ne doit pas réécrire ces clés lors de cette lecture.
Si l'actualisation échoue après la
restauration, le statut précise que les **données sont restaurées**, plutôt que
de prétendre à un retour arrière qui n'a pas eu lieu.

## Intégration GameKit (câblée par le propriétaire du SDK)

```js
const key = `scores_${this.gameName}`;
const scores = readLocalData(key, []);
// Ajouter { score, date: Date.now(), player: this.getPlayer().name },
// trier et limiter à 10 comme auparavant.
writeLocalData(key, scores);

writeLocalData(`progress_${this.gameName}`, data);
const progress = readLocalData(`progress_${this.gameName}`, null);
removeLocalData(`progress_${this.gameName}`); // action explicite clearProgress()
```

Les catches du SDK conservent son contrat historique (`false` / `[]` / `null`)
et avertissent. Un catch de `loadProgress()` ne supprime jamais la clé.
Un schéma futur est refusé sans modifier les données ni la métadonnée.
