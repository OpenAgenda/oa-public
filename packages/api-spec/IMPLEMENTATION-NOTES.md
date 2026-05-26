# v3 API — notes d'implémentation

Journal des décisions et pièges concrets pour **construire** l'API v3 (la couche de mapping HTTP au-dessus de `core`). Complète `docs/analyse-api.md` (analyse + décisions, le « pourquoi/quoi ») ; ici c'est le « comment », enrichi au fil des tranches.

Le contrat fait foi : `packages/api-spec/openapi.yaml`. Stratégie spec-first + spec exécutable (cf. `docs/analyse-api.md` §9 décision 6).

---

## Source de vérité de la sérialisation event

La réponse event de l'API actuelle vient de l'**`_source` Elasticsearch**, post-traité. La couche de mapping v3 lira de là :

- Écriture/indexation : `packages/event-search/utils/formatEvent.js`
- Lecture/projection : `packages/event-search/search.js` (`buildEventParsers` → `parseEvents`) + `packages/event-search/utils/postDSL.js`
- Whitelist des champs renvoyés : `packages/event-search/config/searchIncludes.json` (base + detailed ; le get single force `detailed: true` via `api/middleware/getEventFromSearchOrAsDraft.js`)
- Types autoritatifs : `packages/event-search/config/mapping.json`
- Défs natives & valeurs d'enum : `packages/events/lib/fields.js`, `packages/event-form/src/fields/event.js`

---

## Règles de la couche de mapping (Event, lecture)

