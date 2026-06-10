import http from 'node:http';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { createTokenVerifier } from '../src/auth/verifier.js';

// Unit-tests the OAuth bearer verifier against a REAL local JWKS server (EdDSA),
// the same way the AS would sign. Covers the claims the verifier surfaces in
// `extra` — in particular the optional `uid` (the AS's OpenAgenda-identity custom
// claim) alongside the always-present `sub`. The full middleware path
// (issuer/audience/scope/expiry rejection) is exercised in httpServer.test.js.

const ISSUER = 'https://auth.test';
const RESOURCE = 'https://dmcp.test/mcp';
const KID = 'test-key-1';

let jwksServer;
let jwksUrl;
let signingKey;
let verifier;

async function signToken(claims = {}) {
  return new SignJWT({
    scope: 'openid events:read',
    azp: 'test-client',
    ...claims,
  })
    .setProtectedHeader({ alg: 'EdDSA', kid: KID })
    .setIssuer(ISSUER)
    .setAudience(RESOURCE)
    .setSubject('user-123')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(signingKey);
}

beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA');
  signingKey = privateKey;
  const jwk = {
    ...await exportJWK(publicKey),
    kid: KID,
    alg: 'EdDSA',
    use: 'sig',
  };
  jwksServer = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  await new Promise((resolve) => jwksServer.listen(0, resolve));
  jwksUrl = `http://127.0.0.1:${jwksServer.address().port}/jwks`;
  verifier = createTokenVerifier({
    jwksUrl,
    issuer: ISSUER,
    audience: RESOURCE,
  });
});

afterAll(async () => {
  await new Promise((resolve) => jwksServer.close(resolve));
});

describe('createTokenVerifier — surfaced identity', () => {
  it('surfaces the OA `uid` claim alongside `sub` when present', async () => {
    const token = await signToken({ uid: 987654321 });
    const auth = await verifier.verifyAccessToken(token);
    expect(auth.extra).toEqual({ sub: 'user-123', uid: 987654321 });
    expect(auth.clientId).toBe('test-client');
  });

  it('leaves `uid` undefined when the token carries no such claim', async () => {
    const token = await signToken();
    const auth = await verifier.verifyAccessToken(token);
    expect(auth.extra.sub).toBe('user-123');
    expect(auth.extra.uid).toBeUndefined();
  });

  it('ignores a non-number `uid` rather than surfacing a wrong-typed value', async () => {
    const token = await signToken({ uid: '987654321' });
    const auth = await verifier.verifyAccessToken(token);
    expect(auth.extra.uid).toBeUndefined();
  });
});
