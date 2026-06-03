# Plan — OpenAgenda fournisseur OAuth 2.1 (`@better-auth/oauth-provider`)

> SSO « Sign in with OpenAgenda » + auth du MCP HTTP, sur l'instance better-auth existante.
> Document de travail. État au 2026-06-02.

## 0. Constat de départ

`docs/analyse-authentification.md` §4.5 recommandait un serveur `oidc-provider`
standalone + `express-session` : **caduc** depuis la migration better-auth (BA).
La réalité actuelle (vérifiée) :

- BA `1.6.11` est l'instance d'auth centrale (`packages/auth/src/index.js`), montée
  dans cibul-node sous `/api/auth` (`baseURL = config.root`), DB **MySQL**
  (`MysqlDialect`, `generateId: 'serial'`).
- Plugins actifs : `apiKey`, `oaImpersonationPlugin`, `magicLink`, `customSession` ;
  social consume Google/Facebook (Phase 4 ✅), magic-link ✅, argon2, sessions BA (Lot 4).
- **slice-auth-v3** (en cours) : clés API modernes `oa_pk_`/`oa_sk_`, modèle de scopes
  ↔ tiers de visibilité (cf. `docs/plan-slice-auth-v3.md` §5.1/§5.2).
- MCP : serveur **stdio read-only** posé (`packages/mcp`, SDK bundlé, sandbox, egress).
  Roadmap point #4 = **« MCP HTTP + OAuth »** ; bloquant amont = surface write v3.

**On n'écrit pas un serveur OAuth from scratch.** On active un plugin BA.

## 1. Faits techniques vérifiés (2026-06-02)

- Le plugin à jour est **`@better-auth/oauth-provider`** (« OAuth 2.1 Provider »),
  import `import { oauthProvider } from '@better-auth/oauth-provider'`.
  **`oidc-provider` (présent en 1.6.11) est DÉPRÉCIÉ** → on ne l'utilise pas. L'ancien
  plugin `mcp` séparé est remplacé : `oauth-provider` intègre MCP via `mcpHandler`.
- Disponibilité npm : `@better-auth/oauth-provider@1.6.13`, peer-deps
  `better-auth@^1.6.13`, `better-call@1.3.5`, `@better-auth/core@^1.6.13`,
  `@better-auth/utils@0.4.1`, `@better-fetch/fetch@1.1.21` ; deps `zod@^4`, `jose@^6`.
  → **bump BA `1.6.11 → 1.6.13`** (patch, même mineure) requis.
- Endpoints exposés par le plugin : `/oauth2/authorize`, `/oauth2/token`,
  `/oauth2/consent`, `/oauth2/introspect` (RFC 7662), `/oauth2/revoke` (RFC 7009),
  `/oauth2/userinfo`, `/.well-known/openid-configuration`,
  `/.well-known/oauth-authorization-server`.
- **PKCE obligatoire par défaut** (OAuth 2.1) — exactement ce qu'exige la spec MCP.
- DCR RFC 7591 via `allowDynamicClientRegistration: true`
  (+ `allowUnauthenticatedClientRegistration` optionnel).
- Plugin `jwt` activé par défaut (désactivable `disableJwtPlugin: true`).
- Défauts 2.1 : `storeClientSecret: 'hashed'`, id token 10 h, refresh 30 j,
  `clientRegistrationDefaultScopes` en **tableau** (plus de string espacée).
- Scopes par défaut : `openid`, `profile`, `email`, `offline_access` ; scopes custom OK.
- Consentement : `trustedClients` avec `skipConsent: true` bypass l'écran ; sinon
  redirection vers une page de consentement configurable (`client_id`/`scope`),
  l'utilisateur appelle `oauth2.consent()` pour finaliser.

## 2. Décisions arrêtées

1. **Plugin** = `@better-auth/oauth-provider` (OAuth 2.1). Pas `oidc-provider` (déprécié),
   pas l'ancien plugin `mcp` séparé.
2. **Un seul socle, deux surfaces.** MCP HTTP et SSO tiers sont deux usages du _même_
   serveur OAuth → une seule migration de schéma, MCP débloqué d'abord, SSO public ensuite.
3. **Topologie resource-server MCP** : ~~spike~~ **TRANCHÉ (2026-06-02, recherche O2)** :
   **resource server standalone, validation JWKS _locale_** (`verifyAccessToken({ jwksUrl,
verifyOptions:{audience,issuer} })` valide hors-ligne via `jose`). Pas d'in-process cibul-node.
4. **Modèle de token ↔ modèle v3.** Un access token OAuth porte un **user** (celui qui a
   consenti) → se comporte comme une `oa_sk_` : tier = rôle du propriétaire (`userUid`
   passé à `core`), le **scope plafonne l'opération**. Double application identique à
   slice-auth §5.1/§5.2. Le vocabulaire de scopes réutilise `events:read`, `agendas:write`,
   `locations:*`, `members:*` (+ OIDC `openid`/`profile`/`email`/`offline_access`).
   **Vérif côté API v3 (in-process, B2)** : l'API EST l'AS, donc `auth.verifyOAuthAccessToken`
   (`packages/auth/src/oauthToken.js`) tire le JWKS du plugin `jwt` via `instance.api.getJwks()`
   (zéro HTTP, zéro CA privée) et vérifie le JWS hors-ligne avec `jose` (sig+`iss`+`exp`).
   `aud` **lenient** = ∈ `validAudiences` (le token est `aud=dmcp`, pas `aud=api` — cf. constat
   client B2). ⚠️ **Identité (vérifié au smoke réel)** : le `sub` du token = la PK serial de la table
   `user` better-auth (ex. `313642`), qui **n'est PAS** l'uid OA (`275144919111001`) — ils diffèrent
   pour les 313046 users. Tous les resolvers aval (`core.users.get`, le `referenceId` des clés)
   travaillent sur l'**uid OA**. → l'uid voyage dans une **claim privée `uid`** (string-encodée, BIGINT
   > 2^53) posée par `customAccessTokenClaims`, et `verifyOAuthAccessToken` lit `uid` (pas `sub`) →
   > chemin `sk`. `sub` reste la PK BA (sujet OIDC stable, flow O1 intact). ⚠️ **issuer** = `baseURL` > **+ basePath** (`/api/auth`, ajouté par BA) — résolu depuis `instance.$context.baseURL` (la chaîne
   > exacte que BA signe), pas depuis le `baseURL` brut (`config.root`).
5. **Bump BA additif d'abord, zéro trafic** (même garde-fou que slice-auth D1).

## 3. Phases (unités de déploiement, réversibles isolément)

`→` = peut suivre immédiatement ; `⏸` = nécessite une fenêtre d'observation / arbitrage.

### O0 — Socle plugin (additif, zéro trafic) `→` ✅ **FAIT (2026-06-02, branche `feat/oauth-provider`)**

- ✅ `packages/auth/package.json` : bump `better-auth` → `^1.6.13`, `@better-auth/api-key`/
  `core`/`redis-storage` → `^1.6.13`, ajout `@better-auth/oauth-provider@^1.6.13` +
  `@better-fetch/fetch@1.1.21`, `@better-auth/utils` → `^0.4.1`. `yarn install` OK.
