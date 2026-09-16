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
