# Plan — Logs structurés de connexion pour stats InsightOps

> Card Focalboard : « Structurer les logs de connexion pour stats InsightOps (méthodes de connexion OA) »
> Branche / worktree : `feat/auth-signin-structured-logs`
> Scope commit : `auth` (cœur dans `@openagenda/auth`, branchement dans `cibul-node`)
> Changeset : **non requis** (`packages/auth` est `private`, ni lui ni `cibul-node` ne sont sous `public/`)

## 1. Objectif

Émettre un événement de log structuré **à chaque tentative de sign-in OA**, succès comme échec,
avec des champs typés exploitables côté InsightOps (répartition par méthode, taux succès/échec,
série temporelle). Un seul point de fan-out, pas de duplication par UI.

Décisions cadrées avec le demandeur :

- **Périmètre** : succès **et** échecs dans le même lot / PR.
- **`.well-known`** : appliquer `silenceWarnings` (faux positif assumé, justifié en commentaire).
- **Logger** : prérequis Phase 0 — injecter le logger dans le package auth via l'option `logger`
  de better-auth (DI), pour que `ctx.context.logger` soit le vrai logger OA.

## 2. État des lieux (recherche)

### 2.1 Seams d'authentification existants — `packages/auth/src/index.js`

Tous les chemins de sign-in passent par les hooks `before`/`after` (`hooks:` @574) et les
`databaseHooks` (@1152) **dans le package auth lui-même** — c'est le point de fan-out unique voulu.

| Chemin               | Endpoint                 | Seam succès (file:line)                                    | Méthode               |
| -------------------- | ------------------------ | ---------------------------------------------------------- | --------------------- |
| Email + mot de passe | `/sign-in/email`         | `hooks.after` `onSignInSuccess` @731                       | `password`            |
| OAuth Google         | `/callback/google`       | `hooks.after` `onSignInSuccess` @828                       | `oauth:google`        |
| OAuth Facebook       | `/callback/facebook`     | `hooks.after` `onSignInSuccess` @828                       | `oauth:facebook`      |
| Magic link           | `/magic-link/verify`     | `hooks.after` `onSignInSuccess` @945                       | `magic_link`          |
| OIDC token-exchange  | `/oauth2/token-exchange` | **aucun hook** — `src/tokenExchangePlugin.js`              | `oidc_token_exchange` |
| Création de compte   | tout `user.create`       | `databaseHooks.user.create.after` `onSignUpComplete` @1163 | (signal `is_new`)     |

Faits importants :

- **`ctx.context.logger` est déjà utilisé** dans tous les hooks (ex. `@642`, `@692`, `@724`,
  `@739`…) pour logger des erreurs. Le seam est donc vivant ; aujourd'hui il pointe vers le
  logger console par défaut de better-auth.
- `onSignInSuccess({ session, user, request })` — l'objet `user` porte le **`uid` OA** (champ
  additionnel `uid`, `returned:true`), pas la PK better-auth. ✅
- `is_new` existe comme champ user (`defaultValue:true` à la création) **mais** n'est pas un signal
  fiable « nouveau ce sign-in » (jamais re-basculé) → voir 4.3.
- `is_linked` **n'existe pas** comme champ. Le linking se lit dans la table `account`
  (`internalAdapter.findAccountByUserId`) → voir 4.3.
- Branchement cibul-node : `app.all('/api/auth/*', services.auth.nodeHandler)`
  (`packages/cibul-node/server.js:85`). La factory `Auth({...})` est instanciée dans
  `packages/cibul-node/services/auth/index.js` (~@175), où tous les callbacks sont déjà câblés.

### 2.2 Stack de logging OA → InsightOps

- Lib : **`@openagenda/logs`** (`public/logs/`) = wrapper Winston, transports conditionnels :
  `DebugTransport` (stderr), `InsightOpsTransport` (r7insight_node → Rapid7 InsightOps),
  `OtelTransport` (OTLP).
- Instanciation cibul-node : `lib/initLog.js:4` ; config `config/index.js:77-91`
  (token InsightOps via `OA_INSIGHT_OPS`, format `service:token|service:token`).
- Convention de nommage : namespace en **slashes** (`logs('auth/local')`, `logs('agendaEvents/onCreate')`).
  Métadonnées = objet plat (`log.info('message', { userUid, ... })`).
- IP / User-Agent **déjà capturés au niveau HTTP** par `loadLogger` (`lib/commons-app.js:52-62`,
  `ip` = 1er hop `x-forwarded-for`, `userUid`) → **ne pas les redupliquer** dans l'event auth.
