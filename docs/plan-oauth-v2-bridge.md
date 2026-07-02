# Plan : faire fonctionner l'OAuth sur l'API v2

> Objectif : un token OAuth (le même type de JWT que v3 accepte déjà) doit pouvoir
> appeler l'API **v2** — en lecture **et** en écriture — borné par ses scopes.
> v2 n'est **pas** destinée au MCP ; le consommateur visé est un client OAuth
> générique (DCR, « Sign in with OpenAgenda » + accès API, SPA / explorateur
> in-browser, intégration partenaire).

## Décisions arrêtées

| Sujet                | Décision                                                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Périmètre v2         | OAuth en **lecture + écriture** sur toute la surface v2.                                                                                                                                                                               |
| Audience             | **Une seule resource pour toute l'API (v2 + v3)** — Modèle A. La version est un détail de chemin sous un même resource server, pas une frontière de sécurité.                                                                          |
| Valeur de l'audience | **Identifiant neutre** = le root de l'API (`apiRoot`), plus de suffixe `/v3`. **Bascule sèche, sans transition** : personne n'utilise encore réellement l'OAuth ni la v3, donc on ne garde aucune compat sur l'ancienne valeur `…/v3`. |
| Autorisation fine    | Portée par les **scopes** (déjà définis dans l'AS, version-agnostiques : `events:read/write`, `agendas:read/write`, `locations:read/write`, `members:read/write`, `me:read`, `events:transverse`).                                     |
| Verifier             | **Un seul** `verifyOAuthAccessToken` partagé par v2 et v3 (pas de verifier dédié par version).                                                                                                                                         |

---

## 1. Diagnostic : pourquoi l'OAuth échoue sur v2 aujourd'hui

v2 et v3 tournent dans le **même process**, sur le même `apiServer`
(`server.js:159-169`), et partagent **la même instance** `services.auth`.

**Côté v3** (`packages/cibul-node/api-v3/lib/authenticate.js`), un middleware
unique gère 4 credentials et teste l'OAuth **en premier** : `Bearer <jwt>` →
`auth.verifyOAuthAccessToken(token)` → vérif signature (JWKS locale), `iss`,
`exp`, `aud ∈ apiAudiences`, claim privé `uid` → `req.user` + `req.oauth`. Puis
`requireScope(...)` borne tout credential porteur de scopes.

**Côté v2** (`packages/cibul-node/api/middleware/`), seulement deux mécanismes, et
**aucun ne reconnaît un JWT** :

- `verifyAndLoadAgendaOrUserFromKey.js` (monté `app.get('*')`, `api/index.js:103`) :
  `extractPublicKey` fait `authorization.slice(7)`, écarte uniquement le préfixe
  `tk-`, et **traite donc un JWT OAuth comme une clé publique** → `auth.verifyKey(<jwt>)`
  échoue (pas dans le store `apikey`) → **403 `could not find user or agenda matching key`**.
- `verifyAndLoadAccessTokenUser.js` (POST/PUT/PATCH/DELETE, `api/index.js:75-78`) :
  ne connaît que `tk-` / `access-token:` / `access_token`.

Conséquence : un Bearer JWT OAuth est rejeté en 403 sur tout `/v2`.

C'était un choix assumé (`docs/plan-slice-auth-v3.md`, décisions #8 / D4 :
« v2 gelée, pas de pont d'écriture v2 »). **Ce plan révise sciemment cette
décision** : la surface write v3 n'existe pas encore (v3 = lecture
events/facets/locations/agendas), or un client OAuth réel a besoin de la surface
complète. L'OAuth devient le pont vers v2, **borné par scopes** — ce que `tk-` et
les clés ne savent pas faire.

---

## 2. Audience neutre (lot AS / config)

Aujourd'hui l'audience vaut `${apiRoot}/v3` (`config/index.js:121`), avec la règle
maison « l'audience EST la resource que le SDK appelle ». On la rend **neutre** :
l'audience identifie « l'API OpenAgenda » (le resource server), pas une version.

### `packages/cibul-node/config/index.js`