- **Enveloppe** : liste → `{ data, pagination }` ; ressource seule → objet `Event` nu. (L'API actuelle renvoie `{ success, event }` et `{ events, total, after, sort, aggregations, success }` — à transformer.)
- **Erreur** : mapper les `err.name` de `core` vers `{ error: { code, message, details? } }` ; codes HTTP corrects (401 vs 403).
- **Cursor `after`** : l'interne est un **tableau** `search_after` ES (ex. `[timing, tiebreaker]`), `null` quand tout est renvoyé. Le contrat l'expose en **string opaque** → **base64-encoder/décoder** le tableau (+ le sort, et idéalement le `limit`) en une string. En entrée, décoder vers `useAfterKey` / `search_after`. **Ne jamais exposer le tableau brut.**
- **Champs custom** : séparation natif/custom par **allowlist de champs** (implémentée tranche 2-3) — `mapEvent.js` énumère les champs natifs (`BASE_FIELDS`/`FULL_FIELDS`), droppe les clés internes (`DROP_KEYS`), et route **toute clé restante** sous `custom`. Le socle reste à plat. `additionalProperties: false` sur `EventSummary`/`Event` est correct **parce que** le mapping émet exactement les champs du contrat (il ne passe pas l'`_source` brut). _(Approche plus simple que le tri par `schemaId` initialement envisagé.)_
- **`readOnly`** : les champs `readOnly: true` (uid, slug, state, timestamps, dateRange, first/last/nextTiming, originAgenda, sourceAgendas, featured, country, links, timezone) ne sont pas acceptés en écriture.

### Champs ES volontairement EXCLUS du contrat public

Le mapping ne doit pas les émettre (modération/interne) : `addMethod`, `motive`, `member`, `html`, `creatorUid`, `ownerUid`, `private`, `draft`, `removed`. À rouvrir si un usage admin (Tier 2) le justifie.

---

## Formes première-passe — résolues (tranches 2-3)

Le schéma a d'abord été ancré sur code + fixtures ; ces points ont été tranchés contre de vraies réponses :

- `image.credits` vs `imageCredits` top-level : **les deux coexistent réellement** (confirmé tranche 2) → les deux restent déclarés.
- Formes laxistes (`additionalProperties: true`) sur `Image`(+`variants`), `Location`, `Registration`, `EnrichedLink`, `AgendaRef` : **resserrées en `additionalProperties: false`** + nettoyage allowlist du mapper (tranche 3, cf. « Revue tranche 3 »).
- `limit` max = 100 : **statu quo assumé** (clamp côté mapping ; `validateNavSize` v2 plafonne à 300, v3 borne plus strictement).
- `AgendaRef.title` : modélisé `string` (inchangé).

---

## Chantiers d'implémentation transverses (cf. `docs/analyse-api.md`)

- **Auth** (§9 décision 4) : Bearer unique, clés préfixées `oa_pk_`/`oa_sk_`, OAuth2 client-credentials via `oidc-provider`/oauth-server planifié. Pré-requis : multi-clé + révocation, invalidation cache (<1 h), unifier la vérif blacklist sur les deux chemins, rate-limit par clé, **rotation du sel HMAC `'okilydokily'`**, fenêtre de dépréciation `?key=` (utilisé par le SDK publié + proxies).
- **Tiers de visibilité** (§8) : ne pas servir les routes `internal` sur le port public ; Tier 2 sous tag `admin` + scopes.

---

## Journal par tranche

### Tranche 1 — squelette du contrat (fait)

- Package `@openagenda/api-spec` : `openapi.yaml`, `scripts/validate.mjs` (check offline), script `lint` (Redocly via npx).
- Conventions verrouillées : Bearer + OAuth2/scopes, enveloppe erreur, `{data,pagination}`, cursor opaque, `Event` (socle natif + `custom`, `additionalProperties: false`).
- 2 paths de lecture : `listAgendaEvents`, `getAgendaEvent`.
- Schéma Event ancré (cf. ci-dessus). Spec valide OpenAPI 3.1, 0 warning.

### Tranche 2 — implémentation route + contract-test (fait)

Couche de mapping HTTP des 2 endpoints de lecture, implémentée dans
`packages/cibul-node/api-v3/` (frère de `api/`), montée sur `/v3` du serveur API
standalone. Réutilise les middleware v2 (`api/middleware/`) sans les dupliquer.

**Fichiers créés** (`packages/cibul-node/api-v3/`) :

- `index.js` — `instanciateApiV3(core, { useRouter = true })` : pose
  `app.core`/`app.services` (comme `api/index.js`), `app.param('agendaUid', loadAgenda)`,
  les 2 routes GET (auth `verifyAndLoadAgendaOrUserFromKey` + `evaluateAnonymousAccess`),
  puis le error handler v3 en dernier.
- `lib/mapEvent.js` — mapper PUR `event projeté → Event v3`.
- `lib/cursor.js` — `encodeCursor`/`decodeCursor` (base64url(JSON) du couple `{ after, sort }`).
- `lib/envelope.js` — enveloppe liste `{ data, pagination }`.
- `errorHandler.js` — mapping `err.name` → `{ error: { code, message, details? } }` + statut HTTP.

**Montage** : `server.js` ajoute `instanciateApiV3(core)` et chaîne
`.use('/v3', secureHeaders, logRequestMw, setAPIType('standalone'), apiV3)` sur l'`apiServer`.

**Appels `core`** :

- Liste : `core.agendas(uid).events.search(query, nav, options)` ; page via `nav.size`
  (clampée `[1,100]` selon le contrat) ; cursor entrant décodé vers `nav.after` +
  `query.sort` (avec `useAfterKey: true`). `after` sortant : `null` en dernière page
  (quand `total === events.length`), sinon le tableau `search_after` ES réencodé en cursor opaque.
- Single : `core.agendas(uid).events.search.get({ uid }, { detailed: true, userUid })`
  (pas de fallback brouillon DB) ; lève `NotFound`/`Forbidden` → mappés par le handler.

**Mapper (`mapEvent`)** :

- Champs natifs = propriétés du schéma `Event` (moins `custom`), copiés à plat.
- Clés internes/modération **jamais exposées** : la drop-list inclut `valid` (flag de
  validation interne ajouté par `search.get`) en plus de `id, fileKey, deletedAt,
addMethod, motive, member, html, creatorUid, ownerUid, private, draft, removed,
agenda, agendaUid, _agg, …`.
- `_agg` (blob d'agrégation interne) est aussi **stripé en profondeur** dans
  `location`, `originAgenda`, `sourceAgendas[]`.
- Toute clé restante (ni native, ni droppée) → `custom` (ex. `thematique`).
- Champs natifs non-nullables que `core` émet `null`/vide pour « absent »
  (`keywords` `[]`, `registration`/`extIds` `null`, `conditions` `null`, `country` absent) :
  **omis** plutôt qu'émis (sinon violation de `additionalProperties: false` / type).
  `age`/`accessibility` (nullables au contrat) sont conservés tels quels.

**Ajustements du contrat** (formes première-passe corrigées contre de vraies réponses) :

- `AgendaRef.official` : `boolean` → `[boolean, 'null']`. Réel : `official: null` sur
  les `sourceAgendas` (renseigné `false`/booléen sur `originAgenda`). Validé par le
  contract-test d'intégration.
- Points première-passe **confirmés OK tels quels** par les vraies réponses :
  - `imageCredits` top-level ET `image.credits` coexistent réellement (event-2 : `imageCredits`
    string ; `image` sans `credits`). Les deux restent déclarés.
  - `Image.variants[]`, `Location`, `EnrichedLink`, `AgendaRef` (`additionalProperties: true`)
    encaissent les nombreux champs internes réels (`location._agg`, `disqualifiedDuplicates`,
    `sourceAgendas[].indexed/officializedAt`, …) — laxisme alors conservé, **resserré en
    tranche 3** (cf. « Revue tranche 3 » : `additionalProperties: false` + allowlist).
  - `limit` max = 100 : appliqué côté mapping (clamp) ; `validateNavSize` v2 plafonne à 300,
    mais le contrat v3 borne plus strictement.
  - `country` réel = `LocalizedString` + clé `code` (ex. `"code":"FR"`) — valide via
    `additionalProperties: { type: string }`.

**Auth — limite connue (à traiter dans la tranche auth)** : `verifyAndLoadAgendaOrUserFromKey`
renvoie un `403 { message }` brut (pas l'enveloppe `{ error }`) quand aucune clé/user
n'est résolu, car il répond avant d'atteindre le error handler v3. Réutilisé tel quel
volontairement (la refonte Bearer/`oa_pk_`/scopes est une tranche ultérieure).

**Tests** (`packages/cibul-node/test/`) :

- `90_unit_apiV3_mapEvent.test.js` — fixtures d'events projetés réels → `mapEvent` →
  validation Ajv 2020 contre le schéma `Event` d'`openapi.yaml` (composants enregistrés
  pour résoudre les `$ref`). Vérifie : conforme au contrat ; `custom` contient les non-natifs ;
  clés droppées absentes ; `_agg` stripé.
- `90_unit_apiV3_cursor.test.js` — round-trip encode/decode, gestion dernière page (`null`),
  cursors invalides.
- `90_apiV3_events.test.js` — intégration (MySQL/ES/Redis réels via `Services`, fixture
  `001.sql.js`, agenda 2 réindexé) : monte `instanciateApiV3(core, { useRouter: false })`,
  supertest sur les 2 endpoints. Asserte 200, enveloppe `{ data, pagination }` / `Event` nu,
  validation Ajv des réponses réelles, pagination par cursor, et 404 `{ error }`.

**Validation** : `node scripts/validate.js` OK (2 paths, 16 schemas, 40 `$ref`) ; redocly
lint « valid, 0 warning » ; eslint `api-v3` + tests `90_*` : 0 erreur ; jest unit (15) +
intégration (6) : tous verts.

#### Revue post-implémentation — fixes appliqués

- **400 documenté sur la liste** : `decodeCursor` lève `BadRequest` → 400 ; le path
  `GET …/events` déclare désormais une réponse `400` (`components/responses/BadRequest`),
  - un cas d'intégration (cursor malformé → 400 `{ error }`, code `bad_request`).
- **errorHandler simplifié** : statut = `err.statusCode || mapped.status` (retrait du
  fallback `err.code`, fragile car certaines erreurs ont un `code` non-HTTP).
- `@openagenda/api-spec` déplacé en `devDependencies` de `cibul-node` (aucun code runtime
  ne l'importe, seul le test).

#### Notes de comportement (pour les consommateurs / le SDK)

- ~~**Liste `detailed: false` vs single**~~ / ~~**Champs « parfois présents » (`OMIT_WHEN_EMPTY`)**~~ :
  **superseded** par la Tranche 3 (split `EventSummary`/`Event` + règle « toujours présent,
  vide-comme-vide »). Voir ci-dessous.
- **Cursor non signé** : l'opaque `after` n'est pas un secret ni une frontière d'autorisation —
  l'authz/scoping repose entièrement sur la couche search. Un cursor forgé ne contourne rien.
- **Cohérence éventuelle** : le single-get passe par ES ; un event tout juste créé peut
  renvoyer 404 le temps de l'indexation (lecture publique, acceptable).

#### Known gaps & améliorations hors-scope (futurs slices)

- **`{ error }` non respecté sur échec d'auth** (401/403) : `verifyAndLoadAgendaOrUserFromKey`
  répond en direct → à fermer dans le slice auth (qui le remplace). Aussi : 403 au lieu de 401.
- ~~**Schémas imbriqués ouverts**~~ : **résolu (revue tranche 3)** — `Location`, `AgendaRef`,
  `Image`(+`variants`), `Registration`, `EnrichedLink` passés en `additionalProperties: false`,
  ET le mapper nettoie chaque objet imbriqué par **allowlist** (`pick`, default-deny) → plus de
  fuite de champs internes (`disqualifiedDuplicates`, `tags`, `indexed`, `officializedAt`,
  agenda `private`/`description`, `_agg`…). Restent ouverts à dessein : `Error.details`,
  `EnrichedLink.data` (métadonnées d'enrichissement), `CustomFields`, `LocalizedString`(map).
- ~~**Filtres de liste**~~ : **fait (tranche 4)** — surface publique curée + translator strict + `geo_distance`.
- ~~**Tri (`?sort=`)**~~ : **fait (tranche 4)** — enum curé exposé (le cursor encode déjà le sort).
- **Sparse fieldsets** (`?fields=`) et **`?expand=`** : à exposer (le split `EventSummary`/`Event` ouvre la voie).
- **Aggregations/facettes** : renvoyées par v2, droppées en v3 → tranche/endpoint dédié (différé).
- **`limit`** : clamp silencieux à 100 (vs cap v2 `validateNavSize` = 300) ; statu quo assumé.

### Tranche 3 — split `EventSummary`/`Event` + règle « champs vides » (fait)

**Décision tranchée** : pour les champs vides/absents, **toujours présent, vide-comme-vide** (ni
omission, ni null uniforme) :

- collections → jamais nulles, jamais omises : tableaux `[]`, maps multilingues `{}` ;
- objets singuliers optionnels → `null` (présents) : `image`, `location`, `age`, `accessibility`,
  `originAgenda`, `first/last/nextTiming`, `country` ;
- scalaires nullables → `null` si absent : `imageCredits`, `onlineAccessLink`, `timezone` ;
- scalaires requis → pass-through (toujours fournis par `core`) ;
- **omettre pour cause de vide : interdit.**

**Pourquoi le split** : la liste (`detailed: false`) et le get (`detailed: true`) renvoient des
**jeux de champs réellement différents** (`searchIncludes.json`) — ~12 champs sont detailed-only.
Un seul schéma ne peut donc pas honnêtement servir les deux sous la règle « toujours présent » :
forcer ces champs à `[]`/`{}`/`null` en liste **mentirait**. D'où **deux schémas plats** :

- `EventSummary` (liste, base include) : `uid, slug, title, description, status, dateRange, featured,
image, imageCredits, keywords, originAgenda, timings, location, timezone, attendanceMode,
onlineAccessLink, first/last/nextTiming` + `custom`.
- `Event` (get, base + detailed) : EventSummary + `longDescription, conditions, country, registration,
createdAt, updatedAt, accessibility, age, state, links, extIds, sourceAgendas`.

`EventList.data` → `EventSummary[]` ; get → `Event`. Les deux en `additionalProperties: false`,
tous leurs champs en `required` (le mapper garantit la présence). Pas d'`allOf` (casserait
`additionalProperties: false`) : duplication assumée des lignes `property → $ref`.

**Mapper** (`lib/mapEvent.js`) : `mapEventSummary` (base) et `mapEvent` (full) via un `mapWithFields`
partagé. `OMIT_WHEN_EMPTY` **supprimé**. Coercition par _kind_ : `array`→`[]`, `map`→`{}`,
`object`→`null` (+ `stripAgg` profond), `nullable-scalar`→`null`, `scalar`→pass-through,
`boolean`→`Boolean()`. La liste mappe avec `mapEventSummary` (garde `detailed: false`), le get avec
`mapEvent` (`detailed: true`).

**Corrections de contrat ancrées sur de vraies réponses** :

- `timezone` → **nullable** (`[string, 'null']`) dans `EventSummary` et `Event` : la vraie donnée
  ES renvoie `timezone: null`.
- `AgendaRef.official` → nullable (déjà fait en tranche 2).

**Champs custom** : les champs agenda-spécifiques sont au niveau _detailed_ → `custom` est
typiquement `{}` dans un `EventSummary` (liste) et renseigné dans le `Event` (get).

**Suite** : `EventSummary` ouvre la voie à `?expand=`/sparse-fieldsets (enrichir la liste sans
casser le contrat) plutôt qu'à un futur breaking change.

#### Revue tranche 3 — fixes sécurité/robustesse appliqués

- **Fuite de champs internes imbriqués fermée** : sous-schémas `Location`/`AgendaRef`/`Image`/
  `Registration`/`EnrichedLink` en `additionalProperties: false` + nettoyage **allowlist** dans le
  mapper (`pick`). Test unitaire dédié (aucun `disqualifiedDuplicates`/`private`/`_agg`… imbriqué).
- **Cursor durci** : `decodeCursor` exige désormais un `after` = tableau **non vide de primitives**
  → réduit la surface d'un cursor « JSON valide mais aberrant » (qui pouvait partir dans ES → 500).
- Nettoyage : commentaire YAML résiduel retiré.
- **Toujours différés** (slices dédiés) : enveloppe `{ error }` sur échec d'auth (slice auth),
  validation runtime depuis le spec, rate-limit. (Les filtres/tri sont désormais traités, cf.
  tranche 4 ci-dessous.)

### Tranche 4 — Filtres de liste (contrat OpenAPI)

Conception du filtrage de `GET /agendas/{agendaUid}/events`. Sous-découpage : **4a contrat** (fait),
**4b** geo_distance dans event-search (fait), **4c** translator + validation stricte (fait),
**4d** tests d'intégration (fait), **4e** champs custom (fait).

**Source de vérité v2** : le schéma `validate` dans `packages/event-search/utils/validateQuery.js:27-303`
(le vrai gate), traduit en DSL ES par `getDSLQueryPart.js`. `core.agendas(uid).events.search` passe
tout `query` par `inflateAndClean` → `validateQuery`. Au-dessus : le blob legacy `oaq`
(`convertLegacyFilter`, **hors-scope v3**), `preCleanRawQuery` (alias `if`/`date`/`originAgendaUid`),
et `derelativize` (dates « today »).

**Deux pièges porteurs :**

1. **Les validateurs `choice` droppent silencieusement les valeurs inconnues**
   (`packages/validators/src/choice.js:14-21`, `.filter(idx !== -1)`) — v2 ne 400 PAS sur `status=99`,
   il l'ignore. v3 voulant 400 + `details`, **le translator v3 (4c) doit valider strictement
   lui-même**, sans compter sur `core`. (Les validateurs `text`/`integer`/`date` throw, eux : un
   tableau `{code,message,field}` → `search.js` l'emballe en `BadRequest({ info: { errors } })`, donc
   `errorHandler` peut mapper `err.info.errors` → `error.details`.)
2. **Verrou de visibilité** : `state` défaut = `2` (publié), `valid`/`removed`/`draft` gardent la
   modération. Le chemin liste v3 passe déjà `removed: false` et aucun `state` → publié-only tient.
   `state`, `valid`, `removed`, `addMethod`, `memberUid`, `ownerUid`, `ownerOrMemberUid`,
   `referencing/notReferencingAgendaUid`, `mlt`/`boost`, `set` **ne sont PAS exposés en public**
   (escalade de visibilité ou concept Tier 2/3 réseau).

**Décisions (tranchées avec l'utilisateur) :**

- **Noms singuliers, multi-valeurs par répétition** (`?keyword=a&keyword=b`, style `form`). On
  renomme les pluriels v2 (`languages` → `language`). Sémantique AND conservée pour `keyword`.
- **Ranges en deep-object** (`age[gte]`, `timings[gte]/[lte]`, `createdAt`, `updatedAt`, `localTime`),
  qui mappent 1:1 sur les `{gte,lte}` de v2.
- **`extId`/`locationExtId`** en deep-object `{key,value}`.
- **Géo : `bbox` (viewport) + `near`/`radius` (proximité)** — sans demi-mesure. `bbox=ouest,sud,est,nord`
  (string + regex) mappe sur le `geo_bounding_box` v2 existant ; `near=lat,lng` + `radius` (mètres,
  entier ≥1) **nécessite une nouvelle branche `geo_distance`** dans event-search (tranche 4b, additive,
  zéro impact v2). Le lien « `radius` requiert `near` » n'est pas exprimable en OpenAPI → 400 dans le
  translator, documenté en prose.
- **`custom`** : un seul param deep-object ouvert (`custom[<field>]=…`, `custom[<field>][gte]=…` pour
  les numériques), renvoi prose vers `settings/eventSchema`. Symétrie avec le nesting `custom` des
  réponses. Câblage du `formSchema` public requis (tranche 4e).
- **`sort` curé** : `timings(.asc/WithFeatured)`, `lastTiming(.asc/WithFeatured)`, `updatedAt.asc/desc`,
  `location.name.asc/desc`, `location.city.asc/desc`, `score`. **Écartés** : tris admin-levels 1–6 /
  countryCode / region / department (traînent la logique `mapAdminLevelSwap` par pays) — réintroductibles.
- **Texte/tri** : défaut `timingsWithFeatured.asc`, ou `score` (relevance) si `search` présent et pas
  de `sort` (comportement v2 conservé). `mlt`/`boost` droppés du public (recommandeur → futur endpoint
  `/events/{uid}/related`). `localTime` gardé (filtre v2 réel, inoffensif).
- **Facettes/aggregations** : **différées** vers une tranche/endpoint dédié (les bolter sur la liste
  serait la demi-mesure). Les clients recherche-à-facettes ne migrent pas encore.

**Cursor × filtres (porteur)** : le cursor encode `{ after, sort }` **seulement**, pas les filtres →
les requêtes de page 2+ doivent **renvoyer les mêmes filtres** avec `after`. Documenté dans la
description de l'opération ; à verrouiller par un test en 4d.

**Erreur de filtre** : `400 bad_request` (et non 422) — un paramètre de query malformé rend la
_requête_ malformée. `error.details` porte le contexte par champ.

#### 4b — geo_distance (event-search, fait)

Champ `geoDistance` (`center{lat,lng}` + `distance` en mètres) ajouté à
`validateQuery.js`, calqué sur le `geo` (bbox). DSL `geo_distance` sur `_search_location`
(geo_point) dans `getDSLQueryPart.js`, poussé dans les `must` parts à côté du bbox
(les requêtes géo sont à score constant → must vs filter sans impact sur le classement).
Garde `!= null` sur lat/lng (0 légitime) et `distance > 0`. Additif, zéro impact v2.
Couvert : test unitaire DSL + test d'intégration ES (`02_map_filters_and_aggregations`).

#### 4c — translator (cibul-node, fait)

`api-v3/lib/buildEventSearchQuery.js` : pur `reqQuery → core query`. Parse/type-check chaque
filtre documenté et **agrège toutes les erreurs** en un seul `BadRequest({ info: { errors } })`
→ 400 + `error.details.errors`. **N'émet QUE les params reconnus** : les clés non documentées
(dont `state`/`valid`/`removed`/`memberUid`/… et la pagination `after`/`limit`) sont ignorées,
jamais transmises → le verrou de visibilité ne peut pas être contourné par la query string.

- `req.query` est parsé par `qs` étendu (prod : `app.js` `set('query parser', …)` ; test : défaut
  express identique) → scalaires = strings, params répétés = tableaux, `a[b]` = objets imbriqués.
- Mappings : `language→languages`, `originAgendaUid→originAgenda.uid`,
  `originAgendaOfficial→originAgenda.official`, `bbox→geo`, `near`+`radius→geoDistance`.
  `countryCode` upper-casé. `sort` validé contre l'enum curé.
- **`errorHandler` inchangé** : il surface déjà `err.info.errors` → `error.details.errors`.
- **Précédence cursor** : `index.js` appelle le translator puis, si `after` présent, le `sort`
  décodé du cursor **écrase** un éventuel `?sort` (pagination cohérente).
- **Params inconnus ignorés** (pas de 400) : forward-compat + la route possède `after`/`limit`.

Tests unitaires (`90_unit_apiV3_buildEventSearchQuery.test.js`) : mappings valides, verrou de
visibilité (params modération ignorés), validation stricte par champ + agrégation d'erreurs.

#### 4d — tests d'intégration (cibul-node, fait)

`90_apiV3_events.test.js` étendu (ES réel, agenda 2 = events publiés 2/7/8). Assertions déterministes
ou dérivées du baseline : 400 sur enum/sort invalide (+ `error.details.errors`), params inconnus
ignorés, **`?state=0` n'élargit pas** (event 1 non publié reste absent → verrou vérifié de bout en
bout), `status` exact, `featured` partitionne sans recouvrement, `relative=upcoming/passed`,
`timings[gte]` futur → vide, `updatedAt` partitionne (2024 sépare event 2 de 7/8), `bbox`/`near+radius`
ne gardent que les events Paris (location 1), `near` sans `radius` → 400, et **pagination + filtre**
(cursor porte la position, le filtre est renvoyé page 2).

#### 4e — champs custom (cibul-node, fait)

**Découverte clé** : pas besoin de câbler le `formSchema` en v3. `services/eventSearch/agendaIndexSearch.js`
**injecte déjà** le `formSchema` depuis `agenda.schema` (l'agenda est chargé en interne par le
`doSearch` de core), et `filterAuthorizedSearchFields` applique l'accès par champ côté serveur. Donc le
translator se contente de mapper `custom[<field>]` → `query.custom` ; `core` lit `query.custom.<field>`
(`validateQuery.extractValue`), type-clean selon le schéma (`cleanAdditionalField`) et bâtit le DSL
(`_search_additional_keywords`/`_numbers`). Un champ restreint (ex. `note` en `read:['administrator']`)
est filtré côté serveur ; un champ inconnu est ignoré.

`buildEventSearchQuery` valide seulement la **forme** : scalaire, liste de scalaires, ou objet de bornes
numériques (`gte/lte/gt/lt`). Tests : 4 unitaires (mapping scalaire/liste/range, 400 si non-objet ou borne
inconnue) + 2 intégration sur l'**agenda 1** (réseau 1 → form schema 1, champ public `thematique` ;
event 1 a `thematique=2`, event 6 non) : `custom[thematique]=2` → narrowe à l'event 1, `=1` → vide.

**Note** : en réponse liste (`EventSummary`), `custom` reste `{}` (les champs custom sont detailed) — le
filtrage opère côté ES indépendamment du niveau d'include, donc il narrowe sans exposer les valeurs.
