# @openagenda/api-docs

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