- ✅ `packages/auth/src/index.js` : `jwt()` **puis** `oauthProvider()` dans `plugins`
  (oauthProvider résout jwt via `ctx.getPlugin('jwt')` à l'init → jwt obligatoire et
  AVANT ; le désactiver basculerait en HS256 symétrique sans JWKS, non voulu).
  **jwt en mode OAuth-provider** (per doc jwt#oauth-provider-mode) : `jwt({
disableSettingJwtHeader: true })` (pas de header `set-auth-jwt` sur les réponses session
  — rôle dévolu à `/oauth2/userinfo`) + `disabledPaths: ['/token']` au niveau `betterAuth`
  (l'endpoint `/token` du plugin jwt est remplacé par `/oauth2/token` → 404). Scopes =
  OIDC (`openid`/`profile`/`email`/`offline_access`) + vocabulaire v3 (`events:*`,
  `agendas:*`, `locations:*`, `members:*`). Mapping snake_case des 4 tables + `jwks`.
  DCR **off** (défaut, → O3) ; pas de `trustedClients`/`consentPage` (→ O1).
- ✅ **Décision actée** : `session.storeSessionInDatabase: true` + mapping table `session`.
  Imposé par `oauthProvider` (throw au boot si `secondaryStorage` sans ça —
  `@better-auth/oauth-provider/dist/index.mjs:2857`, dans le hook `init`). Redis reste
  prioritaire en lecture ; écriture DB additive. `impersonatedBy` (champ ad-hoc) reste
  Redis-only (écarté par le field-converter, qui ne persiste que les champs déclarés).
- ✅ `config/index.js` + `services/auth/index.js` : noms de tables (`session`,
  `oauth_client`, `oauth_access_token`, `oauth_refresh_token`, `oauth_consent`, `jwks`).
- ✅ Migration **knex** (pas Kysely — les fichiers de migration utilisent knex ;
  Kysely n'est que le runtime BA) `packages/auth/migrations/20260602120000_create_oauth_provider_tables.js`
  : 6 tables, snake_case, IDs `bigIncrements` (serial MySQL), pas de FK (convention
  account/apikey), arrays/json en TEXT, dates DATETIME(3). **Appliquée** sur `oadev` —
  6 tables vérifiées, colonne `public` (mot réservé) OK en `tinyint(1)`.
- ✅ **nginx : aucun changement** — `location ~ ^/api(|/.+)$` (server_params) route déjà
  tout `/api/auth/...` vers node. Le rewrite des `.well-known` à la **racine** (exigé par
  la spec MCP / RFC 8414) relève de **O2**.
- ✅ Vérifs : `yarn workspace @openagenda/auth test` **112/112** ; boot avec stub redis
  (secondaryStorage + storeSessionInDatabase) **OK**, endpoints exposés
  (`oauth2Authorize/Token/Introspect/Revoke/UserInfo`, `getJwks`, `getOpenIdConfig`,
  `registerOAuthClient`, …) ; eslint **0**.
- ⚠️ **Warning laissé apparent** (pas de `silenceWarnings`, cf. feedback) : _« ensure
  '/.well-known/oauth-authorization-server/api/auth' exists »_ — rappel que le discovery
  conforme-spec à la racine reste à câbler en O2.

### O1 — Écran de consentement + first-party `→` ✅ **FAIT (2026-06-02)**

Question #1 tranchée : **Next** (l'UI auth y vit déjà ; chemins locale-less résolus par
`proxy.ts`, comme `/auth/signin`).

- ✅ `packages/auth/src/index.js` : `oauthProvider({ loginPage: '/auth/signin',
consentPage: '/auth/consent', trustedClients: [] })`.
- ✅ `components/auth/Consent.tsx` (réutilisable, storiable — pattern Signin) : lit
  `client_id`/`scope`, récupère le nom via `GET /oauth2/public-client`, affiche les
  scopes en clair, POST `/oauth2/consent { accept, oauth_query }` puis suit le
  `redirect_uri`. La query signée est rejouée **verbatim** depuis `window.location`
  (la signature est vérifiée sur la chaîne brute — ordre d'insertion préservé).
- ✅ `app/[locale]/(app)/auth/consent/page.tsx` : route serveur, garde session (réentre
  dans `/oauth2/authorize` si la session a expiré).
- ✅ **Round-trip login** : `SigninPageClient` détecte la query OAuth signée et la rejoue
  verbatim en `redirectOnSuccess` → après login on revient à `/oauth2/authorize` → consent.
  Aucune modif de `Signin` (réutilise le prop `redirectOnSuccess` existant).
- ✅ Messages dans les 8 locales (`components/auth/locales`) + `Consent.stories.tsx`.
- ✅ Vérifs : eslint 0, `tsc` 0, tests auth 112/112, boot OK.
- ✅ **Smoke-test end-to-end (2026-06-02, runtime réel `https://d.openagenda.com`)** :
  client de test public PKCE `smoke-mcp-client` inséré dans `oauth_client`. Validé :
  authorize sans session → 302 `/auth/signin?<query signée>` ; authorize avec session →
  302 `/auth/consent?<query signée>` ; `POST /oauth2/consent {accept,oauth_query}` →
  `{redirect:true,url:…?code}` (CSRF `Origin` exigé) ; consent-skip au 2ᵉ passage ;
  `/oauth2/token` (PKCE) → access_token + id_token **EdDSA** ; `/oauth2/userinfo` Bearer →
  claims filtrés par scope ; `/jwks` = Ed25519. **Bug trouvé + corrigé** (commit
  `fix(next): follow url from the OAuth consent response`) : la réponse consent est
  `{redirect,url}`, pas `{redirect_uri}` (doc OpenAPI du plugin trompeuse).
  Le client `smoke-mcp-client` reste en base (redirect_uri `…/oauth-smoke-cb`, scopes
  `openid profile email events:read`) ; supprimable via SQL.
- ⏳ Restant : `trustedClients`/`skipConsent` se remplit quand un client first-party
  existe (→ O3).

### O2 — MCP HTTP en resource server (débloque roadmap #4) `→` ✅ **FAIT (2026-06-03)** — marche dans Claude Code

> **État 2026-06-03 (branche `feat/mcp`, non commité — attend review).** Le MCP HTTP est un
> resource server OAuth complet et **se connecte réellement depuis Claude Code** (`/mcp` →
> Authenticate → login + consent → connecté). Fait cette session, au-delà du périmètre O2 initial :
>
> - **Délégation B2** : `api-v3/lib/authenticate.js` accepte les JWT OA (`auth.verifyOAuthAccessToken`,
>   claim `uid` ≠ `sub`), `packages/mcp` relaie le token de l'appelant par requête (credential
>   per-transport : `req.auth.token` en http, `config.apiKey` en stdio). TTL court (`accessTokenExpiresIn: 600`).
> - **DCR activée** (gated) : `allowDynamicClientRegistration` + `allowUnauthenticatedClientRegistration`
>   → Claude s'auto-enregistre. (Était listé en « question ouverte O3 » — tranché ici.)
> - **`resource`/endpoint = `https://dmcp.openagenda.com/mcp`** : path `/mcp` (endpoint protocole = id de
>   ressource), `GET /` = landing, PRM suffixé `/.well-known/oauth-protected-resource/mcp`. Évite le piège
>   du slash final WHATWG.
> - **Bugs trouvés+corrigés au bring-up réel** : `offline_access` ajouté au `scopes_supported`/PRM (sinon
>   `invalid_scope` au consent DCR) ; **boucle `signin↔/home`** sur cookie périmé pendant l'OAuth (garde
>   `hasOAuthQuery` dans `auth/{signin,signup}/page.tsx`) ; `resource` slash→`/mcp`.
> - **Smoke e2e réel 15/15** (`packages/mcp/scripts/smoke-oauth.js`), tests MCP 123 verts.
> - **Reste** : surface write v3 (read-only sinon, bloquant amont) ; ~~scope par outil (read)~~ ✅ O4a read
>   posé (gate v3 par opération, 403 `insufficient_scope`) ; déploiement prod ; landing en Next (différé).
>   Cf. §O2.5/O3/O4 et les blocs ci-dessous. (Note conception : token OAuth = `sk` scopé, identité toujours
>   présente — le « downscoping de visibilité » est retiré, cf. O4a.)

