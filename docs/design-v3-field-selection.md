# v3 — Modèle de sélection de champs (`view` presets + `fields` sparse)

> Décision structurante. Recherche menée mai 2026 (2 agents : patterns industrie + capacités Hey API). Vaut pour **toutes** les lectures v3 (events ET agendas).

## Problème

Comment offrir aux clients deux leviers de mise en forme des réponses :

1. des **presets nommés** (`view`, façon Google AIP-157 `BASIC`/`FULL`) — paliers de richesse ;
2. une **sélection fine de champs** (`fields`) — réduire la taille de payload quand on liste beaucoup (events/agendas, scripts de synchro) ;
   … **sans casser le contrat de type du SDK généré** (Hey API). C'est le cœur du sujet.

## Contrainte dure (vérifiée)

- **Aucun générateur OpenAPI→TS ne rétrécit le type de réponse à partir d'un param `fields`.** Confirmé sur Hey API, openapi-typescript, Speakeasy, Stainless, Kiota. C'est structurel à OpenAPI : une réponse est fonction de `(path, method, status, content-type)`, **jamais** de la valeur d'un paramètre. GraphQL est le seul à typer exactement, parce que son codegen lit le _selection set de l'opération_, pas le schéma. → la « narrowing magique » n'existe pas, ne pas concevoir autour.
- **L'état actuel d'events ment déjà.** `EventList.data: Array<EventSummary | Event>` (union plate, pas de `discriminator` dans la spec → `z.union`, pas `z.discriminatedUnion`). `detailed?: boolean` n'influe pas sur le type. `EventSummary` étant un sous-ensemble structurel d'`Event`, l'union est **inutilisable** (pas de narrowing propre). Réf : `types.gen.ts:313` (EventList.data), `:858` (detailed), `:1061` (200=EventList) ; spec `openapi.yaml:1455-1458`.

## Comment l'industrie combine les deux axes

| API                | Preset (`view`)                                                                          | Sparse fields                       | Type SDK de la réponse partielle                                                          |
| ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| **Google AIP-157** | `view` enum `BASIC`/`FULL` ; champs **ajoutables jamais retirables** ; List défaut BASIC | FieldMask / `$fields` (param infra) | protobuf = **tout optionnel** → pas de mensonge ; même type quel que soit le mask         |
| **JSON:API**       | —                                                                                        | `fields[TYPE]=a,b` (par type)       | attributs tous optionnels ; pas de codegen typé standard                                  |
| **MS Graph**       | jeu par défaut implicite                                                                 | `$select=a,b`                       | type complet, champs non sélectionnés = `null` (le type « ment » mais tout est nullable)  |
| **Stripe**         | —                                                                                        | `expand[]` (ajoute, ne retire pas)  | champs expandables = `string \| Foo \| null`, **cast obligatoire** (bug connu non résolu) |
| **GraphQL**        | —                                                                                        | selection set                       | **seul à typer exactement** (codegen par opération)                                       |

**Constat :** REST + SDK typé → personne ne type exactement les sparse fields. Les bons acteurs (Google, Graph) s'en sortent parce que **tous les champs sont optionnels** côté type. Le levier d'honnêteté = `required` vs `optional` dans le schéma.

## Stratégies de typage, classées (contexte OpenAPI 3.1 + SDK TS)

1. **Un type concret par `view` nommée** (schémas distincts `*Summary`/full) → le contrat de type est porté par la _view_, exact et honnête. ✅ axe typé.
2. **`fields` documenté best-effort, réponse typée = schéma de la view** ; les champs trimables marqués **`optional`** → le check de type force l'utilisateur de `fields` à gérer `undefined`, sans polluer le chemin commun. ✅ axe sparse.
3. Réponse tout-optionnel : honnête mais poison — _chaque_ accès devient `| undefined` pour _tous_ les appelants. ❌ comme défaut.
4. Codegen qui narrow sur `fields` : **n'existe pas**. ❌ ne pas supposer.
5. Validation zod runtime découplée du type statique : filet complémentaire, pas un substitut.

→ **2 + 1** (fields best-effort par-dessus des views honnêtes), zod (5) en filet optionnel.

## Tension clé : une opération = un schéma de réponse