- Renommer `v3ResourceUrl` → `apiResourceUrl`.
- Nouvelle valeur = `apiRoot` **brut** (p.ex. `https://dapi.openagenda.com` en dev,
  `https://api.openagenda.com` en prod), normalisé sans slash final
  (`apiRoot.replace(/\/$/, '')`). Override via `OA_API_RESOURCE_URL`.
  ```js
  apiResourceUrl:
    prod.apiResourceUrl
    ?? process.env.OA_API_RESOURCE_URL
    ?? (apiRoot ? apiRoot.replace(/\/$/, '') : undefined),
  ```
- ⚠️ **Piège WHATWG trailing-slash** (déjà documenté pour `mcpResourceUrl`,
  `config/index.js:106-108`) : `new URL('https://host').href` rajoute un `/`.
  L'audience est comparée par **égalité de chaîne exacte** (Set / `includes`)
  dans le verifier et le `checkResource` de l'AS. Donc : garder la valeur en
  **chaîne brute canonique** (sans slash final), ne **jamais** la passer par
  `new URL().href`. C'est déjà le traitement de l'ancien `…/v3` (template brut,
  jamais `.href`'d) — on conserve la même hygiène.
- ⚠️ **Côté client** (corollaire) : l'audience neutre étant un **origin nu** (sans
  chemin), elle est plus sensible que l'ancien `…/v3` à cette normalisation. Un
  client à liaison directe qui calcule son paramètre `resource` (RFC 8707) via
  `new URL(apiResourceUrl).href` enverra `https://host/` (slash ajouté) → mismatch
  exact contre `validAudiences` → `invalid_request` / 401. À documenter dans les
  docs développeur : **envoyer la chaîne brute**, ne pas la passer par `URL().href`.
- Conséquence voulue : l'audience **n'est plus** égale au `baseUrl` du SDK (qui
  tape `…/v3` ou `…/v2`). C'est correct sous Modèle A : l'`aud` est l'identifiant
  de la resource, pas le chemin exact appelé.

### `packages/cibul-node/services/auth/index.js`

- `apiResourceUrl: config.apiResourceUrl` (au lieu de `config.v3ResourceUrl`).

### `packages/auth/src/index.js`

- Aucune logique nouvelle : `validAudiences` et `apiAudiences` continuent de se
  construire à partir de `apiResourceUrl` (désormais neutre). Le verifier in-process
  (`apiAudiences = [apiResourceUrl]`) et l'unique `verifyOAuthAccessToken` valent
  pour v2 **et** v3.
- Mettre à jour les commentaires qui disent « v3 API » / `aud=…/v3` → « API
  resource (v2 + v3) » / `aud=api`.

### Câblage à mettre à jour en lockstep (aucun client externe ne dépend de l'ancienne valeur)

- `exchangeClients` du MCP : `allowedResources` / `subjectResource` référencent
  l'ancienne valeur — repointer sur `apiResourceUrl` neutre. Le MCP continue
  d'appeler v3 via échange, inchangé fonctionnellement.
- SDK `@openagenda/api-client` : si un `resource`/audience est codé en dur côté
  client OAuth, le passer au neutre. Le `baseUrl` SDK (`…/v3`) reste tel quel.
- Tests qui assertent `aud=…/v3` (`packages/auth/test/13_oauthToken.test.js`,
  `14_tokenExchange.test.js`, `packages/cibul-node/test/90_unit_apiV3_authenticate.test.js`).

---

## 3. Phase 1 — Accepter et charger l'utilisateur OAuth sur v2

**Nouveau** `packages/cibul-node/api/middleware/verifyAndLoadOAuthUser.js`, calqué
sur la branche OAuth de `api-v3/lib/authenticate.js:80-97`, mais respectant le
**contrat v2** (le middleware écrit lui-même sa réponse) :