- Précédent d'event « métier » structuré : `services/auth/index.js` logge déjà
  `oauth.client.registered` (DCR) via `onClientRegistered`.

### 2.3 Internals better-auth vérifiés (better-auth 1.6.13)

Recherche poussée des inconnues structurantes — **toutes levées** :

**Interface logger** (`@better-auth/core/src/env/logger.ts`) :

```ts
interface Logger {
  disabled?: boolean;
  disableColors?: boolean;
  level?: 'debug' | 'info' | 'warn' | 'error'; // 'success' exclu
  log?: (level, message: string, ...args: any[]) => void;
}
```

- ⚠️ **GOTCHA : le niveau par défaut est `'warn'`** (`createLogger`, ligne 97). Donc
  `ctx.context.logger.info('auth.signin.success', meta)` est **silencieusement droppé** tant que
  l'adaptateur injecté ne fixe pas `level: 'info'`. → l'adaptateur Phase 0 **doit** poser `level:'info'`.
- `ctx.context.logger.info(msg, meta)` appelle `options.log('info', msg, meta)` → notre objet meta
  arrive en `args[0]`. Adaptateur : `oaLog[level](message, args[0] ?? {})`. (`'success'` est déjà
  remappé en `'info'` par BA avant l'appel.)

**Les `hooks.after` s'exécutent AUSSI en cas d'échec** (`dist/api/to-auth-endpoints.mjs:100-149`) :
quand l'endpoint `throw` un `APIError`, il est **capturé** (pas re-throw — seuls les non-APIError
re-throw, ligne 144), stocké dans `ctx.context.returned`, puis `runAfterHooks` tourne
inconditionnellement. → **succès et échec partagent le même seam**. Détection d'échec =
`ctx.context.returned instanceof APIError` — **pattern déjà utilisé par OA** (`src/index.js:855`).

**Reason typé = `apiError.body.code`** : `defineErrorCodes` produit `{ code: 'KEY', message, toString }`,
et `APIError.from(status, BASE_ERROR_CODES.X)` pose `body.code === 'X'` — code machine stable
(`INVALID_EMAIL_OR_PASSWORD`, `EMAIL_NOT_VERIFIED`, `USER_EMAIL_NOT_FOUND`, `OAUTH_LINK_ERROR`…).

### 2.4 Warning `.well-known` (better-auth)

Faux positif émis au boot par `@better-auth/oauth-provider` :

```
Please ensure '/.well-known/oauth-authorization-server' exists. … clear with silenceWarnings.oauthAuthServerConfig.
Please ensure '/.well-known/openid-configuration' exists. … clear with silenceWarnings.openidConfig.
```

Cause : OA configure `baseURL: config.root` (origine nue → `issuerPath=/`) alors que `basePath`
vaut par défaut `/api/auth`. L'heuristique du plugin (`node_modules/@better-auth/oauth-provider/dist/index.mjs:2856-2871`)
compare `issuerPath` à `basePath` et conclut à tort que les métadonnées manquent. **Or elles
existent** : servies sous `/api/auth/.well-known/...`, routées par le catch-all `/api/auth/*`, et
nginx aliase déjà la forme racine RFC 8414 (`docker/nginx/server_params:159-185`).

→ `silenceWarnings` est l'option **prévue par le plugin pour ce cas exact** (« clear once verified »).
Justifié en commentaire de code : ce n'est pas masquer une vraie misconfiguration (cf. mémoire
`feedback_dont_silence_warnings`), c'est neutraliser un faux positif d'heuristique, le routing
discovery étant prouvé reachable.

## 3. Conception cible

### 3.1 Schéma d'événement

Deux events, namespace logger `auth/signin`, nom d'event stable en champ `event` :

