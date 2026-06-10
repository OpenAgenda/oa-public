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
  `example`/`examples` entry validates against its schema (ajv, 2020-12).
- `yarn lint` — `@redocly/cli lint` over the contract.

## Conventions

The contract is spec-first: endpoints are designed here before they are
implemented, and the implementation is tested against it. Changes must keep
`yarn validate` green; the SDK is regenerated from it
(`yarn workspace @openagenda/api-client generate:check` guards drift).
