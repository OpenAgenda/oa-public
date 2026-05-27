# Analyse de l'API OpenAgenda — état actuel & axes d'amélioration

> Objectif à terme : une API **claire et cohérente**, dotée d'une spec **OpenAPI**, d'un **SDK**, d'une **documentation** et d'un **MCP** générés via **Stainless**.
>
> Ce document décrit l'existant, pointe ce qui est améliorable, et propose une feuille de route. Les références de fichiers pointent vers `packages/cibul-node/api/` sauf mention contraire.
>
> **État d'avancement** : ce document reste l'instantané stratégique + les décisions (§9). La mise en œuvre v3 a démarré — le contrat OpenAPI (`packages/api-spec`) et la **lecture des events** (endpoints list/get + filtres de liste, `packages/cibul-node/api-v3/`) sont implémentés. Suivi détaillé au fil des tranches dans `packages/api-spec/IMPLEMENTATION-NOTES.md`.

---

## 1. Résumé exécutif

L'API publique actuelle (« v2 ») est un **routeur Express unique** (`api/index.js`, ~1320 lignes) qui s'appuie sur la couche `core`/`services`. Elle est **fonctionnelle et riche**, mais elle a grandi de façon organique : c'est un routeur fait-main, sans schéma déclaratif, qui sert **à la fois l'UI interne et l'API publique**. Les conventions (enveloppes de réponse, erreurs, pagination, verbes HTTP, paramètres) sont **hétérogènes d'une route à l'autre**.

Conséquence directe pour l'objectif : **on ne peut pas générer aujourd'hui une OpenAPI propre par introspection**. Il n'existe aucune source de vérité de schéma (pas de zod/JSON-Schema sur les routes), les réponses ne sont pas typées de façon homogène, et le périmètre public n'est pas séparé de l'interne. Stainless consomme une OpenAPI 3.1 bien formée : **le vrai chantier est de produire cette spec**, soit en écrivant une façade propre, soit en assainissant + annotant l'existant.

Verdict : l'API est exploitable mais **n'est pas « Stainless-ready »**. Il faut d'abord une phase de normalisation + contractualisation (OpenAPI) avant SDK/MCP.

---

## 2. Architecture actuelle

### 2.1 Double montage du même routeur

Le **même** routeur `api` est monté à deux endroits (`server.js:121-122` et `server.js:157-163`) :

| Montage                        | Chemin | Type (`req.APIType`) | Auth                         | Usage                |
| ------------------------------ | ------ | -------------------- | ---------------------------- | -------------------- |
| App web principale             | `/api` | `UI`                 | Session/cookie (better-auth) | Front interne, admin |
| Serveur dédié (port `apiPort`) | `/v2`  | `standalone`         | Clé API / access token       | API publique         |

- `setAPIType('UI' | 'standalone')` (`middleware/setAPIType.js`) pose juste `req.APIType`, qui modifie ensuite le comportement de certains middlewares (ex. `verifyHeadersPassword` ne s'applique qu'en `UI`).
- Better-auth est branché **avant** le body-parser sur `/api/auth/*` (`server.js:77-84`), hors du routeur `api`.
- Base publique réelle : `https://api.openagenda.com/v2` (prod), `https://dapi.openagenda.com/v2` (dev) — cf. `public/sdk-js/src/api/index.js:17-20`.

**Problème de fond** : il n'y a pas de frontière nette entre surface publique et surface interne. Des routes clairement internes (`/supervisor/users/:uid`, `/agendas/:uid/settings/*`, `/agendas/:uid/members/*`, `/agendas/:uid/sources/*`, `/networks/*`) sont servies par le même routeur que l'API publique. Toute génération d'OpenAPI publique devra **trier** ce qui est exposable.

### 2.2 Pile technique

- Express 4 pour la couche services.
- Couche métier `core.agendas(uid).events / .locations / .members / .settings / .sources`, `core.users`, `core.networks`, `core.events`, `core.services.geocoder`, etc. — l'API n'est qu'une **fine couche HTTP** au-dessus.
- Validation maison : `@openagenda/validators` (validateurs unitaires JS, **pas** de JSON-Schema/zod), et schémas de formulaire **dynamiques par agenda** via `@openagenda/form-schemas`.

---

## 3. Inventaire des endpoints (surface actuelle)

Regroupés par ressource (verbes réels constatés dans `api/index.js`). « ⚑ interne » = visiblement pas destiné au public.

**Agendas**