```js
// succès
log.info('auth.signin.success', {
  event:     'auth.signin.success',
  method:    'password' | 'magic_link' | 'oauth:google' | 'oauth:facebook' | 'oidc_token_exchange',
  provider:  'google' | 'facebook' | <oidc client_id> | undefined,   // si OAuth/OIDC
  is_new:    boolean,        // création de compte vs reconnexion (cf. 4.3)
  user_uid:  number,         // uid OA, jamais la PK BA
  client_id: string | undefined,   // OIDC uniquement
});
// `is_linked` (du card) RETIRÉ de l'event : c'est un état de compte constant par
// utilisateur (un log par connexion le sur-pondère) et le seul champ qui coûtait une
// requête `account` par login. Tous les champs ci-dessus sont en mémoire au seam → 0 I/O
// ajoutée. La distribution "comptes liés password+social" se calcule mieux en rollup
// offline / requête one-shot sur la table `account`. Réversible si besoin produit.

// échec
log.warn('auth.signin.failure', {
  event:    'auth.signin.failure',
  method:   <même domaine que ci-dessus>,
  provider: <si applicable>,
  reason:   'invalid_credentials' | 'email_not_verified' | 'account_unavailable'
          | 'rate_limited' | 'oauth_callback_error'
          | 'magic_link_invalid' | 'token_exchange_denied',
  user_uid: number | undefined,   // si l'utilisateur a pu être résolu
});

// Compte inexistant — TROISIÈME issue d'une tentative, ni succès ni échec :
// il n'y a rien à authentifier, l'utilisateur est routé vers l'inscription.
// Donc un EVENT distinct (pas un `reason` de failure), en `info`, HORS du taux
// d'échec — qui doit mesurer « de vrais users qui n'arrivent pas à entrer ».
// Même event pour TOUTES les méthodes (cohérence : email inconnu = email
// inconnu, quel que soit le chemin) :
//   - magic_link : émis au SEND (`deliverMagicLink`, cibul-node) — seul endroit
//     qui connaît l'existence (`disableSignUp:true` → pas de token à vérifier) ;
//     l'inbox reçoit un mail d'inscription.
//   - password : émis à l'échec `/sign-in/email` quand le flag d'existence
//     stashé par le before-hook (lookup barré, 0 requête ajoutée) dit « inconnu ».
//     Distinct du mauvais mot de passe (compte existant → `invalid_credentials`).
// Signal sécu (ex. spray password sur emails inconnus) toujours requêtable :
//   where(message=auth.signin.no_account AND meta.method=password).
// Log interne uniquement, réponse HTTP inchangée → anti-énumération préservée.
log.info('auth.signin.no_account', {
  event:  'auth.signin.no_account',
  method: 'password' | 'magic_link',
});
```

- **RGPD** : jamais d'email / mot de passe / token dans le log. `uid` OK. IP/UA non redupliqués
  (déjà au niveau HTTP).
- Champs en `snake_case`, event en `auth.*` (validé card).

### 3.2 Architecture (qui fait quoi)

```
packages/auth  (logger-agnostic, DI)
  └─ accepte option `logger` dans Auth({...}) → passée à betterAuth({ logger })
  └─ émet auth.signin.success / .failure DANS les hooks, via ctx.context.logger
       (un seul point de fan-out, ctx déjà en portée à chaque seam)

packages/cibul-node
  └─ services/auth/index.js : fabrique l'adaptateur @openagenda/logs (namespace `auth`)
       et l'injecte en `logger`. Seul endroit qui dépend de @openagenda/logs.
```

Le package auth **ne dépend pas** de `@openagenda/logs` → frontière propre, conforme à son
design actuel.

## 4. Découpage des tâches (1 PR, séquencée)

### Phase 0 — Prérequis : brancher le logger + silence `.well-known` — ✅ FAIT

> Implémenté. `node --check` OK, clés `silenceWarnings` vérifiées contre la source installée
> (`index.mjs:2869-2870`), suite `@openagenda/auth` verte (18 suites / 165 tests).

1. `packages/auth/src/index.js` : ajouter une option `logger` à la factory `Auth({...})`,
   la mapper sur l'interface logger de better-auth (`{ disabled?, level?, log(level,msg,...args) }`)
   et la passer à `betterAuth({ logger, ... })` (@1195). Sans option fournie → comportement
   actuel (logger par défaut) inchangé.
2. `packages/auth/src/index.js:245` (`oauthProvider({...})`) : ajouter
   `silenceWarnings: { oauthAuthServerConfig: true, openidConfig: true }` + commentaire renvoyant
   à nginx `server_params:159-185` + au catch-all, justifiant le faux positif.
3. `packages/cibul-node/services/auth/index.js` : construire l'adaptateur depuis `@openagenda/logs`
   (namespace `auth`, mapping niveaux better-auth → Winston) et l'injecter en `logger` dans `Auth({...})`.

> Effet de bord bénéfique : les logs internes de better-auth (erreurs, diagnostics) partent
> désormais dans InsightOps/OTel au lieu de la console.

### Phase 1 — Succès (`auth.signin.success`) — ✅ FAIT

> Implémenté. Helper `logSigninSuccess` (`src/index.js`) + 4 sites + flag `oaUserCreated`
> (is_new) dans `databaseHooks.user.create.after` + émission inline token-exchange. Test
> `test/18_signinLogging.test.js` (7 cas). Suite verte : 19 suites / 172 tests.
> Caveat : l'émission token-exchange est inline (pas de session/account) et **pas couverte par
> un test unitaire** (le handler du plugin exige un mock lourd signJWT/verifySubject) — à
> couvrir en intégration ou Phase 3.

