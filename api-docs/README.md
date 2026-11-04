# @openagenda/api-docs

The **OpenAgenda v3 API reference** — a self-contained static
[Scalar](https://github.com/scalar/scalar) site built from
[`@openagenda/api-spec`](../api-spec) (the OpenAPI contract is the single
source of truth).

The build output is fully static and zero-egress: the Scalar runtime is
copied next to the page, the spec is inlined, and the OAuth playground
talks directly to the OpenAgenda API and authorization server — nothing
else is contacted at view time.

## Where it is served

At the base address of the API it documents, https://api.openagenda.com/v3:
cibul-node answers a browser there with `dist/index.html`, and serves the
other files of `dist/` under `/v3/_docs/`, a path no API resource takes. The
page holds no inline script (its configuration is `dist/reference.js`), so
it runs under a policy that only allows scripts from its own origin, and the
playground's requests to the API are same-origin.

The deployment builds it with the other workspaces (`prepack`), for the
environment `OA_DOCS_ENV` names.

## Scripts

```sh
yarn build     # render dist/ (index.html, reference.js, standalone.js, openapi.yaml)
yarn dev       # rebuild on spec change + serve with live reload
yarn preview   # serve an existing dist/, at http://localhost:4321/v3
```

`OA_DOCS_ENV` selects the target environment (`prod`, the default, or
`dev`): API base URL and OAuth authorization server of the « try it »
playground.

## OAuth playground

The reference is executable: the playground uses OAuth 2.1 + PKCE
(public client `oa-api-docs`) against the selected environment's
authorization server. The client is a row of `oauth_client`, public with no
secret, whose redirect URI is the address of the page,
`https://api.openagenda.com/v3` in production and
`https://dapi.openagenda.com/v3` in development, without a trailing slash.
Its scopes are the ones the page pre-ticks, the read surface and geocoding
(`agendas:read`, `events:read`, `locations:read`, `me:read`,
`geocoding:use`): the server refuses any other, and writes stay out of a
playground that runs against real data. They hold no `offline_access`, so no
refresh token is issued.
Tokens stay in the browser (`persistAuth` keeps them in localStorage on the
docs origin only).
