# Plan — Durcir les lectures v3 location (altitude + efficiency)

> Objectif : remonter au bon niveau trois faiblesses des routes de lecture v3
> location, révélées par la PR #197 (`GET …/locations/ext/{extKey}/{extId}`).
> Aucune n'est un bug bloquant — ce sont de la dette d'altitude et d'efficience
> qu'il vaut mieux corriger en profondeur que rustiner au routeur.
>
> **Analyse + plan, pas d'implémentation.** Trois chantiers indépendants ; les
> #1 et #3 partagent le package `agenda-locations` (regroupables), le #2 est
> orthogonal (routing api-v3). À sortir hors de #197.

---

## Vue d'ensemble

| #   | Type       | Cible                                                            | Touche                              | Trade-off clé                              |
| --- | ---------- | ---------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| 1   | Altitude   | `merged` typé dans le service ; `resolveLocationOr404` disparaît | `agenda-locations` + façade v2      | lier au `throwOnNotFound`, pas à `deleted` |
| 2   | Altitude   | `:locationUid(\d+)` / `:eventUid(\d+)`                           | toutes routes api-v3                | contrat `not-a-uid` : 400 → 404            |
| 3   | Efficiency | option `formSchema` paresseuse (thunk)                           | `agenda-locations` (`get` + `list`) | rétro-compat objet/fonction                |

---

## 1. Merged-404 : au routeur aujourd'hui, devrait être dans le service

### Constat (vérifié dans le code, juin 2026)

Le service `agenda-locations` connaît déjà le merge à trois niveaux :

| Mécanisme            | Où                                                 | Comportement                                                                                                                     |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Stub brut            | `get.js:50‑59`                                     | `deleted:null` → retourne `{uid, deleted, mergedIn?}`                                                                            |
| 404 nu               | `get.js:69‑72`                                     | `throwOnNotFound:true` → `NotFound({info: identifiers}, 'location not found')` — **sans** code `merged`                          |
| Follow vers la cible | `lib/getMergedLocation.js` via `returnMergeTarget` | suit `merged_in`, retourne la location survivante (resync events, `core/agendas/utils/cleanEvent/extractLocationFromData.js:44`) |

Le routeur v3 (`api-v3/index.js`, `resolveLocationOr404`) prend la 1ʳᵉ voie (lit le
stub via `deleted:null`) et **refabrique** le `code:'merged'` + `details.mergedIn`
à la main. Le wrapper core `core/agendas/locations/get.js:23` (chemin v2/legacy)
prend la 2ᵉ et jette un **404 nu**.

### Le défaut d'altitude

« Une location merged répond 404 avec l'uid survivant » est un **fait métier**
sur la location (il découle de `merged_in`), pas un fait de présentation HTTP.
Or il ne vit qu'au routeur v3. Conséquence : la garantie « répare tes
références » n'existe **que** sur les routes passant par `resolveLocationOr404`.
La future route by-slug, la façade v2, toute surface appelant
`get({throwOnNotFound:true})` obtiennent un 404 nu — le client ne peut pas
réparer. La même vérité a trois encodages incohérents.

### Le fix profond

Faire de « merged » une notion de première classe du service : quand
`throwOnNotFound` rencontre un `merged_in`, jeter une **erreur typée**
(sous-classe de `NotFound` → `statusCode 404`, compat préservée pour qui ne lit
que le statut) portant `info.code='merged'` + `info.details.mergedIn`.
L'errorHandler v3 **forwarde déjà** `info.code` et `info.details` génériquement
(`api-v3/errorHandler.js:50‑53`) → le merged remonte partout _gratuitement_. Le
routeur v3 redevient `get(…, {throwOnNotFound:true})` + `mapLocation`, et
`resolveLocationOr404` **disparaît**.

**Subtilité** : le throw merged doit être lié à `throwOnNotFound`, **pas** à
`deleted:null`. Le mode stub (`deleted:null` sans throw) reste l'outil des
appelants qui veulent inspecter (le resync). Le routeur v3 bascule simplement
sur `throwOnNotFound:true`.

### Coût / séquençage

Touche le package `agenda-locations` + audit des appelants de `throwOnNotFound`
(`core/agendas/locations/set.js`=false, `api/middleware/allowLocationSetWithContributorCreate.js`=false,
`core/agendas/locations/get.js`=true). PR dédiée. Pour #197, garder le helper
routeur est acceptable — dette d'altitude, pas un bug.

---

## 2. `:locationUid(\d+)` : l'ordre de registration comme invariant invisible

