# @openagenda/api-docs

## 0.3.0

### Minor Changes

- [#726](https://github.com/OpenAgenda/oa/pull/726) [`9be163c`](https://github.com/OpenAgenda/oa/commit/9be163cb7d6f7189a6f8b650e7090a6d640598ff) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The reference is built for the base address of the API it documents (https://api.openagenda.com/v3), where cibul-node serves it. The page loads its files from `/v3/_docs/`, named after their content so they cache for good, the scripts precompressed (`.br`, `.gz`); its configuration moves from an inline script to one of those files, so the page runs under a policy that allows scripts from its own origin only. The contract is read from `/v3/openapi.yaml`, where the API publishes it, and the download link leads there, to the file itself, rather than to a copy serialized again in the browser. `dist/docs.json` names the environment the page was built for, which the server checks against its own. The OAuth redirect URI is the page address, set explicitly, and the playground pre-ticks `geocoding:use` with the read scopes, so a token works on every read operation. `prepack` builds it, so the deployment does, and `yarn preview` serves the same layout. The runtime moves to Scalar 1.76, in its ESM build, which loads the rest of the reference as the page needs it (Copy as Markdown on each operation, navigation as links, among the updates). Without JavaScript, the page points to the contract and the MCP server, and its head names the contract as an alternate. The playground keeps its credential in memory only (`persistAuth` off), and zod, inside the runtime, is told upfront it runs without eval, so the page's policy reports no violation. The playground binds its OAuth token to the API itself (`resource` is the API root, with no `/v3`), the one audience the authorization server issues API tokens for: with `/v3`, the token exchange answered `requested resource invalid`.

## 0.2.0

### Minor Changes

- [#455](https://github.com/OpenAgenda/oa/pull/455) [`8fec416`](https://github.com/OpenAgenda/oa/commit/8fec41695a74dc5c113c0ab89f0d64eb6a4ad879) Thanks [@bertho-zero](https://github.com/bertho-zero)! - An operation now declares which API key it accepts.

  One `bearerAuth` scheme stood for both API keys, so the contract could not say that a public key is refused on a write - only the prose could. It is replaced by `publicKey` (`oa_pk_…`, read-only, no identity) and `secretKey` (`oa_sk_…`): reads accept either, writes and `/me` accept the secret key, and each stays paired with its OAuth alternative.

  The generated client is unchanged beyond one more entry in the per-operation security metadata; every requirement is still an `Authorization: Bearer` header.

  The reference page offers OAuth first: a reader without an API key signs in with
  the account they already have instead of going to fetch a key from their
  settings.

## 0.1.1

### Patch Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`51e5177`](https://github.com/OpenAgenda/oa/commit/51e5177060076dc12d35e6231cea7d4a80be91f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Pre-tick `locations:read` and `me:read` in the OAuth playground, matching the read surface (locations and `/me/agendas` landed after the initial pre-tick list).
