# @openagenda/api-docs

The **OpenAgenda v3 API reference** — a self-contained static
[Scalar](https://github.com/scalar/scalar) site built from
[`@openagenda/api-spec`](../api-spec) (the OpenAPI contract is the single
source of truth).

The build output is fully static and zero-egress: the Scalar runtime is
copied next to the page, the contract is read from the API's own origin,
and the OAuth playground talks directly to the OpenAgenda API and
authorization server — nothing else is contacted at view time.

## Where it is served

At the base address of the API it documents, https://api.openagenda.com/v3.
cibul-node (`api-v3/lib/docs.js`) answers a browser there with
`dist/index.html`, serves `dist/_docs/` under `/v3/_docs/`, a path no API
resource takes, and publishes the contract at `/v3/openapi.yaml`, where the
download link of the page leads.

- The page holds no inline script (its configuration is the `reference.*.js`
  of `dist/_docs/`), so it runs under a policy that only allows scripts from
  its own origin, and the playground's requests to the API are same-origin.
- The runtime is Scalar's ESM build: an entry that imports the rest from
  `chunks/` as the page needs it (about 0.1 MiB compressed at first load).
- The files of `dist/_docs/` are named after their content and cached for
  good; the scripts are precompressed (`.br`, `.gz`), as the API compresses
  nothing itself. A deployment replaces the chunks: a page left open across
  it loads the parts it has not opened yet only once reloaded.
- `dist/docs.json` names the environment the page was built for: cibul-node
  serves no page built for another API than its own.

The deployment builds it with the other workspaces (`prepack`), for the
environment `OA_DOCS_ENV` names (production by default).

## Scripts

```sh
yarn build     # render dist/ (index.html, docs.json, _docs/)
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
`geocoding:use`): the server refuses any other, so a one-click token only
reads. They hold no `offline_access`, so no refresh token is issued.

The playground runs against real data, same-origin, so no CORS rule stops a
write: a reader who pastes their own secret key (`oa_sk_`) can create, change
or delete what that key may, as with any HTTP client. The credential stays in
memory (`persistAuth: false`): nothing is stored on the API origin, and a
refresh asks for it again.
