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

- **Auth** (§9 décision 4) : Bearer, clés préfixées `oa_pk_`/`oa_sk_`, **via le plugin `@better-auth/api-key`** (table `apikey` native, BA `1.6.11`) — **pas** le store maison `api_key_set` (l'analyse initiale recommandait l'inverse, revue à l'exécution : cf. `docs/plan-slice-auth-v3.md` §2-3). OAuth2 client-credentials via `oidc-provider`/oauth-server **différé** (Phase 7 SSO). État : **D0→D5a mergés** (journal « Slice auth » ci-dessous). Pré-requis désormais traités : multi-clé + révocation ✅ (table `apikey`), unifier la vérif blacklist ✅ (D0), rate-limit par clé (plugin, activé D6) ; le sel HMAC `'okilydokily'` est **gelé** avec `tk-` v2 (pas roté ; retrait lié à l'EOL v2) ; `?key=` conservé côté v2.
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
  les 2 routes GET (auth via `lib/authenticate.js` — voir slice auth D0),
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

**Auth — résolu (slice auth D0)** : la tranche 2 réutilisait `verifyAndLoadAgendaOrUserFromKey`,
qui renvoyait un `403 { message }` brut (pas l'enveloppe `{ error }`) et 403 là où 401 est
correct. Remplacé sur `/v3` par `api-v3/lib/authenticate.js` (factory fermant sur `core`) qui
lève des erreurs typées → `NotAuthenticated` (401, credential absent/invalide) /
`Forbidden` (403, blacklist), rendues par l'error handler v3. Le middleware v2 reste inchangé
(toujours correct pour `/api` et `/v2`). La refonte clés `oa_pk_`/`oa_sk_` + scopes est la
suite du slice (cf. `docs/plan-slice-auth-v3.md`).

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

- ~~**`{ error }` non respecté sur échec d'auth** (401/403)~~ : **résolu (slice auth D0)** —
  `api-v3/lib/authenticate.js` remplace `verifyAndLoadAgendaOrUserFromKey` sur `/v3` et lève
  `NotAuthenticated` (401) / `Forbidden` (403) dans l'enveloppe `{ error }`.
- ~~**Schémas imbriqués ouverts**~~ : **résolu (revue tranche 3)** — `Location`, `AgendaRef`,
  `Image`(+`variants`), `Registration`, `EnrichedLink` passés en `additionalProperties: false`,
  ET le mapper nettoie chaque objet imbriqué par **allowlist** (`pick`, default-deny) → plus de
  fuite de champs internes (`disqualifiedDuplicates`, `tags`, `indexed`, `officializedAt`,
  agenda `private`/`description`, `_agg`…). Restent ouverts à dessein : `Error.details`,
  `EnrichedLink.data` (métadonnées d'enrichissement), `CustomFields`, `LocalizedString`(map).
- ~~**Filtres de liste**~~ : **fait (tranche 4)** — surface publique curée + translator strict + `geo_distance`.
- ~~**Tri (`?sort=`)**~~ : **fait (tranche 4)** — enum curé exposé (le cursor encode déjà le sort).
- ~~**Enrichissement de liste** (`?expand=`)~~ : **fait (tranche 5)** — exposé en `?detailed=true|false`, la liste renvoie des `Event` complets (cf. journal). **Sparse fieldsets** (`?fields=`) : toujours différé (casse `additionalProperties:false`/`required`, SDK Stainless imprécis `Partial`, cache combinatoire — cf. tranche 5).
- **Aggregations/facettes** : endpoint dédié `…/events/facets` — **familles termes (A), provenance (G), géo (B/C) et temps (E/F) faites (tranche 6)** ; familles dates-ranges (D) / custom (H) différées (cf. journal tranche 6).
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
- **Toujours différés** (slices dédiés) : clés `oa_pk_`/`oa_sk_` + scopes via le plugin
  better-auth `api-key` (cf. `docs/plan-slice-auth-v3.md`), validation runtime depuis le spec,
  rate-limit par clé. (L'enveloppe `{ error }` sur échec d'auth est traitée par le slice auth D0 ;
  les filtres/tri par la tranche 4 ci-dessous.)

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

### Tranche 5 — vue `detailed` sur la liste (fait)

Enrichissement de `GET /agendas/{agendaUid}/events` : un paramètre `?detailed=true|false`
(défaut `false`) fait basculer chaque item de `EventSummary` vers le `Event` complet (mêmes champs
que le get unitaire), **en un seul appel** (pas de N+1).

**Nommage — `detailed`, pas `view=summary|full`** (tranché) : (1) c'est déjà le vocabulaire interne
— option `core` `detailed`, mappers `mapEventSummary`/`mapEvent`, descriptions du contrat — `view`
inventerait un synonyme ; (2) la réponse est une union stricte de **exactement 2** schémas, un booléen
suffit ; (3) continuité v2 (familier). Le grief §5.5 d'`analyse-api` visait le `'1'/'0'` + défaut
variable de v2, **pas le nom** — corrigé ici par un vrai booléen `true/false` + un défaut unique
documenté. Un `view` enum reste introductible plus tard si une 3e représentation émerge (additif).

**Contrat** : nouveau paramètre `Detailed` ; `EventList.data.items` → `oneOf: [EventSummary, Event]`.
Union **non ambiguë** : les deux schémas sont `additionalProperties: false` et mutuellement exclusifs
(un `Event` complet porte des champs que `EventSummary` rejette ; un summary n'a pas les `required` de
`Event`), donc chaque item valide **exactement une** branche.

**Implémentation** : `index.js` parse `detailed` en strict (`true`/`false`/absent ; sinon **400**
`bad_request` + `error.details.errors` par champ, comme les filtres), le passe à
`core … events.search(query, nav, { detailed })` et à `buildListEnvelope` (qui choisit `mapEvent` vs
`mapEventSummary`). `detailed` n'est **pas** un filtre → le translator l'ignore, aucune fuite dans la
query `core`. Vérifié : la recherche **liste** à `detailed: true` porte bien le jeu _detailed_
(`defineIncludes.js:33`), donc `mapEvent` produit des `Event` complets sans N+1.

**Sparse fieldsets `?fields=` — toujours différé** : forte valeur pour les clients HTTP bruts/mobile,
mais (1) casse la règle « tous `required` / `additionalProperties:false` » (exige un `EventSparse` à
part), (2) le SDK Stainless n'en sort qu'un `Partial<Event>` imprécis (le `Pick<>` précis demande une
surcouche TS manuelle), (3) explose les clés de cache. À rouvrir sur **demande partenaire concrète**,
dans un mode de contrat « partiel » assumé.

**Tests** (`90_apiV3_events`) : `detailed=true` valide chaque item contre `Event` (+ présence
`state`/`createdAt`/`updatedAt`) ; `detailed=false` contre `EventSummary` (absence `state`) ;
`detailed=yes` → 400 + `details.errors[0].field === 'detailed'`. Suite api-v3 : 102 verts.

### Tranche 6 — facettes / agrégations (endpoint dédié)

Endpoint `GET /agendas/{agendaUid}/events/facets` : comptes groupés par facette sur le **même
ensemble filtré** que la liste (mêmes params de filtre), **sans données d'event**. Décision actée
(tranche 4) : endpoint dédié, pas bolté sur la liste.

**Les facettes = les agrégations que `event-search` calcule déjà** (`aggregations/index.js`). Elles se
répartissent en **8 familles de formes** distinctes → on les livre **famille par famille** (granularité
= unité de déploiement), pas en un bloc :

| Famille               | Forme                          | Facettes                                                                                                             | État                                                                                    |
| --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **A — termes**        | `[{value,count}]`              | cities, regions, departments, districts, countryCodes, keywords, languages, accessibilities, status, attendanceModes | **fait (6a)**                                                                           |
| B — geo points        | `[{value,count,lat,lng}]`      | geohash                                                                                                              | **fait (6c)**                                                                           |
| C — viewport          | objet `{topLeft,bottomRight}`  | viewport                                                                                                             | **fait (6c)**                                                                           |
| D — tranches de dates | `[{value,count,sampleEvents}]` | eventsByDateRanges                                                                                                   | différé — ⚠️ `sampleEvents` = `_source` ES brut → re-mapper via `mapEvent` + visibilité |
| E — timespan          | objet `{first,last}`           | timespan                                                                                                             | **fait (6d)**                                                                           |
| F — timings           | `[{value,timingCount}]`        | timings                                                                                                              | **fait (6d)**                                                                           |
| G — refs d'agenda     | `[{agenda,count}]`             | originAgendas, sourceAgendas                                                                                         | **fait (6b)**                                                                           |
| H — champs custom     | map `{field:{label,values}}`   | additionalFields                                                                                                     | différé — ⚠️ gated formSchema + accès par champ (cf. 4e)                                |

**Exclu (modération/interne)** : `members`, `valid`, `states`, `addMethods`, `additionalFieldMetrics`,
`missingAdditionalFields`, `adminLevels3/5` — absents de l'enum, inatteignables (curation cohérente
avec filtres/tri de tranche 4).

**Famille A — implémentation (6a)** :

- Contrat : paramètre `Facets` (CSV, `minItems:1`, enum des 10 termes, requis), schémas `FacetBucket`
  (`{value:string, count:int}`) et `FacetResults` (`{facets:{<nom>:FacetBucket[]}}`, propriétés
  nommées + `additionalProperties:false` → typé proprement pour Stainless, pas une map libre).
- `api-v3/lib/facets.js` : `parseFacets` (split CSV, dédup, **400** `bad_request` + `details.errors`
  par champ sur facette inconnue/absente — comme les filtres) ; `mapFacets` (`{key,eventCount}` →
  `{value:String(key),count}`, `value` stringifié pour les facettes à clé entière comme `status`).
- **Mapping identité** : les 10 noms publics = les types internes de `aggregations/index.js`, passés tels
  quels en `aggregations`. `nav = { size: 0 }` (aucun hit, juste les comptes — accepté par `core`).
- Route montée **avant** `/events/:eventUid` (sinon `facets` capté comme `:eventUid`). Verrou de
  visibilité hérité de la liste (pk → public ; facettes de modération hors enum).
- Tests intégration (`90_apiV3_events`) : `facets=cities,status` → buckets valides contre `FacetResults`
  (seules les facettes demandées présentes) ; un filtre sans match vide les buckets (scoping) ; facette
  inconnue → 400 `details.errors[0].field==='facets'` ; `facets` absent → 400. Suite api-v3 : 106 verts.

**Famille G — provenance (6b)** :

Bucket `{ agenda, count }`. **Vérité terrain (index réel, pas les fixtures)** — les formes diffèrent
selon la SOURCE de la donnée, pas selon origin/source :

| Contexte                     | origin                                | source                                          |
| ---------------------------- | ------------------------------------- | ----------------------------------------------- |
| **Facette** (depuis `_agg`)  | `{uid,title,slug,image,url}`          | `{uid,title,image}`                             |
| **Event** (depuis `_source`) | `{uid,title,slug,image,url,official}` | `{uid,title,slug,image,url,official}` (complet) |

⇒ L'asymétrie est **facette (`_agg`) vs event (`_source`)**, pas origin vs source. Sur les events,
`sourceAgendas` porte le **schéma complet** (vérifié) — donc **`Event` n'est pas touché**. Seule la
**facette source** est étroite (l'index ne packe que `uid/title/image` dans `sourceAgenda._agg`).

- Contrat : facette `originAgendas` → `AgendaFacetBucket` (`agenda: AgendaRef`) ; facette `sourceAgendas`
  → `SourceAgendaFacetBucket` (`agenda: SourceAgendaRef` = `{uid,title,image}`, `additionalProperties:false`)
  → le type SDK source n'a pas de `slug`/`url` fantômes. Split à la demande de l'utilisateur, validé par
  la vérité terrain.
- Mapper : `mapFacets` route `originAgendas`/`sourceAgendas` vers `cleanAgendaRef` (exporté de `mapEvent.js`,
  même nettoyage allowlist que les agendas d'events) ; il produit naturellement le bon sous-ensemble
  (`_agg` source n'ayant que 3 champs). Mapping identité côté `aggregations`.
- Tests : `facets=originAgendas,sourceAgendas` → buckets valides ; origin expose `slug` (propagation
  AgendaRef) ; source n'expose **jamais** `slug`/`url` (SourceAgendaRef `additionalProperties:false` +
  assertions). Suite api-v3 : 108 verts.

**Familles B/C — géo (6c)** :

Première facette à **forme non-uniforme** : `viewport` renvoie un **objet** (ou `null`), pas une liste.
D'où le refactor de `mapFacets` : le registre mappe désormais le **résultat entier** de chaque facette
(plus par-bucket), donc une facette peut renvoyer un objet (`viewport`) aussi bien qu'une liste.

- **B `geohash`** (`geo_point_clustering`) : clusters `[{value,count,latitude,longitude}]` (`value` =
  id de grille). Option `geohashZoom` (entier, défaut 1, plancher 1, clamp lenient comme `limit`) →
  passée en requête objet `{type:'geohash', zoom}` (`buildAggregations`). `geo_point_clustering` est
  **supporté par l'ES de test** (vérifié — le test passe).
- **C `viewport`** (`geo_bounds`, standard) : `{topLeft,bottomRight}` (GeoPoint = `{latitude,longitude}`),
  ou **`null`** quand aucun event filtré n'a de coordonnées. Pas d'option.
- Contrat : `GeoPoint`, `GeoFacetBucket`, `Viewport` ; `FacetResults.geohash` → `GeoFacetBucket[]`,
  `FacetResults.viewport` → `oneOf[Viewport, null]`. Param `GeohashZoom`.
- Tests : viewport non-null (events Paris), viewport `null` (filtre sans match), geohash clusters
  (`geohashZoom=5`) avec lat/lng/count. Suite api-v3 : 111 verts.

**Familles E/F — temps (6d)** :

Deux formes sur la même donnée (`timings.begin`), agrégations pures → pas de re-map de visibilité
(contrairement à D), d'où leur priorité avant D/H.

- **E `timespan`** (`min`/`max` nested) : borne min/max des dates d'event sur l'ensemble filtré →
  objet `{first,last}` en **RFC 3339**, ou **`null`** quand aucun event filtré n'a de timings (même
  convention "pas de donnée" que `viewport`). `mapTimespan` normalise les `Date` d'event-search en ISO
  (`toIso`, tolérant aux Invalid Date du set vide). Pas d'option.
- **F `timings`** (`date_histogram` nested) : histogramme `[{value,count}]` (forme termes uniforme ;
  `value` = clé de bucket formatée, `count` = `timingCount`). Option **`timingsInterval`**
  (hour/day/week/month/year, défaut `day`, lenient comme `geohashZoom`). Le **format suit l'intervalle**
  (`TIMINGS_INTERVALS`) — l'agrég sous-jacente formate en `YYYY-MM-dd` par défaut, ce qui écraserait les
  buckets horaires et tronquerait mois/année ; on passe donc `{type:'timings', interval, format}` dans
  `buildAggregations`. La timezone reste le défaut plateforme (Europe/Paris), non exposée.
- Contrat : schéma `Timespan` (`{first,last}` date-time) ; `FacetResults.timespan` → `oneOf[Timespan,
null]`, `FacetResults.timings` → `FacetBucket[]` (réutilise la forme termes). Param `TimingsInterval`.
  `timespan`/`timings` ajoutés à l'enum `Facets`.
- Tests : timespan non-null (`first ≤ last`, dates RFC 3339), timespan `null` (filtre sans match),
  histogramme timings (buckets `YYYY-MM-DD` par défaut), granularité `timingsInterval=year` (buckets
  `YYYY`). Suite api-v3 : 41 verts (fichier events).

**Suite** : D (`eventsByDateRanges` — re-map `_source` brut via `mapEvent` + visibilité) et H
(`additionalFields` — gating formSchema + accès par champ) pour la fin vu leur risque. Une par commit.

### Slice auth — D0 : cohérence enveloppe + 401/403 (fait)

Première tranche du slice auth (plan complet : `docs/plan-slice-auth-v3.md`). **Sans changement de
modèle de données** ni de surface : rend le contrat OpenAPI vrai sur les échecs d'auth.

- **`api-v3/lib/authenticate.js`** (nouveau) : factory `createAuthenticate(core)` qui orchestre les
  primitives `core` (`users.get.byPublicKey`/`byAccessToken`, `services.keys(...).get`) — qui
  **retournent/lèvent** sans écrire de réponse — et lève des erreurs typées :
  - aucun credential **ou** clé/token invalide → `NotAuthenticated` (401) ;
  - user blacklisté (clé **et** token — la vérif blacklist est unifiée ici, le chemin token v2 la
    sautait) → `Forbidden` (403).
    Rendu par l'error handler v3 dans l'enveloppe `{ error: { code, message } }`.
- **`api-v3/index.js`** : remplace `mw.verifyAndLoadAgendaOrUserFromKey` par `createAuthenticate(core)` ;
  retire `mw.evaluateAnonymousAccess` des 2 routes (devenu mort — `authenticate` garantit
  `req.user`/`req.agendaKey` ou lève). **Le middleware v2 reste inchangé** (correct pour `/api`, `/v2`).
- **Factory fermant sur `core`** (et non lecture `req.app.core`) : aligné sur les handlers de route v3,
  évite l'ambiguïté `req.app` d'un Router monté.
- **Contrat** : descriptions `Unauthorized`/`Forbidden` enrichies (codes `unauthorized`/`forbidden`).
- **Tests** : `90_unit_apiV3_authenticate.test.js` (12 cas — toutes les branches : 401 sans/mauvais
  credential, 403 blacklist clé + token, succès user/agenda-key/`?key=`/header/`tk-`/session) +
  bloc `authentication` dans `90_apiV3_events.test.js` (401 + enveloppe `{ error }` end-to-end).

### Slice auth — D1 : plugin api-key additif (fait)

Adoption du plugin **`@better-auth/api-key`** (package séparé `^1.6.11` ⇒ bump de toute la ligne
`better-auth`/`@better-auth/*` `1.6.9 → 1.6.11`). Plugin `apiKey({...})` branché dans
`packages/auth/src/index.js` (préfixes `oa_pk_`/`oa_sk_`, hashing par défaut, rate-limit defaults,
storage Redis). Migration `packages/auth/migrations/20260527120000_create_api_key_table.js` (table
`apikey` native : `referenceId` requis/indexé, `key` hashée, `permissions`, `metadata`, rate-limit,
`expiresAt`, `enabled`). **Plugin activé, zéro trafic dessus** — la suite de tests auth existante
revalidée après le bump. (Décision actée : on **n'étend pas** le store maison `api_key_set`,
contrairement à la reco initiale d'`analyse-api.md` §9.4 — le plugin existe en 1.6.11 et est préféré.)

### Slice auth — D2 : dual-write + backfill (fait)

Toute création/régénération de clé écrit **aussi** dans `apikey` (hashé) via les hooks keys. Migration
de **backfill** `migrations/legacy/20260527130000_backfill_api_key_from_legacy.js` : hashe
(`defaultKeyHasher`) les clés de la table `key` (`userPublic`/`userPrivate`/`agendaFullRead`) dans
`apikey`, `referenceId` = `<uid>` (user) / `agenda:<uid>` (agenda), `metadata.oaKind` = `pk`/`sk`/`agenda`,
**`permissions: null`** (legacy non-restreint — pas de scopes par-ressource sur les clés héritées, cf.
`plan-slice-auth-v3.md` §5.1). Hors transaction knex (`mirrorOne` ouvre ses propres transactions).
Hash déterministe ⇒ backfill **idempotent**. La vérif lit encore l'ancien chemin à ce stade.

### Slice auth — D3a / D3a′ : bascule vérif sur le store apikey (fait)

Façades OA dans `@openagenda/auth` (`packages/auth/src/apiKey.js`, liées sur l'instance) :
`verifyKey` (via `verifyApiKey` du plugin, owner reconstruit depuis `referenceId`), `createUserKey`/
`createAgendaKey` (server-callable au-dessus de `auth.api.createApiKey`, owner encodé dans `userId`),
`listUserKeys`/`listAgendaKeys`/`revokeUserKey`/`revokeAgendaKey` **via l'adapter**
(`instance.$context.adapter`, modèle `'apikey'`) car les endpoints list/get/update/delete du plugin sont
**session-gated** (inadressables server-side / pour une clé agenda).

- **D3a (v3)** : `api-v3/lib/authenticate.js` vérifie d'abord via `verifyKey`, reconstruit le
  propriétaire depuis `referenceId` (`<uid>` → `core.users.get` ; `agenda:<uid>` → `req.agendaKey`).
- **D3a′ (v2)** : `api/middleware/verifyAndLoadAgendaOrUserFromKey.js` (sert `/api` + `/v2`) lit **aussi**
  le store `apikey`, en gardant le contrat v2 (403 `{ message }`, passage anonyme, délégation `tk-`).
  Avancé par rapport au plan initial : une clé native multi/scopée ne peut pas être ré-écrite vers le
  legacy user (`api_key_set` = une seule paire) ⇒ la seule façon que les nouvelles clés marchent sur v2
  **et** v3 sans casser v2, c'est que v2 lise le store `apikey`.
- **Fallback legacy** conservé des deux côtés comme filet (retiré en D5a).

### Slice auth — D3b : endpoints clés dédiés (agenda puis user) (fait)

Sur le store `apikey`, via les façades. `create` renvoie le plaintext **une seule fois** ; `list` ne
renvoie aucun matériel de clé ; revoke scopé `id`×`referenceId` ; PATCH (rename) via l'adapter.

- **D3b-agenda** : endpoints serveur agenda (list/create/revoke) extraits dans `apiKeysPlugApp`, gardes
  identiques au legacy (`requireUser` + `agendas.mw.load` + `members.authorize('administrator')`), à de
  nouveaux chemins. Sûr isolément (clés agenda = read-only).
- **D3b-user** : **liste plate de clés nommées**, créées une par une (`oaKind` `pk`/`sk`). La `pk` lit sur
  v2 (GET) + v3 ; la `sk` écrit nativement sur v3 (Bearer direct). Pas de pont d'écriture v2.

### Slice auth — D3c : UX « montré une fois » + découplage users (fait)

`user-apps` (`ApiKeySettings`) basculé sur le store `apikey` : liste plate de clés nommées, valeur
révélée **uniquement** au retour de création. `users` découplé : suppression des resolvers
`apiKey`/`apiSecret` et des hooks `generateApiKey`/`searchByKey` (`gate enable_secret`). Apps React
legacy — édition en place, Storybook mis à jour.

### Slice auth — D5 / D5a : suppression du legacy (fait)

- **D5** : `packages/keys` + `services/keys` supprimés, dual-write mirror retiré, migrations legacy
  relocalisées dans `cibul-node/migrations/legacy/` (entrée `legacy` dans `byService` ; relocaliser sans
  renommer — knex traque par basename). Migrations forward : drop `key`
  (`20260528120000_drop_legacy_key_table.js`) puis `api_key_set` (`20260528170000_…`, idempotente).
- **D5a** : retrait du **fallback legacy** dans l'auth v2 **et** v3 (`verifyKey` seul fait foi).
- **Cutover `access_token`** : `access_token.user_id` (backfill depuis `api_key_set`) puis résolution du
  user du token par `user_id` seul, mint des tokens directement depuis le store `apikey`, FK alignée.
  Le flux `tk-` reste **gelé** sur v2 (sel `okilydokily` inchangé) ; v3 ne l'introduit jamais.

### Slice auth — reste à faire : D6 (surface moderne v3)

`oaKind` est aujourd'hui **lu mais non appliqué** ; toutes les clés ont `permissions: null` ⇒ **aucun
enforcement de tier/scope** encore en place (une `pk` de modérateur passe `userUid` et voit ses
brouillons — verrou « public » structurel **pas encore posé**). D6 (éclaté A→E dans
`plan-slice-auth-v3.md` §6) ferme ça : **A** tier enforcement (pk read-only, agenda scopé), **B** scopes,
**C** restriction par ressource (agendas), **D** sunset headers v2, **E** expiry. Ordre de PR : A → B1 →
C1 → (B2+C2) → B3+C3 → D → E. **A/B1/C1 sont no-op pour le legacy** (`permissions: null`) et strictement
plus restrictifs — point d'entrée recommandé.
