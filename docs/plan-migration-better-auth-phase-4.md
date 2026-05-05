# Phase 4 — OAuth (Google + Facebook) via better-auth

Branche : `feat/better-auth`. Suit phase 3b (verify-email + reset-password BA, impersonation plugin maison).

> Ce document est un plan de travail. Il **collecte** l'existant, **propose** une cible et un découpage en lots, et **liste les décisions ouvertes** à trancher avant exécution. Aucune implémentation ici.

---

## 1. Contexte & objectif

### Rappel des phases déjà déployées (ou en cours sur la branche)

| Phase | Apport                                                                                                                                                                                                                                                                                                    | État                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1     | `@openagenda/auth` (wrap better-auth + Kysely + MySQL + Redis secondaryStorage), monté avant body-parser sur `/api/auth/*`                                                                                                                                                                                | committée                                |
| 2a    | Dual-write `account.password` (sentinel `legacy-sha256$<salt>$<hex>`) sur `users.create` / `changePassword` / `patch{internal}`                                                                                                                                                                           | committée                                |
| 2b    | Backfill SQL legacy → `account` rows ; lazy rehash en argon2id sur `/sign-in/email`                                                                                                                                                                                                                       | committée                                |
| 2.5   | `accountCleanup` hook : delete credential row + revoke sessions sur `users.remove`, revoke sessions sur blacklist                                                                                                                                                                                         | committée                                |
| 3     | UI signin (`auth.api.signInEmail`), signup → BA email verification, hybrid session loader (BA-first → legacy fallback), `auth.openSession` primitive (impersonation prépa)                                                                                                                                | committée                                |
| 3b    | Email verification BA (`/api/auth/verify-email`) + façade `/activate/:token`, reset password BA (`/api/auth/forget-password`, `/api/auth/reset-password`) + façade `/password/reset/:token`, plugin maison `oaImpersonationPlugin` (`/oa/open-session`, `/oa/impersonate-user`, `/oa/stop-impersonating`) | locale (5a747acb..3b24825f), non poussée |

### But de la phase 4

Migrer la connexion OAuth (Google + Facebook) de Passport vers better-auth, en **réutilisant** la mécanique BA standard `socialProviders` + `/sign-in/social/:provider` + `/callback/:provider`, **sans casser** :

- les sessions des users qui ont aujourd'hui `users.facebookUid` ou `users.googleId` peuplé,
- les vieux liens Google/Facebook envoyés par mail ou shared (boutons `<a href="/google/signin">`),
- la migration en cours de phase-out Facebook (cf. `auth/lib/computeRedirect.js:23-32` qui force tout user `facebookUid` vers `/settings/unlinkFacebook`).

### Hors périmètre (phases ultérieures)

- **Twitter / X** — la stratégie Passport n'est plus câblée (cf. §3.4). Ne pas réintroduire dans phase 4 ; document la suppression définitive en phase 6.
- **Drop des colonnes `facebook_uid` / `google_id`** sur `users` — phase 6, après stabilisation de la lecture des `account` rows BA.
- **Drop Passport / cookie-session / `user.salt`** — phase 6.
- **Magic-link** — phase dédiée.

---

## 2. État actuel (legacy OAuth)

### 2.1 Routes legacy

| Route                              | Méthode | Fichier                                                  | Rôle                                                    |
| ---------------------------------- | ------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `/google/signin`                   | GET     | `packages/cibul-node/auth/google.front.js:82`            | redirect vers Google (signin)                           |
| `/:agendaSlug/google/signin`       | GET     | `google.front.js:84`                                     | idem, dans contexte agenda                              |
| `/google/signin/callback`          | GET     | `google.front.js:86-90`                                  | callback Google → `auth.process('google','signin')`     |
| `/google/signup`                   | POST    | `google.front.js:92`                                     | redirect vers Google (signup explicite)                 |
| `/:agendaSlug/google/signup`       | POST    | `google.front.js:94`                                     | idem agenda                                             |
| `/google/signup/callback`          | GET     | `google.front.js:96-100`                                 | callback Google → `auth.process('google','signup')`     |
| `/facebook/signin`                 | GET     | `packages/cibul-node/auth/facebook.front.js:61`          | redirect vers Facebook (signin)                         |
| `/:agendaSlug/facebook/signin`     | GET     | `facebook.front.js:63`                                   | idem, dans contexte agenda                              |
| `/facebook/signin/callback`        | GET     | `facebook.front.js:66-69`                                | callback Facebook → `auth.process('facebook','signin')` |
| `/unlinkFacebook/:token`           | GET     | `packages/cibul-node/auth/unlinkFacebook.front.js:94-98` | confirme la migration Facebook → email/password         |
| `/users/:id/requestUnlinkFacebook` | PATCH   | `packages/cibul-node/services/users/plugApp.js:70-74`    | endpoint settings : prépare email + password en attente |

> **Note** : pas de bouton « signup avec Facebook ». `cibul-templates/auth/signup.ejs:116` n'expose que **Google** pour le signup. Le bouton Facebook n'existe que sur le signin (`cibul-templates/auth/signin.ejs:46-55`).

### 2.2 Wiring Express

Tout passe par `packages/cibul-node/web.js:10-69` :

```
facebookFront(app);     // :65
googleFront(app);       // :66
localFront(app);        // :67  ← signin email/password (déjà BA-routé phase 3)
resetFront(app);        // :68  ← déjà BA-routé phase 3b
unlinkFacebookFront(app); // :69
```

Le handler BA est monté **avant** body-parser dans `packages/cibul-node/server.js:81-82` :

```
app.all('/api/auth/oa/*', (req, res) => res.sendStatus(404));
app.all('/api/auth/*', services.auth.nodeHandler);
```

→ N'importe quel `/api/auth/sign-in/social/:provider` et `/api/auth/callback/:provider` ajouté côté BA est déjà servi sans intervention sur le wiring.

### 2.3 Helper Passport `Auth(service)` — `auth/lib/auth.js`

Tout le legacy OAuth (Google + Facebook) passe par le **même** helper paramétré (`auth/lib/auth.js:438-649`). Le pipeline `process(authService, name)` (ligne 582) :