Émission **dans les hooks du package auth**, là où `ctx`/path/user sont réunis : 4. `/sign-in/email` (after @731) → `method:'password'`. 5. `/callback/:id` (after @828) → `method:'oauth:'+id`, `provider:id`. 6. `/magic-link/verify` (after @945) → `method:'magic_link'`. 7. `tokenExchangePlugin.js` (succès de l'échange) → `method:'oidc_token_exchange'`, `client_id`. 8. Helper interne `emitSigninSuccess(ctx, { method, provider, user, ... })` factorisant
la dérivation `method` depuis `ctx.path` + l'appel `ctx.context.logger.info(...)`.

### Phase 2 — Échecs (`auth.signin.failure`) — ✅ FAIT

> Implémenté. Helper `logSigninFailure` + table `FAILURE_REASON_BY_CODE` (`src/index.js`).
> 6 sites : before-hook barré /sign-in/email (logué AVANT le throw — cf. découverte ci-dessous),
> after-hook !newSession sur /sign-in/email + /callback/:id + /magic-link/verify, et les 2
> branches barré (account_unavailable + user_uid). Token-exchange : helper `denyExchange` aux 4
> denials sécurité (mauvais client, subject invalide/non-lié, user révoqué). Test `18_signinLogging`
> (+9 cas). Suite verte : 19 suites / 181 tests.
>
> **Découverte clé** : les after-hooks NE tournent PAS sur un throw de _before_-hook
> (`to-auth-endpoints.mjs:74`, hors du try qui exécute les after). Donc le cas barré
> /sign-in/email (throw before-hook, collapsé en INVALID*EMAIL_OR_PASSWORD pour l'anti-énumération)
> est logué \_dans le before-hook* avec `reason:account_unavailable` — réponse HTTP inchangée,
> seul le log interne porte la vraie raison.
>
> **`rate_limited` — RÉSOLU.** Vérifié dans la source : le rate-limiter court-circuite à
> `onRequest` (`api/index.mjs:175`) et renvoie un 429 nu AVANT les hooks (et ne logue rien
> lui-même ; le hook `plugin.onResponse` ne reçoit pas la requête → impossible de connaître le
> chemin). Donc `TOO_MANY_REQUESTS` ne peut PAS être capturé au seam des hooks (entrée retirée de
> `FAILURE_REASON_BY_CODE`). Capturé à la place au **node handler** (`withRateLimitLogging`) : on
> inspecte le 429 et on mappe l'URL → méthode (`signinMethodFromUrl`, uniquement `/sign-in/email`
> et `/magic-link/verify` — jamais `/sign-up/email` ni `/sign-in/magic-link`, qui est un envoi
> d'email, pas une connexion). Écoute sur `'close'` (pas `'finish'`) pour capturer aussi les
> connexions avortées. Testé (5 cas). Plus aucun point ouvert.

Même seam que les succès (vérifié, cf. 2.3/5) : dans chaque `hooks.after`, brancher une branche
échec lorsque `ctx.context.newSession` est absent et `ctx.context.returned instanceof APIError`. 9. Helper `emitSigninFailure(ctx)` : lit `ctx.context.returned.body.code`, mappe vers `reason`
(table 5.ter), dérive `method` depuis `ctx.path`. 10. Ajouter un `code` aux throws maison OA (isRemoved/isBlacklisted, `src/index.js:588`) pour mapper
`account_unavailable` (sinon `body.code` undefined). 11. Échecs OAuth callback (`oauth_callback_error`), magic-link invalide (`magic_link_invalid`),
token-exchange refusé (`token_exchange_denied`) instrumentés à leurs sites respectifs. 12. Vérifier le seul point ouvert : le rate-limiter (`TOO_MANY_REQUESTS`) court-circuite-t-il avant
les `after` hooks ? Si oui, logger `rate_limited` au niveau du rate-limiter.

### Phase 3 — Tests & dashboard

12. `packages/auth/test/18_signinLogging.test.js` : faux logger injecté, asserts sur
    `event/method/reason/uid` par chemin (succès + échec). S'appuyer sur le pattern de
    `test/11_extensions.test.js`.
13. Lancer la suite auth : `yarn workspace @openagenda/auth test`.
14. (Hors-code) Dashboard InsightOps cible : répartition par `method`, taux succès/échec via
    `event`, série temporelle. À cadrer avec le demandeur une fois les events en prod.

## 5. Inconnues — résolues (recherche faite contre better-auth 1.6.13)

- **R1 — `after` hooks en cas d'échec : ✅ OUI, même seam.** `runAfterHooks` tourne même quand
  l'endpoint rejette (cf. 2.3). Le lot « échecs » n'est **pas** invasif : branche d'échec dans les
  `hooks.after` existants, `ctx.context.returned instanceof APIError`, reason = `returned.body.code`.
  **Pas de wrapping du nodeHandler ni de seam séparé.**
- **R2 — `is_new` : ✅ champ sticky, inutilisable tel quel.** Rien ne re-bascule `isNew` à false
  (vérifié sur tout le package). Dériver « nouveau **ce** sign-in » via un flag posé en
  `databaseHooks.user.create.after` dans l'async-context de requête (déjà utilisé pour
  `mapProfileToUser`), lu dans le hook after. Seul `/callback/:id` peut créer un user au sign-in
  (signup désactivé sur `/sign-in/email` et magic-link) → `is_new` n'est vrai que sur OAuth.
- **R3 — `is_linked` : ✅ helper déjà présent.** Pas de champ, mais `getAccountTypesByUserId` /
  `findAccounts` (`src/internalAccount.js:159`) renvoie le `Set` des `providerId` par user.
  Proposition de sémantique : possède à la fois un account `credential` ET ≥1 account OAuth.
  Coût = 1 requête `account` par sign-in.
- **R4 — token-exchange sans hook : instrumentation directe** dans `tokenExchangePlugin.js`
  (succès + échec à leurs sites), jamais le token en clair.
- **R5 — interface logger : ✅ résolue** (cf. 2.3). Adaptateur trivial **mais doit poser `level:'info'`**
  sinon les succès sont droppés (défaut `warn`).

### 5.bis Caveats issus de la recherche (intégrés au schéma)

- **Email inconnu vs mauvais mot de passe** sur `/sign-in/email` : better-auth collapse
  délibérément les deux en `INVALID_EMAIL_OR_PASSWORD` au niveau RÉPONSE (anti-énumération,
  `dist/api/routes/sign-in.mjs:209/215/221/228`). Séparés côté LOG sans requête supplémentaire :
  le before-hook (garde barré) fait déjà `findUserByEmail` → on stashe `oaSigninEmailKnown` sur
  `ctx.context`, et l'after-hook d'échec émet l'event `auth.signin.no_account` si l'email était
  inconnu (issue distincte, hors taux d'échec), sinon `auth.signin.failure{invalid_credentials}`.
  La réponse HTTP reste identique (anti-énumération préservée).
- **Throws maison OA sans `code`** : les rejets isRemoved/isBlacklisted (`src/index.js:588`) font
  `new APIError('UNAUTHORIZED', { message })` sans `code` → `body.code` undefined. → leur ajouter
  un `code` `ACCOUNT_UNAVAILABLE` (tâche 10).
- **`rate_limited` (`TOO_MANY_REQUESTS`)** : rate-limiter en amont du routeur — **seule inconnue
  résiduelle** (tâche 12), non bloquante : peut nécessiter un log au niveau du rate-limiter.

### 5.ter Mapping `body.code` → `reason` (initial)

| `body.code` better-auth                                                                         | `reason` OA             |
| ----------------------------------------------------------------------------------------------- | ----------------------- |
| `INVALID_EMAIL_OR_PASSWORD`, `INVALID_EMAIL`, `INVALID_PASSWORD`                                | `invalid_credentials`   |
| `EMAIL_NOT_VERIFIED`                                                                            | `email_not_verified`    |
| `USER_EMAIL_NOT_FOUND`, `FAILED_TO_GET_USER_INFO`, `OAUTH_LINK_ERROR`, `ID_TOKEN_NOT_SUPPORTED` | `oauth_callback_error`  |
| `ACCOUNT_UNAVAILABLE` (à ajouter côté OA)                                                       | `account_unavailable`   |
| magic link invalide / expiré                                                                    | `magic_link_invalid`    |
| token-exchange refusé                                                                           | `token_exchange_denied` |
| `TOO_MANY_REQUESTS` (si capturable)                                                             | `rate_limited`          |

## 6. Vérification / Definition of Done

- [ ] Boot cibul-node sans le warning `.well-known` (et logs internes BA visibles via le logger OA).
- [ ] Un event `auth.signin.success` typé par chemin (password / oauth:google / oauth:facebook /
      magic_link / oidc_token_exchange), `user_uid` = uid OA, pas d'email/token.
- [ ] Un event `auth.signin.failure` typé pour chaque `reason` cadré.
- [ ] `yarn workspace @openagenda/auth test` vert (+ nouveau fichier de test).
- [ ] Pas de duplication IP/UA.
- [ ] Revue manuelle avant tout commit (cf. process). Pas de changeset (packages privés/non-public).
