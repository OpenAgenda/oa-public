// The shape of a JWS / OAuth access token: three non-empty base64url segments.
// This is the routing fork that decides OAuth-verification vs the api-key path,
// and it MUST be identical everywhere it is tested — v2 (verifyAndLoadOAuthUser,
// verifyAndLoadAgendaOrUserFromKey) and v3 (authenticate). If the copies drifted,
// the same Bearer value could route to the OAuth verifier in one middleware and
// to the api-key path in another, yielding inconsistent 401-vs-403 outcomes. So
// it lives here once.
export const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// True when `value` is shaped like a JWS (and thus an OAuth access token), as
// opposed to an `oa_pk_…`/`oa_sk_…` key or a `tk-…` token (no dots).
export const isJwsShaped = (value) =>
  typeof value === 'string' && JWT_RE.test(value);