> **Décision (juin 2026) : abandonné.** La regex au routeur est le mauvais
> outil — syntaxe `path-to-regexp` 0.1.x **Express 4 only** (casse en Express 5),
> elle éparpille la validation hors de `cleanGetIdentifiers`, et elle **dégrade
> le contrat** (`/locations/pas-un-uid` : 400 « Invalid identifiers », informatif,
> deviendrait un 404 ambigu). Le risque qu'elle visait est purement hypothétique
> (aucune sous-route littérale de même arité que `:locationUid` n'existe) et se
> gère par convention (déclarer les littérales avant le catch-all). Seule action
> retenue : **corriger le commentaire trompeur** de la route by-ext (l'ordre ne
> protège pas du capture de `ext` — arités différentes), fait dans la PR
> « durcir le service location ».

### Constat (vérifié)

- Express **4.18.2** (path-to-regexp 0.1.7) → la syntaxe
  `'/agendas/:agendaUid/locations/:locationUid(\\d+)'` **est supportée** (ce ne
  serait pas le cas en Express 5 / path-to-regexp v6+).
- `app.param('agendaUid', …)` charge l'agenda ; `:locationUid`/`:eventUid` ne
  sont **pas** contraints.

### Le défaut

Le commentaire « registered BEFORE `:locationUid` so the literal `ext` segment is
never captured » est **inexact pour cette paire** : `/locations/ext/:k/:v` a deux
segments de plus que `/locations/:uid`, Express ne les confond jamais, _quel que
soit l'ordre_. L'ordre n'est réellement load-bearing que pour des routes literal
de **même arité** (`events/schema`, `events/facets` vs `:eventUid`). Le risque
réel : une future sous-route literal de même arité ajoutée _après_ le catch-all
`:uid` serait **silencieusement shadowée** (résolue comme `uid='search'` → 400
« Invalid identifiers » au lieu de fonctionner). Invariant invisible et non testé.

### Le fix

Contraindre `:locationUid(\d+)` / `:eventUid(\d+)`. Toute sous-route literal
devient non ambiguë indépendamment de l'ordre → supprime l'invariant fragile et
le besoin du commentaire « registered BEFORE ».

### Le trade-off à décider explicitement

`\d+` change un contrat. Aujourd'hui `/locations/not-a-uid` matche la route puis
`cleanGetIdentifiers` jette un **400** (test `90_apiV3_locations.test.js:447`).
Avec `\d+`, le path ne matche plus → **404** (fallthrough). Les deux sont
défendables ; recommandation : **accepter le 404** (un identifiant de ressource
v3 est numérique ; `ext` est une sous-route nommée) et mettre à jour le test. Un
`app.param` validateur ne résout **pas** le shadowing (la route matche toujours) —
seul le `(\d+)` dans le path le fait.

### Séquençage

Transverse (toutes les routes `:eventUid`/`:locationUid` d'api-v3) + changement de
contrat 400→404 à documenter → PR dédiée « durcir le routing v3 ». Orthogonal aux
#1/#3. Pas dans #197.

---

## 3. `loadLocationFormSchema` : travail jeté sur tous les miss

### Constat (vérifié)

Dans `resolveLocationOr404` (et le `list` à `api-v3/index.js:748`) :

```js
formSchema: await loadLocationFormSchema(core, agenda); // évalué AVANT .get()
```

JS résout l'argument avant d'appeler `.get()`, **à chaque requête, y compris les
404**. Or le `formSchema` n'est consommé que sur le **hit**, au tout dernier
moment (`get.js:103` → `formatLegacyTags`, qui filtre les tags legacy contre le
tagSet du schéma). Sur un miss (null/deleted/merged), `get.js` retourne tôt
(`50‑74`) et le schéma est jeté.

### Le coût

`loadLocationFormSchema` (`api-v3/lib/agendaLocations.js`) =
`getAgenda(detailed:true)` (→ `networks.get`, **SQL non caché** pour un agenda en
réseau) + `schemasWithEvent(…)` (build/merge **synchrone** du form schema event
entier, qui bloque l'event loop). La route by-ext est **miss-heavy par
conception** (des clients sync sondent des source-ids) → ce pipeline tourne pour
rien à chaque sonde infructueuse.

### Pourquoi le défer propre = refacto package

`formatLegacyTags` est _interne_ à `get.js`, déclenché par la présence de l'option
`formSchema`. On ne peut pas le sortir au routeur sans déplacer une logique métier
(quels tags survivent) chez chaque appelant — duplication/divergence. Options non
propres :

- **double `.get()`** (un léger pour exister, un complet avec schema) → 2 SQL sur
  le **hit**, cas nominal → mauvais arbitrage ;
- mémoïser le schema → ne supprime pas le coût d'un miss isolé.

### Le fix propre

Rendre l'option `formSchema` **paresseuse** : accepter aussi un thunk
`() => Promise<schema>` que `get.js` n'appelle que sur le hit, juste avant
`formatLegacyTags`. Rétro-compatible (accepter objet _ou_ fonction), ~10 lignes
dans le package. Le routeur devient :

```js
formSchema: () => loadLocationFormSchema(core, agenda); // zéro travail sur les miss
```

Même gain applicable au `list` (option conditionnée par `detailed`).

### Nature / séquençage

Efficiency, pas correction → priorité moyenne. Touche le package
`agenda-locations` (`get` + `list`) → PR dédiée, **regroupable avec le #1** (même
package). Gain réel (SQL non caché + build CPU sur chaque miss d'une route sync),
pas cosmétique.

---

## Hors scope #197

Ces trois points sont la dette révélée par la route by-ext, pas son véhicule
(granularité PR = unité de déploiement/rollback). Découpage proposé :

- **PR A « durcir le service location »** : #1 (merged typé) + #3 (formSchema
  paresseux) — même package `agenda-locations`, audit appelants commun. ✅ PR #198.
  Inclut la correction du commentaire trompeur de #2.
- ~~**PR B « durcir le routing v3 »** : #2 (`:uid(\d+)`)~~ — **abandonnée** (voir
  la décision en tête du §2 : regex Express-4-only, validation éparpillée,
  régression 400→404, risque hypothétique).

Référence : PR #197 `feat/v3-location-get-by-ext-id`. Voir aussi
`docs/plan-location-ext-ids-normalization.md` (le 4ᵉ chantier révélé par la même
route : le stockage `->` des extIds).
