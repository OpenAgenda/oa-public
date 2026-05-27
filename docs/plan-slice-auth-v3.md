# Slice auth v3 — modernisation des clés API (better-auth api-key)

État au démarrage : l'API v3 (`packages/cibul-node/api-v3/`, montée sur `/v3`) expose les endpoints de lecture events (tranches 1-4 : mapping, curseur opaque, traducteur de filtres strict). L'auth y est encore celle de v2, réutilisée verbatim. La migration **better-auth** est mergée (phases 1-6, PR #77) : BA possède les **sessions interactives** et **ne touche pas** aux tokens API (`verifyAndLoadAccessTokenUser.js` / `verifyAndLoadAgendaOrUserFromKey.js` marqués « hors scope » dans le plan de migration). La gestion des clés API est donc à nous.

Ce document est le plan de la tranche auth de v3 : il fixe les décisions et une **séquence de déploiement par paliers**, chacun sûr isolément, **sans invalider de clé existante ni de connexion en cours**.

---

## 1. Constat — l'état actuel des clés API

Il existe **deux chemins séparés**, et le service `@openagenda/keys` n'en possède qu'un.

| Concept                                                                | Table                                       | Propriétaire du code       | Stockage                | Cardinalité          |
| ---------------------------------------------------------------------- | ------------------------------------------- | -------------------------- | ----------------------- | -------------------- |
| Clés **agenda** (`agendaFullRead`) + legacy `userPublic`/`userPrivate` | `key` (`migrations/20170711112335`)         | service `@openagenda/keys` | **clair** (uuid 32 hex) | **multi** par agenda |
| **Paire user** public/secret                                           | `api_key_set` (`migrations/20260422120000`) | `cibul-node` direct        | **clair**               | **1 ligne** par user |

Les deux sont synchronisées par fan-out : `users/hooks/generateApiKey.js` écrit les `userPublic`/`userPrivate` dans la table `key` via le service, puis `cibul-node/services/users/lib/onGenerateApiKey.js` recopie `api_key`/`api_secret` dans l'unique ligne `api_key_set`. **Les clés user vivent déjà dans la table `key`** ; `api_key_set` n'est qu'un **miroir** pour le fast-path d'auth et le minting de tokens.

### Schéma des deux tables

**`key`** (`20170711112335_create_key_table.js`) : `id`, `type`, `identifier` (uid user ou agenda), `label`, `key` (indexé, non-unique), `created_at`.

**`api_key_set`** (`20260422120000_create_api_key_set_table.js`) : `id`, `api_key` (varchar32, UNIQUE), `api_secret` (varchar32), `type` (bigint), `user_id`, `application_id` (inutilisé), `created_at`, `updated_at`.

### Chemins de vérification

- **User** : `verifyAndLoadAgendaOrUserFromKey.js:49` → `core.users.get.byPublicKey` → `getUserFromKey.js` lit `api_key_set` (par `api_key` ou `api_secret`). Token `tk-` : `verifyAndLoadAccessTokenUser.js` → `getUser.js` → `access_token` joint sur `api_key_set_id`. Minting : `generateTokenFromSecretKey.js` (HMAC-SHA256, **salt en dur `'okilydokily'`**, TTL 1h).
- **Agenda** : `verifyAndLoadAgendaOrUserFromKey.js:58-61` et `services/agendas/middleware.js:42-46` → service `keys({ type:'agendaFullRead', key }).get({ cache:true })` → table `key`.

### Trous identifiés

1. **Enveloppe d'erreur incohérente sur v3.** `verifyAndLoadAgendaOrUserFromKey.js:72` répond `res.status(403).json({ message })` brut (court-circuite l'enveloppe `{error:{code,message}}` de v3) **et 403 là où 401 est correct** (credentials absents/invalides). `verifyAndLoadAccessTokenUser.js:35` fait `res.status(403).json({ error: <string> })`. La branche **401 du contrat est inatteignable** sur v3 aujourd'hui.
2. **Stockage en clair**, **une seule paire par user**, **aucun scope**, **aucun rate-limit** sur le chemin clé, **révocation latence ~1h** (cache), `Bearer` surchargé (clé publique nue vs `tk-`).
3. **Blacklist** vérifiée à 4 endroits / 2 mécanismes (asymétrique).
4. Consommateurs de la **valeur** de clé hors réglages : SDK passCulture (`packages/registrations/passCulture/lib/PassCultureSDK.js`), supervisor (`services/supervisor/users/`), mails (`services/mails/lib/utils.js`), `/me` (`api/index.js`).