Un `view` **sélectionnable par le client sur la même opération** ré-introduit l'union (le mensonge actuel d'events). Deux façons honnêtes d'avoir des paliers :

- **(A) View figée par endpoint** : `list → summary`, `get → full`. Le client ne choisit pas la view ; il **trim** via `fields`. Une opération = un schéma = zéro mensonge. Le plus simple. Pour « lister en réduisant la taille » c'est exactement le besoin (summary + trim `fields`). La detailed-list (rare) s'ajoute plus tard si besoin.
- **(B) View sélectionnable via union discriminée** : items portent un discriminant (`representation: 'summary'|'full'`), `view` choisit ; zod émet `z.discriminatedUnion`, TS narrow sur le discriminant. Donne le `view` client-sélectable façon Google, **honnêtement**, mais ajoute de la machinerie (discriminant dans chaque schéma, +1 op de doc).
- (C) Opérations séparées par view (`list` + `listDetailed`) : honnête, mais double la surface de liste.

## Recommandation

**Modèle à deux axes, typage asymétrique :**

1. **`view` — enum** (`summary` | `full`), remplace le booléen `detailed` partout (events + agendas), cohérent et extensible (AIP-157 : ajouter une view/des champs = non-breaking). Défaut par opération : `list → summary`, `get → full`.
2. **`fields` — CSV plat** `?fields=uid,title,image`, **soustractif uniquement**, sous-ensemble de la view active (champ inconnu/hors-view → `400`). Pas la syntaxe crochets JSON:API (sérialisation objet fragile dans openapi-ts). Réponse typée = schéma de la view ; **tout champ trimable est `optional`** dans le schéma.
3. **Précédence (normative)** : `view` choisit le type/palier ; `fields` ne fait que restreindre dedans. Modèle mental : _view = quel type, fields = quel sous-ensemble du payload_.
4. **Honnêteté collections** : une opération = un schéma. → choix (A) recommandé : `list` reste palier summary (typé propre), `fields` trim dedans, le full passe par `get`. Si une detailed-list devient un vrai besoin → (B) union discriminée à ce moment-là.
5. **Réparer events maintenant** (draft, non publié) : `EventList` redevient `Array<EventSummary>` seul (retirer `Event` du `oneOf`) → la liste cesse de mentir. `detailed` booléen → `view` enum.

### Garde-fous codegen

- Ne pas attendre de narrowing sur `fields` — s'appuyer sur `optional`, pas sur le générateur.
- Pas de `oneOf` view dans un même schéma sans `discriminator` réel (sinon union plate inutilisable).
- `required` = contrat d'honnêteté : auditer que tout champ éligible à `fields` est `optional`.
- AIP-157 : ajouter un champ à une view = sûr ; en retirer = breaking.

## DÉCISIONS FINALES (verrouillées avec l'utilisateur, mai 2026)

La reco ci-dessus proposait un enum `view`. Affiné en discussion → décisions retenues :