- `GET /agendas` — recherche/listing d'agendas
- `POST /agendas` — création (super-admin / réseau)
- `GET /agendas/:agendaUid` · `GET /agendas/slug/:agendaSlug` · `GET /agendas/:agendaUid.prv`
- `PATCH /agendas/:agendaUid` · `DELETE /agendas/:agendaUid` (delete exige mot de passe en header)
- `GET /agendas/:agendaUid/summary`
- ⚑ `GET/POST/PATCH /agendas/:agendaUid/sources[/:sourceAgendaUid]` (agrégation)

**Événements**

- `GET /agendas/:agendaUid/events` · `…/slug/:agendaSlug/events`
- `POST /agendas/:agendaUid/events/search` (**doublon** lecture du GET ci-dessus)
- `GET …/events.json-ld` · `GET …/events/:eventUid.pdf` (et variantes slug)
- `POST /agendas/:agendaUid/events` (création)
- `POST /agendas/:agendaUid/events/validate`
- `GET /agendas/:agendaUid/events/:eventUid` (+ variantes slug, `…/ext/:extKey/:extId`)
- `POST …/events/:eventUid` (**update complet via POST**) · `PATCH …/events/:eventUid` (update partiel)
- `PUT/PATCH/DELETE …/events/ext/:extKey/:extId`
- `DELETE …/events/:eventUid`
- `GET …/events/:eventUid/references`
- `POST …/events/:eventUid/conversations`
- ⚑ `GET …/events/:eventUid/activities`
- `GET …/events/:eventUid/passCulture/bookings`

**Lieux (locations)**

- `GET/POST /agendas/:agendaUid/locations`
- `GET/POST/PATCH/DELETE …/locations/:locationUid` (+ variantes `slug/`, `ext/:key/:value`)
- `PUT …/locations/ext/:key/:value` (set/upsert par ext-id)
- `POST …/locations/merge` · `POST …/locations/:locationUid/transfer/:targetAgendaUid`
- `GET …/locations/settings` · ⚑ `GET …/locations/:locationUid/activities`
- `GET /locations/geocode` · `GET /locations/geocode/reverse` · `GET /locations/insee`

**Membres** ⚑ (essentiellement interne)

- `GET /agendas/:agendaUid/members` · `POST …/members` · `POST …/members/invite`
- `GET …/members/:userUid` · `GET …/members/email/:email`
- `PATCH/DELETE …/members/:userUid` (+ `…/member/:memberId`)
- `POST …/members/sendGroupMail`

**Settings / schémas** ⚑

- `GET …/settings` · `POST …/settings/resync`
- `GET/POST …/settings/eventSchema[/configure]` · `GET …/settings/memberSchema[/configure]`
- `GET …/settings/passCulture`

**Utilisateur courant**

- `GET /me` · `DELETE /me`
- `GET /me/agendas` · `GET /me/agendas/:agendaUid` · `…/events` · `…/events/drafts` · `…/events/:eventUid`

**Auth / divers**

- `POST /requestAccessToken` (échange secretKey → access token)
- `POST /password/evaluate`
- `GET /events` (recherche transverse, nécessite `transverse_api_access`)
- ⚑ `GET/POST /networks/*`, `GET /locationSets/:uid`, `GET /supervisor/users/:uid`

---

## 4. Authentification & autorisation

Quatre mécanismes coexistent (détail confirmé par lecture de `middleware/verifyAndLoadAgendaOrUserFromKey.js`, `requestAccessToken.js`) :

1. **Clé publique utilisateur** (`publicKey`) — lecture (GET). Passée au choix : query `?key=`, header `key:`, ou `Authorization: Bearer <clé>` (si ne commence pas par `tk-`). Résout `req.user`.
2. **Clé d'agenda** (`type: agendaFullRead`) — lecture en lecture seule d'un agenda. Mêmes vecteurs de passage. Rejetée sur certaines routes (`middleware/rejectAgendaKey.js`, ex. `/me/*`).
3. **Access token** (`tk-…`) — pour les écritures (POST/PUT/PATCH/DELETE). Obtenu via `POST /requestAccessToken` avec `{ code: <secretKey> }` → `{ access_token, expires_in }`. Passé via header `access-token:` ou `Authorization: Bearer tk-…` ou body `access_token`.
4. **Session/cookie better-auth** — **UI uniquement** (`/api`), pas sur `/v2`.

Plus deux drapeaux d'autorisation : **super-admin** (`config.superAdminUids` / `user.isSuperAdmin`) et **accès transverse** (`user.transverse_api_access`, requis pour `GET /events`). Autorisation par rôle de membre : `administrator > moderator > contributor` via `middleware/member.js` (`.allow([roles])`, `.load`).