```js
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export default async (req, res, next) => {
  if (req.user) return next(); // session / clé déjà résolue
  const { auth } = req.app.services;
  if (!auth) return next(); // dégradation (apps de test), cohérent v2

  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!bearer || !JWT_RE.test(bearer)) return next(); // seul un JWS (3 segments) entre ici

  const verified = await auth.verifyOAuthAccessToken(bearer);
  if (!verified) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return res.status(401).json({ message: 'invalid or expired OAuth token' });
  }
  const user = await req.app.core.users.get(verified.userUid, {
    detailed: true,
  });
  if (!user) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return res.status(401).json({ message: 'invalid OAuth token' });
  }
  if (user.isBlacklisted)
    return res.status(403).json({ message: 'user is blacklisted' });

  req.oauth = { scopes: verified.scopes, clientId: verified.clientId };
  req.user = user; // visibilité = celle du propriétaire (comme une sk)
  return next();
};
```

Points clés :

- **401 (pas 403) pour un token OAuth invalide/expiré**, avec
  `WWW-Authenticate: Bearer` (RFC 6750) — signal OAuth-correct, et surtout on ne
  retombe **pas** sur le chemin clé qui renverrait un 403 trompeur. Le 403 reste
  réservé au blacklist.
- Sans Bearer JWT → **no-op** (`next()`), donc clés / `tk-` / session / anonyme
  continuent comme avant.

**Montage** (`api/index.js`), une seule ligne tous verbes, **après** la landing
`GET /` et `POST /requestAccessToken`, **avant** le bloc access-token (l.75) et le
bloc clé (l.103) :

```js
app.all('*', mw.verifyAndLoadOAuthUser); // ~ juste avant la l.75
```

Tous les middlewares d'auth v2 court-circuitent sur `if (req.user) return next()`,
donc dès que l'OAuth pose `req.user`, les autres deviennent inertes. La résolution
de rôle (`mw.member.allow/load`) marche telle quelle (elle ne lit que `req.user`).

**Durcissement défensif** (`verifyAndLoadAgendaOrUserFromKey.js:6-18`) : aligner
`extractPublicKey` sur v3 — renvoyer `null` si la valeur Bearer matche `JWT_RE`
(en plus du test `tk-`). Ceinture + bretelles : `verifyKey(<jwt>)` ne doit jamais
être appelé, même après un futur refactor de l'ordre de montage.

---

## 4. Phase 2 — Enforcement de scope sur v2 (obligatoire)

Sans ça, un token consenti `events:read` pourrait, via un user admin, écrire ou
supprimer sur v2 — escalade au-delà du consentement (d'autant que
`verifyHeadersPassword` est **bypassé sur /v2**, voir §6).

**Décision (design retenu) : scope par route, comme v3.** Le scope requis est
déclaré **sur chaque route**, à côté du `mw.member.allow` existant — pas de gate
central qui re-parse l'URL (ré-encoder le routage dérive et a des edge cases
slug/extension). C'est l'altitude de v3 (`requireScope` par opération) et de
`member.allow`.

**Helper partagé** extrait depuis `api-v3/lib/requireScope.js` vers
`api-v3/lib/scopes.js`, importé par v2 et v3 : `grantedScopesOf(req)` (OAuth →
`scopes`, fail-closed si `[]` ; clé/agenda/session → `null` → passe) et
`scopesFromPermissions`.

**Nouveau** `packages/cibul-node/api/middleware/oauthScope.js` exporte trois
middlewares :

- `requireScope(...scopes)` — factory posée par route. Marque
  `req.oauthScopeChecked`, passe les credentials non scopés, sinon exige TOUS les
  scopes listés (sinon **403 `insufficient_scope`** + `WWW-Authenticate`). Plusieurs
  scopes = ET logique (la recherche transverse exige `events:read` **et**
  `events:transverse`).
- `denyOAuthScope` — deny explicite pour la surface qu'aucun scope ne couvre
  (networks / supervisor / locationSets superadmin, `DELETE /me`). 403 tout caller
  OAuth, laisse passer le legacy.
- `denyUncheckedOAuthScope` — **backstop fail-closed**, monté en dernier
  (`app.all('*', …)` après toutes les routes) : un caller OAuth qui retombe sur une
  route sans gate (chemin non mappé, route oubliée) est refusé plutôt que servi.

Mapping appliqué (par méthode) :