1. **On garde le booléen `detailed`** (pas d'enum `view`) : seulement 2 paliers, un booléen suffit, l'enum ne se justifierait qu'à 3+ paliers extensibles.
2. **2 schémas distincts, fully-required** (`*Summary` / full). Le « tout-optionnel » (un seul schéma) est **rejeté** (DX moins bonne, pollue le chemin commun).
3. **Union de liste = `oneOf` nu, SANS discriminant** (le champ `representation` + le `discriminator:` envisagés ici ont été **rejetés** à l'implémentation — voir « Appliqué » et la note ci-dessous). Sur les listes, `data.items = oneOf [Summary, Detailed]` ; le narrowing TS repose sur les **différences structurelles** des schémas, pas sur un discriminant. Les GET mono-ressource renvoient directement le schéma full (pas d'union). Défaut par endpoint : `list → summary`, `get → full`.

   > ⚠️ Correctif (juin 2026) : ce point décrivait initialement une union _discriminée_ (`representation` const + `discriminator:`). Cette approche a été **abandonnée** ; rien de tout cela n'existe dans la spec. Vérifié : aucun champ `representation` dans `AgendaSummary`/`AgendaDetailed`/`Agenda` ni dans `mapAgenda` — `AgendaList.data` est un `oneOf` nu.

4. **`fields` (sparse) découplé en deux lots** (décidé juin 2026, voir « Appliqué — tranche fields » ci-dessous), transverse et **additif** (zéro breaking sur contrat ou SDK) :
   - **Lot 1 — trim serveur best-effort (LIVRÉ).** Le filtrage `?fields=` est appliqué côté serveur sur les 4 routes _list_, schémas **inchangés (fully-required)**. Vérifié pendant l'implémentation : l'api-client généré **ne valide PAS les réponses** par défaut (`responseValidator` opt-in jamais câblé) et le seul consommateur réel — le serveur MCP — passe le JSON brut sans re-parser ; donc un payload trimmé **ne casse aucun runtime**. Le type SDK sur-promet sur le chemin `fields` (champ trimé typé présent → `undefined` au runtime), footgun documenté et assumé.
   - **Lot 2 — surcouche Pick typée (REPORTÉ).** Avec 2 schémas required + pas de tout-optionnel, la **seule** façon honnête de typer `fields` est la surcouche TS manuelle (`Pick<T, Fields[number]>`, const generics) dans le seam wildcard d'`api-client` — le SDK généré seul mentirait. À designer **une fois pour toutes les ressources**, additif sur le lot 1. Convergent avec la reco ChatGPT (son « Option B »).
5. **Events** : `EventList.data` est dans la même situation — `oneOf [EventSummary, Event]` nu, narrowing structurel. (Le plan initial « ajouter un discriminant `representation` » est caduc, l'approche discriminant ayant été rejetée. Si l'union events doit être durcie un jour, c'est un suivi dédié — sans discriminant.)

### Appliqué dans `openapi.yaml` (tranche agenda, mai 2026)

- Scope **`agendas:read`** ajouté ; ops `agendas.list`/`agendas.get` sécurisées dessus.
- Params : `AfterCursor`/`Limit`/`Detailed` réutilisés (descriptions généralisées « items » au lieu de « events ») + nouveaux `AgendaSearch`/`AgendaFilterUid`/`AgendaFilterSlug`/`AgendaFilterOfficial`.

**TROIS types distincts pour les agendas (≠ events à 2 types) — raison backend, pas préférence.** L'index ES agenda ne porte PAS `url/updatedAt/officializedAt/private/indexed` (preuve `packages/agenda-search/service/lib/fields.js`) : ils n'existent que via le `get` SQL. On garde `detailed` sur la liste (volonté utilisateur) MAIS chaque type reflète honnêtement sa source :

- `AgendaSummary` — `list?detailed=false`, projection ES base : uid, slug, title, description, image, official.
- `AgendaDetailed` — `list?detailed=true`, projection ES detailed : + createdAt, network, locationSet. **Plus étroit** que le get (assumé).
- `Agenda` — `get` SQL : record complet (+ url, updatedAt, officializedAt, private, indexed).
- `AgendaList.data` = oneOf `AgendaSummary | AgendaDetailed`, **nu** : ni `discriminator:` (Hey API ne le transforme pas en `z.discriminatedUnion`, il salit le zod) ni champ discriminant `representation` (rejeté). Le narrowing TS repose sur les différences de structure des deux schémas. Vérifié : types narrowables, zod `z.union` propre, tsc 0.
- Câblage **api-v3** : `packages/cibul-node/api-v3/index.js` (2 routes) + `lib/mapAgenda.js` (3 mappers, `official`→bool, dates→ISO, network/locationSet→`{uid,title}`) + `lib/buildAgendaSearchQuery.js` (gate strict 400) + `lib/agendaEnvelope.js` (after:null sur page incomplète, car l'agenda search ne renvoie pas de sentinelle null). Liste = `core.agendas.search` (ES, access public, sort `createdAt.desc`) ; get = `core.agendas(uid).get({detailed:true})`. Tests unitaires `90_unit_apiV3_mapAgenda` (valide contre le schéma OpenAPI via Ajv) + `90_unit_apiV3_buildAgendaSearchQuery` : 16/16.
- ⚠️ **`image` = string URL** (et non le `Image` structuré des events) — calque la réalité backend ; aligner sur `Image` = suivi backend. Champs `memberSchemaId`/`settings` **non exposés** (→ future ressource `agendas.settings.*`).
- Validé : `yarn validate` + Redocly lint OK, eslint api-v3 0, jest unit 16/16.

### Appliqué — tranche fields (juin 2026)

> ⚠️ Le modèle a évolué en deux temps. **Checkpoint (commit `c3d33c4`)** = trim post-mapping, sous-ensemble de la vue active (`detailed ? full : summary`). **Rework (override, ci-dessous)** = le modèle retenu, qui remplace la sémantique « sous-ensemble de la vue » par « sélecteur de projection direct ». Le checkpoint reste comme point de rollback ; c'est le rework qui décrit le contrat.

**Modèle override (retenu, discuté avec l'utilisateur juin 2026) :** `fields` présent ⇒ il choisit la forme **directement sur l'univers complet** de la ressource ; `detailed` devient sans objet (il ne pilote que la forme par défaut quand `fields` est absent) et `fields` gagne si les deux sont fournis. Donc `?fields=longDescription` marche **sans** `detailed=true`. Strict : `uid` toujours retenu, nom hors-univers → 400. (On garde la rigueur v3 ; on n'hérite PAS du silent-drop v2.)

- **Helper** `packages/cibul-node/api-v3/lib/selectFields.js` : `resolveFields(rawFields, allowed)` (gate 400, `uid` retenu, CSV + param répété), `pickSelected` (trim top-level), `fieldNamesOf(mapItem, extra)` (**anti-drift** : `Object.keys(mapItem({}))`), `eventFieldsToIncludes(selected)` (traduction → `includeFields` ES, identité + provenance `first/last/nextTiming ⇒ timings`, et `additionalFields` global ⇒ `null` = pas de pushdown).
- **Univers = mapper le plus riche** par ressource (`mapEvent` ; `mapAgendaDetailed` pour la liste agendas car l'index ne porte pas `url/private/indexed/…` ; `mapLocation` ; `mapAgendaDetailed`+`role`/`private` pour `/me`). `effectiveDetailed = fields ? true : detailed`.
- **Paths pointés** : `resolveFields` accepte les paths (`location.name`, `additionalFields.x`), valide le **segment top-level** (strict, inconnu → 400) et laisse la feuille best-effort. `pickSelected` est path-aware (`pathsToTree`/`pickTree` : `true` = sous-arbre entier, descend dans objets, mappe sur les éléments de tableau type `timings.begin`, le champ nu gagne sur le path profond).
- **Pushdown ES events** : `eventFieldsToIncludes` → `includeFields` (override `defineIncludes`, access-gating preservé), via `...searchOptions`. Identité + provenance (`first/last/nextTiming ⇒ timings`, `additionalFields.x ⇒ champ plat`, bag global ⇒ `null` = pas de pushdown). Le mapper full tourne puis `pickSelected` trime (le trim reste requis : l'empty-as-empty réinjecterait les absents).
- **Pushdown ES agendas** : `onlyIncludeFields` (override restrictif, **déjà implémenté+testé dans `defineIncludes`**) **exposé dans `packages/agenda-search/validators/options.js`** (sinon `validateOptions` le supprimait). `agendaFieldsToOnlyIncludes` → segments top-level distincts (noms AgendaDetailed↔index alignés 1:1). Le keyset agenda trie sur des champs de doc, indépendant de `_source` → pagination intacte.
- **Pushdown SQL locations** : `locationFieldsToIncludes` (identité + `verified→state`, `additionalFields→tags`) → `includeFields` du service `agendaLocations.list`. **Sûr pour le keyset** : le service force déjà `id`/`placename` + les after-fields (`include: includeAfterFields(cleanNav)`, `list.js:108-122`) indépendamment de `includeFields` ; l'access-gating SQL drope les champs non-`public`. Gain réel pour les colonnes top-level (cas géo-only) ; les champs adossés à la colonne JSON `store` (image/description/access/tags/…) la partagent, donc les sélectionner relit tout le blob — le trim réduit quand même le payload sur le fil.
- **/me : trim seul (pas de pushdown), volontairement.** Le fallback SQL `services.agendas.list` `includeFields` est **additif** (n'enlève rien) ; items minuscules. Donc fetch-riche + `pickSelected`. (Piste de pushdown ci-dessous.)
- **Spec** : param `Fields` (CSV) sur les 4 ops list, description = sélecteur direct + `detailed` moot + `fields` gagne + paths pointés. **Aucun schéma de réponse modifié**. api-client régénéré.
- **Tests** : unit `90_unit_apiV3_selectFields` (parse dotted, trim path-aware, `eventFieldsToIncludes`/`agendaFieldsToOnlyIncludes`/`locationFieldsToIncludes`) + intégration events (dotted `location.name`, dérivé nextTiming, fields-gagne) & agendas (pushdown `createdAt` sans detailed, `url` hors-univers → 400) & locations (géo-only top-level, `verified` store-backed, inconnu → 400). Unit 184/184, `yarn validate` + tsc OK.

**Reste à faire (court terme)** : (a) **pushdown /me** (voir piste 4) ; (b) **feuilles dotted strictes** (voir piste 2) ; (c) overlay `Pick` typé (lot 2 transverse, voir décision n°4).

## Pistes d'amélioration / cohérence (si on adapte les services)

> ✅ **Pistes 1-4 appliquées (juin 2026).** Les 3 helpers per-ressource ont été remplacés par **un descripteur `*_SELECT` co-localisé avec chaque mapper** (`EVENT_SELECT`/`AGENDA_SELECT`/`LOCATION_SELECT`) + **un traducteur générique** `selectionToIncludes(selected, spec)`. Détails ci-dessous. Pistes 5-6 restent ouvertes (driver requis).
>
> 🔎 **Durcissements post-revue (code-review xhigh, juin 2026)** : (1) `LOCATION_SELECT.children` ne déclare PLUS `additionalFields` — conteneur ouvert/extensible (comme le bag events), feuilles best-effort, pas de 400 sur une future clé custom ; seul `extIds` reste strict. (2) `selectionToIncludes` bail aussi sur `bagKeys=[]` (agenda sans champ custom → fetch complet, on ne pousse pas un override qui efface le bag). (3) `pickSelected` mémoïse l'arbre par Set (`WeakMap`) → 1 build/page au lieu d'1/item. (4) la route events réutilise `additionalFieldsOf` (facets.js, exporté) au lieu d'une 3ᵉ copie du prédicat `schemaId`, et passe l'objet `req.agenda` chargé à `getMerged` (évite un re-fetch). (5) `fieldNamesOf(...)` hissé en constantes module (`*_FIELD_NAMES`), plus de probe par requête. (6) test lockstep renforcé : converse `children == CLEANERS` + sondage des keysets imbriqués via les mappers (network/extIds/location).

1. ✅ **Field-map déclaratif unique par ressource.** Chaque mapper exporte un `*_SELECT = { granularity, children?, store?, derives?, bag? }` — l'overlay déclaratif sur l'univers (qui reste **dérivé du mapper** via `fieldNamesOf`, anti-drift). `children` = exactement les keysets des CLEANERS (donc impossible de diverger de ce que le mapper émet), `store` = renommages contrat→colonne, `derives` = dépendances (`nextTiming⇒timings`), `bag` = conteneur ouvert. `selectionToIncludes` consomme ce spec pour les 3 ressources (events `granularity:'path'`, agendas/locations `'top'`). Un test unit (`SELECT descriptors stay in lockstep`) garde la cohérence descripteur↔mapper. La coercition du mapper reste intouchée (pas de réécriture du moteur — couvert seulement par l'intégration).

2. ✅ **Feuilles dotted strictes.** `resolveFields(raw, universe, children)` valide le **premier segment imbriqué** contre le keyset déclaré : `location.zzz` → 400. Best-effort conservé là où il n'y a pas d'allowlist (bag `additionalFields`, maps localisées, objets pass-through type `age`/`accessibility`).

3. ✅ **`additionalFields` pushable (events).** Quand le bag nu est sélectionné, la route énumère les champs custom du form schema mergé (`schema.fields.filter(f => f.schemaId != null)`, même set que `getFormSchemaAdditionalFields`) et les pousse dans l'`_source` (`bagKeys`) ; `defineIncludes` les access-gate toujours. Plus de retombée sur le fetch large.

4. ✅ **Pushdown /me.** `enrichAgendas` reçoit `fields` : il **saute la résolution SQL `network`/`locationSet`** quand ces refs ne sont pas sélectionnées (`selectsTop`), ne demande `networkUid` que si besoin, et passe un `onlyIncludeFields` (réduit aux champs agenda) à la recherche ES des agendas publics. Output identique, backend allégé.

5. **Locations : sortir les champs chauds de la colonne JSON `store`.** Le pushdown SQL ne gagne que sur les colonnes top-level car image/description/access/tags… partagent `store`. Si le payload locations devient un sujet, promouvoir les champs chauds en colonnes réelles (migration) rendrait le pushdown pleinement effectif — sinon accepter la granularité « blob `store` ».

6. **Unifier les options de projection des services.** event-search utilise `includeFields`(=requested, override), agenda-search `includeFields`(additif)+`onlyIncludeFields`(override), agenda-locations `includeFields`(restrictif)+`include`(forcé). Trois conventions pour la même idée. → Converger sur un couple `{ include (force), only (override restrictif) }` partagé rendrait la couche v3 (et les autres consommateurs) homogène. (Le traducteur générique masque déjà ces écarts côté v3.)

## Simplifier par le bas (réparer les services, pas amputer le v3)

> **Décision (juin 2026) :** on garde **#183 + #184** (feature + pistes 1-4) et on les merge — valeur livrée maintenant. Le bottom-up ci-dessous est une **piste de fond** (chantier multi-packages), tirée quand il y a de l'appétit ou un 2ᵉ consommateur. La PR #185 (simplification _par amputation_ : pushdown events-only, feuilles best-effort) est **abandonnée** — mauvaise direction au regard de ce qui suit.

**Constat.** Presque tout le code `?fields=` du v3 est de la **glu qui compense ce que les couches basses ne fournissent pas**. Trois compensations → trois réparations possibles. Modèle mental cible : **« le contrat EST le vocabulaire de projection, et une seule sélection circule inchangée de la requête jusqu'à la réponse »**. Tout écart (renommages, réensemencer-puis-recouper, 3 APIs de projection) est la taxe.

1. **Unifier le contrat de projection des 3 services en un seul `select`** (le gros levier — approfondit la piste 6). Une seule sémantique : « projette exactement ça, garde toujours identité/keyset, paths pointés, nom inconnu ignoré ». Alors le v3 ne traduit plus : il forward `select` à `core.X.search(query, nav, { select })`. **`selectionToIncludes` disparaît**, et tous les consommateurs en profitent.

2. **Faire parler aux services le vocabulaire public** (catalogue de champs « public » = le vocabulaire du contrat, dont le mapper dérive aussi). Tue les renommages `verified↔state`, `additionalFields↔tags`, `nextTiming⇒timings`. C'est la vraie incarnation du « field-map unique », **possédée près du service**, pas réimplémentée dans le v3.

3. **Sortie projection-aware → supprimer la couche de trim.** `pickSelected` post-mapping est _toujours_ requis parce que les mappers réensemencent chaque champ (empty-as-empty). Si, _sélection active_, le mapper n'émet que les champs demandés, alors **pousser = trimer** : une couche au lieu de deux. La réduction conceptuelle la plus profonde, et la plus risquée (réécriture mappers, couverts intégration seulement).

4. **Dériver l'univers + le schéma imbriqué de la spec OpenAPI.** La sonde `fieldNamesOf` + les keysets `children` maintenus à la main donnent des feuilles strictes _partielles_ (contrat flou « may be rejected »). Or les schémas `additionalProperties:false` énumèrent déjà tout. Un codegen « schéma → arbre de champs » rend la validation **totale et honnête** : feuilles strictes complètes, et les seuls nœuds best-effort = exactement les `additionalProperties:true` (bag, maps localisées) — frontière _visible_ au lieu d'accidentelle. Single source = le contrat.

5. **(Locations) sortir les champs chauds de la colonne JSON `store`** (= piste 5). Exemple direct d'« améliorer le service pour garder la feature simple _et_ effective » plutôt que d'abandonner le pushdown locations.

**Ordre rendement/risque :** **#1 + #2 d'abord** (font fondre la glu v3 sans rien amputer) ; **#4** ensuite (validation pilotée par la spec, coût modéré) ; **#3** en cible long terme ; **#5** si le payload locations devient mesurément un sujet.

## Sources

Google AIP-157/161, JSON:API 1.1, MS Graph query params, Stripe expand (+ stripe-node #2327), graphql-codegen, heyapi.dev (+ openapi-ts #1613/#3270/#393). Détails dans l'historique de recherche.
