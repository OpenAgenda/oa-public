// RFC 8693 token-exchange client — the MCP half of the O2.5 delegation.
//
// The HTTP resource server verifies a caller's bearer (aud=<this MCP resource>),
// then — before entering the sandbox — swaps it here for a SHORT-lived token
// bound to the v3 API (aud=<v3 resource>). That exchanged token is what gets
// baked into the executed code, so the caller's full consented grant never
// reaches the sandbox (see ../sandbox/preamble.js and httpServer.js).
//
// The exchange runs against the authorization server's `/oauth2/token-exchange`
// endpoint (our own — the better-auth oauth-provider has no token-exchange
// grant). We authenticate as a confidential first-party client
// (client_secret_basic: `client_id` + secret); the AS validates the subject
// token and mints the api-bound token.

const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const ACCESS_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:access_token';

/**
 * RFC 6749 client_secret_basic credential. §2.3.1: the client_id and secret are
 * form-urlencoded BEFORE being joined with `:` and base64'd — so a credential
 * containing a reserved char (`:`, `%`, …) round-trips. The AS side decodes both
 * halves with decodeURIComponent (matching the oauth-provider's own /oauth2/token),
 * so encoding here is what keeps the two ends symmetric: a raw `%` would otherwise
 * make decodeURIComponent throw → 401 invalid_client on every call.
 */
const basicAuth = (clientId, secret) =>
  `Basic ${Buffer.from(
    `${encodeURIComponent(clientId)}:${encodeURIComponent(secret)}`,
  ).toString('base64')}`;

/** Thrown when the exchange does not yield a usable api token. */
export class TokenExchangeError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number | null }} [opts]
   */
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'TokenExchangeError';
    this.status = status ?? null;
  }
}

/**
 * Exchange a subject access token for one bound to the v3 API resource.
 *
 * @param {object} opts
 * @param {string} opts.exchangeUrl   AS token-exchange endpoint.
 * @param {string} opts.clientId      this service's registered client_id.
 * @param {string} opts.secret        this service's confidential client secret.
 * @param {string} opts.subjectToken  the caller's verified bearer (aud=mcp).
 * @param {string} [opts.resource]    requested target resource (omit → AS default).
 * @param {string} [opts.scope]       optional down-scope (space-delimited).
 * @returns {Promise<{ accessToken: string, expiresIn: number|null }>}
 * @throws {TokenExchangeError} on any non-200 / malformed response.
 */
export async function exchangeToken({
  exchangeUrl,
  clientId,
  secret,
  subjectToken,
  resource,
  scope,
}) {
  let res;
  try {
    res = await fetch(exchangeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: basicAuth(clientId, secret),
      },
      body: JSON.stringify({
        grant_type: GRANT_TYPE,
        subject_token: subjectToken,
        subject_token_type: ACCESS_TOKEN_TYPE,
        // Spread conditionally — like `scope` — so an absent/empty value is never
        // sent: the AS resolves `resource ?? apiResourceUrl`, and a literal '' is
        // NOT nullish, so it would wrongly defeat that default (→ invalid_target).
        ...resource ? { resource } : {},
        ...scope ? { scope } : {},
      }),
      // Bound the wait: without this, a hung AS (connection accepted, no response)
      // stalls the caller for undici's multi-minute default before failing.
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    // Network/transport failure (or the 8s timeout abort) reaching the AS.
    throw new TokenExchangeError(
      `token exchange request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      // ignore body read failure — the status is the signal.
    }
    throw new TokenExchangeError(
      `token exchange rejected (${res.status})${detail ? `: ${detail}` : ''}`,
      { status: res.status },
    );
  }

  // Untrusted external JSON (`res.json()` is `unknown`) — typed `any` so the
  // runtime guards below are the validation; never assume the shape.
  /** @type {any} */
  let body;
  try {
    body = await res.json();
  } catch {
    throw new TokenExchangeError('token exchange returned a non-JSON body');
  }

  if (typeof body?.access_token !== 'string') {
    throw new TokenExchangeError('token exchange response had no access_token');
  }

  return {
    accessToken: body.access_token,
    expiresIn: typeof body.expires_in === 'number' ? body.expires_in : null,
  };
}