> ⚠️ **Précision (vérifiée dans le code)** : il n'y a **pas de séparation lecture/écriture au niveau du credential**. `byPublicKey` et `byAccessToken` résolvent le **même objet user complet** (`core/users/index.js`). La séparation est uniquement le **câblage middleware par verbe** : `publicKey` testé sur `GET` (`api/index.js:81`), `access token` requis sur POST/PUT/PATCH/DELETE (`:74-77`). De même `publicKey`/`secretKey` existent déjà comme colonnes `api_key`/`api_secret` d'une **unique** ligne `api_key_set` par user.

**Incohérences notables**

- **Credentials différents selon le verbe (par convention de routage)** : `publicKey` pour GET, `access token` (donc échange préalable de `secretKey`) pour les écritures. Le secret n'est jamais envoyé comme credential : il est échangé contre un token `tk-`. Un client doit gérer les deux ; le SDK masque ça mais c'est inhabituel.
- **Trois façons de passer la même clé** (query / header `key` / Bearer) → surface d'auth ambiguë ; `Bearer` est déjà surchargé (valeur nue = publicKey, préfixe `tk-` = token).
- **Mot de passe en clair dans un header Basic** pour les opérations sensibles en UI (`verifyHeadersPassword`).
- **Codes HTTP**: échec de résolution de clé renvoie **403** (`verifyAndLoadAgendaOrUserFromKey.js:72`) là où **401** serait correct.
- `POST /requestAccessToken` est un pseudo-OAuth (`grant-type: authorization_code`, `code` = secretKey) **non conforme** ; il **réutilise/prolonge** un token vivant au lieu d'en émettre un neuf, et le token `tk-` est un HMAC-SHA256 à **sel codé en dur (`'okilydokily'`)**, durée de vie 1 h (`generateTokenFromSecretKey.js`).
- **Vérif blacklist asymétrique** : `isBlacklisted` est contrôlé sur le chemin publicKey (`getUserFromKey.js`) mais **pas** sur le chemin token (`getUser`) → un token résout un user blacklisté.
- **Modèle de clés rigide** : une seule paire publique/secrète par user (régénérer = remplacer) → **pas de multi-clé, pas de révocation par clé, pas de label** au niveau user. Cache Redis 1 h sur la résolution → **latence de révocation** jusqu'à 1 h. Aucun **rate-limit** sur le chemin clé API. Enum de types figé `['userPublic','userPrivate','agendaPrivate','agendaFullRead']`, **aucun concept de scope**.

---

## 5. Problèmes & axes d'amélioration

### 5.1 Enveloppes de réponse incohérentes

Aucun contrat unifié. Échantillon réel :

- `{ success: true, event }` (event get/create) ; `{ success: true, location }` ; `{ success: true, events, total, after }`.
- `{ ...data, success: true }` (agendas search, me/agendas).
- **Sans enveloppe** : `GET /networks/:uid` → `{ uid, title }` brut ; `GET /locations/insee` → `{ code }` ; `GET /locations/geocode` → `{ results }` ; `settings/eventSchema` → `{ ...data }`.
- `GET /me` → `{ logged: true, apiKey }` (pas de `success`).
- `POST …/members/sendGroupMail` → **`{ dontKnowWhat: true }`** (placeholder resté en prod, `api/index.js:697`).
- 404 catch-all → `{ info: 'Unhandled route' }`.

