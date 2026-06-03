import {
  exchangeToken,
  TokenExchangeError,
} from '../src/auth/tokenExchange.js';

// Unit-tests the RFC 8693 client (src/auth/tokenExchange.js) against a stubbed
// global fetch — no network, no AS. The live exchange against the real endpoint
// is covered by scripts/smoke-oauth.js.

const EXCHANGE_URL = 'https://d.test/api/auth/oauth2/token-exchange';
const CLIENT_ID = 'mcp';
const SECRET = 'shared-secret';
const SUBJECT = 'aud.mcp.token';
const expectedBasic = `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64')}`;

let savedFetch;
let lastCall;

function stubFetch(impl) {
  globalThis.fetch = async (input, init) => {
    lastCall = { input, init };
    return impl(input, init);
  };
}

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

beforeEach(() => {
  savedFetch = globalThis.fetch;
  lastCall = null;
});

afterEach(() => {
  globalThis.fetch = savedFetch;
});

describe('exchangeToken', () => {
  it('POSTs the RFC 8693 grant with the secret and returns the minted token', async () => {
    stubFetch(() =>
      jsonResponse(200, {
        access_token: 'aud.api.token',
        issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        token_type: 'Bearer',
        expires_in: 120,
        scope: 'events:read',
      }));

    const result = await exchangeToken({
      exchangeUrl: EXCHANGE_URL,
      clientId: CLIENT_ID,
      secret: SECRET,
      subjectToken: SUBJECT,
    });

    expect(result).toEqual({ accessToken: 'aud.api.token', expiresIn: 120 });

    // Authenticates as a confidential client (client_secret_basic).
    expect(lastCall.input).toBe(EXCHANGE_URL);
    expect(lastCall.init.method).toBe('POST');
    expect(lastCall.init.headers.authorization).toBe(expectedBasic);
    const sent = JSON.parse(lastCall.init.body);
    expect(sent.grant_type).toBe(
      'urn:ietf:params:oauth:grant-type:token-exchange',
    );
    expect(sent.subject_token).toBe(SUBJECT);
    expect(sent.subject_token_type).toBe(
      'urn:ietf:params:oauth:token-type:access_token',
    );
    // No `resource` is sent — the AS binds to its single configured v3 resource.
    expect(sent.resource).toBeUndefined();
  });

  it('form-urlencodes the credential so a reserved char in the secret round-trips', async () => {
    // The AS (tokenExchangePlugin) decodeURIComponent's both Basic halves; a raw
    // `%` would make that throw → 401. Encoding here keeps the two ends symmetric.
    const trickySecret = 'a%b:c d+e';
    stubFetch(() => jsonResponse(200, { access_token: 'x', expires_in: 60 }));
    await exchangeToken({
      exchangeUrl: EXCHANGE_URL,
      clientId: CLIENT_ID,
      secret: trickySecret,
      subjectToken: SUBJECT,
    });

    // Decode the header exactly as the AS does and assert we recover the inputs.
    const b64 = lastCall.init.headers.authorization.slice('Basic '.length);
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    expect(decodeURIComponent(decoded.slice(0, sep))).toBe(CLIENT_ID);
    expect(decodeURIComponent(decoded.slice(sep + 1))).toBe(trickySecret);
  });

  it('forwards a down-scope request when a scope is given', async () => {
    stubFetch(() => jsonResponse(200, { access_token: 'x', expires_in: 60 }));
    await exchangeToken({
      exchangeUrl: EXCHANGE_URL,
      clientId: CLIENT_ID,
      secret: SECRET,
      subjectToken: SUBJECT,
      scope: 'events:read',
    });
    expect(JSON.parse(lastCall.init.body).scope).toBe('events:read');
  });

  it('returns expiresIn=null when the AS omits expires_in', async () => {
    stubFetch(() => jsonResponse(200, { access_token: 'x' }));
    const result = await exchangeToken({
      exchangeUrl: EXCHANGE_URL,
      clientId: CLIENT_ID,
      secret: SECRET,
      subjectToken: SUBJECT,
    });
    expect(result).toEqual({ accessToken: 'x', expiresIn: null });
  });

  it('throws TokenExchangeError on a non-200 (carrying the status)', async () => {
    stubFetch(() => jsonResponse(401, { error: 'invalid_client' }));
    const err = await exchangeToken({
      exchangeUrl: EXCHANGE_URL,
      clientId: CLIENT_ID,
      secret: SECRET,
      subjectToken: SUBJECT,
    }).catch((e) => e);
    expect(err).toBeInstanceOf(TokenExchangeError);
    expect(err.status).toBe(401);
  });

  it('throws TokenExchangeError when the response has no access_token', async () => {
    stubFetch(() => jsonResponse(200, { token_type: 'Bearer' }));
    await expect(
      exchangeToken({
        exchangeUrl: EXCHANGE_URL,
        clientId: CLIENT_ID,
        secret: SECRET,
        subjectToken: SUBJECT,
      }),
    ).rejects.toBeInstanceOf(TokenExchangeError);
  });

  it('throws TokenExchangeError on a transport failure', async () => {
    stubFetch(() => {
      throw new Error('ECONNREFUSED');
    });
    const err = await exchangeToken({
      exchangeUrl: EXCHANGE_URL,
      clientId: CLIENT_ID,
      secret: SECRET,
      subjectToken: SUBJECT,
    }).catch((e) => e);
    expect(err).toBeInstanceOf(TokenExchangeError);
    expect(err.status).toBeNull();
  });
});
