# @openagenda/api-client

Typed TypeScript client for the **OpenAgenda v3 API** — a thin, fully-typed SDK
over the public events surface, with [zod](https://zod.dev) validators and a
configurable [ky](https://github.com/sindresorhus/ky) HTTP client (retry, hooks,
timeouts) built in.

It is **generated from the OpenAPI contract** ([`@openagenda/api-spec`](../api-spec))
with [Hey API](https://heyapi.dev), so the types, request builders and validators
always track the spec — no hand-maintained client drift.

```ts
import { OpenAgenda, client } from '@openagenda/api-client';

client.setConfig({ auth: process.env.OA_API_KEY }); // a key is required

const oa = new OpenAgenda();
const { data, error } = await oa.agendas.events.list({
  path: { agendaUid: 12345 },
});
if (error) throw error;

console.log(data.data.length, 'events,', data.pagination.after, 'next cursor');
```

## Install

```sh
yarn add @openagenda/api-client
# or: npm i @openagenda/api-client / pnpm add @openagenda/api-client
```

Requires Node ≥ 18 (native `fetch`). `ky` and `zod` are peer-installed as
dependencies.

## Authentication

The API uses HTTP **Bearer** tokens, and **a key is required** — there is no
anonymous read; requests without credentials get `401`.

| Key prefix | Use                                      |
| ---------- | ---------------------------------------- |
| `oa_pk_…`  | publishable — read access                |
| `oa_sk_…`  | secret — write access (keep server-side) |

The simplest setup: configure the shared `client` once (the default base URL is
production), then instantiate `OpenAgenda`. The `auth` value is a string or a
(possibly async) callback — use the callback for short-lived / refreshed tokens:

```ts
import { OpenAgenda, client } from '@openagenda/api-client';

client.setConfig({ auth: 'oa_pk_…' });
// or, for tokens that expire:
client.setConfig({ auth: async () => getFreshToken() });

const oa = new OpenAgenda(); // uses the configured shared client
```

Need isolated instances — e.g. a different base URL or a per-tenant token per
request, without mutating shared state? Build a client and pass it in:

```ts
import { OpenAgenda, createClient } from '@openagenda/api-client';

const oa = new OpenAgenda({
  client: createClient({
    baseUrl: 'https://api.openagenda.com/v3',
    auth: () => callerToken,
  }),
});
```

## Configuration

A client accepts a `baseUrl` plus any ky option — this is where the generated
client earns its keep for direct consumers:

```ts
import { OpenAgenda, createClient } from '@openagenda/api-client';

const oa = new OpenAgenda({
  client: createClient({
    baseUrl: 'https://api.openagenda.com/v3', // dev: https://dapi.openagenda.com/v3
    auth: 'oa_pk_…',
    retry: { limit: 3 }, // ky: retry transient failures
    timeout: 10_000, // ky: per-request timeout (ms)
    hooks: {
      // ky: intercept requests/responses
      beforeRequest: [(req) => req],
    },
  }),
});
```

The same options can be set on the shared singleton via `client.setConfig({ … })`.

## Operations

Methods mirror the resource tree (`oa.agendas.events.…`). Three cover the v3
read surface — `list`, `get` and `facets`. Each takes a single options object
(`path`, optional `query`) and returns `{ data, error }`. Results are
cursor-paginated via `data.pagination.after` — resend the same filters with
`query.after` to fetch the next page.

```ts
const { data } = await oa.agendas.events.list({
  path: { agendaUid: 12345 },
  query: { limit: 50, detailed: false },
});
```

For the full list of operations, parameters and filters, see the
**[API reference](https://developers.openagenda.com)**.

## Error handling

By default a call resolves to `{ data, error }` and never throws on HTTP errors —
check `error` (typed per operation):

```ts
const { data, error } = await oa.agendas.events.get({
  path: { agendaUid: 1, eventUid: 2 },
});
if (error) {
  console.error(error.error.code, error.error.message);
  return;
}
use(data);
```

Prefer exceptions? Pass `throwOnError: true` and `data` is returned unwrapped:

```ts
const { data } = await oa.agendas.events.get({
  path: { agendaUid: 1, eventUid: 2 },
  throwOnError: true,
});
```

## Validation (zod schemas)

Every schema in the contract is exported as a zod validator under `schemas`
(prefixed `z…`) — useful to validate untrusted input or narrow a payload at a
trust boundary:

```ts
import { schemas } from '@openagenda/api-client';

const event = schemas.zEvent.parse(payload); // throws if it doesn't match the contract
```

## Types

All request/response types are exported from the package root:

```ts
import type {
  Event,
  EventSummary,
  EventList,
  Pagination,
} from '@openagenda/api-client';
```

## Provenance & contributing

This package is **generated** — `src/generated/` is produced by Hey API from
[`@openagenda/api-spec`](../api-spec) and should never be edited by hand. To
update it after a contract change:

```sh
yarn workspace @openagenda/api-client generate   # regenerate from openapi.yaml
yarn workspace @openagenda/api-client build       # tsdown → dist/ (ESM + d.ts)
```

For SDK mechanics (custom client, interceptors, response shapes), see the
[Hey API ky client docs](https://heyapi.dev/docs/openapi/typescript/clients/ky).
Fix the contract in `@openagenda/api-spec`, not the output here.

## License

Part of the [OpenAgenda](https://openagenda.com) project; released under the
OpenAgenda repository's license.
