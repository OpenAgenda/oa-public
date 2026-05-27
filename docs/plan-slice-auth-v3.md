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
5. **Scopes** : `permissions: Record<string,string[]>` (ex. `{ events: ['read','write'] }`), mappés aux tiers de visibilité ; `transverse_api_access` devient un scope. **Modèle figé en §5.1.**
6. **Découpler `users` des clés** : `users` ne gère plus le cycle de vie des clés (suppression des resolvers `apiKey`/`apiSecret`, hooks `generateApiKey`/`searchByKey`). Le lookup inverse (clé → propriétaire) passe dans le store de clés / l'auth. La page de réglages appelle des **endpoints clés dédiés**, plus `getMe` détaillé.
7. **Supprimer `packages/keys`** : relocaliser ses migrations (**inchangées**) dans `cibul-node/migrations/legacy/`, déplacer le runtime, supprimer le package. Voir §4.
8. **Retirer le flux `tk-`** (`access_token` + `generateTokenFromSecretKey` + salt `okilydokily`) au profit de `oa_sk_` en Bearer direct.
9. **Multi-clés nommées pour les users** (« Applications ») — gratuit avec le plugin (`apikey` multi par `referenceId`).
10. **Aucun commit avant review.** Séquence applicable **palier par palier**, plusieurs déploiements espacés.

---

## 3. Faits techniques vérifiés (plugin `@better-auth/api-key@1.6.11`)

- Schéma `apikey` (`dist/index.mjs:1939`) : `id`, `configId`, `name`, `start`, `referenceId` (**required, générique, indexé**), `prefix`, `key` (indexé), `refillInterval`/`refillAmount`/`lastRefillAt`, `enabled`, `rateLimitEnabled`/`rateLimitTimeWindow`/`rateLimitMax`/`requestCount`, `remaining`, `lastRequest`, `expiresAt`, `createdAt`, `updatedAt`, `permissions` (string JSON), `metadata` (string JSON).
- **Hashing** : `disableKeyHashing` existe (`dist/index.mjs:2087`) mais **on hashe** (défaut). `defaultKeyHasher` est exporté ⇒ utilisable pour **backfiller** les clés existantes (on détient le plaintext aujourd'hui).
- `verifyApiKey({ key, permissions? })` → `{ valid, error, key: Omit<ApiKey,'key'> }` — **pas d'hydratation de session/user**. Idéal : notre middleware v3 appelle `verifyApiKey`, puis charge le user/agenda OA depuis `referenceId`, en gardant **100 % le contrôle de l'enveloppe + 401/403**.
- `createApiKey` côté serveur accepte `userId`/`prefix`/`expiresIn`/`permissions`/`metadata`/`remaining`/`refill*`/`rateLimit*` ; `referenceId` dérivé de `userId` (ou orgId). Le plaintext n'est rendu **qu'à la création**.
- `listApiKeys`/`getApiKey`/`updateApiKey`/`deleteApiKey` (par `keyId`, contrôle d'ownership), `deleteAllExpiredApiKeys`. Le plugin auto-supprime les clés expirées (cooldown 10 s).
- Rate-limit par clé sur **secondaryStorage** (Redis déjà câblé dans `@openagenda/auth`).

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

- **Helpers OA** dans `@openagenda/auth` : `createUserKeyPair` (pk+sk), `createAgendaKey`, `verifyKey`, `listKeys`, `revokeKey` — façade au-dessus de `auth.api.*` avec l'encodage `referenceId` + scopes par défaut.
- **Auth v3** : middleware propre à v3 qui classe le Bearer (`oa_pk_`/`oa_sk_`/legacy), `verifyApiKey`, applique les scopes, charge user/agenda depuis `referenceId`, mappe `NotAuthenticated`→401 / `Forbidden`→403 dans l'enveloppe `{error}`.
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

**Scopes canoniques** (format `resource:action`, mappé sur `permissions: Record<string,string[]>` du plugin — clé = resource, valeurs = actions) :

`events:read`, `events:write`, `agendas:read`, `agendas:write`, `locations:read`, `locations:write`, `registrations:read`, `registrations:write`, `members:read`, `members:write`, et l'action transverse `events:transverse` (cross-agenda).

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

**Backfill (D2) — scopes par défaut préservant le comportement actuel à l'identique** :

| Clé legacy                   | Type cible | `permissions`                                                                                                                                                                     |
| ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `userPublic` / `api_key`     | `oa_pk_`   | `{ events:['read'], agendas:['read'], locations:['read'], registrations:['read'], members:['read'] }`                                                                             |
| `userPrivate` / `api_secret` | `oa_sk_`   | read complet + `events:['read','write']`, `agendas/locations/registrations:['read','write']`, `members:['read']` (+ `events:['…','transverse']` si `owner.transverse_api_access`) |
| `agendaFullRead`             | agenda key | `{ events:['read'] }` (read-only, admin tier de l'agenda)                                                                                                                         |

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
- Migration de **backfill** : hashe (`defaultKeyHasher`) les `key` (`userPublic`/`userPrivate`/`agendaFullRead`) + `api_key_set` existantes dans `apikey`, avec `referenceId` (`<uid>` / `agenda:<uid>`) + scopes par défaut (`events:read` pour pk/agenda, `events:read`+`events:write` pour sk).
- La vérif lit **encore l'ancien chemin**. À l'issue, `apikey` est complète et concordante.

### D3 — Bascule vérif + refonte UIs _(déploiement visible)_ `→`

- Auth via `verifyApiKey` (v3, puis v2), ancien chemin en **fallback**.
- Endpoints clés dédiés (list/create/revoke) user + agenda sur `apikey` ; brancher `user-apps` + `agenda-settings` dessus.
- **Refonte UX « montré une fois »** : `user-apps/src/components/ApiKeySettings.js` et `agenda-settings/src/components/KeysManager.js` cessent d'afficher la valeur stockée ; liste = label/created/last-used, valeur révélée seulement au retour de création. _(Apps React legacy — édition en place, pas de migration App Router.)_
- Découpler `users` : retirer resolvers `apiKey`/`apiSecret`, hooks `generateApiKey`/`searchByKey` une fois plus aucun lecteur.

### D4 — Retrait `tk-` / `access_token` `⏸`

- Auth write directe via `oa_sk_` Bearer (lit `apikey`).
- Déprécier `requestAccessToken`/`tk-` (fenêtre d'acceptation). Quand les métriques montrent `tk-` inutilisé : couper le minting, arrêter le dual-write vers `key`/`api_key_set`, retirer les lectures `access_token`. Le salt `okilydokily` disparaît.

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

- **Câblage exact des resources** `res.keys.*` / `res.getMe` / `res.generateApiKey` des UIs legacy (injectées par le serveur hôte, hors des 4 packages) — à localiser avant D3.
- **Consommateurs de la valeur de clé** (passCulture, supervisor, mails) : confirmer qu'ils lisent une valeur (compatible) et non un comportement « ré-affichable » — à câbler en D3/D4.
- **`oidc-provider` / `client_credentials`** (M2M OAuth2) : **hors scope**, différé à la future Phase 7 SSO. `oa_sk_` en Bearer direct couvre le M2M write d'ici là.