| Ressource (segment)                                                          | GET/HEAD                            | Écriture                             |
| ---------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------ |
| events (`/agendas/:uid/events*`)                                             | `events:read`                       | `events:write`                       |
| transverse `/events`                                                         | `events:read` + `events:transverse` | —                                    |
| locations (`/agendas/:uid/locations*`, `/locations/*`)                       | `locations:read`                    | `locations:write`                    |
| members (`/agendas/:uid/members*`)                                           | `members:read`                      | `members:write`                      |
| agendas (`/agendas`, `/agendas/:uid`, `/settings*`, `/sources*`, `/summary`) | `agendas:read`                      | `agendas:write`                      |
| `/me/*`                                                                      | `me:read`                           | `denyOAuthScope` (pas de `me:write`) |
| networks / supervisor / locationSets                                         | `denyOAuthScope`                    | `denyOAuthScope`                     |
| `/requestAccessToken`, `/password/evaluate`, landing `/`                     | exempt                              | exempt                               |

- Les ops admin/destructives (settings/schema configure, `DELETE /agendas/:uid`,
  `members/sendGroupMail`, `locations/merge|transfer`) sont couvertes par le
  `:write` de leur ressource. Le **rôle membre** reste le vrai garde-fou ; le scope
  est la **borne de consentement** par-dessus.

---

## 5. Phase 3 — Tests, observabilité, docs

**Tests** (modèle : `packages/cibul-node/test/90_unit_apiV3_authenticate.test.js`) :

- ✅ Unit `verifyAndLoadOAuthUser` + `requireScope`/`denyOAuthScope`/
  `denyUncheckedOAuthScope` (`test/91_unit_apiV2_oauth.test.js`, 50 cas) : JWT valide
  → `req.user` + `req.oauth` ; invalide/expiré → 401 + `WWW-Authenticate` ;
  blacklisté → 403 ; pas de Bearer / clé / `tk-` → no-op ; scope manquant → 403
  `insufficient_scope` ; ET logique multi-scopes ; fail-closed scope vide ;
  pass-through clé/agenda/session ; backstop sur route non gatée.
- ✅ Intégration `/v2` (`test/92_api_v2_oauth_scope.test.js`, 7 cas, serveur réel +
  vrai `core`) : token valide → GET scopé 200 ; token inconnu → 401 `invalid_token` ;
  GET cross-resource hors scope → 403 `events:read` ; POST avec `events:read` → 403
  `insufficient_scope` `events:write` (le rôle admin passe, le scope bloque) ;
  POST avec `events:write` → passe la barrière ; `denyOAuthScope` (`/networks/:uid`)
  → 403 ; agenda-key → 200 (gate inerte). **Seul `auth.verifyOAuthAccessToken` est
  stubé** — la vérif jose/JWKS est couverte par `packages/auth/test/13_oauthToken.test.js`.
- ✅ Audience neutre : tests `13_oauthToken` / `14_tokenExchange` repassés au neutre
  (`API_RESOURCE`), suite `@openagenda/auth` 189/189.
- ⏳ Non-régression `oa_pk_`/`oa_sk_`, `tk-`, agenda-key, anonyme : couverte par
  `14_api_authentication_and_posts.test.js` (inchangé, 26 cas verts dans la nouvelle chaîne).

**Observabilité** : journaliser `auth.v2.oauth` (event distinct) avec `client_id`

- `user_uid`, cohérent avec les events `auth.signin.*`.

**Docs** : acter dans `docs/plan-slice-auth-v3.md` la révision de la décision
#8 / D4 (v2 n'est plus « gelée » : OAuth y lit + écrit, borné par scopes).

---

## 6. Points de sécurité à valider

1. **`verifyHeadersPassword` bypassé sur /v2** (`APIType==='standalone'`) :
   `DELETE /agendas/:uid` n'a pas de garde mot-de-passe sur v2. Avec l'OAuth,
   l'exposition augmente ; filet = rôle `administrator` + scope `agendas:write`.
   À confirmer : acceptable, ou scope élevé dédié pour les destructives ?