---

## 2. Décisions actées

1. **Adopter le plugin `@better-auth/api-key`** (package séparé `@better-auth/api-key@^1.6.11`, même découpage que `@better-auth/core`/`redis-storage`/`utils` déjà installés). Export `apiKey`, `apiKeyClient`, `defaultKeyHasher`. Peer dep ⇒ **bump BA 1.6.9 → 1.6.11** sur toute la ligne `@better-auth/*`.
2. **Hasher les clés** (recommandé). Conséquence UX **actée** : la page de réglages passe de « affiche toujours la clé » à **« clé montrée une seule fois à la création »** + préfixe masqué + régénérer. Le **backfill hashe les clés existantes ⇒ elles continuent de fonctionner** (intégrations embarquées intactes), simplement non ré-affichables.
3. **Préfixes Stripe-style** : `oa_pk_` (publishable, read-only) / `oa_sk_` (secret, read+write direct en Bearer, **sans** échange de token). Transport unique `Authorization: Bearer`.
4. **Ownership via `referenceId`** (champ générique `string, required` du plugin) : `user uid` pour les clés user, `agenda:<uid>` pour les clés agenda. **Pas** le plugin `organization` de BA (rejeté en migration). Les endpoints self-service du plugin sont scopés `referenceId === session.user.id` ⇒ les **clés agenda sont pilotées par nos endpoints agenda-admin** appelant `auth.api.*` côté serveur (cohérent avec le RBAC `@openagenda/members`).
5. **Scopes** (nouvelles clés D3+) : `permissions: Record<string,string[]>` (ex. `{ events: ['read','write'] }`), mappés aux tiers de visibilité ; `transverse_api_access` conditionne l'action `events:transverse`. Les clés **legacy backfillées restent non-restreintes** (`permissions: null`) — le tier porte le cap. **Modèle figé en §5.1.**
6. **Découpler `users` des clés** : `users` ne gère plus le cycle de vie des clés (suppression des resolvers `apiKey`/`apiSecret`, hooks `generateApiKey`/`searchByKey`). Le lookup inverse (clé → propriétaire) passe dans le store de clés / l'auth. La page de réglages appelle des **endpoints clés dédiés**, plus `getMe` détaillé.
7. **Supprimer `packages/keys`** : relocaliser ses migrations (**inchangées**) dans `cibul-node/migrations/legacy/`, déplacer le runtime, supprimer le package. Voir §4.
8. **`tk-` : abandonné sur v3, gelé sur v2.** v3 n'introduit **jamais** l'échange `/requestAccessToken` — `oa_sk_` écrit en **Bearer direct** (§5.2). v2 **conserve** son flux `tk-` (`access_token` + `generateTokenFromSecretKey` + salt `okilydokily`) tel quel (surface gelée) ; son retrait global est lié à l'EOL de v2, **hors scope** de cette tranche.
9. **Multi-clés nommées pour les users** (« Applications ») — gratuit avec le plugin (`apikey` multi par `referenceId`).
10. **Aucun commit avant review.** Séquence applicable **palier par palier**, plusieurs déploiements espacés.

---

## 3. Faits techniques vérifiés (plugin `@better-auth/api-key@1.6.11`)

