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
- **Champs custom** : séparer natif vs custom via le `schemaId` du schéma (natif = schéma par défaut/parent `schemaId: null` ; custom = schéma propre de l'agenda). Nester les non-natifs sous `custom`. Le socle reste à plat. `additionalProperties: false` sur `Event` est correct **parce que** le mapping émet exactement les champs du contrat (il ne passe pas l'`_source` brut).
- **`readOnly`** : les champs `readOnly: true` (uid, slug, state, timestamps, dateRange, first/last/nextTiming, originAgenda, sourceAgendas, featured, country, links, timezone) ne sont pas acceptés en écriture.

### Champs ES volontairement EXCLUS du contrat public

Le mapping ne doit pas les émettre (modération/interne) : `addMethod`, `motive`, `member`, `html`, `creatorUid`, `ownerUid`, `private`, `draft`, `removed`. À rouvrir si un usage admin (Tier 2) le justifie.

---

## À confirmer via contract-tests (formes première-passe)

Le schéma a été ancré sur code + fixtures, mais ces points restent à valider contre de vraies réponses en tranche 2 :

- `image.credits` vs `imageCredits` top-level : lequel apparaît réellement en sortie ? (les deux sont déclarés pour l'instant)
- Formes laxistes (`additionalProperties: true`) à resserrer si possible : `Image.variants[]`, `Location`, `Registration`, `EnrichedLink`, `AgendaRef`.
- `limit` max = 100 : à caler sur `validateNavSize` (`api/middleware/validateNavSize.js`).
- `AgendaRef.title` : string ou multilingue ? (modélisé string)

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

### Tranche 2 — implémentation route + contract-test (à venir)

- Implémenter le mapping v3 des 2 endpoints sur `core` (encodage cursor, enveloppe, erreurs).
- Contract-test : valider de vraies réponses contre `openapi.yaml` → trim/fix des formes première-passe.