Le champ `success: true` est **redondant** avec le code HTTP et incohérent (absent ailleurs). Pour OpenAPI/SDK il faut **une enveloppe unique** (ou pas d'enveloppe du tout) et des **clés de collection stables**.

### 5.2 Format d'erreur non standardisé

`errorHandler.js` produit au moins 5 formes différentes selon `err.name` : `{errors, times}` (ValidationError), `{message, errors, info, times}` (BadRequest), `{message, info, times}` (auth/notfound), `{message, code, field}` (Multer), `{message}` (500, **texte humain** invitant à mailer le support). Aucun **code d'erreur machine** ni `type` stable. Impossible d'en dériver un modèle d'erreur OpenAPI fiable.

### 5.3 Conventions REST hétérogènes

- **Update via POST** : `POST /agendas/:uid/events/:eventUid` = remplacement complet, `PATCH` = partiel. Le SDK appelle ça `update` (POST) vs `patch`. Sémantique non standard (devrait être `PUT` vs `PATCH`).
- **Multiplicité d'identifiants** par ressource : `:uid`, `slug/:slug`, `ext/:key/:value` — multiplie les chemins (4+ variantes pour `GET event`).
- **Doublons lecture** : `GET …/events` et `POST …/events/search` font la même chose.
- Verbe `PUT` réservé à l'upsert par ext-id (`locations/ext/...`) — usage non uniforme.

### 5.4 Pagination hétérogène

- Événements : **curseur** `after` (`useAfterKey`, clé d'after opaque) + `total`.
- Lieux : bascule `from`/`after` selon `useAfter` (`api/index.js:995`), clé de collection **paramétrable** par `?itemsKey=` (`api/index.js:997-1005`) → **la forme de la réponse dépend d'un paramètre client** (anti-OpenAPI).
- Pas de `limit`/`size` standardisé ni d'entête de pagination commune.

→ **Cible réaliste** : on ne peut pas tout ramener au curseur — la recherche d'events (Elasticsearch `search_after`) est nativement _cursor_, mais des listes adossées au SQL ne produisent pas de curseur stable à moindre coût. La cible n'est donc **pas un mode unique** mais **deux modes déclarés**, partageant une **enveloppe de pagination homogène** :

- _cursor_ : `?after=<curseur>&limit=N` → `pagination: { after, limit, total? }`
- _offset_ : `?offset=N&limit=N` → `pagination: { offset, limit, total }`
  Règles : un **mode fixe par ressource** (pas de bascule via paramètre client), noms de paramètres canoniques, clé de collection **fixe** (`data`), `total` optionnel quand il est coûteux. Stainless gère la pagination par opération → deux modes sont acceptables tant que chaque opération est cohérente et déclarée dans l'OpenAPI.

### 5.5 Paramètres de requête

- **Alias** : `includeFields` ⟺ `if`, `aggregations` ⟺ `aggs`.
- **Booléens en `'1'`/`'0'`** (chaînes) un peu partout (`includeNonDataFields`, `detailed`, `useDefaultImage`, `includeImagePath`…), parfois avec défaut implicite (`?? '1'`).
- `detailed` a un **défaut différent** selon les routes.
- Pas de schéma de query déclaré → aucune validation/documentation automatique.

### 5.6 Schémas de contenu dynamiques (point structurant)

Le **schéma d'un événement et d'un membre est configurable par agenda** (champs custom via `form-schemas`). Le corps d'un `POST /events` n'a donc **pas de forme statique universelle** : il dépend de l'agenda cible. C'est le principal défi pour un typage statique (OpenAPI/SDK/Stainless). Il faut décider : (a) typer le **socle commun** + un sac `customData` libre, et/ou (b) exposer le schéma par agenda via un endpoint dédié (déjà existant : `…/settings/eventSchema`) pour validation côté client.

### 5.7 Absence de source de vérité de schéma

Validation = `@openagenda/validators` (validateurs impératifs JS) + form-schemas dynamiques. **Aucun JSON-Schema/zod/OpenAPI** n'existe sur les routes. Il n'y a donc **rien à introspecter** : la spec devra être écrite (ou une couche de schéma introduite).

### 5.8 Périmètre public/interne non séparé

(cf. §2.1) — beaucoup de routes ⚑ internes dans le même routeur. Risque de fuite dans une OpenAPI publique et de couplage UI/API.

### 5.9 Versionnage

« v2 » est juste un préfixe de montage ; il n'y a pas de v1 servie ni de stratégie de versionnage/deprecation documentée. À clarifier avant de figer un contrat public.

---

## 6. Implications pour l'objectif (OpenAPI → SDK → Docs → MCP via Stainless)

**Ce que Stainless attend** : une **OpenAPI 3.1** propre, avec des `operationId` clairs, des ressources cohérentes (CRUD réguliers), un modèle d'**erreur** unique, une **pagination** déclarée (idéalement un style unique, ex. cursor), des **schémas de requête/réponse** typés, et une séparation nette du périmètre public. À partir de là, Stainless génère SDKs (TS, Python…), la doc, et le **MCP server**.

**Écart actuel** : tous les points du §5. Il n'existe ni spec, ni schémas, ni enveloppe/erreur/pagination homogènes, ni séparation public/interne.

**Deux stratégies possibles**

- **A — Façade « API propre » (recommandé à terme).** Définir un nouveau contrat REST cohérent (ressources, enveloppe, erreurs, pagination, auth Bearer unifiée) décrit en OpenAPI 3.1 _spec-first_, implémenté comme une fine couche de mapping vers `core`. Avantage : on contrôle le contrat, Stainless produit un SDK/MCP de qualité. Inconvénient : effort de design + maintien en parallèle de l'existant le temps de la transition.
- **B — Assainir + annoter l'existant.** Garder les routes, mais (1) homogénéiser enveloppe/erreurs/pagination, (2) introduire une couche de schéma (zod/JSON-Schema) sur chaque route, (3) générer l'OpenAPI depuis ces schémas. Avantage : pas de nouvelle surface. Inconvénient : on hérite des chemins/verbes non standard ; l'OpenAPI restera « anguleuse ».

Dans les deux cas, le **socle commun** est le même : décider d'une enveloppe, d'un modèle d'erreur, d'un style de pagination, d'un schéma d'auth, et trier public/interne.

### Stratégie retenue : A, matérialisée en **v3 façade**

La contrainte « **on ne peut pas casser v2** » élimine B pour les corrections de fond : enveloppe, format d'erreur, POST-as-update, `itemsKey`, pagination sont tous **structurellement cassants**. Les corrections de fond exigent donc un **nouveau contrat = v3**.

Pourquoi A est peu coûteuse _ici précisément_ : l'API actuelle est une **fine couche HTTP au-dessus de `core`** — la logique métier (validation, permissions, persistance) vit dans `core`, pas dans les routes. Une v3 ne réimplémente donc **rien** : elle réutilise le même `core` + le middleware `member`, et n'ajoute qu'une **couche de normalisation HTTP** (enveloppe unique, mapper d'erreurs, pagination unique, auth Bearer). Le coût = mapping + schémas, pas la logique.

Mise en œuvre :

- **`/v3` path-based**, sur le même serveur standalone que `/v2` (cohérent, cacheable, Stainless-friendly — pas de versioning par header).
- **Spec-first** : écrire l'OpenAPI 3.1 à la main _comme contrat_, implémenter les routes v3 pour la satisfaire, avec contract-tests (réponse à la décision 6).
- **Mapping fin sur `core` partagé** — règle d'or : **ne jamais reforker la logique métier** dans v3 ; seul le _shaping_ HTTP diffère.
- **Périmètre incrémental** : v3 démarre sur le **Tier 1** (events, locations, agendas read, me) ; le Tier 2 suit ; tout le reste reste sur v2.
- **v2 gelée** : bugfix/sécurité seulement, plus de feature → la double maintenance est quasi nulle. Politique de dépréciation annoncée, sans sunset brutal.
- **En parallèle, durcissement _additif_ (non cassant) sur v2** : appliquer la séparation Tier 3 du §8 (cesser de servir les routes internes sur le port public) — sans impact sur les clients publics légitimes.

Pièges à garder en tête :

- **Collision de noms** : le SDK existant est déjà `@openagenda/sdk-js` **v3.0.0** et cible l'API v2. Version de package ≠ version d'API — être explicite dans la comm (« SDK vX cible API v3 »).
- **Champs custom** : v3 ne résout pas le schéma dynamique par agenda, mais offre l'endroit propre pour modéliser « socle typé + `customData` » (décision 5).

---

## 7. Feuille de route proposée (incrémentale)

**Phase 0 — Cadrage (décisions, §9).** Trancher : périmètre public (§8), enveloppe, modèle d'erreur, pagination, auth cible, gestion des champs custom. Stratégie : **v3 façade spec-first** (cf. §6).

**Phase 1 — Définir les conventions transverses de v3** (couche de normalisation HTTP, pas d'édition de v2)

- Modèle d'**erreur unique** `{ error: { code, message, details? } }` + mapper depuis les `err.name` de `core` ; codes HTTP corrects (401 vs 403).
- **Enveloppe** unique pour collections (`{ data, pagination: { after, total } }`) et ressources ; plus de `success` ni de clés ad hoc.
- **Pagination** : enveloppe homogène (`pagination: { … }`, clé de collection fixe `data`) avec **2 modes déclarés** — _cursor_ (`after`/`limit`) et _offset_ (`offset`/`limit`) — un mode fixe par ressource, pas de bascule via paramètre client (`itemsKey`). Cf. §5.4.
- Booléens `true`/`false` ; pas d'alias (`if`, `aggs`) — noms pleins uniquement.

**Phase 2 — Contractualisation OpenAPI**

- Introduire une couche de schéma (zod → conversion JSON-Schema, ou hand-written OpenAPI spec-first).
- Modéliser le **socle commun** Event/Location/Agenda + champs custom nestés sous `custom` (`Record<string, CustomFieldValue>`) ; documenter l'endpoint de schéma par agenda. Cf. §9 décision 5.
- Séparer explicitement les routes publiques (tagging `x-internal` pour le reste).
- Unifier l'**auth** publique sur `Authorization: Bearer` (clé préfixée ou token), scopes mappés aux tiers ; OAuth2 `client_credentials` via `oidc-provider`/`oauth-server` planifié, **pas** via un plugin api-key BA (inexistant en 1.6.9). Détail et chantiers induits : §9 décision 4.

**Phase 3 — Stainless**

- Brancher Stainless sur l'OpenAPI, configurer ressources/pagination/auth, générer **SDK** (remplacer / étendre le `@openagenda/sdk-js` fait-main, qui ne couvre aujourd'hui qu'Events + Locations) et **MCP**.
- Publier la **doc** (remplacer/alimenter `developers.openagenda.com`, repo `OpenAgenda/dev-doc`).

**Phase 4 — Couverture & dépréciation**

- Étendre la spec aux ressources manquantes jugées publiques (members? agendas? me?).
- Plan de dépréciation des formes legacy (POST-as-update, alias, `?key=` en query).

---

## 8. Tiers de visibilité (périmètre public)

Ne pas raisonner en binaire public/interne, mais en **3 tiers**. Beaucoup de routes « non publiques » ne sont pas internes à OA : ce sont des opérations d'**admin d'agenda** qu'un intégrateur légitime peut piloter par token. Le tier corrèle d'ailleurs déjà avec le mécanisme d'auth (public = clé/token ; admin = token + rôle agenda ; interne = session UI ou super-admin) — le découpage suit donc une frontière déjà présente dans le code.

### Tier 1 — API Contenu (cœur public : OpenAPI + SDK + MCP)

~70 % de la surface, part dans la spec publique sans réserve :

- **Événements** : search/list, get, create, update, patch, delete, par ext-id, json-ld, pdf, references
- **Lieux** : CRUD complet + `geocode` / `reverse` / `insee` + `locations/settings` (read)
- **Agendas** : `GET /agendas` (search), `GET /agendas/:uid`, `summary`
- `GET …/settings/eventSchema` (read seul — indispensable pour connaître les champs à remplir)
- `/me` + `/me/agendas` (read)
- `POST /requestAccessToken`
- `GET /events` (transverse, déjà gated par `transverse_api_access` → palier partenaire existant)

### Tier 2 — API Management (admin d'agenda)

Légitimement programmable, **même auth** (token + rôle `administrator`/`moderator`), mais documenté dans une section « Admin » distincte (tag OpenAPI `admin`), pas dans le quickstart :

- **Membres** : list, get, create, invite, patch, delete
- **Settings** : `eventSchema/configure`, `memberSchema/configure` (POST)
- **Sources** (agrégation) : `GET/POST/PATCH …/sources`
- `locations/merge`, `locations/:uid/transfer`
- **Agendas** : create / patch / delete
- `events/:uid/conversations` (modération)

### Tier 3 — Interne / plateforme (hors OpenAPI publique)

Super-admin OA ou pur helper d'UI couplé au front :

- `/supervisor/*`, `/networks/*`, `/locationSets/:uid` — super-admin
- `/settings/resync` — ops
- `/password/evaluate` — jauge de mot de passe UI
- `…/events/:uid/activities`, `…/locations/:uid/activities` — feed back-office
- `/me/agendas/:uid` (getContext), `…/events/drafts`, `…/events/:uid` (getContext) — contexte d'édition du front
- `passCulture/*` — intégration de niche (à isoler dans un namespace partenaire dédié plutôt que dans l'API généraliste)

### Où mettre les routes (organisation)

Pas de séparation en 3 codebases : le `core` est partagé. Approche incrémentale :

1. **Court terme — métadonnée de visibilité par route** : taguer chaque route `public | admin | internal` (+ scope/rôle requis). L'OpenAPI publique n'émet que `public` (+ `admin` sous tag séparé). Aucun déplacement de code.
2. **Gain de sécurité indépendant** : aujourd'hui le routeur **entier** est servi sur le port public `/v2`. Cesser d'y monter les routes `internal` (elles restent sur `/api` pour le front) → réduit la surface d'attaque publique _et_ aligne le contrat. Utile même avant l'OpenAPI.
3. **Long terme** : rapatrier le Tier 3 super-admin (`networks`, `supervisor`) derrière l'app `/admin` existante (`superadmin.plugApp`) pour le sortir définitivement du routeur API.

**Seul vrai arbitrage** : exposer le **Tier 2** publiquement (sous tag « Admin ») dès la v1 du contrat, ou le garder interne et l'ouvrir plus tard ? Recommandation : l'exposer mais le tagger, pour ne pas se fermer de portes côté partenaires.

---

## 9. Décisions à trancher (questions ouvertes)

1. **Périmètre public** : ✅ **tranchée** → exposer le **Tier 2 (Management) dès la v1**, mais **curé et scope-gated** :
   - **Curer, pas tout publier** : inclure les ops propres à forte valeur (agenda CRUD, membres CRUD/invite, sources, `eventSchema/configure`) ; **exclure/reporter** les bancales ou à risque (`sendGroupMail` — placeholder `{dontKnowWhat:true}` + mail de masse ; `passCulture` → namespace partenaire séparé).
   - **Tag OpenAPI `admin` + scopes `*:write` obligatoires** → hors quickstart, inaccessible à la clé publiable lecture seule.
   - **Contrat ≠ implémentation** : le contrat OpenAPI v1 décrit les deux tiers (image complète pour les partenaires) même si l'implémentation livre Tier 1 d'abord puis Tier 2.
   - ⚠️ **Garde MCP** : via Stainless le Tier 2 devient des tools manipulables par un agent IA — ne pas auto-exposer les ops destructrices (delete agenda, remove member) comme tools par défaut, ou exiger confirmation.
2. **Stratégie** : ✅ **tranchée** → A matérialisée en **v3 façade** spec-first sur `core`, v2 gelée en parallèle + durcissement additif (cf. §6, sous-section « Stratégie retenue »). Reste à fixer le calendrier de dépréciation de v2.
3. **Rétro-compatibilité** : ✅ **tranchée** (découle de la v3) — politique :
   - **v2 = contrat figé, zéro changement cassant** : uniquement bugfix, sécurité et ajouts strictement additifs/optionnels. Les intégrateurs existants et le SDK actuel continuent sans modification.
   - **v3 = nouveau contrat, libre de diverger** (enveloppe, erreurs, verbes, pagination, auth) — aucune contrainte de compat avec v2.
   - **Pas de double-écriture de compat** : on ne rétroporte pas les conventions v3 dans v2 ; les deux coexistent côte à côte.
   - **Dépréciation conditionnelle** : pas de sunset de v2 tant que l'usage est significatif. Pré-requis avant d'inciter à migrer : v3 couvre au moins le périmètre **Tier 1** équivalent. Annoncer une politique (préavis type 12–18 mois) mais ne déclencher la fin de vie que quand l'usage v2 est résiduel. ← seul point de calendrier encore ouvert.
4. **Auth cible** : ✅ **reco** (vérifiée dans le code) — direction proposée :
   - **Transport unique `Authorization: Bearer`** ; supprimer `?key=` en query et les headers `key:`/`access-token:`. Garder les types distinguables par **préfixe** (`oa_pk_`/`oa_sk_`).
   - **Deux clés (façon Stripe)** : _publiable lecture seule_ (remplace `publicKey` + `agendaFullRead`, safe en navigateur) et _secrète_ (serveur, lecture+écriture). Nuance : ce n'est **pas** « supprimer un split de credential » (il n'existe pas, cf. §4) — le vrai changement est de **laisser la clé secrète/scopée autoriser l'écriture directement** en Bearer, sans échange de token.
   - **OAuth2 `client_credentials` conforme** (RFC 6749) en option pour des tokens courts, **remplaçant** `requestAccessToken`. ⚠️ **À aligner sur le plan existant `@openagenda/oauth-server` (oidc-provider)** décrit dans `docs/analyse-authentification.md` — ne pas créer un design parallèle.
   - **Scopes** (`events:read`, `events:write`, …) mappés aux tiers du §8 (net-new : ajouter une colonne `scopes` au store de clés) ; `transverse_api_access` devient un scope (sémantique globale cross-agenda à conserver).
   - **Rôles de membre + super-admin** : couche d'autorisation **orthogonale**, inchangée.
   - **Better-auth** : ⚠️ **correction** — BA **1.6.9 n'a pas de plugin api-key** (il a `oidc-provider`, `bearer`, `jwt`, `mcp`). Donc : (a) côté OAuth, s'appuyer sur `oidc-provider` (ou l'`oauth-server` planifié) ; (b) côté clés API, **étendre le store maison existant** (`api_key_set` + service `keys`) avec scopes/multi-clé — ne **pas** présumer un plugin BA non installé.
   - **Pré-requis / chantiers induits** : multi-clé + révocation par clé = **nouveau modèle de données** ; invalidation de cache (révocation < 1 h) ; unifier la vérif blacklist sur les deux chemins ; rate-limit par clé ; **rotation du sel HMAC `'okilydokily'`** ; **fenêtre de dépréciation `?key=`** (utilisé par le SDK publié + proxies first-party, pas seulement les embeds).
5. **Champs custom** : ✅ **reco** (vérifiée dans le code) — **nester les champs custom sous une clé dédiée `custom`** en v3, socle natif typé et fermé au top-level.
   - **État actuel** : tout est **à plat** (natif + custom mélangés au top-level de l'event), sur tout OpenAgenda.
   - **Donnée clé** : natif vs custom est **dérivable du schéma** — les champs natifs viennent du schéma par défaut/parent (`schemaId: null`, dans `parents`), les custom du schéma propre de l'agenda (`schemaId` non nul) ; le `fieldType` est un **enum fermé** (`text`, `image`, `date`, `choice`, `languages`…).
   - **Pourquoi nester** : (1) typage statique propre — le socle natif est un type fermé/complet, `custom` un `Record<string, CustomFieldValue>` ; à plat, l'objet event devient ouvert (`{ …, [k: string]: unknown }`), ce qui pollue tout le type et casse l'autocomplétion (pire cas pour Stainless/SDK). (2) Plus d'ambiguïté natif/custom ni de collision possible (ajouter un champ natif plus tard ne heurte aucun champ maison). (3) `custom` reste typable par `fieldType` (union fermée), donc pas d'`any`.
   - **Faisabilité** : le split étant dérivable du `schemaId`, la couche de mapping v3 transforme **plat-interne ↔ nesté-API** sans perte. C'est **purement une préoccupation de surface v3** : le `core`, l'UI, Elasticsearch et les exports gardent le modèle plat — pas de changement du modèle de données.
   - **Source de vérité** : exposer le schéma de l'agenda (endpoint `settings/eventSchema`, déjà existant) pour introspection/validation de `custom`.
   - **Alternative légère écartée** : rester à plat avec `additionalProperties: true` — moins de travail mais DX SDK médiocre (type ouvert) et zéro garde-fou de collision. À ne retenir que si le round-trip flat↔nesté s'avérait risqué.
6. **Spec-first ou code-first** : ✅ **tranchée** → **spec-first + spec exécutable**.
   - **Spec-first** : écrire l'OpenAPI 3.1 à la main comme **contrat**, puis implémenter le mapping v3 pour le satisfaire. Cohérent avec la v3 façade (on _conçoit_ le contrat, on ne _reflète_ pas la forme de `core`). Contrôle total des operationIds/naming/pagination par opération/scopes/exemples — ce dont Stainless a besoin. Le back étant en JS sans schémas existants, une couche zod→openapi serait _aussi_ du travail, pour un résultat moins maîtrisé.
   - **Spec exécutable** (neutralise la dérive spec/code, le seul vrai contre-argument du spec-first) : validation runtime **générée depuis l'OpenAPI** (schemas → JSON-Schema/ajv, requêtes + réponses) ; **contract-tests en CI** (v3 réelle validée contre le spec) ; lint du spec (Spectral).
   - **Localisation** : le spec vit dans le repo (package `api-spec` dédié) → source de vérité unique pour Stainless (SDK + MCP + doc).

---

## Annexe — fichiers clés

- Routeur API : `packages/cibul-node/api/index.js`
- Montage : `packages/cibul-node/server.js:121-122` (UI) et `:157-163` (/v2)
- Gestion d'erreurs : `packages/cibul-node/api/errorHandler.js`
- Auth : `api/middleware/{verifyAndLoadAgendaOrUserFromKey,verifyAndLoadAccessTokenUser,requestAccessToken,setAPIType,rejectAgendaKey,member}.js`
- SDK existant : `public/sdk-js/` (`@openagenda/sdk-js` v3, Events + Locations seulement)
- Validation : `packages/validators/` (validateurs maison) ; `packages/form-schemas/` (schémas dynamiques par agenda)
- Migration auth en cours : `docs/analyse-authentification.md`, `docs/plan-migration-better-auth*.md`
- Doc développeur externe : `https://developers.openagenda.com` (repo `OpenAgenda/dev-doc`, hors monorepo)
