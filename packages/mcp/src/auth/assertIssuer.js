// Boot-time issuer self-check for the HTTP resource server.
//
// The verifier (verifier.js) strict-matches a token's `iss` against
// OA_OAUTH_ISSUER, but config.js only URL-validates that env — and the correct
// value is the non-obvious `<origin>/api/auth` (the AS basePath), NOT the bare
// origin. A wrong value makes EVERY token 401 with no obvious cause. This turns
// that silent total-auth-breakage into a precise boot error by asking the AS
// what issuer it actually advertises (RFC 8414 metadata) and comparing.
//
// FAIL FAST on a genuine mismatch (throws → fatal exit before the port opens).
// TOLERANT of an unreachable/!ok AS: a transient outage or missing CA trust is
// not a misconfiguration, and the JWKS fetch is lazy anyway, so we warn and let
// boot proceed rather than coupling startup to the AS being up.

/**
 * RFC 8414 metadata locations for an issuer with a path component. better-auth
 * serves BOTH the path-suffixed form and the origin path-inserted form; we try
 * them in order and use the first that answers.
 *
 * @param {string} issuer
 * @returns {string[]}
 */
function metadataUrls(issuer) {
  const trimmed = issuer.replace(/\/$/, '');
  const { origin, pathname } = new URL(trimmed);
  const issuerPath = pathname === '/' ? '' : pathname;
  return [
    // Path-suffixed (what better-auth matches for a based instance).
    `${trimmed}/.well-known/oauth-authorization-server`,
    // RFC 8414 §3.1 origin path-insertion (only differs when issuer has a path).
    ...issuerPath
      ? [`${origin}/.well-known/oauth-authorization-server${issuerPath}`]
      : [],
  ];
}

/**
 * Verify the configured issuer matches the AS's advertised one.
 *
 * @param {object} opts
 * @param {string} opts.issuer  the configured OA_OAUTH_ISSUER
 * @param {(msg: string) => void} [opts.warn]  sink for the non-fatal skip notice
 *   (defaults to stderr) — injectable for tests.
 * @param {typeof fetch} [opts.fetchImpl]  injectable fetch (tests).
 * @throws {Error} when the AS is reachable AND advertises a different issuer.
 */
export async function assertIssuer({
  issuer,
  warn = (msg) => process.stderr.write(msg),
  fetchImpl = fetch,
}) {
  // The AS metadata (RFC 8414) — external JSON whose shape we don't control;
  // res.json() is `unknown`, so type it `any` to read the one load-bearing field
  // (`issuer`) without an inline cast. `undefined` until a metadata URL resolves.
  /** @type {any} */
  let meta;
  let lastErr;
  for (const url of metadataUrls(issuer)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        lastErr = new Error(`${url} → ${res.status}`);
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      meta = await res.json();
      break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (!meta) {
    // Unreachable / not-ok / non-JSON — NOT a misconfig signal. Warn and proceed.
    warn(
      '[openagenda-mcp] issuer self-check skipped (AS metadata unreachable: '
        + `${lastErr instanceof Error ? lastErr.message : String(lastErr)}). `
        + 'Tokens will still be verified lazily against the JWKS.\n',
    );
    return;
  }

  if (meta.issuer !== issuer) {
    throw new Error(
      `OA_OAUTH_ISSUER mismatch: configured "${issuer}" but the authorization `
        + `server advertises issuer "${meta.issuer}". Set OA_OAUTH_ISSUER to `
        + 'exactly the latter (typically the origin + "/api/auth") — otherwise '
        + 'every token fails the issuer check and 401s.',
    );
  }
}
