import { jest } from '@jest/globals';
import {
  generateKeyPair,
  exportJWK,
  SignJWT,
  calculateJwkThumbprint,
} from 'jose';
import createOAuthTokenHelpers from '../src/oauthToken.js';

const ISSUER = 'https://d.openagenda.com/api/auth';
const MCP_RESOURCE = 'https://dmcp.openagenda.com/mcp';
// The v3-delegation audiences — only resources that delegate to v3 (the MCP),
// NOT the bare AS origin (ISSUER). Mirrors `v3DelegationAudiences` in index.js.
const VALID_AUDIENCES = [MCP_RESOURCE];

// Mint an EdDSA key pair and a matching `instance` whose `api.getJwks()` returns
// the public JWK — the same shape the better-auth jwt plugin serves at /jwks.
async function setup() {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA', {
    extractable: true,
  });
  const publicJwk = await exportJWK(publicKey);
  publicJwk.alg = 'EdDSA';
  publicJwk.use = 'sig';
  publicJwk.kid = await calculateJwkThumbprint(publicJwk);

  const getJwks = jest.fn().mockResolvedValue({ keys: [publicJwk] });
  // The helper resolves the expected issuer from the BA instance context
  // (`ctx.baseURL`), the same string BA stamps as `iss`.
  const instance = {
    api: { getJwks },
    $context: Promise.resolve({ baseURL: ISSUER }),
  };

  const sign = (claims, { kid = publicJwk.kid } = {}) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: 'EdDSA', kid })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);

  return { instance, getJwks, sign, privateKey, publicJwk };
}

const helpers = (instance, opts = {}) =>
  createOAuthTokenHelpers(instance, {
    validAudiences: VALID_AUDIENCES,
    ...opts,
  });

describe('auth - unit: verifyOAuthAccessToken', () => {
  it('accepts a token bound to the MCP resource and maps the uid claim', async () => {
    const { instance, sign } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    // sub is the better-auth row id (serial); uid is the OA identity downstream.
    const token = await sign({
      iss: ISSUER,
      aud: MCP_RESOURCE,
      sub: '313642',
      uid: '275144919111001',
      azp: 'mcp-client',
      scope: 'openid events:read agendas:read',
    });

    const result = await verifyOAuthAccessToken(token);
    expect(result).toEqual({
      // Number — the uid type used everywhere downstream (OA uids are bounded
      // < 2^48, so Number() is lossless).
      userUid: 275144919111001,
      scopes: ['openid', 'events:read', 'agendas:read'],
      clientId: 'mcp-client',
      audiences: [MCP_RESOURCE],
    });
  });

  it('rejects a token bound only to the AS origin (not a v3-delegation audience)', async () => {
    const { instance, sign } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    // A valid OA token (e.g. an OIDC/SSO login token) bound to the AS issuer/
    // origin — but NOT to a resource that delegates to v3 → must not be honoured
    // here, so an SSO token can't double as a full v3 API credential.
    const token = await sign({ iss: ISSUER, aud: ISSUER, sub: '1', uid: '42' });
    expect(await verifyOAuthAccessToken(token)).toBeNull();
  });

  it('rejects a token bound to an audience we never issue for', async () => {
    const { instance, sign } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    const token = await sign({
      iss: ISSUER,
      aud: 'https://evil.example.com',
      uid: '42',
    });
    expect(await verifyOAuthAccessToken(token)).toBeNull();
  });

  it('rejects a wrong issuer', async () => {
    const { instance, sign } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    const token = await sign({
      iss: 'https://attacker.example.com',
      aud: MCP_RESOURCE,
      uid: '42',
    });
    expect(await verifyOAuthAccessToken(token)).toBeNull();
  });

  it('rejects a token signed by a foreign key', async () => {
    const { instance } = await setup();
    const foreign = await setup(); // a different key pair, not in the JWKS
    const { verifyOAuthAccessToken } = helpers(instance);

    const token = await foreign.sign({
      iss: ISSUER,
      aud: MCP_RESOURCE,
      uid: '42',
    });
    expect(await verifyOAuthAccessToken(token)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const { instance, privateKey, publicJwk } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    const expired = await new SignJWT({
      iss: ISSUER,
      aud: MCP_RESOURCE,
      uid: '42',
    })
      .setProtectedHeader({ alg: 'EdDSA', kid: publicJwk.kid })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(privateKey);

    expect(await verifyOAuthAccessToken(expired)).toBeNull();
  });

  it('rejects a token with no uid claim (e.g. a machine/client_credentials token)', async () => {
    const { instance, sign } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    // A valid, well-audienced token but with no OA user identity to act as.
    const token = await sign({
      iss: ISSUER,
      aud: MCP_RESOURCE,
      sub: 'service-client',
    });
    expect(await verifyOAuthAccessToken(token)).toBeNull();
  });

  it('returns null for a non-JWT bearer without touching the JWKS', async () => {
    const { instance, getJwks } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance);

    expect(await verifyOAuthAccessToken('oa_pk_deadbeef')).toBeNull();
    expect(await verifyOAuthAccessToken(null)).toBeNull();
    expect(getJwks).not.toHaveBeenCalled();
  });

  it('refetches the JWKS on a kid miss past the cooldown (key rotation)', async () => {
    const { instance, getJwks, sign } = await setup();
    // cooldown 0 → a miss always refetches (the rotation-pickup behavior).
    const { verifyOAuthAccessToken } = helpers(instance, { jwksCooldownMs: 0 });

    // First call primes the cached keyset.
    await verifyOAuthAccessToken(
      await sign({ iss: ISSUER, aud: MCP_RESOURCE, uid: '1' }),
    );
    expect(getJwks).toHaveBeenCalledTimes(1);

    // A token referencing an unknown kid forces exactly one refetch.
    const stale = await sign(
      { iss: ISSUER, aud: MCP_RESOURCE, uid: '2' },
      { kid: 'rotated-away-kid' },
    );
    await verifyOAuthAccessToken(stale);
    expect(getJwks).toHaveBeenCalledTimes(2);
  });

  it('throttles JWKS refetch within the cooldown (bogus-kid flood)', async () => {
    const { instance, getJwks, sign } = await setup();
    const { verifyOAuthAccessToken } = helpers(instance, {
      jwksCooldownMs: 60_000,
    });

    // Prime the keyset (one fetch).
    await verifyOAuthAccessToken(
      await sign({ iss: ISSUER, aud: MCP_RESOURCE, uid: '1' }),
    );
    expect(getJwks).toHaveBeenCalledTimes(1);

    // A flood of bogus-`kid` tokens (the kid is read pre-verification) must NOT
    // each force a refetch — all rejected, keyset fetched at most once.
    for (let i = 0; i < 5; i += 1) {
      const bogus = await sign(
        { iss: ISSUER, aud: MCP_RESOURCE, uid: '1' },
        { kid: `bogus-${i}` },
      );
      // eslint-disable-next-line no-await-in-loop
      expect(await verifyOAuthAccessToken(bogus)).toBeNull();
    }
    expect(getJwks).toHaveBeenCalledTimes(1);
  });
});