2. **Visibilité = propriétaire** : un token OAuth agit avec la visibilité pleine de
   l'utilisateur consentant (comme une `sk`), jamais comme une `pk` — borné par les
   scopes. À documenter.
3. **Révocation** : déjà couverte — blacklist revérifié à chaque requête
   (chargement user) ; TTL token court.

---

## 7. Découpage PR (cf. `feedback_pr_granularity`, scope commit `cibul-node`)

- **PR 1 — Audience neutre** : config (`v3ResourceUrl` → `apiResourceUrl`, valeur
  neutre), `services/auth`, commentaires `@openagenda/auth`, MCP `allowedResources`,
  tests. Bascule sèche, autonome. ⚠️ Touche un package publié sous `public/` côté
  MCP → **changeset requis** si la valeur d'audience y est exposée.
- **PR 2 — OAuth read+write sur v2** : Phase 1 (`verifyAndLoadOAuthUser` +
  durcissement `extractPublicKey`) **et** Phase 2 (`oauthScope` + helper
  partagé `scopes.js`). ⚠️ **Les deux phases doivent partir ensemble** — livrer la Phase 1
  seule ouvrirait une fenêtre où un token read-only écrirait sur v2. Deux commits,
  une PR.

---

## 8. Hors scope

- Câblage MCP→v2 : v2 n'est **pas** destinée au MCP. Ce plan rend v2 capable
  d'accepter un token OAuth ; aucun travail MCP n'en découle.
- Retrait de `tk-` / `requestAccessToken` (lié à l'EOL v2).
- Refonte du modèle de rôles membres (inchangé, dépend de `req.user`).

---

## 9. Revue de code — corrigés et points de suivi

**Corrigés dans cette PR** (revue xhigh) : try/catch manquant dans
`verifyAndLoadOAuthUser` (rejet async non relayé sous Express 4 → socket pendante) ;
fuite d'existence via le `302` `redirectIfPrivate` avant le gate `agendas:read` ;
commentaire trompeur du backstop (ne couvre que le fall-through, pas une route
répondante non gatée) ; `JWT_RE` dédupliqué dans un module partagé
(`api-v3/lib/bearer.js`, utilisé par les 3 forks JWT-vs-clé) ; commentaire obsolète
`enforceOAuthScope.js` ; message de refus hoisté ; changeset MCP.

**Points connus non traités (suivi, hors périmètre de cette PR) :**

- **Effet de bord avant le gate** : `imageMw`/`parseBodyData` (montés tous verbes
  avant l'auth) traitent et **uploadent l'image** avant que `requireScope` ne
  refuse un token `events:read` → upload orphelin. **Pré-existant** (les callers
  legacy aussi uploadent avant auth) ; le corriger proprement = déplacer l'auth
  avant `imageMw`, refonte risquée du routeur — séparé.
- **Granularité de scope** : `passCulture/bookings` (PII) est sous `events:read` ;
  `settings`/`sources`/`settings/passCulture` (config admin) sous `agendas:read`.
  Conforme au **vocabulaire de scopes choisi** (pas de `registrations:read` /
  `settings:read`) ; un découpage plus fin est une évolution du vocabulaire AS,
  hors de cette tranche. Le **rôle membre** reste le vrai garde-fou.
- **Validation des scopes au boot** : `requireScope('evnts:read')` (typo) ne 403
  qu'à l'exécution sur la route concernée. Un set figé vérifié au boot l'attraperait
  — nécessite d'exporter le vocabulaire depuis `@openagenda/auth` (source unique,
  éviter la dérive). Suivi.
- **Dédup v2/v3** : `verifyAndLoadOAuthUser` ré-implémente la branche OAuth de
  `api-v3/lib/authenticate.js`, et `oauthScope.requireScope` celle de
  `api-v3/lib/requireScope.js` (contrats de réponse différents). Un
  `resolveOAuthUser` / un constructeur de challenge `WWW-Authenticate` partagés
  réduiraient la divergence — refonte du chemin d'auth v3, séparée.
- **`POST /events/validate` sous `events:write`** : dry-run non mutant, mais
  prélude d'écriture — `events:write` est défendable ; laissé tel quel.
  </content>
  </invoke>
