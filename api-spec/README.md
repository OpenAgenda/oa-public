# @openagenda/api-spec

The OpenAPI 3.1 contract of the **OpenAgenda v3 public API** — the single
source of truth from which the rest of the v3 ecosystem is derived:

- [`@openagenda/api-client`](../api-client) — the generated TypeScript SDK
  (Hey API + ky + zod),
- [`@openagenda/mcp`](../mcp) — the MCP server (tool docs, parameter
  derivation and search index come from the spec),
- [`@openagenda/api-docs`](../api-docs) — the Scalar API reference site.

## Usage

```js
import { readFile } from 'node:fs/promises';

const specPath = import.meta.resolve('@openagenda/api-spec/openapi.yaml');
const spec = await readFile(new URL(specPath), 'utf8');
```

Or point any OpenAPI tooling at `node_modules/@openagenda/api-spec/openapi.yaml`.

## Scripts

- `yarn validate` — structural validation: every `$ref` resolves and every
  `example`/`examples` entry validates against its schema (ajv, 2020-12). It
  then runs `yarn workspace @openagenda/mcp check:contract`, which answers a
  different question: can the MCP's `search_docs` _render_ what this contract
  says? That server hand-interprets a subset of OpenAPI 3.1 to build the cards
  an LLM writes calls from, so a construct it does not read becomes a card that
  silently drops or misstates a field. The check names each one with a JSON
  Pointer. It is invoked as a workspace script, not depended on as a package:
  nothing here imports the MCP, and a standalone install of this package never
  runs it.
- `yarn lint` — `@redocly/cli lint` over the contract.
- `yarn test` — an alias for `yarn validate`: for a contract package, being
  well-formed and renderable IS the test, and it is what CI runs across
  workspaces.

## Conventions

The contract is spec-first: endpoints are designed here before they are
implemented, and the implementation is tested against it. Changes must keep
`yarn validate` green; the SDK is regenerated from it
(`yarn workspace @openagenda/api-client generate:check` guards drift).

### Writing descriptions

Every `description`, `summary` and `x-enum-descriptions` text is read by three
consumers that never follow a link: the MCP `search_docs` tool (it flattens each
description to one line, renders only the best-ranked operation cards in full
and shows the others as a summary; its search index covers ids, summaries,
parameters and `x-synonyms`, not descriptions), the JSDoc comments of the
generated SDK, and the Scalar reference. Hence these rules:

1. **Present tense, no timeline.** No "now", "no longer", "upcoming", "later",
   "in this version", "not yet": a reader sees the text without knowing when it
   was written, and a stale timeline is a false statement.
2. **Say what is, not what is not.** A negation is worth writing only when a
   reasonable reader would make that mistake and the server sanctions it; then
   name the sanction (`answers 400`). A silent behaviour the reader cannot
   guess is written affirmatively ("ignored when the event has no image").
3. **Self-contained.** No "see X" and no pointer to another operation or field
   for information the reader needs: write it in place, in one sentence. The
   MCP card shows only the components of its own operation; a type present on
   the same card may be named.
4. **One rule, one level, once.** A property carries the meaning of its field,
   a component its shape, an operation the behaviour of the call. A general
   rule repeated on a single field reads as an exception.
5. **Verified only.** Write nothing the code does not do; a doubtful sentence
   is deleted, not replaced by another doubtful one.
6. **No implementation history.** No fixed bugs, internal module or service
   names, storage engines, "legacy", v2 or internal reasons: the reader holds
   the contract, not the codebase.
7. **Observable and actionable.** HTTP codes, error fields, numeric limits and
   values ("rejected with `422`" rather than "invalid").
8. **Do not duplicate what the contract already carries.** A fact is carried
   when explicit contract data - `type`, `enum`, `maxLength`, `required`,
   `oneOf`, `readOnly`, a parameter's own description, `security` - states it
   without assuming how the server behaves. Write it once, at the level that
   owns it, and let each reader project it. Drop the prose only once every
   reader shows the equivalent where it is read: a missing or truncated
   rendering is a rendering gap to fix, not a reason to repeat the rule on the
   operation. Business permissions, conditional behaviour and exceptions no
   structured field carries stay in prose.
9. **Readable on one line.** No markdown lists, tables or structure that
   depends on line breaks: `search_docs` flattens the text.
10. **No search keywords in descriptions.** Discoverability is the job of
    `summary` and `x-synonyms`.
11. **No prose enumeration of an evolving set** (fields, values, types): a
    closed set belongs in the schema and the prose names the rule that defines
    it. A partial example that helps writing a call (`800x0`) is fine; a list
    that mimics the members of a schema set is not, because it drifts.
