# @openagenda/api-docs

The **OpenAgenda v3 API reference** — a self-contained static
[Scalar](https://github.com/scalar/scalar) site built from
[`@openagenda/api-spec`](../api-spec) (the OpenAPI contract is the single
source of truth).

The build output is fully static and zero-egress: the Scalar runtime is
copied next to the page, the spec is inlined, and the OAuth playground
talks directly to the OpenAgenda API and authorization server — nothing
else is contacted at view time.

## Scripts

```sh
yarn build     # render dist/ (index.html + standalone.js + openapi.yaml)
yarn dev       # rebuild on spec change + serve with live reload
yarn preview   # serve an existing dist/
```

`OA_DOCS_ENV` selects the target environment (`prod`, the default, or
`dev`): API base URL and OAuth authorization server of the « try it »
playground.

## OAuth playground

The reference is executable: the playground uses OAuth 2.1 + PKCE
(public client `oa-api-docs`) against the selected environment's
authorization server, with read-only scopes. Tokens stay in the browser
(`persistAuth` keeps them in localStorage on the docs origin only).
