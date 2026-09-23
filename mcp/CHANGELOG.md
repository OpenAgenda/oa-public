# @openagenda/mcp

## 1.4.0

### Minor Changes

- [#348](https://github.com/OpenAgenda/oa/pull/348) [`51d2d18`](https://github.com/OpenAgenda/oa/commit/51d2d187bd26c3e95dcd1bd037b1e3d230863324) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `search_docs` now describes what to SEND, not only what comes back.

  The catalogue derived its cards from an operation's parameters and its response and never looked at `requestBody`, so the nine operations that take one were documented as if they took none. `agendas.events.create` rendered as `oa.agendas.events.create({ path: { agendaUid } })` — no `body` in the signature — and `EventInput` was named in its own prose ("see `EventInput`") while being defined nowhere in the payload. The LLM received the full forty-field typed `Event` it would get back, and had to infer a comparable input from a six-field example: no types, no enums, nothing saying which fields are required.

  Each card now names its body and its media type, the signature carries `body`, and the auto-derived skeleton includes it. The body component is NAMED rather than inlined: `EventInput` is shared by four write operations, so the Components section defines it once for the whole response instead of repeating forty fields per card — the payload budget that depth-by-rank exists to protect.

  Component collection follows the request body too, so the shapes a caller needs in order to WRITE are defined in the same payload as the call: `EventInput` on the create/validate/update/setByExtId cards, `EventPatch` on the patch ones, and `ImageInput`/`AdditionalFields` through `EventInput` wherever media gets attached. That is the whole of it — the same traversal that produces the types a card renders produces their definitions, so "every type named on a card is defined in that payload" holds by construction, with nothing to parse and nothing to keep in sync.

  Body fields the caller must send are now marked `, required` in their component definition, exactly as a required path parameter already was: without it every newly-surfaced write payload read as entirely optional. A body with no component to name (a multipart upload, or an inline schema) renders its own fields instead of pointing at the example. And a union inside an array is parenthesised — `(FacetName | FacetSpec)[]`, not `FacetName | FacetSpec[]`, which parses as "one name, or an array of specs" and invites a scalar where a list belongs.

  Every field line now renders the same way wherever it appears — a component definition, an object response rendered on its card, a multipart body: type, `, required`, description, and an inline enum's values. The inline paths used to drop all but the type and description, so the upload's `file` read as optional and `DeletionResult`'s `deleted: true` marker was documented nowhere.

  A binary string is typed as the SDK types it. `file` is declared `type: string, format: binary`, which the client generator turns into `file: Blob | File`; rendered as `string`, the card invited the agent to send a file name and the upload would fail. `format` is otherwise a refinement of a type the card already states correctly (`date-time`, `int64`, `uri`), carried by the field's description.

  The shapes a write payload is built from are no longer opaque either. A union component lists its alternatives, so `ImageInput` shows `{ ref }`, `{ url }` or `null` instead of its prose alone. A map names its value type — `facets (Record<string, FacetReportEntry>)` rather than `facets (object)`, which stranded the two dozen facet components the payload defined below it. An unnamed nested object lists its own fields one indent deeper, and a list's `pagination` is typed. Together these make the catalogue's invariant hold in both directions, and the tests now walk it from the cards: every type a card leads to is defined in the payload, and every definition in the payload is reached from a card — not merely cited by another definition. The added detail costs about 8% of the catalogue rendered whole, where most entries are compact lines - but an average is the wrong way to read it, because the growth sits exactly where the detail is. Measured against `main`: three rich read cards grow 40%, and a write card, which now pulls its body component into the payload, roughly doubles. Through the real search path the swing is wider still and mixes two changes, since this branch also changed how operations rank: five representative queries land between -7% and +54%.

### Patch Changes

- [#262](https://github.com/OpenAgenda/oa/pull/262) [`adf3653`](https://github.com/OpenAgenda/oa/commit/adf36534bde6e3590951e0b27649fb04e5c27e61) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Bump the Sentry (`@sentry/*` → 10.67) and OpenTelemetry (`@opentelemetry/*` → 2.10 stable / 0.221 experimental) dependencies. Adapt to the `@opentelemetry/sdk-logs` breaking change where `BatchLogRecordProcessor` now takes an options object (`{ exporter }`) instead of a positional exporter.

- [#446](https://github.com/OpenAgenda/oa/pull/446) [`83ea34c`](https://github.com/OpenAgenda/oa/commit/83ea34ca2a13b3a4c5c18363b2b30283fa427774) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `search_docs` now measures what it can render, instead of claiming it.

  The catalogue is derived at load time from the OpenAPI contract by hand-interpreting a subset of OpenAPI 3.1 / JSON Schema 2020-12. The failure that matters is silent: the contract adopts a construct the renderer does not read, a card drops or misstates a field, the LLM writes a wrong call, and the suite stays green. The guard until now was a denylist of five shapes - the five somebody had thought of - and a first attempt at replacing it with a table of keywords classified by position was worse in a specific way: it was a second interpretation of the renderer, kept in step by hand, and two independent reviews found five places where it already disagreed with the first.

  So it is a measurement now. The contract is wrapped in a proxy that records every `(node, key)` read, the catalogue is derived and every card and component definition rendered over it, and then the raw contract is walked. A key nothing read is, by construction, a key no card shows; a node whose reference was read but whose contents never were is a shape the card renders opaque. Position is a recorded fact, not a claim, so the keyword table has no notion of it - and `ROOTS`, `direction` and the rest of the predictions are gone. It measures reads, not uses: a key read and then discarded still counts, which is what the rendering tests are for.

  What it found on the contract we ship, and what is now fixed:

  - **22 structured query parameters rendered as a bare `object`.** `timings[gte]=…&timings[lte]=…`, `extId[key]=…&extId[value]=…`, and the `age`, `localTime`, `createdAt` and `updatedAt` ranges are declared as objects with properties; the card said `object` and, since nothing marked them notable, compacted them into the names line. The caller could not know a key existed. They now render their fields, from the same derivation as every other field list, and keep a full line.
  - **A map parameter whose accepted values were listed nowhere.** `facetSorts` is `Record<string, string>` on the card, so `count` and `alpha`, which sit on the map's values, had no other place to appear. The enum resolver now looks there.
  - **A partial enum read as the whole type.** `threshold` is `oneOf: [enum(off, auto), number]`, and the card said `[one of: off, auto]` - which hides the absolute score the other branch takes. It now reads `[one of: off, auto, or a number]`; a parameter whose enum IS its type keeps the plain wording.
  - **Four nullable component roots.** `AgeRange`, `Accessibility`, `AgendaNetworkRef` and `AgendaLocationSetRef` are `type: [object, 'null']`, rendered by their fields; every line pointing at them names the component alone, so `null` reached no card. Their definition head now says `(object | null)`.

  The check runs in three places, for three readers: this package's tests, `@openagenda/api-spec`'s own `validate` (so the failure reaches whoever is writing the contract), and the server itself on its first payload - a published install resolves the contract on a range, so it can carry one newer than this version was tested against, and it now leads the payload with what to distrust rather than rendering plausible, wrong cards.

  Also: the cards are cross-checked against `@openagenda/api-client`'s generated types - operation inventory, argument groups, key names, optionality, a structural type key one level deep, and the success response. That is an independent reading of the same contract, and it is what turns a disagreement into a failing test: reverting the `Blob | File` fix makes it fail on both upload operations.

  Two more silences the measurement did not catch, because they are not about a construct the renderer misreads but about a parameter it declines to show:

  - **Four patterned strings compacted to their names.** `near` is `lat,lng`, `bbox` four comma-separated floats, `month` a `YYYY-MM`. A `pattern` says the string is not free-form, yet none of them was notable, so each was folded into the names line and its description - the only place the format is written - never reached the card. Measured against the live API with two small models: asked for a rectangle given as two `(latitude, longitude)` corners, both wrote `bbox` in the natural `lat,lng,lat,lng` order. The contract's pattern matches four floats in any order, so the API answers `200` with an empty set; one model reported "0 events" as the answer, the other spent seven turns and four calls - including a deliberate `bbox=not-a-bbox` probe to read the error message - before finding the order. With the format on the card both write `west,south,east,north` first try, in three turns. A `pattern` now makes a parameter notable and travels to the line, where the description that actually disambiguates it can be read; the regex alone never says which corner comes first. An array whose ITEMS carry a pattern stays omitted on purpose: the one in this contract is `countryCode`, whose name and description already say ISO 3166-1 alpha-2.

    A component FIELD carries its pattern for the same reason, and the reason is stronger there: a patterned parameter filters a read, where a patterned field travels in a request BODY. The case arrives with `main`, which adds `Timing.id` - six characters of Crockford base32, reachable from the body of all six event writes - and the merge is what surfaced it: the check reported no break, but the pinned omissions gained `/components/schemas/*/properties/*/pattern`, which is the guard doing its job (a construct reaching a new place is a decision somebody makes, not a silence nobody hears). That field's own description happens to spell the alphabet out in prose, so what this buys today is a regex a reader can match instead of an alphabet it has to derive. What it buys tomorrow is the field whose description is one line.

  And the texts an LLM reads, which are the whole product of this package:

  - The compact tail entries said nothing about being openable, while the server instructions told the model that earlier results stay valid - so an operation seen only as a name could be called with an opaque `query`. Searching an operation by its id ranks it in the top 3 for every operation in the catalogue, which a test now pins; a line under the tail points at that, conditionally, because an unconditional "search again" costs a 30 kB payload for nothing.
  - The contract warning spent eighty words telling the reader to upgrade the server and consult an API reference - neither of which an LLM can do, and the payload IS its reference. It now offers the one check it can perform: where a card and a live response disagree, the response is right.
  - The SDK preamble promised that a route not callable through the client "shows its own call, marked" - true on a rich card, false in the compact tail, where `POST /uploads/staged` appears bare. The rule is now the form of the call line itself, which holds in both modes.
  - `facetSorts` rendered `[one of: count, alpha]` after a `Record<string, string>` type, which reads as the parameter being one of two strings; the enum constrains the map's values, and the line now says so.
  - "Working with an agenda? Fetch its event form schema first" cost a call before every plain read. The trigger is now the invariant - a call that touches an agenda's additional fields, whether it fills, filters or facets on them - so a facet or a write path added later is covered without a text change.

  A code review of the whole branch then found fifteen more, of which these mattered:

  - **The check ran inside the request path with no `try`.** It is memoised on success only, so a contract that made it throw turned every `search_docs` call into an error, forever - the mechanism meant to degrade gracefully failing harder than the cards it guards. It now catches and memoises a finding of its own (`the contract check itself failed`), because a silent empty result is the exact failure this feature exists to prevent.
  - **A component named on a card and defined nowhere.** `renderComponentsSection` excluded a response root unconditionally, on the assumption the card had rendered it inline - true of a list root and of an object root with fields, false of a union, which renders as a bare `Response: \`Outcome\`` and then loses its own definition. The checker could not see it: its reachability walk goes definitions to cards, never cards to definitions.
  - **Cycles were guarded by `$ref` string.** A YAML alias resolves to a shared object with no `$ref`, so `enumSchemaOf` and `collectComponentRefs` - in the renderer, not the checker - recursed until the stack blew, breaking catalogue derivation at load. All the guards are keyed by node identity now.
  - **The reachability check read prose.** It matched component names against the whole card, so an operation description citing a type by name vouched for a body the card renders opaque. The renderer now reports the names it writes in a type position as it writes them, so what leads a reader from a card to a definition is a fact stated at the point of rendering rather than one read back out of the finished text - the same move as the rest of this change, one level up.
  - **Two success responses were compared by `JSON.stringify`**, so the same shape written with its keys in another order was reported as a divergence - a false positive that now blocks `api-spec`'s `validate`.

  Two seams that review left open are closed here as well. The dry run rendered EVERY component definition, where a payload never defines a list root - its card gives `{ data, pagination }` on the head line and the Components section leaves it out. A third property at such a root was therefore read by the dry run and shown to no reader: exactly the silence this mechanism exists to break. The dry run now skips what the payload skips, a test pins it, and the prose on a list root's `data` joins the omissions it always was. And the OAuth scopes the protected-resource metadata advertises were walked out of the contract a second time in `config.js`, beside the `op.scopes` the catalogue already derives and nothing read - the same fact, two readings, one of them able to drift. `specScopes()` consumes the catalogue's now; what is advertised is bounded by what is reachable, and the contract is parsed once instead of twice.

  Plus: the `execute` tool description still said every operation is an `oa.*` call, which this branch had just made false for the ticket upload; a nullable enum component rendered `(string,null)`; the skeleton example wrote a scalar where a map parameter takes a map; the contract CLI broke on a working directory containing a space; and the SDK parity suite skipped itself silently when the generated source was missing, which is the one case where it should fail.

- [#348](https://github.com/OpenAgenda/oa/pull/348) [`129e5ec`](https://github.com/OpenAgenda/oa/commit/129e5ec99e4a2c0b6cfeb24c85ee24a8f0cad6df) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `search_docs` no longer advertises an SDK call for the one endpoint the contract forbids calling that way.

  `uploads.staged` receives the raw bytes of an out-of-band upload and is authorized by a single-use `X-Upload-Ticket` header — not by the API key or OAuth token the `oa` client carries. Its description is explicit: "Call it with a plain HTTPS `POST`, NOT through the typed API client — the purpose of the ticket flow is that the file never transits the client (or an LLM's token stream)." The contract curates the correct invocation as a `Shell` sample.

  That sample was discarded: `exampleFor` only accepted TypeScript-ish languages, so the operation fell through to the auto-derived skeleton and rendered `const { data, error } = await oa.uploads.staged();` — no ticket, no file, no body, and precisely the call the description rules out. The example is the most-imitated part of a card, so an agent following it would have defeated the point of the ticket flow and got a 400/401 for its trouble.

  A curated sample is now kept whatever its language and rendered under its own fence, and an operation the client's credentials do not authorize is named by its wire signature (`POST /uploads/staged`), marked "call it over plain HTTPS, not through the `oa` client", instead of an `oa.*` invocation. Whether the client can reach a route is derived from its security requirements rather than from a list of operation ids, so a second ticket-style endpoint needs no change here: the requirements are read as OpenAPI defines them (alternatives, each needing all of its schemes; `{}` as anonymous access), and each scheme by its type rather than its name. The advertised OAuth scopes are read the same way, so a renamed OAuth2 scheme no longer drops out of `scopes_supported`.

  The `execute` tool description now gives calls as `{ path?, query?, body? }`, and the SDK lead of every `search_docs` response points out the rare route that must not go through the client, which shows its own invocation instead.

- [#348](https://github.com/OpenAgenda/oa/pull/348) [`4abc5fc`](https://github.com/OpenAgenda/oa/commit/4abc5fc648b73cf155c522414648b4a813fc9e45) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `search_docs` now describes the response of a creation instead of leaving it blank.

  The operation catalogue read the success body from a hardcoded `responses['200']`, so an operation answering `201` and nothing else fell through to no response shape at all. `agendas.events.create` is the only one in the contract, which is why it went unnoticed: its card documented the call, its parameters and a runnable example, then stopped — the LLM was told how to create an event but never what comes back, and the `Event` components the body references were missing from the payload's Components section too.

  The body is now taken from the lowest 2xx response that carries a JSON schema. `agendas.events.create` renders as `Response: Event` with its fields, identical to the single-get as the contract promises, and the by-ext upserts (which answer `200` when they update and `201` when they create, with the same component either way) keep reading as their `200`. A `2XX` range response is read too (an explicit status still wins), JSON is recognised by media type whatever its case or suffix (`application/merge-patch+json`, `; charset=utf-8`), and a body wrapped in `allOf` renders its merged fields inline instead of none — only a bare `$ref` is named, since a wrapper may constrain what it wraps and the component's own definition would then describe a different shape.

- [#348](https://github.com/OpenAgenda/oa/pull/348) [`2da5966`](https://github.com/OpenAgenda/oa/commit/2da5966b52fc8da3b7dc9da0587a31023c5f014b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `search_docs` no longer lets the filler of a plain-language query outrank the resource being asked for: "show me events", "give me the list of events" and "can you show me events" all returned `me.agendas.list` ahead of `agendas.events.list`.

  Relevance is BM25, which ranks by rarity — so filler becomes dangerous the moment it collides with a term the catalogue holds exactly once. `me.agendas.list` was hit by two such collisions at once, which is why it captured any sentence addressed to an assistant:

  - its operationId carries the namespace segment `me`, a singleton in the ×3-boosted id field, so the pronoun in "show **me** events" scored more than twice what "events" scored on the listing operation;
  - its summary — "List **the** agendas **you** are a member of" — is the only one in the contract containing "the" or "you", making both singletons in the ×2-boosted summary field.

  Stop words are now stripped from the indexed summary, which is where the prose collision came from: the list was already maintained in this module for the derived keywords, while the raw summary was indexed verbatim. It is applied to the summary alone — the curated `x-synonyms` contain stop words as deliberate signal ("by id", "by ext", "one"), and stripping those would break the queries they exist to serve. The structural collision needs the other half: the 1–2 character tokens of a query are damped, since no stop list enumerates every pronoun a user might use, and no summary filtering reaches a term that lives in an operationId.

  The two guards are independent and neither subsumes the other — measured across the query set, dropping either one lets the wrong operation win again. Filler is demoted, never dropped, so the short words that genuinely ask for that operation ("my agendas", "memberships") still reach it.

- [#446](https://github.com/OpenAgenda/oa/pull/446) [`6a4926b`](https://github.com/OpenAgenda/oa/commit/6a4926bff0bea518b97a14d5e7ee6e5cf0131a24) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Two texts an LLM reads before it plans said something the server does not do.

  `search_docs` described itself as "Find the OpenAgenda v3 operations relevant to a question" - the shape of a filter handing back a subset. The tool is a ranker: it scores the whole catalogue and returns everything it matched, the top hits in full and the rest named. The same sentence promised "signatures, parameters and examples" while the payload also carries a request body and a response shape, and it said nothing at all about the tail, which is most of the entries. The description now states what comes back, completely.

  The server `instructions` had a subtler defect. "Search again only for an operation whose parameters you have not yet seen" is a rule about HISTORY, and history is the one thing an MCP client can lose: a context that has been compacted no longer holds the cards, though the model has still seen them - so the rule forbade the single search that would recover them. It is keyed on availability now, a property the reader can actually check: search again when the operation you need is not documented in front of you.

  Both changes are justified by being true, and by nothing else. The hypothesis that prompted them - that a filter framing invites a caller to fan out paraphrases of one intent - was tested and did not survive. An interleaved A/B on the production API, 120 runs, three models, ten tasks, two arms whose texts are identified by hash in every trace: first-turn `search_docs` calls went 0.90 -> 0.90 (Gemma 4 31B), 2.40 -> 2.40 (Muse Glimmer 30B) and 1.15 -> 1.05 (GLM 5.3 Flash), with identical correctness. The 30B model fires three parallel searches on seven tasks out of ten under either wording. Payload read per task fell 2-9%, which is a side effect of slightly different queries, not a result. Nobody should read a behavioural gain into these texts.

  Two wordings were rejected on the way, each proposed by a reviewer, both false in the same way: "a single search returns the whole catalogue" and "parallel searches on reformulations return the same cards". `searchOperations` returns the MATCHES - between 5 and 23 of 24 operations depending on the query - and falls back to the whole catalogue only on an empty or unmatched query. And reformulations do not return the same cards: three paraphrases of one question put `list`+`facets`, `list`+`facetsReport` and `get`+`getByExtId` at ranks 2-3, which is different documentation. Equal byte counts had suggested duplicates; the payload hashes said otherwise. A model that checks a claim like that finds the server wrong, which is worse than a server that says less.

  Nothing else changed. No state or de-duplication was added (the HTTP server is per-POST by construction, and parallel calls are concurrent - none of them can know it is the second), the payload keeps its shape, and nothing was written about `limit`, whose range the card already gives three times. Each text is pinned by a test on its intent rather than its spelling.

- Updated dependencies [[`8b03d1a`](https://github.com/OpenAgenda/oa/commit/8b03d1a35313201ad67d627418902872a03f93dd), [`7d463dc`](https://github.com/OpenAgenda/oa/commit/7d463dcceecc06098d87e778c09efa6fa109d4c9), [`9ea8905`](https://github.com/OpenAgenda/oa/commit/9ea89054f0f866da4bb1cb4a48410c27db8894b8), [`bc7984b`](https://github.com/OpenAgenda/oa/commit/bc7984bc39d9d0aecd652bf9861eaee7c4bb7ee6), [`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`adf3653`](https://github.com/OpenAgenda/oa/commit/adf36534bde6e3590951e0b27649fb04e5c27e61), [`9e158bd`](https://github.com/OpenAgenda/oa/commit/9e158bd1dc50c20ed1c4201346561ffc37d39862), [`f45f9b6`](https://github.com/OpenAgenda/oa/commit/f45f9b6808ba90cb44f49938b0e5c0fda33bfb03), [`c5f74f6`](https://github.com/OpenAgenda/oa/commit/c5f74f68ce6fd42723bc6e5c969d1fac4a2dd503), [`087b12e`](https://github.com/OpenAgenda/oa/commit/087b12ef0488b512b4199f653224c5d7d188a6db), [`ba35930`](https://github.com/OpenAgenda/oa/commit/ba35930a2722b27ead1d691bddfeacfc5cb70b34)]:
  - @openagenda/api-spec@0.4.0
  - @openagenda/logs@1.2.2

## 1.3.2

### Patch Changes

- [#204](https://github.com/OpenAgenda/oa/pull/204) [`c9ed00e`](https://github.com/OpenAgenda/oa/commit/c9ed00e2882157a69b267b14a72b372aaacf4b8f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Align the OAuth smoke script with the version-neutral API audience. The OAuth access-token audience is now a single, version-neutral API resource id (the bare API root, `aud=api`) covering both the v2 and v3 APIs, instead of a `/v3`-suffixed value. `scripts/smoke-oauth.js` comments are updated accordingly (`aud=<v3>` → `aud=<api>`); the token-exchange flow it exercises is functionally unchanged.

- Updated dependencies [[`5420053`](https://github.com/OpenAgenda/oa/commit/54200538b8108ce7664e800c6ae4a70f38b68c4a), [`13a924d`](https://github.com/OpenAgenda/oa/commit/13a924d48b45f5b3133f10c137f2ceab43f28768), [`ea60459`](https://github.com/OpenAgenda/oa/commit/ea604592638ee8890612c40a9bd8d672d358be9b), [`1708abd`](https://github.com/OpenAgenda/oa/commit/1708abdcdfc9679b6a72a0709f13db20263d5efa), [`cb8a56f`](https://github.com/OpenAgenda/oa/commit/cb8a56f3c63e95b37359495d36bbc57034ae43ec), [`e4a1f3d`](https://github.com/OpenAgenda/oa/commit/e4a1f3d285ca8828a7fdd8caf656f845549c0f9a), [`86edff3`](https://github.com/OpenAgenda/oa/commit/86edff39e89184230b8351d87723277c0faa3be6), [`a37dc80`](https://github.com/OpenAgenda/oa/commit/a37dc8072933f449af337ee5785fb881a101c548), [`072a7b6`](https://github.com/OpenAgenda/oa/commit/072a7b69279ef1390e79e89c1f230e13dc1fa6cf), [`c3d33c4`](https://github.com/OpenAgenda/oa/commit/c3d33c488c0d65a077bf2ad12a74cd821dde7106)]:
  - @openagenda/api-spec@0.3.0

## 1.3.1

### Patch Changes

- Updated dependencies [[`a3bd9bd`](https://github.com/OpenAgenda/oa/commit/a3bd9bd75ac41e5f5c62bc7e43efcd8b376ffa99)]:
  - @openagenda/logs@1.2.1

## 1.3.0

### Minor Changes

- [`4e83203`](https://github.com/OpenAgenda/oa/commit/4e832038a829f62c58d56fd0c6bb95d4faddaf65) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Surface the `@openagenda/api-client` SDK as the path from prototype to product. The `oa.*` calls the `execute` sandbox runs are the public surface of that npm package, but nothing told an agent (or a developer) that the code they prototype ships unchanged in a real site or tool. Now: every `search_docs` response LEADS with the frame that the operations it renders are the SDK (install + one-time `client.setConfig` + key guidance), so the model reproduces them as SDK calls instead of hand-rolled fetch; the `execute` tool description states the portability inline; and the landing page and README gain a "Build with the API" section. The lead also states the wire auth contract — every request authenticates via `Authorization: Bearer <key>`, not a `key` query param or header — which catches the raw-fetch path models still reach for. Use a read-only publishable key (`oa_pk_…`) for in-browser reads, a secret key (`oa_sk_…`) server-side for writes.

## 1.2.0

### Minor Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`69963d8`](https://github.com/OpenAgenda/oa/commit/69963d869677beeb5da95a02033900026cd9885c) Thanks [@bertho-zero](https://github.com/bertho-zero)! - search_docs renders a Components section: every named type a rich card references is defined once in the same response — enum components with their decode table (`EventStatus`: 1 = Scheduled, …), object components with typed, described property lines (e.g. `FormSchemaField.schemaId` marking additional fields). Type names are now uniform across the whole payload: params, response fields and validators all use the component name (`status (EventStatus[])` filters, `status (EventStatus)` on events, `schemas.zEventStatus`), params keep their passable values inline, and object-kind responses render their root field by field with descriptions — so an LLM can write the call AND decode what `execute` returns without a second lookup. The section is render-only (not indexed) so shared components leak no relevance credit between operations.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`e570a55`](https://github.com/OpenAgenda/oa/commit/e570a550e02503d0f78fb0aa0d37980b23a4a5c8) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The server now ships MCP `instructions` (returned in the initialize result, mounted by clients as system-context guidance): compose `execute` bodies from `search_docs` results — call it before the first `execute`, search again only for operations not yet seen. This channel frames the workflow before any planning happens, which keeps lower-tier models from skipping discovery and composing `execute` bodies from priors, without prescribing redundant re-searches once the catalogue is in context. Content split: `instructions` carries how the tools articulate, tool descriptions carry how to use each tool, the contract carries per-operation reference.

### Patch Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`e570a55`](https://github.com/OpenAgenda/oa/commit/e570a550e02503d0f78fb0aa0d37980b23a4a5c8) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The `execute` tool description now carries the agenda schema-first doctrine: when working with an agenda, fetch its event form schema first (`oa.agendas.events.schema`) — it defines the agenda's topology, whose own fields drive stats (the `additionalFields` facet) and complete event payloads. The tool description is the closest universally-supported text to where the LLM composes its code, which is why the guidance lives there rather than in per-operation docs.

- [#147](https://github.com/OpenAgenda/oa/pull/147) [`227232c`](https://github.com/OpenAgenda/oa/commit/227232c4ecd43051155bf8a0fe3f02a69f22dcc2) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add one-click install deep links to the landing page — Cursor, VS Code, VS Code Insiders and LM Studio — each carrying just the remote endpoint (the client runs the OAuth flow on first connect). Also slim the `execute` tool description: per-operation response shapes (pagination, facets) now live only in `search_docs`, where they are derived from the contract, instead of being duplicated in the tool description.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`916a964`](https://github.com/OpenAgenda/oa/commit/916a9641858014e67c38ab39449bb6067fab83d4) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Derive the advertised OAuth scopes from the contract instead of a hand-maintained list: `scopesSupported` (PRM + DCR client) is now `openid`/`offline_access` plus every `oauth2` scope the bundled spec's operations require. Fixes `/me/agendas` being unreachable over OAuth (`me:read` shipped in the spec but the hand-kept list omitted it, so DCR clients could not even request the scope), and stops advertising declared-but-unused scopes (`members:read`). New spec scopes now reach the PRM by bumping the `@openagenda/api-spec` dependency — do that only once the production AS issues them.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`69963d8`](https://github.com/OpenAgenda/oa/commit/69963d869677beeb5da95a02033900026cd9885c) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Derive the summary/detailed list variants structurally (smaller property set = summary) instead of relying on the contract's `oneOf` order — the spec now lists the detailed branch first (zod client constraint), which would have flipped the operation docs' "default shape + detailed upgrade" labelling.

- Updated dependencies [[`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b), [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b), [`86975d0`](https://github.com/OpenAgenda/oa/commit/86975d0c0d088e6ad4351a3df9d46841e26f0121), [`9e497b6`](https://github.com/OpenAgenda/oa/commit/9e497b67b0e1a4d06735890a8db082c0ea6a1b7c), [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b), [`7034cd1`](https://github.com/OpenAgenda/oa/commit/7034cd1010e196f47c2047afd3ee0e4c5677b7ba), [`fad618a`](https://github.com/OpenAgenda/oa/commit/fad618aef5a42d4872ed909ba07234c536849820), [`4316075`](https://github.com/OpenAgenda/oa/commit/431607534fdc484939a9c40cc9fa9410e9cc8312), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/api-spec@0.2.0
  - @openagenda/logs@1.2.0

## 1.1.1

### Patch Changes

- [#145](https://github.com/OpenAgenda/oa/pull/145) [`0f0a50c`](https://github.com/OpenAgenda/oa/commit/0f0a50c8a2fa89ba71a0e2d123242cfae58cbe52) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add a one-click Claude Desktop bundle (`openagenda.mcpb`). It is a thin launcher — the manifest runs `npx @openagenda/mcp` over stdio and prompts for the API key — so it always pulls the current published version and never needs re-releasing when the server or API contract changes. Build it with `yarn pack:mcpb`. The hosted OAuth server stays a remote URL connector (mcpb is local-stdio only).

  The bundle is attached to each GitHub release (CI) and offered for download from the server's landing page, version-pinned to the running server.

- [`11864ca`](https://github.com/OpenAgenda/oa/commit/11864ca9539f1dd36334b6957fc106d2b0f1ad10) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add npm package metadata for discoverability: `keywords` (mcp, model-context-protocol, openagenda, events, …), `author`, a `bugs` URL, and `repository.directory` so the npm listing links to the package subfolder in the mirror.

## 1.1.0

### Minor Changes

- [#142](https://github.com/OpenAgenda/oa/pull/142) [`740ba38`](https://github.com/OpenAgenda/oa/commit/740ba38f307e60e91cd7b485453b39e0e29f9262) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Node-first local mode, unauthenticated discovery card, and CLI flags.

  Behavior changes:

  - The local default execution engine is now plain node, hardened with Node's permission model (`--permission`, Node ≥ 24: filesystem/subprocess/workers denied) — replacing deno. This shifts the default code-egress posture: the node engine does NOT bound network egress (deno's `--allow-net` did), so a default local deployment must trust the executed code's network reach (a boot banner states this; `OA_EXECUTOR=deno` restores the scoped-egress boundary). `engines.node` is now `>=24` (the permission sandbox floor). `OA_LOCAL_NO_SANDBOX=1` now means "bare node, no sandbox at all" and stays the explicit egress ack for other engines.
  - The `http` transport now FAILS CLOSED on an unbounded-egress configuration: `transport=http` with the default node engine (egress=none) refuses to boot. A network-facing server must bound egress (`OA_EXECUTOR=deno` or `microsandbox`), run under an egress wrapper, or explicitly acknowledge a trusted single-tenant box with `OA_LOCAL_NO_SANDBOX=1`. (Production hosted is already forced to microsandbox; this guards the self-hosted operator who runs http but leaves `OA_MCP_MODE` at its local default.)

  Features:

  - New `/.well-known/mcp.json` (and the `/.well-known/mcp/server-card.json` variant Smithery fetches) MCP Server Card (SEP-1649 draft): static identity, tool definitions and the OAuth requirement, readable without a token — generated from the same tool definitions as `tools/list`. The execute tool description reflects the deployment's REAL sandbox boundary, never an overstated claim.
  - App-wide CORS `*` on the HTTP transport (no ambient auth — bearer only): browser-based MCP clients pass the preflight on `POST /mcp`, and the 401's `WWW-Authenticate` discovery challenge is exposed cross-origin.
  - CLI: `--help`/`--version` and non-secret flags (`--transport`, `--port`, `--executor`, `--base-url`) mapping onto their env vars; secrets remain env-only.
  - Registry `server.json`: brand icons (PNG + SVG), node-first env var docs, new `OA_EXECUTOR` entry.

## 1.0.2

### Patch Changes

- [#139](https://github.com/OpenAgenda/oa/pull/139) [`a7efa05`](https://github.com/OpenAgenda/oa/commit/a7efa0544f4eb38c747ac336a0cdacfacb82f6c5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Serve the OAuth Protected Resource Metadata (RFC 9728) at the root well-known
  form too (`/.well-known/oauth-protected-resource`, without the resource path
  suffix). Some clients derive the PRM from the origin instead of the full
  resource URL — Le Chat (Mistral) documents exactly that URL in its connector
  troubleshooting checklist and could not discover the authorization server.

## 1.0.1

### Patch Changes

- [#135](https://github.com/OpenAgenda/oa/pull/135) [`77cd0c9`](https://github.com/OpenAgenda/oa/commit/77cd0c9019de0ccd08b94de2af09013ee39d84fa) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Clearer MCP registry listing and a truthful handshake version. The registry
  description now leads with the capability ("Search, analyze and manage events
  on OpenAgenda.") and the stdio path documents `OA_LOCAL_NO_SANDBOX` — the
  unblock flag when deno is not installed. The MCP `initialize` handshake now
  reports the released package version instead of a hardcoded `0.0.0`.