> **État main (post-merge PR #87) [historique]** : le serveur MCP (`packages/mcp`) est **stdio-only**,
> zéro HTTP, zéro auth. Une clé `OA_API_KEY` unique (bearer `oa_pk_`, read-only) est
> **bakée dans le texte du programme** de la sandbox (`src/sandbox/preamble.js`), egress
> allowlisté, exécuteurs deno/node/microsandbox. Tools : `search_docs` (méta, dérivé du
> spec) + `execute` (code-mode). SDK MCP déclaré `^1.29.0` mais **résolu en 1.18.0** au root
> (à réconcilier, cf. pré-vol). Le SDK 1.18 a tout le nécessaire (StreamableHTTP + auth).

#### Recherche — spike topologie : **TRANCHÉ → resource server standalone, validation JWKS locale**

Vérifié dans le code installé (pas la doc) :

- **`verifyAccessToken(token, opts)`** (`@better-auth/core/src/oauth2/verify.ts`) fait de la
  **vérification _locale_** via `jose` : `opts.jwksUrl` (fetch + cache par `kid`) +
  `verifyOptions: { audience, issuer }` (tous deux **requis**) + `scopes?` (403 si manquant,
  enforcement inline). Fallback distant optionnel `remoteVerify` (introspection RFC 7662).
  → **Pas besoin d'embarquer le MCP in-process dans cibul-node.** Le resource server reste
  son propre process (comme aujourd'hui), valide le bearer **hors-ligne** contre le JWKS
  public `/.well-known`/`/api/auth/jwks` (EdDSA Ed25519, déjà live, prouvé au smoke O1).
  → **Annule le risque « couplage sandbox ↔ monolithe »** (§4) : aucun couplage runtime.

- **Format du token : JWS signé conditionné à l'indicateur `resource` (RFC 8707).**
  Dans `oauth-provider`, `createUserTokens` : `isJwtAccessToken = audience && !disableJwtPlugin`.
  `checkResource()` lit `ctx.body.resource` → `aud`. **Sans `resource` → token opaque**
  (impose l'introspection). Tout client MCP conforme (spec 2025-06-18) envoie `resource=<url
du serveur MCP>` à l'authorize/token → on obtient un **JWT EdDSA audience-bound**,
  vérifiable par JWKS local. C'est le chemin nominal — pas d'introspection nécessaire.

- **Config better-auth requise (sinon 400 `requested resource invalid`)** :
  `checkResource` valide `resource` contre `opts.validAudiences ?? [baseURL]`. Il faut donc,
  dans `packages/auth/src/index.js`, `oauthProvider({ validAudiences: [MCP_RESOURCE_URL], … })`.
  (Si scope `openid` demandé, l'audience `…/oauth2/userinfo` est auto-ajoutée — sans impact.)
  C'est **le seul changement côté `packages/auth`** pour O2.

- **`mcpHandler(verifyOptions, handler, opts?)`** (export `@better-auth/oauth-provider`) :
  middleware **Web Fetch** (`Request→Response`) qui valide le bearer via `verifyAccessToken`,
  répond `WWW-Authenticate` si absent/invalide, passe le `JWTPayload` décodé au handler.
  Alternative _native SDK_ (recommandée car StreamableHTTP est express/Node) :
  **`requireBearerAuth({ verifier, requiredScopes, resourceMetadataUrl })`** + un `verifier`
  maison délégant à `verifyAccessToken`. On retient le path SDK-natif (intégration express +
  `WWW-Authenticate` avec `resource_metadata` conforme PRM).

#### Tâches d'implémentation (`packages/mcp`) — ✅ FAIT (transport + bearer + credential délégation) ; reste activation + smoke (#9)

> SDK MCP résolu en **1.29.0** (le `^1.29.0` déclaré était désync dans l'arbre, `yarn install`
> a réconcilié). Choix : ne PAS coupler `packages/mcp` à `better-auth` → vérification locale
> via **`jose`** directement (exactement ce que fait `verifyAccessToken` en interne), + deps
> ajoutées `express ^4.18.2` et `jose ^6.2.3`.

1. ✅ **Transport HTTP** : `StreamableHTTPServerTransport` à côté de stdio, sélection par
   `OA_MCP_TRANSPORT=stdio|http` (défaut stdio). **Stateless** (`sessionIdGenerator: undefined`,
   server+transport recréés par requête → scalable, pas d'état). `src/index.js` branche sur le transport.
2. ✅ **Entrée HTTP** (`src/httpServer.js`, express) : `POST /` **gardé par `requireBearerAuth`**.
   `verifier` (`src/auth/verifier.js`) = `createRemoteJWKSet` + `jwtVerify(token, jwks, {issuer,
audience})` → mappe vers `AuthInfo` du SDK (`{token, clientId: azp/client_id, scopes, expiresAt:
exp, resource, extra:{sub}}`) ; échec → `InvalidTokenError` (401 + `WWW-Authenticate` avec
   `resource_metadata`). `GET`/`DELETE` → 405 (stateless).
3. ✅ **Métadonnées resource server** : `metadataHandler` du SDK sert le PRM (RFC 9728) à
   `/.well-known/oauth-protected-resource` = `{ resource, authorization_servers:[issuer],
scopes_supported, bearer_methods_supported:['header'], resource_name }`. Pas de proxy de l'AS
   metadata (les clients suivent `authorization_servers` vers l'issuer BA).
4. ✅ **Config + fail-closed** (`src/config.js`) : `OA_MCP_TRANSPORT`, `OA_MCP_HTTP_PORT` (8904),
   `OA_OAUTH_ISSUER`, `OA_OAUTH_JWKS_URL` (défaut `<issuer>/jwks`), `OA_MCP_RESOURCE_URL`,
   `OA_MCP_REQUIRED_SCOPES`. **transport=http SANS issuer/resource → refus de booter** (pas de MCP
   public non authentifié).
5. ✅ **Tests** : `test/httpServer.test.js` (JWKS Ed25519 local + tokens signés : PRM, 401 sans
   token/non-JWS/mauvaise audience/mauvais issuer/expiré, 403 scope manquant, 200 `tools/list`,
   405 GET/DELETE) + tests config transport/oauth. Suite **118/118** (4 skipped microsandbox), tsc 0, eslint 0.
6. ✅ **Câblage credential = délégation (B2), par transport** (2026-06-02) : `createServer({…, credential})`
   — http relaie `req.auth.token` (le token de l'appelant) par requête, stdio retombe sur `config.apiKey`.
   Côté API, `api-v3/authenticate.js` accepte le JWT OA (vérif in-process). Détails « Modèle credential »
   ci-dessous. Reste : (c) TTL court (`accessTokenExpiresIn`) + smoke e2e (→ #9).

#### Hébergement (tranché) : **sous-domaine dédié**

- **Dev** : `https://dmcp.openagenda.com` — son entrée `/etc/hosts`, son certificat CA-signé
  généré par `docker/devinstaller` (script générique `create_domain_certificates.sh`), son
  server block nginx. **Prod** : serveur à part (même topologie standalone).
- **`MCP_RESOURCE_URL = https://dmcp.openagenda.com/mcp`** (2026-06-03) → sert d'`aud`/`resource`.
  Le **path `/mcp` est l'endpoint protocole ET l'identifiant de ressource** (ils coïncident : l'URL
  dont le client est configuré est liée comme `aud` du token). Convention des MCP hébergés (Sentry
  `mcp.sentry.dev/mcp`, GitHub, Ref). **Pourquoi un path et pas la racine** :
  - libère `dmcp.openagenda.com/` pour une **page d'accueil humaine** (sinon `GET /` = challenge 401/JSON brut) ;
  - **supprime le piège du slash final** : `new URL('https://host')` (origine nue) est normalisé par
    WHATWG en `https://host/` (les clients envoient donc `…/`), alors qu'un path `…/mcp` est gardé tel
    quel → plus d'ambiguïté entre ce que le client envoie, le `aud` du token et `validAudiences`
    (match exact côté AS _et_ conteneur MCP via jose). _(Histoire : d'abord canonisé `…/` avec slash
    pour matcher la normalisation WHATWG, puis basculé sur `…/mcp` — plus propre.)_
  - PRM servi au chemin **suffixé** `https://dmcp.openagenda.com/.well-known/oauth-protected-resource/mcp`
    (= `getOAuthProtectedResourceMetadataUrl(new URL(MCP_RESOURCE_URL))`, RFC 9728), **sans collision Next ni rewrite.**

#### `.well-known` / nginx

- **PRM (resource server)** : servi par le process MCP lui-même (`metadataHandler`) au chemin suffixé
  `/.well-known/oauth-protected-resource/mcp` → `{ resource: 'https://dmcp.openagenda.com/mcp', authorization_servers: ['https://d.openagenda.com/api/auth'] }`.
  `POST /mcp` = endpoint protocole, `GET /` = landing humaine (`packages/mcp/src/landing.js`).
- **AS metadata (RFC 8414)**, sur l'issuer `d.openagenda.com` : BA l'expose sous
  `/api/auth/.well-known/oauth-authorization-server` ; l'emplacement spec (insertion de chemin) est
  `/.well-known/oauth-authorization-server/api/auth` (= la chaîne du **warning de boot O0**). Les
  clients MCP récents lisent `authorization_servers` du PRM puis suivent ce chemin RFC 8414. Si un
  client exige le discovery strict à la racine : **rewrite nginx** sur `d.openagenda.com` (convention
  `reference_cibul_node_nginx_route_allowlist`) ou handler exportable
  `oauthProviderAuthServerMetadata(auth)`. Non bloquant si les clients suivent le PRM.

#### Landing `GET /` depuis Next (idée — `⏸` à tester plus tard)

Aujourd'hui la landing est un **HTML statique** rendu par le conteneur `mcp` (`packages/mcp/src/landing.js`),
ce qui garde `dmcp` **autonome** (la surface se déploie seule). Idée : la servir depuis **Next** pour
réutiliser le **design system OA** (Chakra/uikit, composants, header/footer, i18n). Tranché : _page Next
dédiée_, mais **différé** — on testera. Implications à anticiper :

1. **nginx (`dmcp`)** route par chemin : `/mcp` + `/.well-known/oauth-protected-resource/mcp` → conteneur
   `mcp` (protocole + sandbox, isolé, inchangé) ; **tout le reste** (`/`, `/_next/*`, polices, images,
   hydratation) → `node` (Next). ⇒ `dmcp` **fronte l'app Next** sauf les chemins protocole — elle n'est
   plus une surface minuscule autonome. (Le sandbox, lui, reste isolé.)
2. **Route Next + host-awareness** : `dmcp/` doit résoudre vers une **landing MCP dédiée**, pas la home OA.
   `proxy.ts` est déjà host-aware → détecter `host=dmcp` et servir la route MCP ; **404 les autres chemins**
   sur `dmcp` (sinon `dmcp/<slug>` tomberait sur une page agenda).
3. **i18n** : copie de la landing en 8 locales (fr,en,de,es,it,nl,br,oc) + `extract-messages` (la version
   statique actuelle est anglais-only).
4. **Injection de l'endpoint** : la landing affiche `claude mcp add … https://…/mcp` → la valeur vient de
   la config (resourceUrl) côté Next (dev=dmcp, prod=mcp.openagenda.com).
5. **Sort de `landing.js`** : devient mort pour le déploiement hébergé. **Le garder en fallback** pour un
   déploiement **MCP standalone** (la cible « hébergée scalable » : conteneur `mcp` sans Next devant — un
   self-hoster n'aurait sinon pas de landing). C'est la tension de fond : `landing.js` existe _pour_ que
   `mcp` soit self-contained ; passer à Next **couple** la landing publique à l'app Next.
6. **CORS** : à scoper aux locations `/mcp` + well-known (inutile sur les pages Next).

Gain = design system/marque cohérents ; coût = couplage déploiement + i18n + routing. Pertinent surtout
**si la landing grossit en mini-site** (doc, exemples) ; pour une page unique, l'alternative « statique
brandée en place » suffirait. Décision : Next, à faire plus tard.

#### Câblage infra dev — ✅ FAIT (fichiers trackés ; reste l'activation `.env` + cert + smoke)

Décisions dev : image **`node:24-alpine`** (runtime pur-JS ; le bundle est buildé sur l'**hôte**,
pas dans le conteneur — rolldown natif ≠ musl). Le conteneur atteint JWKS + API v3 par le **réseau
docker interne** (`http://node:8903/api/auth/jwks`, `http://node:8902/v3`) → pas de CA privée à gérer
(le JWKS = clés publiques ; `iss`/`aud` vérifiés restent les valeurs publiques). Executor dev =
`node + OA_LOCAL_NO_SANDBOX` (pas de deno/microsandbox dans l'image — trusted local, read-only).

1. ✅ **`.env.sample`** : `DEPLOY_MCP_NGINX_PROXY`, `MCP_DOMAIN`, `MCP_SSL_CERT/KEY`,
   `MCP_OAUTH_ISSUER`, `MCP_OAUTH_JWKS_URL`, `MCP_RESOURCE_URL`, `MCP_BASE_URL` (plus de `MCP_API_KEY`
   pour l'hébergé : délégation-only, cf. « Modèle credential »).
2. ✅ **`docker/devinstaller/run.sh`** : passe `${MCP_DOMAIN}` à `command.sh` (génère le cert CA-signé).
3. ✅ **`docker-compose.yml`** : service `mcp` (node:24-alpine, `node packages/mcp/src/index.js`,
   transport=http, env interne) ; nginx monte `${MCP_SSL_CERT}:/ssl/mcp.cert.pem` + clé, link `mcp`,
   6ᵉ arg `${DEPLOY_MCP_NGINX_PROXY:-0}`. **`docker compose config` valide.**
4. ✅ **`docker/nginx/mcp.conf`** : `server_name ${MCP_DOMAIN}`, cert `/ssl/mcp.cert.pem`, upstream
   `mcp:8904` (`keepalive 2`), `location /` proxie **tout** le sous-domaine vers le conteneur (qui route
   en interne `GET /` landing, `POST /mcp` endpoint, `/.well-known/oauth-protected-resource/mcp` PRM), `proxy_buffering off`,
   `proxy_read_timeout 1h`, CORS. Garde de suppression dans `nginx/command.sh` si
   `DEPLOY_MCP_NGINX_PROXY < 1` (défaut OFF → opt-in). ⚠️ **Bug trouvé+corrigé au smoke** : les
   en-têtes WebSocket-upgrade (`Connection $connection_upgrade`/`Upgrade $http_upgrade`) sont
   inappropriés (MCP Streamable HTTP = POST + réponse SSE, jamais d'upgrade) et empoisonnaient le pool
   `keepalive` (empty Upgrade → `Connection: close` envoyé à l'upstream → une requête réutilisée sur
   deux → **400** alterné). → `proxy_set_header Connection ""` (recette canonique upstream keepalive).
5. ✅ **`docker/README.md`** : `/etc/hosts` documente `dmcp.openagenda.com` (+ `dapi`).
6. ✅ **Activation + smoke e2e RÉEL FAIT (2026-06-02, runtime `https://d`/`dmcp`/`dapi.openagenda.com`)** :
   colonne `impersonated_by` ajoutée à la volée en dev (la migration 0602 l'avait sautée via son garde
   `hasTable`, n'ayant tourné qu'en dev — frais/prod corrects) ; `node` relancé sain (login OK) ; nginx
   recréé. Flow OAuth complet via le `smoke-mcp-client` (sign-in → authorize → consent → token PKCE) →
   **access token JWS** (`aud=dmcp`, claim `uid`, TTL 600s). **15/15 verts** : v3 accepte le token
   (404 = auth OK, pas 401) ; `tools/list` + `execute` via `https://dmcp.openagenda.com` ; `execute`
   relaie le token jusqu'à v3 **depuis la sandbox** (404, pas 401) = délégation B2 bout-en-bout prouvée.
   **2 bugs trouvés+corrigés au smoke** (voir « Modèle credential ») : (i) `sub` BA ≠ uid OA → claim
   `uid` ; (ii) issuer = baseURL **+ basePath** → résolu via le contexte BA. User de smoke
   `mcp-smoke@example.com` (`is_activated=1`) + le client `smoke-mcp-client` restent en base (fixtures,
   supprimables en SQL). **Rejouable** : `packages/mcp/scripts/smoke-oauth.js` (= `yarn workspace
@openagenda/mcp smoke:oauth`) — flow OAuth+PKCE complet via le client pré-enregistré (PAS de DCR,
   off jusqu'à O3), tout paramétrable par env, défauts dev. Prérequis : stack up + `NODE_EXTRA_CA_CERTS`
   = la CA dev (les domaines servent une CA privée).

#### Modèle credential — **délégation (le MCP agit AU NOM de l'utilisateur)** — REPRIS 2026-06-02

> **Correction d'une erreur de cadrage.** OAuth ici n'est PAS un simple portail d'accès au MCP
> avec une clé de lecture partagée derrière (ça ne verrait que du public → OAuth inutile). Le but
> est la **délégation** : le MCP lit/écrit les données de l'utilisateur avec SES droits. L'identité
> de l'appelant doit donc atteindre l'API. Idée « clé partagée » **abandonnée**.

**Constat client (vérifié dans le SDK, `client/auth.js` + `shared/auth-utils.js`)** : le client MCP de
référence (celui sur lequel Claude est bâti) **force l'audience du token = l'origine du serveur MCP**.
`selectResourceURL` → `checkResourceAllowed` exige `requested.origin === configured.origin` (same-origin
strict) entre l'URL connectée et la `resource` de la PRM, sinon il **throw**. Donc :

- Le token sera **toujours `aud=https://dmcp.openagenda.com`** (≠ l'API). Ça **valide** `validAudiences`
  - le verifier `audience=dmcp` déjà construits.
- L'idée « émettre un token `aud=API` et le relayer » (single-audience B1) est **impossible** avec le
  client standard (origines différentes → rejet). Il ne reste que deux voies pour le saut MCP→API.

**Décision : O2 = B2 (passthrough intra-domaine, le moins cher) ; le token-exchange = O2.5 (le « top »).**

- **B2 (O2)** : le token reste `aud=dmcp` ; l'**API v3 accepte les JWT émis par son propre AS**
  (vérifie `iss`+signature+`exp`+`scope`, `sub`→user) **sans exiger `aud=api`**. Le MCP **relaie le
  token entrant** (`req.auth.token`) dans la preamble — là où la clé était bakée. Mitigations cheap :
  **TTL court** sur l'access token + egress verrouillé sur le seul host API. Concession assumée :
  passthrough borné au first-party (même org, même issuer) + le token consenti complet vit dans la
  sandbox ≤ TTL. La branche JWT côté API réutilise le chemin user des clés `sk` (§2.4).
- **O2.5 (option « top », forward-compatible)** : **token-exchange RFC 8693** — le MCP échange le
  `aud=dmcp` contre un `aud=api` court & downscopé par exécution, + **injection du credential à
  l'egress** (le code non fiable ne voit jamais le token). Coût : ajouter le grant token-exchange à
  `@better-auth/oauth-provider` (absent : `GrantType = authorization_code|client_credentials|refresh_token`)
  - un proxy egress. **N'upgrade que le saut MCP→API** : la branche JWT de l'API (faite en O2) ne bouge pas.

**Credential PAR TRANSPORT (acté 2026-06-02).** La clé API et l'OAuth ne sont pas concurrents : le
principal diffère. → un credential par transport, résolu par requête dans `createServer`.

- **stdio = self-hosting** : un seul utilisateur lance le MCP sur sa machine ; sa **propre** clé
  `oa_pk_…` (`OA_API_KEY`) est le credential idiomatique (cf. tout MCP local). Pas de dance OAuth
  navigateur pour un process mono-utilisateur sans frontière de confiance. **`OA_API_KEY` reste.**
- **http = hébergé multi-tenant** (dmcp/prod) : le serveur agit _au nom de_ N utilisateurs. Une clé
  **partagée** y serait fausse (fusionne toutes les identités). Chaque requête relaie **le token OAuth
  de l'appelant** (`req.auth.token`) → `createServer({credential})` → preamble. **Pas de clé partagée.**
- Conséquence infra : `MCP_API_KEY` **retiré du service `mcp` hébergé** (compose + `.env.sample`), pas
  du produit — il reste le credential du self-hosting stdio.

**Travail O2** : (a) ✅ `api-v3/lib/authenticate.js` → branche JWT OA (commune aux deux voies,
donc jamais jetée — vérif via `auth.verifyOAuthAccessToken`, voir §2.4) ; (b) ✅ `packages/mcp` →
credential per-transport (`req.auth.token` en http, `config.apiKey` en stdio) ; (c) ✅ TTL court
(`accessTokenExpiresIn: 600`) ; (d) ✅ `MCP_API_KEY` retiré de l'infra hébergée ; (e) ✅ smoke e2e réel
(15/15) + connexion Claude Code. **O2 terminé** (cf. bloc « État 2026-06-03 » en tête de section).

> **Idée à explorer plus tard — OAuth aussi en stdio.** Certains clients MCP savent faire l'OAuth en
> stdio (DCR + flow navigateur), ce qui éviterait à un self-hoster de coller une clé en clair dans sa
> config. Non nécessaire pour O2 (la clé reste le défaut pragmatique du self-hosting, zéro frontière
> de confiance), mais la porte reste ouverte : stdio pourrait accepter _optionnellement_ un bearer en
> plus de `OA_API_KEY`. À évaluer quand un besoin réel émerge (rotation, moindre-privilège local).

#### Pré-vol / questions ouvertes O2 — ✅ résolues

- ✅ **SDK MCP** : résolu en **1.29.0** (`yarn install` a réconcilié) ; helpers présents et utilisés
  (`requireBearerAuth`, `metadataHandler`, `getOAuthProtectedResourceMetadataUrl`, `StreamableHTTPServerTransport`).
- ✅ **`validAudiences`** émises côté `packages/auth` : incluent `https://dmcp.openagenda.com/mcp` (dev), via
  `exchangeClients.mcp.subjectResource` (cibul `config.mcpResourceUrl`). Le **verifier v3** (`oauthToken.js`),
  lui, ne fait PLUS confiance à cette audience — il est borné à `apiAudiences = [apiResourceUrl]` (aud=api
  seul) depuis O2.5a (cf. ci-dessous, décodage des rôles).
- ✅ **Mode session StreamableHTTP** : **stateless** (`sessionIdGenerator: undefined`) retenu — un
  serveur+transport par POST, scale horizontal. Confirmé au smoke + en réel.
- ⏳ Reste **read-only** tant que la surface write v3 n'existe pas (**vrai bloquant amont**).
  Les write-tools + l'enforcement de scope **par outil** suivront la surface v3.

### O2.5 — Token-exchange + injection egress (durcissement délégation)

Le « top » sur le saut MCP→API, **forward-compatible** (n'upgrade que ce saut, l'API ne bouge pas).
Deux briques séparables — **(a) faite, (b) différée**.

#### O2.5a — Token-exchange RFC 8693 + remontée du TTL global `→` ✅ **FAIT (2026-06-03, non commité — attend review)**

- **Endpoint `/oauth2/token-exchange`** ajouté nous-mêmes (`packages/auth/src/tokenExchangePlugin.js`) — le
  grant token-exchange est **absent** de `@better-auth/oauth-provider@1.6.13` (switch en dur
  `authorization_code|client_credentials|refresh_token`). Le MCP échange son `aud=mcp` contre un token
  **court (`exchangeTokenTtl`, 120s), `aud=api`, downscopé** (scopes = sujet ∩ demandé ∩ politique client,
  jamais élargi), signé via `signJWT` avec **la même clé JWKS** que vérifie v3.
- **Auth = client confidentiel par service** (`client_secret_basic`, pas de secret partagé global). Un
  **registre first-party** (`client_id` → `{ secret, subjectResource, allowedScopes?, allowedResources?,
tokenTtl? }`) construit **en dur** dans cibul-node — services internes, **pas configurables à la volée** :
  ajouter un service = une entrée code + son secret env. Aujourd'hui : seulement `mcp`
  (`OA_MCP_EXCHANGE_SECRET`). Secret par service = rotation/révocation indépendantes ; séparé du
  `oauth_client`/DCR public. Comparaison constant-time. `tokenTtl` per-entry surcharge le TTL global.
- **API `auth` nommée par RÔLE, pas par produit** (refactor 2026-06-03). La factory `Auth()` n'expose plus
  `mcpResourceUrl`/`v3ResourceUrl` : elle prend `apiResourceUrl` (la ressource API protégée **in-process** —
  cible du mint + audience du vérifieur) et `exchangeClients` (le registre). La ressource MCP n'est plus une
  option top-level : elle vit dans le registre comme le `subjectResource` du client `mcp`. `subjectResource`
  = l'audience des tokens qu'un gateway présente, et **la seule** qu'il peut échanger (le gateway A ne peut
  pas swapper les tokens du gateway B — check `subject.audiences.includes(client.subjectResource)`). Les
  `validAudiences` émises se **dérivent** du registre (`[baseURL, ...subjectResources]`). cibul-node reste la
  couche qui connaît « mcp »/« v3 » et les mappe sur ces rôles. → 2ᵉ gateway = une entrée de registre, zéro
  changement de signature.
- **Modèle UNIQUE de délégation, B2 supprimé.** L'échange est la seule voie MCP→v3 (pas de passthrough).
  Le token consenti `aud=mcp` n'**entre jamais** dans une sandbox ; seul le `aud=api` court y est baké.
  **Fail-closed** : le transport http **refuse de booter** sans `OA_MCP_EXCHANGE_SECRET` (sinon v3, resserré
  à `aud=api`, rejetterait tout — échec garanti).
- **Échange PARESSEUX, au point d'usage** (`packages/mcp/src/server.js` `getCredential` + `httpServer.js`) :
  le swap ne se déclenche **que quand le tool `execute` tourne**, pas sur les POST métadonnées
  (`initialize`/`tools/list`/`search_docs`) — ceux-ci n'ont aucun aller-retour AS et restent debout même AS
  indisponible. Résolu **une fois par serveur** (par-requête, stateless) et mémoïsé. Échec d'échange → le
  tool `execute` renvoie une **erreur générique** (`isError`, sans détail upstream — loggué en `stderr`), la
  transport reste 200, le sandbox **ne tourne pas** (jamais de token non-échangé baké). `getCredential`
  rejette aussi si le bearer manque (invariant garanti par le middleware bearer, rendu explicite).
- **v3 resserré à `aud=api` seul** : `apiAudiences = [apiResourceUrl]` — un token `aud=mcp`
  (ancien B2) **ou** `aud=baseURL` (SSO/OIDC) n'est **plus** honoré comme credential v3. Vide si pas de
  `apiResourceUrl` (pas de délégation OAuth→v3 ; les clés API marchent toujours) — **jamais** de retour à
  honorer `aud=mcp`.
- **TTL global access-token remonté `600 → 3600`** : le clamp à 600s était une mitigation B2 (le token
  consenti vivait dans la sandbox) ; il ne sert plus → 1h standard pour SSO/OIDC/API. Le token _court_
  est désormais le `aud=api` échangé.
- **`aud=api` = l'URL de base de l'API v3** — **dérivée d'`API_ROOT` + `/v3`** dans cibul-node
  (`https://dapi.openagenda.com/v3` dev, `https://api.openagenda.com/v3` prod), donc zéro drift. Override
  `OA_V3_RESOURCE_URL` si besoin. L'audience EST la ressource que le SDK appelle, pas d'abstraction.
- **Durcissements (code-review 2026-06-03)** :
  - **Blocker infra** : le conteneur mcp force `OA_OAUTH_EXCHANGE_URL` vers l'**interne** `node:8903`
    (comme JWKS) — le défaut `<issuer>/…` pointe sur le host public injoignable depuis le conteneur ; c'est
    le 1ᵉʳ appel réseau réel à l'issuer (sinon `OA_OAUTH_ISSUER` n'est qu'une string pour le check `iss`).
  - **Auth client** : lookup `Object.hasOwn` (anti prototype-pollution sur `client_id`), secrets vides
    rejetés, `secretMatches` délègue à `constantTimeEqual` (`better-auth/crypto`, pas de fuite de longueur),
    `parseBasicAuth` `decodeURIComponent` (RFC 6749 §2.3.1).
  - **Fail-fast au boot** : `subjectResource` obligatoire par client (sinon throw — pas de glissement vers
    l'union), `ttl`/`tokenTtl` validés (`MIN_TTL=30`, entier > 0), `Auth()` throw si `exchangeClients` sans
    `apiResourceUrl` (plus de « broken-but-healthy »).
  - **Robustesse** : `subject_token_type` validé (RFC 8693 §2.1), `resource` envoyé conditionnellement,
    `iss` dérivé comme le provider (`jwt.issuer ?? baseURL`), `clockTolerance: 5s` sur les deux vérifieurs,
    `AbortSignal.timeout(8s)` sur le fetch d'échange (plus de blocage multi-minutes si l'AS pend).
- Tests : auth `14_tokenExchange` (gating + gardes secret/grant/resource + throws subjectResource/apiResourceUrl)
  - `13_oauthToken` (aud=api, rejet aud=mcp) ; mcp `config` (fail-closed sans secret) + `tokenExchange`
    (client, Basic) + `httpServer` (baké = token échangé ; échec d'échange → `execute` `isError`, sandbox non
    exécuté ; `tools/list` sans échange). **tsc 0**, eslint 0. **Smoke live 21/21** (2026-06-03, stack réelle) :
    flux OAuth complet, exchange aud=mcp→aud=api (iss/uid/TTL 120s), v3 rejette aud=mcp (401) et accepte
    l'échangé, MCP `tools/list` + `execute` end-to-end. Infra : `OA_MCP_EXCHANGE_SECRET` (une var, partagée
    node+mcp), v3 resource dérivé d'`API_ROOT` (compose + `.env.sample`).

#### O2.5b — Injection du credential à l'egress `⏸` (différé)

La brique dure : un **proxy injecteur** entre la sandbox et l'API (le code non fiable ne voit **jamais**
le token, même le `aud=api` court). Crux : la reachability du proxy depuis l'intérieur des µVM
microsandbox (isolation réseau) + l'allowlist egress pointée sur le proxy. Déclencheur : besoin de
moindre-privilège total / ressource tierce. Tant que ce n'est pas fait, O2.5a (token court downscopé
baké) tient.

### O3 — SSO public « Sign in with OpenAgenda » `→`

- ✅ **DCR activée** (gated) cette session pour débloquer Claude Code : `allowDynamicClientRegistration`
  - `allowUnauthenticatedClientRegistration`, rate-limit `/oauth2/register` (défaut plugin 5/min). Garde-fous
    vs registration ouverte : **consentement obligatoire** (jamais skip pour clients DCR), TTL court.
- **Durcissement DCR public** (registration **non authentifiée**) — leviers vérifiés dans
  `@better-auth/oauth-provider` (`clientRegistrationAllowedScopes`/`…DefaultScopes`, `softwareStatement`,
  `requirePKCE`, validation `redirect_uris`) ; pas de hook `onClientRegister` ⇒ l'anti-usurpation passe par
  NOTRE UI. Découpé en « faisable maintenant » (indépendant du write) et « avec O4a » :
  - ✅ **FAIT (2026-06-03, `feat(next): warn on unverified OAuth apps…`)** — anti-usurpation au consentement
    (LE vrai rempart du DCR ouvert) : n'importe qui peut enregistrer un client avec `client_name`/`logo_uri`
    arbitraires (« OpenAgenda Officiel » + logo). L'écran de consentement (`Consent.tsx`) affiche désormais un
    **bandeau « OpenAgenda n'a pas vérifié cette application »**, montre en clair le **host du `redirect_uri`**
    (chip orange — le signal non-usurpable : un phisher contrôle le nom, pas la destination du code), et ne
    rend **jamais** le `logo_uri`/`client_uri` auto-déclaré (sinon = badge de confiance offert au phisher).
    - **Toujours afficher le bandeau** (pas de distinction `trustedClient`) : `public-client` n'expose aucun
      flag de confiance, et de toute façon **tout client atteignant l'écran est non-trusted** (les trusted
      skippent le consentement, et le DCR interdit `skip_consent` — vérifié l. 3586/3946 du plugin). La
      suppression sélective du bandeau pour de futures « apps vérifiées » est notée en commentaire ; aucune
      n'existe → always-warn est le défaut correct. `redirect_uri` est lu des searchParams (déjà validé par
      `/oauth2/authorize`), pas de `public-client` → **zéro changement serveur**.
    - Le message de redirection est **factuel nu** (« vous serez redirigé vers `<host>`. ») : l'injonction
      « assurez-vous de reconnaître cette adresse » a été retirée — inutile pour un loopback Claude Code
      (`localhost:<port>`, que personne ne « reconnaît ») et redondante avec le bandeau.
    - Refonte visuelle dans la même passe (avatar d'identité neutre + badge ⚠, lignes de permission iconées
      avec reveal staggered reduced-motion-aware, lift de la carte auth partagée). i18n fr/en/de/es/it/nl/br/oc.
  - ✅ **vérifié + verrouillé par test (2026-06-03)** — credentials de flux stricts. Constat : **déjà l'état
    par défaut** du plugin, aucune config à ajouter (le « move senior » = vérifier puis épingler, pas empiler
    de la config redondante). Vérifié dans `@better-auth/oauth-provider` dist :
    - **PKCE obligatoire pour tous** : `isPKCERequired` → `requirePKCE ?? true` (+ forcé public/native/
      user-agent et toute demande `offline_access`) ; un client DCR **ne peut pas s'en exempter** (le body
      `/oauth2/register` n'a aucun champ `require_pkce`, et `skip_consent` est `z.never`). **S256 only** —
      `plain` rejeté au schéma zod de `/oauth2/authorize` (`code_challenge_method: z.enum(["S256"])`).
    - **`redirect_uris`** via `SafeUrlSchema` : https-only **sauf loopback** (`127.0.0.0/8`, `[::1]`,
      `*.localhost` RFC 6761), schémas dangereux (`javascript:`/`data:`/`vbscript:`) rejetés ; validé à
      register **et** update ; au `/authorize`, **exact-match** (loopback = match host+path+protocol+query en
      ignorant le port, RFC 8252 §7.3). http non-loopback → rejeté.
    - **Décision actée — schémas custom (`myapp://`) gardés** : `SafeUrlSchema` les autorise (RFC 8252 apps
      natives) ; PKCE obligatoire **est** la mitigation IETF de l'interception de redirect natif (BCP 212), donc
      on ne rejette pas les clients mobiles. Les clients MCP utilisent le loopback de toute façon.
    - Posture épinglée par `packages/auth/test/15_dcrFlowHardening.test.js` (matrice `SafeUrlSchema` + rejets
      register/authorize au boundary zod, DB-free) → un bump du plugin ou un changement de config ne peut plus
      la relâcher en silence.
  - ✅ **décidé — cap de scope à l'enregistrement** : `clientRegistrationAllowedScopes` +
    `clientRegistrationDefaultScopes` = sous-ensemble minimal — _départ proposé_ `openid` / `profile` /
    `events:read`. Un client auto-enregistré **ne peut pas demander** un scope write/sensible : coupé à la
    registration (l. 1304 du plugin), pas seulement au consentement ; write/sensible ⇒ client **revu**
    (`trustedClients` ou upgrade hors-bande). Posable **dès maintenant** (defense-in-depth + borne ce que le
    consentement propose) ; l'enforcement v3 **`O4a` (read) est posé (2026-06-03)**, donc le cap mord déjà
    côté read (`events:read`/`agendas:read` gatés par opération) et s'étendra au write avec la surface write.
  - ✅ **FAIT (2026-06-03) — GC** (élargi au-delà du DCR). Ni better-auth ni l'oauth-provider ne purgent
    leurs lignes (pas de scheduler ; nettoyage de session paresseux-à-la-lecture au mieux). `auth.gcExpired()`
    (`packages/auth/src/gcExpired.js`, pur sur l'**adapter** better-auth — pas de SQL brut, le package qui
    possède le schéma possède la suppression) purge : **sessions expirées** (le gros volume), **lignes `verification` expirées**
    (tokens email-verify / reset), **tokens OAuth access/refresh expirés** (`expiresAt < now` exclut gratis
    les `NULL` non-expirants), **clients DCR créés
    avant le cutoff sans aucune ligne `oauthConsent`** (jamais approuvés ; `trustedClients` exclus car
    skip-consent = pas de consent). N=30 j. Planifié par cibul-node en **job bullmq répétable** (quotidien
    03:17, schedule en Redis, worker sur le process worker uniquement), visible dans **bull-board** (« Maintenance
    OAuth ») avec `job.log` par run. Test unitaire `packages/auth/test/16_gcExpired.test.js` (adapter mocké).
    _Reste ⏳ optionnel : quota global/IP au-delà du rate-limit 5/min, si besoin._
  - ✅ **FAIT (2026-06-03)** — audit logging des registrations. Le plugin n'a aucun hook de registration ;
    on observe la réponse dans le `hooks.after` existant de `packages/auth` (branche `ctx.path ===
'/oauth2/register'`, `ctx.context.returned` = client émis sur succès, APIError sans `client_id` sinon →
    les échecs ne polluent pas le journal). Émission via une **callback `onClientRegistered`** (même pattern
    que `onSignInSuccess`/`onAfterOAuthSignUp`), descriptor **assaini (jamais le `client_secret`)** :
    `clientId`, `clientName`, `redirectUris`, `tokenEndpointAuthMethod`, `grantTypes`, `softwareId/Version`,
    `clientUri`, **`registeredBy`** (uid ou `null` = DCR anonyme), `ip` (1er hop XFF), `userAgent`. cibul-node
    fait `log('info', 'oauth.client.registered', entry)` — un nom d'événement unique pour dashboard/alertes
    en aval (côté infra). Isolation : échec de la callback swallowé + `logger.error`, ne casse jamais la
    registration. Garde DB-free testée (`15_dcrFlowHardening` : pas d'événement sur registration rejetée) ;
    succès couvert par `smoke-oauth.js` (DCR = étape 1).
  - ⏸ **proposé — futur « apps vérifiées »** via `software_statement` (RFC 7591 §2.3) : un émetteur connu
    enregistre avec un cap de scope **élevé**, le DCR anonyme reste au minimal. Overkill tant qu'il n'y a pas
    de besoin d'annuaire d'apps vérifiées.
  - **Déjà mitigé** (ne pas refaire) : consentement jamais sauté + `client_id` distinct par app ⇒ **pas** de
    confused-deputy « client statique + consent skippé » ; `aud` découplé (bullet suivant) ⇒ un token de
    client DCR ne double pas comme credential v3.
  - **Séquencement** : ~~anti-usurpation~~ ✅, ~~PKCE/redirect strict~~ ✅, ~~audit logging~~ ✅, ~~GC~~ ✅,
    ~~enforcement O4a (read)~~ ✅. Reste : **appliquer** le cap de scope au register
    (`clientRegistrationAllowedScopes`, déjà décidé) — l'enforcement read d'O4a est en place donc le cap
    mordra dès qu'il est posé ; quota global/IP optionnel.
- ✅ **`aud` durci au point d'entrée v3** (relevé en code-review, fait 2026-06-03) : les deux listes
  d'audiences sont **découplées** dans `index.js` — l'oauth-provider garde `[baseURL, ...subjectResources]`
  (un client peut lier `resource` à l'origine AS pour OIDC/SSO, ou à la ressource d'un gateway), mais le
  verifier v3 (`createOAuthTokenHelpers`) ne reçoit qu'un sous-ensemble. Un token lié à `baseURL` (login
  SSO/OIDC) n'est donc **jamais** honoré comme credential v3. ✅ **Resserré encore en O2.5a** :
  `apiAudiences = [apiResourceUrl]` (aud=api seul) — même un token `aud=mcp` ne passe plus, le MCP doit
  token-exchanger d'abord.
- ⏳ **UI dashboard** de gestion des apps tierces (client_id/secret affiché **une seule fois**,
  redirect_uris, scopes) — réutilise le pattern « montré une fois » de slice-auth D3c.
- ⏳ Doc développeurs tiers ; introspection (RFC 7662) / révocation (RFC 7009) déjà fournies.

### O4 — Scopes réels & cycle de vie `🔄` (O4a read `✅`)

La clé de voûte récurrente du plan (le `⏳` « enforcement par outil ») + le positionnement vs clés API,
en deux fils séparables. **O4a est le chemin critique** (il débloque le write-tooling et le cap DCR
d'O3) ; **O4b** est du cheap-win adjacent. **O4a read est posé (2026-06-03)** ; reste la moitié write
(drop-in, dépend de la surface write v3). Décision de conception actée : un token OAuth = clé `sk` scopée,
**identité toujours présente** (requise pour l'attribution write) — le « downscoping de visibilité » est
retiré (cf. O4a ci-dessous).

#### O4a — Enforcement de scope de bout en bout (read `✅`, write drop-in `⏸`)

Le vocabulaire de scopes (`events:read`, `events:write`, …) était **porté mais pas appliqué** :
`authenticate.js` expose `req.oauth = { scopes, clientId }`, mais aucune opération v3 n'exigeait un scope.
Tant que ce n'était pas le cas, un token OAuth n'était pas réellement « moins-privilège » qu'un `oa_sk_`, le
cap de scope DCR (O3) restait inopérant, et on ne pouvait pas exposer de write-tool en confiance.

**Fait (côté read) — commit `feat(cibul-node): …`** :

- **Gate par opération dans v3** : `api-v3/lib/requireScope.js` (middleware par route). Posé en clair sur
  chaque `app.get` (`requireScope('agendas:read')` / `requireScope('events:read')`), miroir du
  `security.oauth2` que le contrat déclarait déjà par opération (`packages/api-spec/openapi.yaml`).
- **Ne contraint qu'un credential porteur de scopes** : seam `grantedScopesOf(req)` →
  - token OAuth : `req.oauth.scopes` (`[]` = **fail-closed** — le consentement n'a rien accordé) ;
  - clé API : `req.apiKey.permissions` **branché** — le champ `permissions` du plugin api-key
    (`Record<resource, actions[]>`, déjà remonté par `verifyKey`) est aplati vers le vocabulaire de scopes
    plat via `scopesFromPermissions` (`{ events: ['read'] }` → `events:read`). **Grandfather** : une clé
    `permissions = null` (toutes les clés existantes, pas encore d'UI pour les poser) → `null` → passe-droit
    = tous scopes, donc activer les scopes par clé **ne casse aucune clé existante** ; seule une clé à
    `permissions` explicites est contrainte (map vide `{}` = aucun scope) ;
  - agenda-key / session : pas de descripteur → `null` → passe-droit.
    Couvert par `90_unit_apiV3_requireScope.test.js` (OAuth + clé grandfathered + clé à permissions + `{}`).
    _Reste UI : l'écran de création de clé qui peuple `permissions` (lot slice-auth) — le gate est déjà prêt._
- **403 `insufficient_scope`** : `error.code` distinct (override `info.code` dans `errorHandler.js`) +
  header `WWW-Authenticate: Bearer error="insufficient_scope", scope="…"` (RFC 6750 §3.1). Contrat mis à
  jour (réponse `Forbidden` + exemples de `code`).
- **Tests** : `90_unit_apiV3_requireScope.test.js` (6 cas) ; suites `90_unit_apiV3` vertes ; spec `validate`
  ✓. Mapping tool MCP : `search_docs`/`execute` (read) parlent à v3 avec le token `events:read`.

**Reste** :

- **Write = drop-in** : pas encore de write en v3. Quand il arrive → exigence `events:write` sur les
  nouvelles routes (même middleware) + exposition des write-tools côté MCP. Le mécanisme ne bouge pas.
  _Dépendance_ : surface write v3 (bloquant amont, hors de ce plan) — pour la moitié write uniquement.
- **Modèle d'identité vs visibilité — décision de conception actée (2026-06-03)** : un token OAuth est une
  **identité utilisateur déléguée** = équivaut à une clé **`sk` scopée**. **`req.user` est TOUJOURS posé** ;
  les scopes ne gèrent **que les opérations** (read/write, type de ressource — O4a), **jamais l'identité**.
  - _Pourquoi_ : identité et visibilité sont **orthogonales**. L'identité (`req.user.uid`) est requise pour
    l'attribution en write — les futurs points write v3 créent des **activités/notifications au nom de
    l'utilisateur**, plus l'ownership/modération. Retirer `req.user` (idée initiale « traiter comme `pk`,
    public-only ») **casserait** cette attribution. Donc on ne le retire jamais.
  - _Conséquence_ : la visibilité propriétaire en lecture est le comportement **attendu** d'un token délégué
    (le consentement annonce « lire/gérer _tes_ events » ; qui ne veut pas, n'accorde pas le grant). L'ancien
    « downscoping de visibilité / public-only via `pk` » est **retiré de la feuille de route** — pas un
    prérequis sécurité, et conceptuellement faux pour le write.
  - _Write = drop-in_ : un write-tool passera `req.user.uid` à `core` exactement comme une clé `sk` (même
    chemin d'attribution), gaté par `events:write`. L'identité est déjà là, rien à reposer.
  - _Si un jour_ un palier « app en lecture **publique seulement** » est voulu : **scope dédié**
    (`events:read` public vs `events:read:private`) + un **plafond d'accès** dans le chemin read
    (`access = minTier(résolu, plafondScope)`), appliqué sur la **projection** en gardant `userUid` intact —
    **jamais** en droppant l'identité. Aligné scopes ↔ tiers `plan-slice-auth-v3.md` §5.1. À faire seulement
    si le besoin « app tierce non-confiance » apparaît, pas avant.
- **Bord MCP (ops, pas de code)** : `OA_MCP_REQUIRED_SCOPES` reste `[]` par défaut (v3 est le gate, fail-safe).
  Reco env prod : `OA_MCP_REQUIRED_SCOPES=events:read agendas:read` pour rejeter un token sans scope plus tôt
  avec un 403 propre au bord.

#### O4b — Cycle de vie & positionnement `⏸`

- **`offline_access` → refresh tokens** (ce que les clés API n'offrent pas) + **alignement des lifetimes**
  sur la politique de session OA (question ouverte #3, encore `⏳` : l'access token est remonté à 3600s en
  O2.5a, mais refresh/id token sont aux défauts 2.1).
- **« Mes apps connectées »** : UX de révocation d'un grant par l'utilisateur (introspection/révocation
  RFC 7662/7009 déjà fournies côté protocole) + **audit logging des grants & échanges** (relevé en revue
  sécurité ; naturel post-lancement).
- Positionner OAuth comme **alternative standard à `oa_sk_`** pour les intégrateurs (doc développeurs).
- **Pas** de suppression de `requestAccessToken` ici (lié à l'EOL v2, hors scope).

#### Hors O4 (tracks séparés, non bloquants)

- **O2.5b** (injection du credential à l'egress) — lot dur indépendant, déclenché par un besoin de
  moindre-privilège total / ressource tierce.
- **O3** (dashboard apps tierces, doc dev, durcissement DCR public) — gros lot UI, différable ; mais son
  cap de scope **dépend d'O4a**, donc O4a passe avant.

### O5 — Mise en production & exploitation `⏸`

Le code est validé sur la stack dev (CA privée, `dmcp`/`dapi`), mais aucune phase ne couvre le passage en
prod ni l'exploitation des signaux qu'on vient d'ajouter. À cadrer comme un lot dédié :

- **Config prod / secrets** : `MCP_EXCHANGE_SECRET` (partagé service auth ↔ conteneur MCP), `V3_RESOURCE_URL`
  / `mcpResourceUrl` aux valeurs prod (`api.openagenda.com/v3`, `mcp.openagenda.com/mcp`), `OA_OAUTH_EXCHANGE_URL`
  interne. **Le secret ne doit jamais être commité** (`.env` gitignored).
- **DNS / infra prod** : équivalents prod des hôtes `dmcp`/`dapi` câblés en dev (compose + nginx) ; posture
  rate-limit `/oauth2/register` à confirmer pour le public.
- **Observabilité** : brancher les événements déjà émis — `oauth.client.registered` (audit DCR),
  `oauth.gc.completed`/`oauth.gc.failed` — sur dashboard + alertes (côté infra). bull-board expose déjà la
  queue « Maintenance OAuth ».
- **Smoke prod** : rejouer `smoke-oauth.js` contre l'AS prod ; round-trip `/mcp` réel depuis un client.
- **Rollout DCR public** : ouverture progressive / annonce aux intégrateurs tiers (dépend de l'anti-usurpation
  ✅ et du cap de scope O4a).

## 4. Risques / points d'attention

- **Bump BA 1.6.11 → 1.6.13** : régression possible sur apiKey/magic-link/customSession/
  impersonation. La suite de tests auth est le filet (à lancer avant commit).
- ~~**Couplage sandbox ↔ monolithe** (O2)~~ : **levé** — le resource server valide le bearer
  hors-ligne (JWKS local), reste son propre process, zéro couplage runtime avec cibul-node.
- **JWKS** : rotation + cache. `verifyAccessToken` cache le JWKS par `kid` et le re-fetch au
  changement de `kid` → la rotation Ed25519 est gérée tant que le serveur MCP atteint `/jwks`.
- **Scope creep SSO** : O3 (UI tierce, DCR ouvert) est le plus gros lot — différable sans
  bloquer MCP.
- **Schéma MySQL** : valider que le schéma du plugin (souvent décrit pour Postgres dans la
  doc) génère proprement en MySQL avec IDs `serial` (comme `apikey` l'a fait).

## 5. Questions ouvertes (non bloquantes pour O0)

1. ✅ **Écran de consentement** : **route Next** (`packages/next/.../auth/consent`, composant
   `components/auth/Consent.tsx`) — aligné sur le reste de l'auth UI migrée vers Next.
2. ✅ **DCR** : **ouvert** (`allowUnauthenticatedClientRegistration`) — requis par les clients MCP qui
   s'enregistrent avant login. Garde-fous : consentement obligatoire + rate-limit. Posture à durcir pour
   le public (cf. O3).
3. ⏳ **Lifetimes** : access token **revenu à 3600 s en O2.5a** (le 600 s était une mitigation B2, devenue
   inutile depuis que le MCP token-exchange au lieu de relayer le grant consenti dans le sandbox). Refresh/id
   token : défauts 2.1 (refresh 30 j via `offline_access`, id token 10 h) — aligner sur la politique de
   session OA reste ouvert (cf. O4b).
4. ⏳ **Boucle `signin↔/home` hors-OAuth** (cookie périmé sans query OAuth) : bug pré-existant Next↔cibul-node
   non couvert par le fix `hasOAuthQuery` (qui ne traite que le cas OAuth). À traiter à part.

## 6. Références

- `docs/plan-slice-auth-v3.md` §5.1/§5.2 — modèle de scopes ↔ tiers (à réutiliser).
- `docs/plan-mcp-sdk-wiring.md` #4 — roadmap MCP (HTTP+OAuth).
- `docs/analyse-authentification.md` §4.5 — proposition SSO d'origine (caduque sur le « how »).
- `packages/auth/src/index.js` — instance BA, tableau `plugins`.
- `packages/cibul-node/services/auth/index.js` — montage `/api/auth`.