1. `passport.authenticate(${authService}-${name}, …)` → reçoit le profil OAuth normalisé.
2. `attemptAuth` → `users.findOne({ query: { facebookUid|googleId|twitterId: profile.id } })`.
3. Si user trouvé → `signin(values)` (ligne 134) → ouvre une session BA via `services.auth.openSession({ userId, req, res })` (ligne 162).
4. Si user non trouvé → `attemptCreate` → `users.create({ email, fullName, culture, [fieldName]: profile.id, isActivated: false })`.
5. Si user créé non activé → `redirectToComplete` (renvoie vers `/signup/complete?email=…`, qui **ne renvoie PAS de mail d'activation automatiquement** dans le legacy OAuth — divergence avec le signup email/password).
6. Branchement spécial Facebook (ligne 504) : si `profile.email` absent → `err = 'facebookEmailMissing'` → render signin avec erreur.

**Quirks à préserver ou nettoyer** :

- `signin()` (`auth/lib/auth.js:134-219`) inclut un branchement spécifique Facebook ligne 188-199 : si `user.facebookUid` est non-null, on **force** `redirectUrl = '/settings/unlinkFacebook'`. Idem dans `auth/lib/computeRedirect.js:23-32` (l'helper utilisé par le signin email/password BA-routed). C'est un **dispositif de phase-out** : à chaque login, un user encore lié à Facebook est dévié vers la page de migration (`packages/user-apps/src/components/UnlinkFacebookSettings.js`).
- Le mapping `culture` au create OAuth est `req.lang` (`auth/lib/auth.js:548`) — pas `'fr'` par défaut.
- Le `serviceCreate` (ligne 55) crée le user avec `isActivated: !!activate` — le 2ᵉ argument est toujours `false` dans le legacy OAuth (ligne 440), donc **les comptes OAuth nouvellement créés sont initialement non activés**, ce qui force le redirect-to-complete et l'envoi (par le hook Feathers `users.onCreate`) d'un mail d'activation.

### 2.4 Modèle de stockage des liens OAuth

| Provider | Colonne `users`       | Type         | Index | Source                                                             |
| -------- | --------------------- | ------------ | ----- | ------------------------------------------------------------------ |
| Google   | `google_id`           | varchar(255) | aucun | `packages/users/migrations/20190812170942_create_user_table.js:29` |
| Facebook | `facebook_uid`        | varchar(255) | aucun | idem `:14`                                                         |
| Twitter  | `twitter_id`          | varchar(255) | aucun | idem `:28`                                                         |
| Twitter  | `twitter_screen_name` | varchar(255) | aucun | idem `:15`                                                         |

Pas de table dédiée. Pas d'index — donc lookup OAuth-by-id repose sur full scan ou index implicite primaire. À pondérer dans le plan de backfill (cf. §4.1).

Champs exposés par le service users (`packages/users/service/fields.js:14-26`) :

```js
detailed: ['facebookUid', 'twitterId', 'googleId' /* ... */];
```

Schéma de création (`packages/users/service/schemas/create.js:26-34`) accepte `twitterId`, `googleId`, `facebookUid` comme champs optionnels libres.

### 2.5 Configuration env legacy

`packages/cibul-node/config/index.js:220-234` :

```js
auth: {
  facebook: prod.facebook?.appId ?? process.env.OA_FACEBOOK_ID
    ? { id, secret } : null,
  google: prod.googleApps ?? process.env.OA_OAUTH_GOOGLE_ID
    ? { id, secret } : null,
}
```

Variables docker (`docker-compose.yml:200-203`) :

- `OA_OAUTH_GOOGLE_ID` / `OA_OAUTH_GOOGLE_SECRET`
- `OA_FACEBOOK_ID` / `OA_FACEBOOK_SECRET`

Sample (`.env.sample:134-137`) — vides par défaut.

### 2.6 nginx

`docker/nginx/server_params:246-256` whitelist :

```
location ~ ^/facebook(|/.+)$ { include conf.d/nodejs_params; }
location ~ ^/twitter(|/.+)$  { include conf.d/nodejs_params; }
location ~ ^/google(|/.+)$   { include conf.d/nodejs_params; }
```

Et l'agenda-scoped (`:304`) inclut `facebook|twitter|google` dans la liste de prefixes routés vers nodejs.

`/api/auth/*` est déjà routé vers nodejs via `^/api(|/.+)$` (`:129`). Donc **les nouvelles routes BA `/api/auth/sign-in/social/*` et `/api/auth/callback/*` ne nécessitent aucun changement nginx**.

### 2.7 Dette identifiée en commentaires existants

| Fichier                                | Ligne | Note                                                                                                                                                                                        |
| -------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/auth/src/index.js`           | 96-98 | TODO(phase 4) explicite : étendre le guard `isRemoved`/`isBlacklisted` à `/sign-in/social` et `/callback/:provider`                                                                         |
| `packages/auth/src/internalAccount.js` | 33    | Commentaire « OAuth rows (providerId !== 'credential') are left untouched; phase 4 » — `deleteCredentialAccount` doit être étendu pour aussi delete les rows OAuth lors d'un `users.remove` |

---

## 3. Cible — modèle better-auth

### 3.1 Configuration `socialProviders`

Ajouter dans `packages/auth/src/index.js` (objet betterAuth) :

```js
socialProviders: {
  google: {
    clientId: options.google?.id,
    clientSecret: options.google?.secret,
    // BA expose 'email' et 'profile' par défaut, équivalent au legacy.
  },
  facebook: {
    clientId: options.facebook?.id,
    clientSecret: options.facebook?.secret,
    fields: ['id', 'name', 'email'], // équivalent profileFields legacy
  },
}
```

(Pseudo-code — la config réelle dépendra des décisions ouvertes §9.)

Le `Auth({ google, facebook })` recevra les credentials depuis `services/auth/index.js`, qui les lira sur `config.auth.google` / `config.auth.facebook` (déjà exposé).

### 3.2 Routes auto-générées par BA

| Route                          | Méthode    | Comportement                                                           |
| ------------------------------ | ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/auth/sign-in/social`     | POST       | body `{ provider: 'google'                                             | 'facebook', callbackURL?, errorCallbackURL?, newUserCallbackURL?, requestSignUp? }`— répond avec`{ url, redirect: true }`. Le client suit le redirect. |
| `/api/auth/callback/:provider` | GET / POST | endpoint OAuth callback ; URL à déclarer sur Google / Facebook console |
| `/api/auth/link-social`        | POST       | (utilisateur déjà connecté) lie un provider supplémentaire             |
| `/api/auth/unlink-account`     | POST       | délie un provider (`{ providerId: 'google' }`)                         |

**Important** :

- `/sign-in/social` est un POST côté BA. Pour un bouton legacy `<a href="/google/signin">` (méthode GET avec navigation native), il faut **un façade GET** qui POST vers BA — ou utiliser `authClient.signIn.social({ provider })` côté front.
- `callbackURL` peut être un path same-origin (autorisé via `trustedOrigins`, déjà câblé phase 3 sur `[config.root, …]`).

### 3.3 Modèle `account` row OAuth

| Colonne         | Valeur OAuth                                                 | Source                                                |
| --------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `provider_id`   | `'google'` ou `'facebook'`                                   | constant fournisseur                                  |
| `account_id`    | `profile.id` (ex. `108743912…` Google, `592025090` Facebook) | reçu du provider                                      |
| `user_id`       | PK du user OA                                                | résolu par `findOAuthUser` (cf. §3.4)                 |
| `access_token`  | optionnel                                                    | encrypted si `account.encryptOAuthTokens` (à décider) |
| `refresh_token` | optionnel (Google si `accessType: 'offline'`)                | idem                                                  |
| `id_token`      | OIDC JWT (Google)                                            | idem                                                  |
| `scope`         | scope demandé                                                | string                                                |
| `password`      | `NULL`                                                       | jamais peuplé pour OAuth                              |

Index unique déjà en place : `(provider_id, account_id)` (`packages/auth/migrations/20260428120000_create_better_auth_tables.js:30-32`). Donc un même Google account ne peut pas être lié à deux users OA distincts — bonne contrainte.

### 3.4 Mapping legacy ↔ BA

Le mécanisme cœur côté BA est `internalAdapter.findOAuthUser(email, accountId, providerId)` — `node_modules/better-auth/dist/db/internal-adapter.mjs:390-443` :

1. Cherche d'abord par `(account_id, provider_id)` → si trouvé, `linkedAccount` retourné, ouverture session direct.
2. Sinon, cherche par `email` → si trouvé, `linkedAccount: null` retourné — entre dans la branche **« linked account missing »** dans `oauth2/link-account.mjs:18-46`.
3. Sinon → `createOAuthUser` (ligne 89) crée user + account row dans la même transaction.

Dans la branche « linked account missing », le code BA (`link-account.mjs:20`) fait :

```
if (!(isTrustedProvider || trustedProviders.includes(providerId))
    && !userInfo.emailVerified
    || accountLinking?.enabled === false
    || accountLinking?.disableImplicitLinking === true) {
  return { error: "account not linked", data: null };
}
```

→ **Auto-link** réussit si :

- le provider est dans `trustedProviders`, OU
- le `userInfo.emailVerified` est `true`,
- ET `accountLinking.enabled !== false` (qui est le défaut),
- ET `disableImplicitLinking !== true`.

### 3.5 Cas `users.facebookUid` / `users.googleId` peuplés mais pas de `account` row

C'est l'état actuel pour TOUS les users OAuth historiques. Deux options ouvertes (cf. §9) :

**Option A — Backfill `account` rows à la migration de déploiement.** Inspiré de `packages/auth/migrations/20260429100000_backfill_legacy_passwords.js`. Pour chaque user :

```sql
SELECT id, google_id, facebook_uid FROM user
WHERE (google_id IS NOT NULL OR facebook_uid IS NOT NULL)
  AND is_removed = 0;
```

Insère dans `account` :

- `(provider_id='google', account_id=user.google_id, user_id=user.id)` si `google_id`
- `(provider_id='facebook', account_id=user.facebook_uid, user_id=user.id)` si `facebook_uid`

`access_token`/`refresh_token` à `NULL` (jamais persisté en legacy). `password` à `NULL` aussi (les rows credential pour ces mêmes users existent déjà via la backfill 2b si le user avait aussi un mot de passe).

→ Au prochain `/sign-in/social`, BA fait `findOAuthUser` qui matche directement par `(account_id, provider_id)` — pas besoin de logique de linking, pas de dépendance à `accountLinking.enabled`.

**Option B — Lazy linking.** Ne pas backfiller. Compter sur `accountLinking.enabled: true` (défaut BA) + `accountLinking.trustedProviders: ['google']` (Google envoie `email_verified` côté JWT, donc `userInfo.emailVerified` est généralement `true` ; néanmoins explicit > implicit). Pour Facebook, c'est **plus délicat** : le provider BA met `emailVerified: false` toujours (cf. `node_modules/.../core/dist/social-providers/facebook.mjs:90,114`). Donc le seul moyen d'auto-linker un user Facebook existant est de marquer `'facebook'` comme trusted provider — discutable sécurité-wise (cf. §5.1).

Risque option B : un user qui a aujourd'hui `users.googleId='abc'` clique « signin Google » ; BA voit que l'email Google matche `users.email`, mais aucune row `account` provider=google ; passe par l'auto-link → `internalAdapter.linkAccount()` → ajoute la row `account`. Sympathique sur Google. Sur Facebook, doit forcer `trustedProviders: ['facebook']` ce qu'on **ne veut PAS** (cf. §5.1 sur l'email synthétique Facebook).

**Recommandation** (à valider §9 #1) : **Option A pour les deux providers**. Migration symétrique à la 2b. Backfill simple, idempotent (`onConflict(['provider_id','account_id']).ignore()`).

### 3.6 Hooks à ajouter dans `betterAuth({ hooks })`

Étendre l'objet `hooks.before` et `hooks.after` actuel (`packages/auth/src/index.js:91-198`) :

#### Hook before : extension du guard `isRemoved` / `isBlacklisted`

```js
// Pseudo-code
if (ctx.path === '/callback/:provider') {
  // Pas d'email dans ctx.body (c'est un callback OAuth) ; on doit attendre after.
  return;
}
```

→ Constat (cf. §3.7) : **le guard ne peut pas s'exécuter en `before` sur OAuth**, l'email/userId n'est pas connu avant que `handleOAuthUserInfo` ait tourné. Solution : guard en **after**, qui détecte la session ouverte, charge le user, vérifie `isRemoved`/`isBlacklisted`, et si oui → `internalAdapter.deleteSessions(userId)` + supprime les Set-Cookie de la réponse + redirect vers `/signin?msg=accountUnavailable`.

#### Hook after : guard post-callback

```js
if (ctx.path.startsWith('/callback/')) {
  const newSession = ctx.context.newSession;
  if (!newSession) return;
  const user = await ctx.context.internalAdapter.findUserById(
    newSession.user.id,
  );
  if (user.isRemoved || user.isBlacklisted) {
    await ctx.context.internalAdapter.deleteSessions(String(user.id));
    // Supprimer le Set-Cookie + redirect vers /signin?msg=accountUnavailable
    // (mécanisme exact à confirmer — voir §9 #4)
  }
}
```

**Caveat (cf. issue better-auth #1743)** : `ctx.context.newSession` peut être `null` dans le after hook callback de certaines versions de BA. Il faudra **vérifier sur BA 1.6.9** ; sinon recourir à `ctx.context.returned` (le Response à renvoyer) ou parser le `setCookie` qu'on s'apprête à émettre.

#### Hook after : invocation `runOnActivation` après création OAuth

`createOAuthUser` (cf. §3.7) **ne passe pas** par `users.create` Feathers, donc ne déclenche **PAS** :

- `runOnActivation` (apiKey publique, inbox, activities feed, behavioralEmails, invitations.execute)
- `dualWriteLegacyPassword` afterCreate (innocent ici, pas de password)
- `sendVerificationEmailOnCreate` (déjà bypass : `sendOnSignUp: true` BA s'en charge si `emailVerified: false`)

→ Hook after `/callback/:provider` qui détecte `isRegister: true` → load OA user → `runOnActivation(services, oaUser, optionals)`. **Couplage fort** : ça nécessite que `services` soit accessible depuis le hook BA — actuellement `Auth()` reçoit `mysqlPool` + `redis`, pas `services`. Refactor mineur : passer une callback `onAfterOAuthSignUp(user, request)` calquée sur `onEmailVerified`.

#### Database hook BA `user.create.after`

Alternative au hook after `/callback/`: `databaseHooks.user.create.after` (`hooks` BA root config). Se déclenche pour **toute** création user, y compris celle déclenchée par `/sign-in/email` signup ; il faudra gating par contexte. Probablement plus propre que de discriminer sur `ctx.path`. À discuter §9.

### 3.7 Email Facebook absent / synthétique

Cas Facebook documenté dans `auth/lib/auth.js:504-520` : refus si `profile.email` absent. À conserver côté BA. Trois options :

1. **`disableImplicitSignUp: true`** sur `facebook` : un user Facebook sans match d'`account` row existant ne crée pas de user — l'utilisateur doit cliquer un bouton « créer un compte avec mon Facebook » qui passe `requestSignUp: true`. Côté UI on n'expose pas ce flow → en pratique seuls les users **historiques avec backfill** peuvent signin Facebook.
2. **`mapProfileToUser`** qui rejette en throwant si `profile.email` absent. Plus chirurgical.
3. **Whitelist dans `before`** (impossible : pas d'email). Whitelist dans `after` du callback : si user juste créé sans email → rollback (`deleteUser` + `deleteSessions`). Lourd.

**Recommandation** (à valider §9 #5) : `disableImplicitSignUp: true` sur Facebook (cohérent avec phase-out + signup.ejs n'expose déjà pas Facebook). Pour Google, on garde signup implicite (compatible avec le bouton signup Google legacy).

### 3.8 `requireEmailVerification` ne s'applique PAS aux OAuth

`emailAndPassword.requireEmailVerification: true` (config phase 3b) bloque uniquement `/sign-in/email`. Pour OAuth :

- Google envoie `email_verified` dans le JWT → BA met `user.emailVerified=true` quand le provider l'a confirmé. Donc `users.is_activated=1` dans la table OA (mapping `emailVerified → is_activated`).
- Facebook : BA force `emailVerified: false` (`facebook.mjs:90,114`). Donc `users.is_activated=0`. Mais BA ouvre **quand même** une session post-callback (le `requireEmailVerification` ne gate pas OAuth).

**Conséquences directes** :

1. Un user créé via signup Google → `is_activated=1` → `runOnActivation` doit tourner. Hook §3.6.
2. Un user créé via signin Facebook (futur seulement, signup désactivé via `disableImplicitSignUp` recommandé) → `is_activated=0` → `runOnActivation` ne tourne PAS (sémantique OA = pas d'activation = pas de feed/apikey/etc.). Cohérent avec contrat actuel.

### 3.9 `additionalFields` au create OAuth

`packages/auth/src/index.js:270-307` déclare quatre `additionalFields` :

- `uid` (input:false, default `generateUid()`) — OK pour OAuth, généré côté DB hook.
- `salt` (input:false, default `''`) — OK, OAuth n'a pas besoin de salt.
- `isRemoved` / `isBlacklisted` (input:false, default false) — OK.
- `culture` (input:**true**, default `'fr'`) — **problème** : BA `createOAuthUser` n'a pas de moyen évident d'injecter `culture` depuis le profil. `mapProfileToUser` peut renvoyer `{ culture: profile.locale?.slice(0,2) ?? 'fr' }` mais ça nécessite que `culture` soit traité comme un champ produit par le mapping. À valider en lisant `createWithHooks` et le merge avec `additionalFields`. Sinon, fallback : la valeur defaultValue `'fr'` s'applique, et le user peut éditer `culture` via `/settings`.

---

## 4. Stratégie de migration

### 4.1 Backfill `account` rows OAuth

(Sous réserve décision §9 #1 = Option A.)

Nouvelle migration `packages/auth/migrations/20260520120000_backfill_oauth_accounts.js` :

- Source : `SELECT id, google_id, facebook_uid FROM user WHERE (google_id IS NOT NULL OR facebook_uid IS NOT NULL) AND is_removed = 0`.
- Insert dans `account` :
  - `provider_id='google', account_id=String(google_id), user_id=id, password=NULL` quand `google_id`.
  - `provider_id='facebook', account_id=String(facebook_uid), user_id=id, password=NULL` quand `facebook_uid`.
- `onConflict(['provider_id','account_id']).ignore()` — idempotent.
- Chunked à 1000 comme la 2b.
- `down`: delete provider IN ('google','facebook') AND password IS NULL (ne touche pas aux rows credential).

**Risque silencieux** : doublons côté legacy. Si deux users distincts ont `google_id='X'` (corruption historique), la migration échouera sur l'index unique `(provider_id, account_id)`. Pré-check à exécuter manuellement avant deploy :

```sql
SELECT google_id, COUNT(*) FROM user
WHERE google_id IS NOT NULL AND is_removed = 0
GROUP BY google_id HAVING COUNT(*) > 1;
```

(idem `facebook_uid`). À documenter dans la pré-deploy checklist §7.

### 4.2 Façades 307 pour les anciens liens

Les liens `/google/signin` et `/facebook/signin` peuvent être indexés (mails, share buttons) ou bookmarkés. Plusieurs approches :

| Approche                                                                                                 | Pour                                                                                      | Contre                                                                                          |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **307 redirect** vers `/api/auth/sign-in/social/?provider=google&callbackURL=…`                          | simple, transparent                                                                       | `/sign-in/social` est POST côté BA → 307 ne peut pas en faire un GET. Et on perd les optionals. |
| **Façade Express GET** qui POST vers BA en interne (pattern phase 3 `signinSubmit`)                      | conserve la logique optionals (`saveOptionals`, `restoreOptionals`, `agenda`, `redirect`) | duplique du code                                                                                |
| **Modifier les boutons** dans signin.ejs pour qu'ils POSTent directement vers `/api/auth/sign-in/social` | propre long terme                                                                         | rupture des bookmarks et liens externes                                                         |

**Recommandation** : **Façade Express GET**. Patterns disponibles :

```js
// pseudo-code
app.get('/google/signin', preMw, async (req, res) => {
  // Reproduce auth.saveOptionals + redirect
  const callbackURL = computePostSignInRedirect({ req, optionals }); // §4.3
  const baResponse = await authSvc.api.signInSocial({
    body: { provider: 'google', callbackURL },
    asResponse: true,
  });
  // baResponse.redirect carries the Google authorization URL
  authSvc.forwardSetCookieHeaders(baResponse, res); // for state cookie
  const body = await baResponse.json();
  res.redirect(302, body.url);
});
```

Idem pour Facebook + agenda-scoped (`/:agendaSlug/google/signin`). Le `/google/signup` POST devient une façade similaire avec `requestSignUp: true` si Google reste sous `disableImplicitSignUp: false`, ou simplement un alias de `/google/signin`.

Les routes `/google/signin/callback` et `/facebook/signin/callback` n'ont **aucune raison d'être conservées** — Google et Facebook console doivent être migrés sur la nouvelle URL `/api/auth/callback/google` / `/api/auth/callback/facebook` (cf. §7).

> **À décider §9 #2** : drop des routes callback legacy le jour J du deploy, ou cohabitation pendant N jours en façade ?

### 4.3 `computePostSignInRedirect`

Calqué sur `auth/lib/computePostActivateRedirect.js` (phase 3b). Calcule un path same-origin à passer en `callbackURL` qui :

- Décode `req.query.redirect` (base64) ou retombe sur `/${agenda.slug}/contribute` ou `/home`.
- Si `req.query.invitation` présent → wrap dans `/post-activate?invitation=…&next=…` (BA fait le redirect post-callback, le post-activate hop applique l'invitation comme phase 3b).
- Si l'user atterrissant a `facebookUid` non-null **après le callback** → forcer `/settings/unlinkFacebook`. Mais c'est calculé **post**-callback, pas dans le `callbackURL` initial → la logique `computeRedirect.js` actuel (utilisée par `betterAuthSignin`) fait déjà ça pour le signin email/password. Pour OAuth, le BA `callbackURL` est suivi sans repasser par notre code Express. **Solution** : utiliser le hook `after` `/callback/:provider` pour modifier le `Location` header de la réponse BA quand `user.facebookUid` est non-null. Ou laisser BA rediriger normalement et faire le redirect-to-unlinkFacebook via le `sessions.mw.load` global qui injecte `req.user` puis un middleware sur les pages d'arrivée habituelles. **À cadrer §9 #6**.

### 4.4 Façade `/users/:id/requestUnlinkFacebook` et `/unlinkFacebook/:token`

Deux flux distincts à conserver :

1. **`PATCH /users/:id/requestUnlinkFacebook`** (`packages/cibul-node/services/users/middleware/unlinkFacebook.js:10-42`) — l'user (dans Settings) saisit un email + nouveau password ; `unlinkFacebookEmail` + `unlinkFacebookPasswordHash` stockés en `user.store` ; mail envoyé avec un token `type='uf'` (legacy `tokens` table). **Pas d'impact phase 4** ; ce flux ne touche pas Passport ni `/google` `/facebook`. Reste tel quel.
2. **`GET /unlinkFacebook/:token`** (`packages/cibul-node/auth/unlinkFacebook.front.js:19`) — confirme le token `type='uf'`, applique `email + password` depuis `user.store`, **set `facebookUid: null`**. Le `users.patch` interne déclenche le hook `dualWriteLegacyPassword.afterPatch` qui mirror le password en `account.password` (credential row). Mais **rien ne supprime la row `account` provider=facebook** créée par phase 4.

**Conséquence** : après unlink, le user a `facebookUid=NULL` en DB user **mais** il a toujours une row `account` provider=facebook, accountId=<old facebook_uid>. Au prochain login Facebook (s'il a encore le compte FB lié à OA via le mapping), `findOAuthUser` matchera par accountId+providerId et le ré-attachera. Bug.

**Fix attendu** : étendre `confirmUnlinkFacebook` pour `auth.deleteAccount({ providerId: 'facebook', accountId: <facebookUid> })` ou via l'helper interne. Nouveau helper dans `internalAccount.js` (cf. §3.7 dette : `deleteCredentialAccount` doit aussi gérer OAuth — même si le naming actuel `Credential` reste valide pour le password row, on ajoutera `deleteOAuthAccount(userId, providerId)`).

### 4.5 Route `/api/auth/unlink-account` côté UI

**Hors scope phase 4** (cf. §9 #7). Google n'est pas en phase-out comme Facebook → aucun équivalent UX au flow `/settings/unlinkFacebook` à construire pour Google. Le endpoint BA `/api/auth/unlink-account` reste disponible mais n'est pas exposé côté UI.

### 4.6 Signin / signup buttons UI

Trois fichiers à muter :

- `packages/cibul-templates/auth/signin.ejs:46-67` — boutons Facebook + Google.
- `packages/cibul-templates/auth/signup.ejs:116-…` — bouton Google.

Deux approches :

| Approche                                                         | Action                                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Conservation des liens legacy                                    | Inchangé. Façade GET §4.2 fait la conversion vers BA.                                                               |
| Migration directe vers `auth.signIn.social` (better-auth client) | Switch vers form POST `/api/auth/sign-in/social` ou JS authClient. Mais ces vues sont EJS server-side, pas une SPA. |

**Recommandation** : conservation des liens legacy + façade GET. Ne pas muter les templates EJS phase 4 (cohérent avec phase 3b qui a gardé `/activate/:token` et `/password/lost`). Cleanup en phase 6.

### 4.7 Nettoyage Passport

Tant qu'il existe des callsites `passport.authenticate('local-signin', …)` (`auth/local.front.js:890-893` — encore en place « belt and braces » phase 3), Passport reste chargé. Les stratégies `google-signin`, `google-signup`, `facebook-signin` deviennent **mortes** dès que les façades GET `/google/signin` etc. n'invoquent plus `passport.authenticate('google-signin', …)`. Suppression des fichiers `auth/google.front.js` et `auth/facebook.front.js` lot 5 (cf. §5).

Les `passport-google-oauth` et `passport-facebook` packages peuvent être retirés du `package.json` cibul-node (mais pas de Passport core, encore utilisé par `local-signin`). À acter §9 #8.

---

## 5. Plan détaillé en lots

Ordre conçu pour minimiser les fenêtres de risque deploy. Chaque lot ≈ 1 commit logique.

### Lot 1 — config socialProviders + guard hooks BA (`scope: auth`)

**Fichiers** :

- `packages/auth/src/index.js` :
  - ajouter `options.google` / `options.facebook` (valider via opts).
  - injecter `socialProviders: { google?, facebook? }` (conditionnel sur les credentials).
  - étendre `hooks.after`: branche `ctx.path.startsWith('/callback/')` qui charge le user, vérifie `isRemoved`/`isBlacklisted`, deleteSessions + sanitize Set-Cookie le cas échéant.
  - ajouter callback `onAfterOAuthSignUp(user, request)` (calque `onEmailVerified`).
  - étendre `internalAccount.js` avec `deleteOAuthAccount(userId, providerId)` et utilisation dans `accountCleanup.afterRemove` (cf. §3.7 dette).
- `packages/auth/test/*` : ajouter test unitaire du guard (mock `internalAdapter.findUserById` qui renvoie `isRemoved: true` → assertion `deleteSessions` appelé).

### Lot 2 — wiring services/auth + façades Express (`scope: cibul-node`)

**Fichiers** :

- `packages/cibul-node/services/auth/index.js` :
  - lire `config.auth.google` / `config.auth.facebook` et les passer à `Auth()`.
  - implémenter `onAfterOAuthSignUp` qui charge OA user et appelle `runOnActivation(services, oaUser, optionals)` (idempotent) et `users.refresh(uid, { lastSignin: true })`.
- `packages/cibul-node/auth/google.front.js` (réécriture intégrale en façade) :
  - GET `/google/signin` + `/:agendaSlug/google/signin` : façade vers `auth.api.signInSocial({ provider: 'google', callbackURL: computePostSignInRedirect(req) })`.
  - POST `/google/signup` + `/:agendaSlug/google/signup` : idem (avec `requestSignUp: true` si on garde `disableImplicitSignUp` sur Google — cf. §9 #5).
  - **Suppression** des routes `/google/signin/callback` et `/google/signup/callback` (les callbacks parlent maintenant à `/api/auth/callback/google`).
- `packages/cibul-node/auth/facebook.front.js` (réécriture intégrale en façade) :
  - GET `/facebook/signin` + `/:agendaSlug/facebook/signin` : façade vers `auth.api.signInSocial({ provider: 'facebook', callbackURL })`.
  - **Suppression** de `/facebook/signin/callback`.
- `packages/cibul-node/auth/lib/computePostSignInRedirect.js` (nouveau, calque computePostActivateRedirect) — gère agenda, redirect, invitation.
- Garder le `auth/lib/auth.js` dans son état actuel pour l'instant (toujours utilisé par `signin()` post-OAuth callback dans le legacy ; lot 5 le simplifie).

**Validation deploy** : à ce stade, le flow OAuth nominal passe par BA. Les anciens users passent par `findOAuthUser` → branche `account not linked` (parce que pas de backfill encore) → erreur. **Donc lot 3 doit être déployé avant lot 2**, ou lot 2 doit shipper dépendant d'un feature flag. **Réordonner.** Voir §5bis.

### Lot 3 — backfill OAuth `account` rows (`scope: auth`)

**Fichiers** :

- `packages/auth/migrations/20260520120000_backfill_oauth_accounts.js` (nouveau, calque 20260429100000).
- Pre-check unicité `google_id` / `facebook_uid` documenté en commentaire.

### Lot 4 — UnlinkFacebook : drop la row `account` provider=facebook (`scope: cibul-node`)

**Fichiers** :

- `packages/cibul-node/auth/unlinkFacebook.front.js:60-68` — après le `usersSvc.patch({ facebookUid: null, … })`, appel `auth.deleteOAuthAccount(user.id, 'facebook')`.
- Test à étendre `packages/users/test/requestUnlinkFacebook.test.js` (mais ce test cible le service users seul, pas l'app — l'effet sur `account` row passe par `cibul-node/test/`).

### Lot 5 — drop Passport OAuth + cleanup (`scope: cibul-node`)

**Fichiers** :

- `packages/cibul-node/auth/lib/auth.js` — retirer `serviceCreate`, `serviceAuthenticate`, `attemptAuth`, `attemptCreate`, `process`, `serviceCallback`, `restoreOptionals`. La fonction `signin()` reste (utilisée par le fallback legacy `aa` dans `local.front.js:842`). `redirectToComplete` reste (utilisé par `signupSubmit` et `activateResend`). Renommer `auth/lib/auth.js` en `auth/lib/legacySignin.js` ou similaire — clarifier qu'il ne sert plus que de helper signin/render.
- `packages/cibul-node/package.json` — retirer `passport-google-oauth`, `passport-facebook`. Conserver `passport` (utilisé par `local-signin` strategy ; sera dropped phase 6).
- Mise à jour de `packages/cibul-node/config/index.js:519-554` (genUrl) :
  - `googleSigninCallback`, `googleSignupCallback`, `facebookSigninCallback` deviennent dead code → suppression (vérifier qu'aucun callsite externe ne les utilise).
  - `googleSignin`, `agendaGoogleSignin`, `googleSignup`, `agendaGoogleSignup`, `facebookSignin`, `agendaFacebookSignin` restent tels quels (les façades servent toujours).

### Lot 6 — env + docs (`scope: omis car non-package`)

**Fichiers** :

- `.env.sample` — pas de nouvelles variables (les credentials Google/FB legacy sont réutilisés).
- `docker-compose.yml` — idem.
- `docs/plan-migration-better-auth-phase-4.md` — ce fichier, lien depuis `analyse-authentification.md` ou un index si existant.

> Lot 6 peut être fusionné avec lot 5 ou 1 selon la propreté de l'historique. Je préconise un lot dédié.

### §5bis — Ordre de déploiement

L'ordre **commit** ≠ ordre **deploy**. Pour éviter une fenêtre où un user OAuth historique se voit refuser par BA (pas de backfill), **l'ordre deploy doit être** :

1. Lot 3 (backfill) — déployable seul, pas de changement de comportement.
2. Lot 1 (config + guards BA) — déployable seul, pas de routes BA actives sans façade.
3. Lot 2 (façades Express) — c'est ici que le flow bascule.
4. Lot 4 (unlinkFacebook drop account row) — peut être différé après stabilisation.
5. Lot 5 (cleanup Passport).

Si la branche `feat/better-auth` est mergée en un seul push (cf. phases précédentes), l'ordre d'exécution des migrations Knex (timestamp) garantit déjà que la backfill tourne avant que le code applicatif soit live.

---

## 6. Tests

### 6.1 Tests existants concernés

| Fichier                                                             | Impact phase 4                                                                                                                     |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `packages/users/test/requestUnlinkFacebook.test.js`                 | inchangé (le service `users` ne touche pas `account` directement)                                                                  |
| `packages/cibul-node/test/15_users.dualWriteLegacyPassword.test.js` | inchangé (provider=credential)                                                                                                     |
| `packages/cibul-node/test/16_users.accountCleanup.test.js`          | **étendre** : assertions sur la suppression des rows `account` provider=google/facebook lors d'un `users.remove` (cf. §3.7 dette). |
| `packages/cibul-node/test/19_auth.signinUI.betterAuth.test.js`      | inchangé.                                                                                                                          |
| `packages/cibul-node/test/21_auth.sessionLoad.hybrid.test.js`       | vérifier qu'un user OAuth-only (pas de password) charge correctement.                                                              |

### 6.2 Nouveaux tests

| Fichier proposé                                                                 | Couverture                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/cibul-node/test/28_auth.oauthFacade.google.test.js`                   | façade GET `/google/signin` répond 302 vers `accounts.google.com/o/oauth2/v2/auth?...&state=…&redirect_uri=…/api/auth/callback/google` ; cookie state BA est posé.                                         |
| `packages/cibul-node/test/29_auth.oauthFacade.facebook.test.js`                 | idem pour Facebook.                                                                                                                                                                                        |
| `packages/cibul-node/test/30_auth.oauthCallback.guards.test.js`                 | mock du callback BA (stub `authSvc.api.callback`) ; vérifie que pour un user `isRemoved: true`, la session est révoquée et le redirect amène à `/signin?msg=accountUnavailable` (ou ce qu'on aura décidé). |
| `packages/cibul-node/test/31_auth.oauthCallback.runOnActivation.test.js`        | assertion : nouveau user créé via OAuth Google → apiKey publique présente, inbox créée, feed activity créé (cf. `runOnActivation`).                                                                        |
| `packages/cibul-node/test/32_auth.oauthCallback.unlinkFacebookRedirect.test.js` | user existant avec `facebookUid` → callback Google force `/settings/unlinkFacebook` (cf. §4.3).                                                                                                            |
| `packages/cibul-node/test/33_auth.oauthBackfill.test.js`                        | exécute la migration 20260520120000 sur un dataset fixture (3 users avec mix google_id / facebook_uid / both / neither) ; assert rows `account` créées avec password=null.                                 |
| `packages/auth/test/oauthGuard.test.js`                                         | unitaire du hook BA after `/callback/*` : mock `internalAdapter.findUserById`, assertions `deleteSessions` appelé / pas appelé.                                                                            |

### 6.3 Stratégie de mock provider

Pour les tests d'intégration end-to-end OAuth, deux options :

1. **`nock`** sur `accounts.google.com/o/oauth2/v2/auth` et `oauth2.googleapis.com/token` + `https://www.googleapis.com/oauth2/v3/userinfo`. Idem Facebook (`graph.facebook.com/me`).
2. **Stub direct des méthodes BA** `auth.api.signInSocial` et `auth.api.callbackOAuth`. Plus rapide mais moins fidèle au comportement OAuth réel.

Phase 3 utilise déjà `request(app)` + supertest sans mock provider parce que les flows email/password ne sortent pas du process. Pour OAuth, **option 1 (nock) est la seule honnête** mais coûte plus en setup. Option 2 acceptable pour le guard hook test (lot 1 unit test). À cadrer dans le prompt du planner §9 #9.

### 6.4 Tests OAuth historiques absents

Pas de test OAuth Passport dans `packages/cibul-node/test/`. Pas de baseline à comparer. Les fixtures `setup.js` utilisent quelques users avec `facebookUid` peuplé (cf. `kaoreUid` dans `requestUnlinkFacebook.test.js` qui a `facebookUid: '592025090'`) — réutilisables pour la migration backfill test.

---

## 7. Pré-deploy checklist

### 7.1 Console Google Cloud

- Ajouter `https://<root>/api/auth/callback/google` à la liste des « Authorized redirect URIs » du Google OAuth 2.0 Client.
- **Conserver** `https://<root>/google/signin/callback` et `/google/signup/callback` jusqu'à confirmation que plus aucun trafic n'y arrive (lot 5 deploy + 30 jours).
- Vérifier que les scopes demandés (BA défaut : `email profile openid`) correspondent au minimum demandé en legacy (`email`, `profile`).
- Pour `accessType: 'offline'` (refresh tokens) — décision §9 #10.

### 7.2 Meta for Developers (Facebook)

- Ajouter `https://<root>/api/auth/callback/facebook` à « Valid OAuth Redirect URIs » dans Facebook Login → Settings.
- Vérifier que les permissions demandées sont `email`, `public_profile`.
- App review status : si l'app FB est en mode développement, aucun changement. Si elle est en production, vérifier qu'aucun review supplémentaire n'est requis (le redirect URI peut être ajouté sans review tant qu'il est sur le même domaine déclaré).

### 7.3 Pré-checks DB

```sql
-- Doublons google_id (devrait renvoyer 0 lignes)
SELECT google_id, COUNT(*) FROM user
WHERE google_id IS NOT NULL AND is_removed = 0
GROUP BY google_id HAVING COUNT(*) > 1;

-- Doublons facebook_uid
SELECT facebook_uid, COUNT(*) FROM user
WHERE facebook_uid IS NOT NULL AND is_removed = 0
GROUP BY facebook_uid HAVING COUNT(*) > 1;

-- Volumétrie pour estimer la durée backfill
SELECT
  SUM(CASE WHEN google_id IS NOT NULL THEN 1 ELSE 0 END) AS google_users,
  SUM(CASE WHEN facebook_uid IS NOT NULL THEN 1 ELSE 0 END) AS fb_users
FROM user WHERE is_removed = 0;
```

Si doublons : à résoudre **manuellement** avant deploy (un user à conserver, l'autre à `is_removed=1` ou à fusionner).

### 7.4 Variables d'environnement

Pas de nouvelle variable. Réutilisation directe de :

- `OA_OAUTH_GOOGLE_ID` / `OA_OAUTH_GOOGLE_SECRET`
- `OA_FACEBOOK_ID` / `OA_FACEBOOK_SECRET`

(Présentes dans `docker-compose.yml:200-203` et `.env.sample:134-137`.)

### 7.5 Migrations à exécuter

- `20260520120000_backfill_oauth_accounts.js` (lot 3) — exécutée par le deploy pipeline standard.

---

## 8. Risques & rollback

### 8.1 Risques

| #   | Risque                                                                                                                                                                | Probabilité     | Impact                                              | Mitigation                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Doublons `google_id` / `facebook_uid` historiques → migration backfill échoue                                                                                         | faible          | high (deploy bloqué)                                | Pré-check §7.3, résolution manuelle                                                                                                      |
| 2   | Google console pas mis à jour → callback `/api/auth/callback/google` rejeté par Google                                                                                | moyen           | high (signin Google KO)                             | Checklist §7.1 + smoke-test post-deploy                                                                                                  |
| 3   | `ctx.context.newSession` null en after hook callback (cf. issue BA #1743) → guard `isRemoved` ne s'arme pas                                                           | moyen           | medium (un user soft-removed pourrait signin OAuth) | Test d'intégration explicite sur BA 1.6.9, fallback : guard via DB hook `user.update.before` ou via `databaseHooks.session.create.after` |
| 4   | Email Facebook absent → user créé avec `email: NULL` impossible (BA throw) ou avec email synthétique → bug invitation                                                 | moyen           | medium                                              | `disableImplicitSignUp: true` Facebook (cf. §9 #5)                                                                                       |
| 5   | Le redirect post-OAuth bypasse `computeRedirect.js` → un user `facebookUid` peut atterrir sur `/home` au lieu de `/settings/unlinkFacebook` (régression du phase-out) | moyen           | medium (phase-out lent)                             | Hook after callback redirect override (cf. §4.3 + §9 #6)                                                                                 |
| 6   | `runOnActivation` non déclenché sur création OAuth Google → apiKey/inbox/feed manquants pour les nouveaux users Google                                                | high            | high (functional regression)                        | Hook `onAfterOAuthSignUp` lot 1 + test 31 lot 2                                                                                          |
| 7   | Row `account` provider=facebook persiste après unlink → re-link silencieux au prochain login Facebook                                                                 | high            | medium                                              | Lot 4 (cleanup)                                                                                                                          |
| 8   | `accountCleanup` n'efface pas les rows OAuth → fuite de données account après `users.remove`                                                                          | high (existant) | medium                                              | Lot 1 (extension internalAccount.js)                                                                                                     |

### 8.2 Plan de rollback

| Lot | Rollback                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Revert commit. Hook BA n'existe plus, comportement défaut BA.                                                                                                                                                                                                                                      |
| 2   | Revert commit cibul-node ; **PROBLÈME** : les façades disparaissent et les liens `/google/signin` retombent sur la version Passport supprimée. **Solution** : revert lot 5 d'abord, puis lot 2 — Passport revient. Ou : ne pas merger lot 5 avant que lot 2 soit en prod stable depuis 2 semaines. |
| 3   | `down` migration : delete provider IN ('google','facebook') AND password IS NULL. Idempotent.                                                                                                                                                                                                      |
| 4   | Revert commit. Le row `account` n'est plus deleted ; au prochain login Facebook le user redevient lié. **Pas de perte de données.**                                                                                                                                                                |
| 5   | Revert commit, restore Passport et ses `passport-google-oauth` / `passport-facebook` dans package.json.                                                                                                                                                                                            |

### 8.3 Coexistence Passport ↔ BA

Pendant la fenêtre lot 1 + lot 2 (BA actif sur les façades) **avant** lot 5 (Passport supprimé), Passport reste **chargé** mais ses stratégies google/facebook ne sont plus invoquées. Pas de risque actif, juste du code mort temporaire.

---

## 9. Décisions tranchées

### #1. Backfill `account` rows OAuth — **Tranché : backfill**

Backfill explicite (Option A §3.5 / §4.1), symétrique à la backfill 2b. Lazy linking dépend de la signal `emailVerified` côté provider — Google OK, Facebook **toujours `false`** côté BA → forcerait à mettre Facebook dans `trustedProviders`, ce qu'on **ne veut PAS** (cf. #5). Backfill résout les deux providers d'un coup et rend le comportement déterministe.

**Coût** : une migration Knex de plus, pré-check unicité §7.3.

### #2. Façade `/google/signin/callback` `/facebook/signin/callback` — **Tranché : drop direct**

Les Google/Facebook console ne renvoient des callbacks que vers les redirect URIs déclarées. On re-déclare `/api/auth/callback/<provider>` **avant** le deploy puis on retire les redirect URIs legacy **après** confirmation du nouveau flow. La cohabitation 307 ne sert à rien : la façade `/google/signin/callback` ferait un 307 vers `/api/auth/callback/google` mais le state cookie BA ne matchera pas (cookie posé par BA pré-redirect, mais Passport ne posait pas le même cookie). Cohabitation utile = nulle.

Le risque d'un utilisateur en plein milieu d'un OAuth flow au moment du deploy (state cookie chez lui, redirect vers callback legacy → 404) est minime (fenêtre ~30s) et accepté.

### #3. Twitter — **Tranché : ne rien faire phase 4**

Stratégie Passport référencée par `auth/lib/auth.js:19,21,26` mais aucune stratégie câblée (`grep -rn "twitter-signin\|twitter-signup"` → rien). Pas de bouton UI, pas de config provider active. Mort-vivant documenté. Drop des références phase 6 (avec `users.twitter_id`, `users.twitter_screen_name`).

### #4. `ctx.context.newSession` fiable en after hook callback — **Tranché : fiable, on l'utilise**

Vérifié dans le source BA 1.6.9 :

- `dist/oauth2/callback.mjs:164` → `setSessionCookie(c, { session, user })`
- `dist/cookies/index.mjs:134` → `ctx.context.setNewSession(session)` avant le redirect
- `dist/api/to-auth-endpoints.mjs:143` → after hooks sur le même `ctx.context`, `newSession` posée

Confirmé aussi par `node_modules/better-auth/dist/plugins/multi-session/index.mjs` (plugin officiel utilisant le pattern) et par notre propre `packages/auth/src/index.js:142-144` (déjà utilisé sur `/sign-in/email` depuis phase 3).

**Fallback documenté** (non requis) : `databaseHooks.session.create.after` si jamais.

### #5. `disableImplicitSignUp` sur Facebook — **Tranché : oui (FB), non (Google)**

`disableImplicitSignUp: true` sur Facebook (le signup FB n'est plus exposé dans `signup.ejs`, signin uniquement pour users déjà backfillés ; user qui change d'identifiant FB → message « contactez le support »).

`disableImplicitSignUp: false` sur Google (le signup Google reste fonctionnel — Google n'est **pas** en phase-out, contrairement à Facebook).

### #6. Redirect post-callback vers `/settings/unlinkFacebook` — **Tranché : Option A (after hook BA réécrit Location)**

Approche chirurgicale, rend le phase-out FB transparent. Dans le hook `after` matchant `ctx.path.startsWith('/callback/facebook')` :

- charger le user via `ctx.context.internalAdapter.findUserById(ctx.context.newSession.user.id)`
- si `user.facebookUid` non-null → muter le `Location` header de la réponse vers `${baseURL}/settings/unlinkFacebook`

Pas de middleware Express global (overhead sur toutes les routes authentifiées). Pas d'abandon du phase-out (divergence inacceptable avec le comportement legacy).

### #6.bis. Verified linking pour les users OA existants sans backfill (lot 4.5) — **Tranché : verified linking via `errorCallbackURL` + `/link-social`**

Le strict mode initial (`accountLinking.enabled: false`) bloquait aussi le cas légitime « j'ai un compte OA email/pwd, je veux ajouter Google ». Le user clique Google → BA matche par email mais row `account` absente → `error=account_not_linked`.

Solution implémentée (lot 4.5) :

- `accountLinking.disableImplicitLinking: true` au lieu de `enabled: false`. Bloque toujours l'auto-link silencieux au callback OAuth, mais autorise le flux explicite `/link-social` (qui exige une session active).
- `accountLinking.trustedProviders: ['google']`. Whitelist Google pour le flux `/link-social` (BA `account.mjs:145` gate `!trustedProviders.includes(provider) && !emailVerified` → false → pass). Facebook reste exclu : son `email_verified` est toujours `false` côté BA → `/link-social` le refuse, ce qui matche la politique de phase-out.
- Façade `google.front.js` passe `errorCallbackURL: '/auth/signin?linkProvider=google'` au `signInSocial`. BA y redirige sur `account_not_linked` (le path Next post-merge main est `/auth/signin`, pas `/signin`).
- Page Next `app/[locale]/(app)/auth/signin/page.tsx` lit `searchParams.linkProvider`/`linkError`, passe via `SigninPageClient` à `Signin.tsx` qui :
  - Affiche un bandeau Alert « Confirme ton mot de passe pour lier Google » (status `info`) ou « Linking failed » (status `error` si `linkError=1`).
  - Cache la section OAuth (boutons Google/Facebook + séparateur "or") quand `linkProvider` est set — l'user n'a plus à choisir un provider, il complète le linking en cours.
  - Ajoute `linkProvider` au body du POST `/signin`.
- POST `/signin` (cibul-node) → après `signInEmail` réussi, lit `req.body.linkProvider`. Si `'google'` : appel interne `auth.api.linkSocialAccount({body: {provider: 'google', callbackURL: '/home', errorCallbackURL: '/auth/signin?linkProvider=google&linkError=1', disableRedirect: true}, headers: authSvc.toHeaders(req, result)})`. Récupère `body.url` (URL Google) et redirige le user dessus tel quel. Le navigateur a encore une session Google active du 1er flow → Google fait un silent re-auth (sans re-prompter le consent) → callback BA voit la session BA active + `link={userId, email}` du state → branche linking dans `callback.mjs` → `internalAdapter.createAccount` provider=google → set session cookie → redirect `/home`. Atomique.

Sécurité :

- Password challenge = preuve de possession du compte OA (le user doit avoir le mot de passe).
- 2e OAuth flow = preuve de possession du compte Google (silent en pratique, le browser cookie Google est encore vivant).
- Aucune info Google stockée temporairement côté serveur OA.

UX :

- Cas nominal : 1 password challenge + 1 redirect Google silencieux → indistinguable d'un flow atomique.
- Cas dégradé (user expulsé de la session Google entre les deux flows, rare) : Google demande à re-confirmer le compte ; +1 clic. Pas de `prompt=none` qui forcerait un échec dans ce cas — on laisse Google décider.

Fichiers touchés (lot 4.5) :

- `packages/auth/src/index.js` : config `accountLinking` (`disableImplicitLinking: true`, `trustedProviders: ['google']`).
- `packages/auth/test/10_oauth_config.test.js` : test ajusté.
- `packages/cibul-node/auth/google.front.js` : `errorCallbackURL: '/auth/signin?linkProvider=google'`.
- `packages/cibul-node/auth/local.front.js` : branche `linkProvider` dans `signinSubmit` POST → `linkSocialAccount`.
- `packages/next/src/components/auth/Signin.tsx` : props `linkProvider`/`linkError`, bandeau Alert, hidden `linkProvider` injecté dans body, OAuth section cachée en mode link.
- `packages/next/src/app/[locale]/(app)/auth/signin/_components/SigninPageClient.tsx` + `page.tsx` : propagation des searchParams.
- `packages/next/src/components/auth/locales/{en,fr}.json` : labels `linkProviderGoogleNotice` + `linkProviderError`.

### #7. Exposer `unlink-account` côté UI — **Tranché : non**

Pas de bouton « délier mon compte Google » : Google n'est **pas** en phase-out, on garde le provider pleinement actif. Pas d'équivalent UX au flow `/settings/unlinkFacebook` à construire pour Google. Décision à reconsidérer hors plan auth si un besoin produit émerge.

### #8. Drop des packages `passport-google-oauth` et `passport-facebook` — **Tranché : oui**

Retirés du `package.json` cibul-node au lot 5 (après que les façades BA soient stabilisées en prod). `passport` core reste (utilisé par `local-signin` jusqu'à phase 6).

### #9. Stratégie de mock provider pour les tests OAuth d'intégration ?

**Tranché : msw.**

Justification :

- msw `^2.3.0` est déjà la stack standard du monorepo (15+ packages, dont pattern serveur dans `packages/cibul-node/test/core.agendas.events.create.passCulture.test.js` via `setupServer` + `http.get/post` de `msw/node`).
- BA social providers utilisent `@better-fetch/fetch` (wrapper sur native `fetch`) — msw 2.x intercepte fetch natif via undici, donc aucun monkey-patch http.request requis (contrairement à nock historiquement fragile sur native fetch Node 18+).
- Pattern à dupliquer : intercepter `https://oauth2.googleapis.com/token`, `https://www.googleapis.com/oauth2/v3/certs`, `https://graph.facebook.com/me`, `https://graph.facebook.com/v15.0/oauth/access_token` (cf. URLs hardcodées dans `node_modules/better-auth/node_modules/@better-auth/core/dist/social-providers/{google,facebook}.mjs`).

Stub BA méthodes (`auth.api.signInSocial`) pour les tests unitaires du guard hook (rapide, pas besoin du flow OAuth complet) ; msw pour les tests end-to-end (façade GET → BA → provider mocké → callback → session ouverte).

### #10. `accessType: 'offline'` Google (refresh tokens) — **Tranché : non**

Le legacy Passport ne demandait pas de refresh token (`google.front.js:10-14` n'a pas `accessType`). Aucune feature OA ne dépend d'un refresh token Google aujourd'hui. On maintient le défaut BA (`accessType` non précisé = pas de refresh). Plus sobre côté privacy + UX (pas de prompt consent screen répété). Cohérent avec le legacy.

---

## 10. Annexe — fichiers de référence

| Fichier                                                                                      | Rôle                                                             |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/auth/src/index.js`                                                                 | config better-auth, hooks, helpers                               |
| `packages/auth/src/internalAccount.js`                                                       | helpers low-level adapter                                        |
| `packages/auth/migrations/20260428120000_create_better_auth_tables.js`                       | schéma `account` + `verification`                                |
| `packages/auth/migrations/20260429100000_backfill_legacy_passwords.js`                       | gabarit de la backfill OAuth phase 4                             |
| `packages/cibul-node/services/auth/index.js`                                                 | wiring `Auth()` + callbacks                                      |
| `packages/cibul-node/auth/google.front.js`                                                   | legacy Google routes                                             |
| `packages/cibul-node/auth/facebook.front.js`                                                 | legacy Facebook routes                                           |
| `packages/cibul-node/auth/unlinkFacebook.front.js`                                           | confirme migration FB → email/password                           |
| `packages/cibul-node/auth/lib/auth.js`                                                       | helper Passport partagé OAuth                                    |
| `packages/cibul-node/auth/lib/computeRedirect.js`                                            | redirect post-signin                                             |
| `packages/cibul-node/auth/lib/computePostActivateRedirect.js`                                | gabarit pour `computePostSignInRedirect`                         |
| `packages/cibul-node/auth/local.front.js`                                                    | exemple de façade signin BA-routed (phase 3)                     |
| `packages/cibul-node/services/users/middleware/unlinkFacebook.js`                            | flow request unlink                                              |
| `packages/cibul-node/services/users/hooks/accountCleanup.js`                                 | cleanup BA `account` à compléter pour OAuth                      |
| `packages/cibul-node/services/users/hooks/dualWriteLegacyPassword.js`                        | mirror password — pas affecté phase 4                            |
| `packages/users/migrations/20190812170942_create_user_table.js`                              | schéma user (colonnes `google_id`, `facebook_uid`, `twitter_id`) |
| `packages/cibul-templates/auth/signin.ejs`                                                   | UI signin (boutons FB + Google)                                  |
| `packages/cibul-templates/auth/signup.ejs`                                                   | UI signup (bouton Google seulement)                              |
| `packages/cibul-node/server.js:75-83`                                                        | mount `/api/auth/*` BA handler                                   |
| `node_modules/better-auth/dist/oauth2/link-account.mjs`                                      | source BA `handleOAuthUserInfo`                                  |
| `node_modules/better-auth/dist/db/internal-adapter.mjs:39-71,390-443`                        | `createOAuthUser`, `findOAuthUser`                               |
| `node_modules/better-auth/node_modules/@better-auth/core/dist/social-providers/facebook.mjs` | `emailVerified: false` toujours                                  |
| `node_modules/better-auth/node_modules/@better-auth/core/dist/social-providers/google.mjs`   | `emailVerified: profile.email_verified`                          |
| `docker/nginx/server_params:129,246-256,304`                                                 | nginx routes OAuth                                               |
| `docker-compose.yml:200-203`                                                                 | env OAuth                                                        |
| `.env.sample:134-137`                                                                        | sample env OAuth                                                 |

---

## Résumé exécutif

Phase 4 est **plus simple structurellement** que 3b : pas de coordination avec Feathers tokens table (`type='aa'` / `type='lp'`), pas de hybrid token format. Mais elle **introduit** trois sources de complexité nouvelles :

1. Le hook `runOnActivation` doit être plombé sur la création OAuth (BA crée user via internalAdapter, court-circuite Feathers users).
2. Le guard `isRemoved`/`isBlacklisted` doit s'appliquer post-callback, pas pre — l'email n'est pas connu avant le callback.
3. Le phase-out Facebook (`computeRedirect.js`) doit être préservé sans repasser par notre code Express post-callback.

Le **backfill des `account` rows** est la pièce maîtresse : il découple complètement les nouveaux users (créés par BA) des anciens (avec `users.facebookUid`/`googleId`) sans leur faire subir un re-linking conditionnel.

Le wiring nginx + env est inchangé : tout le trafic OAuth nouveau va via `/api/auth/*` qui existe déjà.

L'effort est concentré sur 3 packages : `@openagenda/auth` (config + hooks), `cibul-node` (façades + cleanup unlink), et une migration Knex.
