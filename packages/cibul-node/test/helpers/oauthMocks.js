// msw handlers for stubbing Google + Facebook OAuth endpoints. Used by the
// phase-4 OAuth façade integration tests. Generates one shared RSA keypair
// per test run, exposes the public key as a JWKS that BA's `verifyIdToken`
// fetches via `https://www.googleapis.com/oauth2/v3/certs`, and signs each
// id_token with the matching private key.
//
// Facebook does NOT use id_token verification by default in BA — its
// `getUserInfo` falls back to `https://graph.facebook.com/me?fields=...` over
// access_token. Both code paths are covered.

import crypto from 'node:crypto';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SignJWT, exportJWK } from 'jose';

const KID = 'oa-test-kid';

// `crypto.generateKeyPairSync('rsa', 2048)` is ~100ms — keep it lazy so it
// only runs in test files that actually mount Google handlers.
let keyPair;
function getKeyPair() {
  if (keyPair) return keyPair;
  keyPair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  return keyPair;
}

let publicJwk;
async function getPublicJwk() {
  if (publicJwk) return publicJwk;
  publicJwk = {
    ...await exportJWK(getKeyPair().publicKey),
    kid: KID,
    alg: 'RS256',
    use: 'sig',
  };
  return publicJwk;
}

export async function signGoogleIdToken({
  aud,
  sub,
  email,
  name,
  emailVerified = true,
}) {
  return new SignJWT({
    sub,
    email,
    email_verified: emailVerified,
    name,
  })
    .setProtectedHeader({ alg: 'RS256', kid: KID, typ: 'JWT' })
    .setIssuer('https://accounts.google.com')
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getKeyPair().privateKey);
}

export function googleHandlers({ profile, aud }) {
  return [
    http.post('https://oauth2.googleapis.com/token', async () => {
      const idToken = await signGoogleIdToken({
        aud,
        sub: profile.id,
        email: profile.email,
        name: profile.name,
        emailVerified: profile.email_verified !== false,
      });
      return HttpResponse.json({
        access_token: 'fake-google-access',
        id_token: idToken,
        token_type: 'Bearer',
        expires_in: 3600,
      });
    }),
    http.get('https://www.googleapis.com/oauth2/v3/certs', async () =>
      HttpResponse.json({ keys: [await getPublicJwk()] })),
    http.get('https://www.googleapis.com/oauth2/v3/userinfo', () =>
      HttpResponse.json(profile)),
    http.get('https://openidconnect.googleapis.com/v1/userinfo', () =>
      HttpResponse.json(profile)),
  ];
}

export function facebookHandlers({ profile }) {
  return [
    http.post(/graph\.facebook\.com\/v\d+\.\d+\/oauth\/access_token$/, () =>
      HttpResponse.json({
        access_token: 'fake-fb-access',
        token_type: 'Bearer',
        expires_in: 3600,
      })),
    http.get(/graph\.facebook\.com\/me$/, () => HttpResponse.json(profile)),
  ];
}

export function buildOAuthServer(handlers = []) {
  return setupServer(...handlers);
}