- Schéma `apikey` (`dist/index.mjs:1939`) : `id`, `configId`, `name`, `start`, `referenceId` (**required, générique, indexé**), `prefix`, `key` (indexé), `refillInterval`/`refillAmount`/`lastRefillAt`, `enabled`, `rateLimitEnabled`/`rateLimitTimeWindow`/`rateLimitMax`/`requestCount`, `remaining`, `lastRequest`, `expiresAt`, `createdAt`, `updatedAt`, `permissions` (string JSON), `metadata` (string JSON).
- **Hashing** : `disableKeyHashing` existe (`dist/index.mjs:2087`) mais **on hashe** (défaut). `defaultKeyHasher` est exporté ⇒ utilisable pour **backfiller** les clés existantes (on détient le plaintext aujourd'hui).
- `verifyApiKey({ key, permissions? })` → `{ valid, error, key: Omit<ApiKey,'key'> }` — **pas d'hydratation de session/user**. Idéal : notre middleware v3 appelle `verifyApiKey`, puis charge le user/agenda OA depuis `referenceId`, en gardant **100 % le contrôle de l'enveloppe + 401/403**.
- `createApiKey` est **server-callable** (in-process, sans session). **Pas de champ `referenceId`** dans le body : avec `references:"user"` (notre config), un appel serveur dérive `referenceId` de `userId` ⇒ on **encode l'owner dans `userId`** (`"<uid>"` / `"agenda:<uid>"`, vérifié `dist/index.mjs:745-757`). `permissions`/`rateLimit*`/`refill*`/`remaining` sont **server-only** (rejetés sur un appel client, `:725`). Le plaintext n'est rendu **qu'à la création**.
- ⚠️ **`listApiKeys`/`getApiKey`/`updateApiKey`/`deleteApiKey` sont `session-gated`** (`use: [sessionMiddleware]`, scopés sur `session.user.id` — `:881`,`:1115`) : **pas appelables server-side**, et **incapables d'adresser une clé agenda** (`referenceId = agenda:<uid>` ≠ user de session). ⇒ list/revoke OA passent par l'**adapter** (`instance.$context.adapter`, modèle `'apikey'`), le même escape hatch que `createCredentialHelpers`, et non par ces endpoints. (`deleteAllExpiredApiKeys` auto-purge, cooldown 10 s.)
- Rate-limit par clé sur **secondaryStorage** (Redis déjà câblé) ; les **clés** elles-mêmes sont en **storage base** (table `apikey`) — d'où la lecture list/revoke via l'adapter base.

---

## 4. Système de migrations — pourquoi `cibul-node/migrations/legacy/`

`scripts/migrate.js` appelle `knex.migrate.latest({ directory: migrationDirectories() })` avec un **tableau de répertoires** (`lib/migrationDirectories.js`). Conséquences vérifiées :

- **Un seul ledger** `knex_migrations`, ordonné par **nom de fichier** (timestamp), d'où les timestamps entrelacés entre packages.
- Knex traque par **basename**, pas par chemin ⇒ **déplacer un fichier de migration sans le renommer** ne le re-déclenche pas (déjà enregistré), et le recrée sur base neuve depuis le nouvel emplacement.
- **Supprimer** un fichier de migration ⇒ knex lève _« migration directory is corrupt, files missing »_. D'où : **relocaliser, jamais supprimer**.

**Action** : ajouter une entrée générique `legacy: path.join(packages, 'cibul-node/migrations/legacy')` dans `byService` (réutilisable pour tout futur package supprimé), y déplacer les migrations de `packages/keys`, retirer l'entrée `keys`. Les tables `key`/`api_key_set` seront droppées par une migration **forward ultérieure** (après la fenêtre de fallback), pas en éditant l'historique.

---

## 5. Cible

Store unique **`apikey`** (plugin, migration dans `packages/auth/migrations`) : hashé, multi-clés, `referenceId` (`<uid>` user / `agenda:<uid>`), `permissions` = scopes, `prefix` `oa_pk_`/`oa_sk_`, `expiresAt`, `enabled` (révocation), rate-limit par clé.

- **Helpers OA** dans `@openagenda/auth` (`createApiKeyHelpers(instance)`, calqué sur `createCredentialHelpers`, liés sur l'instance) : `verifyKey`, `createUserKeyPair` (pk+sk, archétypes), `createUserKey` (sk nommée additionnelle), `createAgendaKey` **au-dessus de `auth.api.*`** (server-callable) ; `listUserKeys`/`listAgendaKeys`/`revokeUserKey`/`revokeAgendaKey` **via l'adapter** (`auth.api.list/delete` étant session-gated). L'encodage `referenceId` et l'ownership du store vivent là ; revoke est scopé `id`×`referenceId`.
- **Auth v3** : middleware propre à v3 qui classe le Bearer (`oa_pk_`/`oa_sk_`/legacy), `verifyApiKey`, applique les scopes, charge user/agenda depuis `referenceId`, mappe `NotAuthenticated`→401 / `Forbidden`→403 dans l'enveloppe `{error}`. **Modèle figé en §5.2** (Bearer direct, deux axes, pas de `tk-`).
- `packages/keys` supprimé ; `api_key_set` + `access_token` + `tk-` retirés ; `users` découplé.

### 5.1 Modèle de scopes ↔ tiers de visibilité _(figé)_

Le modèle de visibilité de `core` (vérifié) repose sur un **niveau d'accès** calculé par `loadSearchAccess.js` :

| `access`                      | Origine                                     | États visibles                                       | Champs     |
| ----------------------------- | ------------------------------------------- | ---------------------------------------------------- | ---------- |
| `null`                        | anonyme (pas de `userUid`)                  | publié uniquement (`state === 2`)                    | publics    |
| `'public'`                    | user authentifié **non-membre** de l'agenda | publié uniquement                                    | publics    |
| `reader` / `contributor`      | membre                                      | publié + ses propres contributions (via `memberUid`) | selon rôle |
| `moderator` / `administrator` | membre (ou **agenda key** sur son agenda)   | tous (filtre `state` autorisé)                       | selon rôle |
| `'internal'`                  | superadmin / système                        | tous                                                 | tous       |

(`filterAuthorizedSearchFields.js` : `internal` ou `≥ moderator` ⇒ requête complète ; sinon `state` retiré. Champs de réponse filtrés par rôle via formSchema + `filterEventByRole`.)

**Principe directeur** : un scope **ne peut jamais élever** au-delà de l'autorisation du propriétaire de la clé ; il **atténue**. L'autorisation effective vient de `loadSearchAccess` (rôle de membre du propriétaire), le scope plafonne l'**opération** (read/write).

**Scopes canoniques** — vocabulaire des **nouvelles clés (D3+) uniquement** (les clés legacy backfillées sont non-restreintes, cf. §Backfill). Format `resource:action`, mappé sur `permissions: Record<string,string[]>` du plugin (clé = resource, valeurs = actions), **limité aux ressources réellement exposées par l'API** (`agendas`, `events`, `locations`, `members`) :

`events:read`, `events:write`, `agendas:read`, `agendas:write`, `locations:read`, `locations:write`, `members:read`, `members:write`, et l'action transverse `events:transverse` (cross-agenda). (`registrations` n'a **pas** de route API — écarté du vocabulaire.)

**Règles par type de clé** (le tier effectif vient du _type de clé_ × _propriétaire_, pas du seul scope) :

| Type de clé (`referenceId`)      | Tier effectif imposé                                          | Scopes autorisés                                                                      | `userUid` passé à `core`                             |
| -------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **`oa_pk_`** (user, publishable) | **public** (toujours, même si le propriétaire est modérateur) | actions **`read` uniquement** (`events:read`, `agendas:read`, …)                      | **non** ⇒ `access = null/public` (verrou structurel) |
| **`oa_sk_`** (user, secret)      | **tier du propriétaire** (par agenda, via son rôle)           | `read` + `write` ; `events:transverse` **seulement si** `owner.transverse_api_access` | **oui** (`userUid = referenceId`)                    |
| **agenda key** (`agenda:<uid>`)  | **administrator de son agenda** (= legacy `agendaFullRead`)   | `read` (+ `write` si accordé), pas de transverse (scopé à l'agenda)                   | n/a (`agendaKey` ⇒ `access='administrator'`)         |

Conséquences :

- Une `oa_pk_` avec une action `:write` ⇒ **400 à la création** (publishable = read-only par définition). Le verrou « public » est **structurel** : v3 ne passe pas `userUid` pour une pk, donc `loadSearchAccess` retourne `null` — une pk de modérateur ne peut pas fuiter de brouillons.
- Une `oa_sk_` agit au tier du propriétaire : `events:read` voit ce que le propriétaire voit (publié partout + non-publié dans ses agendas membres, champs selon rôle) ; `events:write` écrit là où il est `contributor+`.
- `events:transverse` n'est accordable qu'à une clé dont le propriétaire a `transverse_api_access` (sinon 400) — réserve l'endpoint cross-agenda (hors surface v3 actuelle).
- **Double application** : le scope est vérifié à `verifyApiKey({ permissions })` (l'opération) ; le tier est appliqué en passant/ne passant pas `userUid` à `core` (la visibilité).

**Backfill (D2) — `permissions: null` (non-restreint), fidèle au comportement actuel** :

Les clés legacy sont aujourd'hui **non-restreintes par ressource** : elles authentifient _en tant que user_, et c'est le **rôle** du propriétaire (+ `transverse_api_access`) qui gouverne l'accès à toutes les ressources. Énumérer une matrice de scopes par ressource sur ces clés serait à la fois faux (`registrations` n'existe pas) et risqué (toute ressource oubliée deviendrait une régression à l'enforcement D6). Le backfill stocke donc, par clé, uniquement la classification de tier :

| Clé legacy                   | `referenceId`  | `metadata.oaKind` | `permissions` |
| ---------------------------- | -------------- | ----------------- | ------------- |
| `userPublic` / `api_key`     | `<uid>`        | `pk`              | `null`        |
| `userPrivate` / `api_secret` | `<uid>`        | `sk`              | `null`        |
| `agendaFullRead`             | `agenda:<uid>` | `agenda`          | `null`        |

Le cap effectif reste le **tier**, porté par `metadata.oaKind` et appliqué au request-time (D6 : `pk` → public/read-only, `sk` → tier propriétaire read+write, `agenda` → admin de l'agenda). Les scopes par-ressource sont réservés aux **nouvelles clés (D3+)**, où le propriétaire choisit explicitement un sous-ensemble. `rate_limit_enabled: false` (legacy = pas de rate-limit). Hash déterministe ⇒ backfill idempotent (delete-then-insert par `referenceId`×`oaKind`).

### 5.2 Modèle d'auth v3 _(acté)_

v3 est la surface où le modèle de clés se modernise (v2 reste **gelée**, cf. décision #8 / D4). Deux principes.

**Bearer direct, pas de `tk-`.** Sur v3, une `oa_sk_` présentée en `Authorization: Bearer` **lit et écrit** directement, au tier de son propriétaire — aucun échange `/requestAccessToken`. Le détour `tk-` est un héritage v2 ; v3 ne l'introduit jamais. La « carotte » de migration v2→v3 est précisément la suppression de la danse du token.

**Deux axes orthogonaux.** Ce qu'une clé peut faire se décompose en deux dimensions **indépendantes** — et les scopes **ne peuvent pas** exprimer la seconde :

| Axe                    | Question            | Mécanisme                                                                                   |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| **Opération**          | _quelles actions ?_ | **scopes** (`permissions`, §5.1) : `events:read`, `events:write`, …                         |
| **Tier de visibilité** | _en tant que qui ?_ | **kind** (`oaKind` `pk`/`sk`/`agenda`) : **structurel**, via le passage ou non de `userUid` |

Une clé scopée `events:read` mais appartenant à un modérateur, **si elle passe `userUid`**, voit quand même ses brouillons. « Read-only » ≠ « public ». Seule une **pk — qui ne passe jamais `userUid`** — garantit _publié uniquement / champs publics_, donc **embarquable côté client** sans risque. Le verrou public est **structurel**, indépendant des scopes (§5.1 « double application »).

**Clés multiples nommées, pas de paire figée.** Une clé = un `oaKind` (`pk`|`sk`) **+** un sous-ensemble de scopes. Archétypes par défaut (99 % des usages) : une **pk** (lecture, publique, embarquable) + une **sk** (lecture+écriture, tier propriétaire). Les « Applications » sont des **sk nommées additionnelles** scopées (ex. une clé `events:write` seule pour un connecteur d'import) — gratuit avec le plugin (multi par `referenceId`). Le **couplage 1 pk + 1 sk n'est pas imposé** ; les _kinds_ le sont (porteurs du verrou de tier). Garde-fous (D6) : `pk` + action `:write` → **400** ; une `sk` ne dépasse **jamais** le rôle de son propriétaire (le scope atténue, n'élève pas).

---

## 6. Séquence de déploiement

Chaque palier est **déployable et réversible isolément**. `→` = peut suivre immédiatement ; `⏸` = nécessite une fenêtre d'observation.

### D0 — Slice 1 : cohérence enveloppe + 401/403 _(indépendant, aucun changement data)_

- Nouveau `api-v3/lib/authenticate.js` : orchestre les primitives `core` (qui **retournent/lèvent**, n'envoient pas de réponse) et lève `NotAuthenticated` (401, credentials absents/invalides) / `Forbidden` (403, blacklist). Vérif blacklist unifiée sur ce chemin.
- `api-v3/index.js:54` : remplacer `mw.verifyAndLoadAgendaOrUserFromKey` par le middleware v3 ; retirer `mw.evaluateAnonymousAccess` (code mort sur `/v3`).
- **Ne pas toucher** au middleware v2 partagé (`/api`, `/v2` en dépendent).
- Tests 401/403 + enveloppe ; doc `openapi.yaml` (401 = pas/mauvais credential, 403 = interdit).

### D1 — Plugin additif `→`

- `@openagenda/auth` : ajouter `@better-auth/api-key`, bump BA 1.6.11, brancher `apiKey({...})` dans `plugins`. Migration table `apikey` (`packages/auth/migrations`, Kysely). Config : préfixes, modèle de permissions, rate-limit defaults, storage Redis.
- Plugin activé, **zéro trafic** dessus. Valider la suite de tests auth existante après le bump.

### D2 — Dual-write + backfill `→`

- Toute création/régénération de clé écrit **aussi** dans `apikey` (hashé) via les helpers OA.
- Migration de **backfill** : hashe (`defaultKeyHasher`) les clés de la table `key` (`userPublic`/`userPrivate`/`agendaFullRead`) dans `apikey`, avec `referenceId` (`<uid>` / `agenda:<uid>`), `metadata.oaKind` (pk/sk/agenda) + **`permissions: null`** (non-restreint, cf. §5.1 — pas de scopes par-ressource sur les clés legacy). `api_key_set` est un miroir dérivé de la table `key`, donc `key` seule suffit. Migration `transaction: false` (mirrorOne ouvre ses propres transactions par clé).
- La vérif lit **encore l'ancien chemin**. À l'issue, `apikey` est complète et concordante (hash déterministe ⇒ idempotent).

### D3 — Bascule vérif + endpoints + refonte UIs _(éclaté en 4 sous-paliers)_ `→`

D3 du plan initial agrégeait trois **unités de déploiement** de risque et de réversibilité différents. Découpé pour respecter la granularité = unité déploiement/rollback :

#### D3a — Bascule vérif v3 _(invisible, revert trivial)_ `→`

- `api-v3/lib/authenticate.js` : sur la branche clé publique, **`verifyApiKey` d'abord** (via la façade `verifyKey` de `@openagenda/auth`), propriétaire reconstruit depuis `referenceId` (`<uid>` → `core.users.get(uid)` ; `agenda:<uid>` → `req.agendaKey = { identifier }`, seul champ lu par `loadSearchAccess`). **Parité de comportement** : pk et sk chargent tous deux le user et passent `userUid` — **pas d'enforcement de tier** (c'est D6). `oaKind` lu mais non appliqué.
- **Fallback legacy** (`byPublicKey`/`keys().get`) conservé comme filet contre une dérive backfill/dual-write ; chaque hit est loggé (`api-v3/authenticate`, « apikey verify miss »). Le fallback lit `key`/`api_key_set` ⇒ **retiré à D5** (drop des tables) au plus tard, plus tôt si les métriques montrent zéro hit.
- Branche `tk-` **inchangée** (legacy jusqu'à D4 ; les tokens HMAC ne sont pas dans `apikey`).
- **Pré-requis** : re-jouer le backfill avant déploiement (absorbe les clés créées depuis le merge D2).
- **Dépendance dure** : `core.services.auth` requis sur le chemin v3 (toujours chargé en prod via `initServices` sans filtre ; à activer dans les tests d'intégration v3).

#### D3a′ — Bascule vérif v2 _(invisible, filet)_ `→`

- `api/middleware/verifyAndLoadAgendaOrUserFromKey.js` (sert `/api` + `/v2`) : même mécanique que D3a — `verifyKey` d'abord, propriétaire reconstruit depuis `referenceId`, **fallback legacy** sinon. Garde le **contrat v2** (403 `{ message }` écrit lui-même, passage anonyme sur `/api`, délégation `tk-` intacte) et la forme `req.agendaKey = { identifier }` (seul champ lu en aval).
- **Pourquoi avancer ce palier** (le plan initial le différait) : une clé native multi/scopée/expirable **ne peut pas** être ré-écrite vers le legacy **user** (`api_key_set` = une seule paire). Le dual-write-back est donc structurellement impossible ⇒ la **seule** façon que les nouvelles clés marchent **à la fois sur v2 et v3 sans casser v2**, c'est que v2 lise aussi le store `apikey`. Le fallback préserve toutes les clés existantes : v2 n'est pas cassée, elle est **étendue**.
- **Dépendance gardée** : `services.auth` est optionnel (`auth ? verifyKey : null`) — dégradation vers legacy si absent (cohérent `server.js`, et certaines apps de test montent v2 sans auth). Contraste avec v3 où la dépendance est dure.

#### D3b — Endpoints clés dédiés sur `apikey` _(surface ajoutée, non branchée)_ `→`

Découpé en **deux unités de déploiement indépendantes** (granularité = unité déploiement/rollback). La **façade** `@openagenda/auth` est posée : `createUserKeyPair`/`createUserKey`/`createAgendaKey` via `auth.api.createApiKey` (owner encodé dans `userId`, `metadata.oaKind`, plaintext **une seule fois**) ; `listUserKeys`/`listAgendaKeys`/`revokeUserKey`/`revokeAgendaKey` via l'**adapter** (endpoints plugin session-gated). Revoke scopé `id`×`referenceId`. **Pas de dual-write-back** vers `key`/`api_key_set` : les clés natives vivent dans `apikey`. **Politique commune** : `permissions: null` (pas d'enforcement de scope avant D6 — inutile de stocker des scopes inertes), **préfixes différés à D6** (la façade les accepte en option, le caller décide), **UIs pas encore basculées** (D3c).

##### D3b-agenda — clés agenda sur `apikey` _(read-only, sûr)_ `→`

- Endpoints serveur agenda (list/create/revoke) sur la façade (`auth.listAgendaKeys`/`createAgendaKey`/`revokeAgendaKey`, `referenceId = agenda:<uid>`), montés dans `services/keys/plugApp.js`, **guards identiques au legacy** (`requireUser` + `agendas.mw.load` + `members.mw.loadAndAuthorize('administrator')`), à de **nouveaux chemins** (`…/admin/settings/api-keys`). Le legacy `…/keys/*` reste vivant tant que l'UI n'est pas basculée (D3c). `create` renvoie le plaintext **une fois** ; `list` ne renvoie **aucun** matériel de clé.
- **Sûr isolément** : les clés agenda sont **read-only** (`agendaFullRead` ; l'écriture v2 passe par un `tk-` minté d'une clé _user_, jamais d'une clé agenda). Une clé agenda native lit donc déjà sur v2 (GET, D3a′) **et** v3, sans toucher au chemin d'écriture.

##### D3b-user — clés user sur `apikey` _(v3-first)_ `→`

- Endpoints serveur user (« Applications ») sur la façade : pk+sk (archétypes) + **sk nommées additionnelles**, list, revoke. La **pk** lit sur v2 (GET) + v3 ; la **sk** écrit **nativement sur v3** (Bearer direct, §5.2).
- **Pas de pont d'écriture v2** : v2 reste gelée (`tk-`), le write moderne vit sur **v3** — pas de demi-mesure (on ne livre pas une `sk` censée écrire sur v2 sans le pouvoir ; elle écrit, sur v3). Les credentials legacy continuent d'écrire sur v2 via leur `tk-`.
- Dépend de D3b-agenda pour la façade/harness ; déployable/rollbackable à part.

#### D3c — Refonte UX « montré une fois » + découplage `users` _(visible, peu réversible)_ `⏸`

- `user-apps/src/components/ApiKeySettings.js` et `agenda-settings/src/components/KeysManager.js` cessent d'afficher la valeur stockée ; liste = label/created/last-used, valeur révélée **seulement** au retour de création. _(Apps React legacy — édition en place, pas de migration App Router ; mettre à jour Storybook.)_
- Découpler `users` : retirer resolvers `apiKey`/`apiSecret`, hooks `generateApiKey`/`searchByKey`, et le `apiKey` de `/me` une fois plus aucun lecteur.
- **Contrainte de séquencement (révocation effective)** : tant que le fallback legacy de D3a/D3a′ est vivant, révoquer une clé **backfillée (mirror)** ne retire que sa ligne `apikey` — la ligne legacy `key`/`api_key_set` subsiste et la clé **continue d'authentifier via le fallback**. La bascule de l'UI revoke **doit donc suivre le retrait du fallback** (métriques zéro hit), pas seulement une fenêtre d'observation — sinon « Révoquer » ment à l'utilisateur. Les endpoints restent **purs** (`apikey` only) ; on ne recouple pas revoke aux tables legacy.
- À déployer **en dernier** : un utilisateur qui n'a pas copié sa clé à la création est bloqué ⇒ atterrissage après observation de D3a/D3a′/D3b en prod.

### D4 — Écriture moderne v3 (Bearer direct) ; `tk-` gelé sur v2 `⏸`

- **v3** : `oa_sk_` en Bearer direct autorise l'**écriture** (lit `apikey`, §5.2), sans `/requestAccessToken`. v3 n'introduit jamais `tk-`. _(Les endpoints d'écriture v3 eux-mêmes relèvent de la surface moderne — D6 ; D4 fige le **modèle d'auth** write de v3.)_
- **v2** : le flux `tk-` (`requestAccessToken` + `access_token` + salt `okilydokily`) **reste en place, inchangé** — v2 est gelée. Les credentials legacy continuent d'y écrire ; les nouvelles `oa_sk_` natives écrivent sur **v3**. Pas de pont v2 (éviterait une demi-mesure).
- Le retrait **global** de `tk-`/`access_token` et du salt `okilydokily` est lié à l'**EOL de v2**, hors de cette tranche.

### D5 — Supprimer `packages/keys` `⏸`

- Relocaliser les migrations `keys/*` (inchangées) → `cibul-node/migrations/legacy/`, entrée `legacy` dans `byService`, retirer `keys`.
- Déplacer/retirer le runtime du service ; supprimer `packages/keys`.
- Migration **forward** : drop `key`, `api_key_set`, `access_token` (après fenêtre de fallback).

### D6 — Surface moderne v3 `→`

- Scopes mappés aux tiers de visibilité (enforcement à `verifyApiKey`), préfixes sur toute nouvelle clé, expiry/révocation dans les UIs, multi-clés « Applications » côté user.
- En-têtes `Deprecation`/`Sunset` sur `?key=` + headers `key:`/`access-token:`.

---

## 7. Fichiers impactés (indicatif)

| Zone                     | Fichiers                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plugin + helpers         | `packages/auth/package.json`, `packages/auth/src/index.js`, `packages/auth/migrations/*_create_api_key_table.js`, nouveaux helpers `@openagenda/auth`                                 |
| Auth v3                  | `api-v3/lib/authenticate.js` (nouveau), `api-v3/index.js`, `api-v3/errorHandler.js` (inchangé), `packages/api-spec/openapi.yaml`                                                      |
| Découplage users         | `packages/users/service/resolvers.js`, `hooks/generateApiKey.js`, `hooks/searchByKey.js`, `hooks/keepFields.js`, `service/schemas/coerce.js`                                          |
| Retrait tk-/mirror       | `services/accessTokens/lib/*`, `services/users/lib/onGenerateApiKey.js`, `core/users/getByPublicKey.js`/`getByAccessToken`                                                            |
| UIs                      | `packages/user-apps/src/components/ApiKeySettings.js` + `reducers/userSettings.js` ; `packages/agenda-settings/src/components/KeysManager.js` + `EditKeyForm.js` + `reducers/keys.js` |
| Migrations / suppression | `cibul-node/lib/migrationDirectories.js`, `cibul-node/migrations/legacy/` (nouveau), suppression `packages/keys`                                                                      |
| Consommateurs valeur clé | `registrations/passCulture/lib/PassCultureSDK.js`, `services/supervisor/users/*`, `services/mails/lib/utils.js`, `api/index.js` (`/me`)                                               |

---

## 8. Points ouverts / à vérifier en cours de route

- ~~**Câblage des resources** `res.keys.*` / `res.getMe` / `res.generateApiKey`~~ **localisé** : clés user via `services/users/plugApp.js` (`/users/:id/generateApiKey`, hook `generateApiKey` single-pair) + `/me` (`api/index.js:1056`, resolver `apiKey` plaintext) ; clés agenda via `services/keys/plugApp.js` (`/:slug/admin/settings/keys/{list,create,update,remove}`, gardé `members.authorize('administrator')`). Réutilisables / remplaçables en D3b.
- ~~**Consommateurs de la valeur de clé**~~ **confirmé** : passCulture / supervisor / mails utilisent des credentials **de config** (Mailgun, InsightOps, SDK), **aucun** ne lit une valeur de clé OA de requête. Seuls `/me` + les 2 UIs lisent une valeur OA stockée ⇒ tout l'impact « montré une fois » est concentré en **D3c**.
- **`oidc-provider` / `client_credentials`** (M2M OAuth2) : **hors scope**, différé à la future Phase 7 SSO. `oa_sk_` en Bearer direct couvre le M2M write d'ici là.
