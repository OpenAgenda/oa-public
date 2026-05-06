// 301 redirects for legacy auth URLs that may still be in circulation
// (already-sent emails, bookmarks, third-party docs). These tests pin the
// redirect map so a future refactor cannot silently break links the user
// base relies on.
//
// We don't need full services for these tests — the redirect handlers do
// not hit the DB, the BA layer or the session middleware. We mount only
// `legacyRedirectsFront` on a bare Express app to keep the suite fast and
// independent of MySQL/Redis fixtures.

import express from 'express';
import request from 'supertest';
import legacyRedirectsFront from '../auth/legacyRedirects.front.js';

function buildBareApp() {
  const app = express();
  legacyRedirectsFront(app);
  return app;
}

describe('37 - auth legacy URL redirects', () => {
  let app;

  beforeAll(() => {
    app = buildBareApp();
  });

  it('redirects all retired auth routes to their new locations with 301', async () => {
    // /signin → /auth/signin (preserves query)
    let res = await request(app).get('/signin?redirect=foo&lang=fr');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/signin?redirect=foo&lang=fr');

    // /:agendaSlug/signin → /auth/signin?agenda=<slug>&...
    res = await request(app).get('/lyon/signin?lang=en');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/signin?agenda=lyon&lang=en');

    // /signup → /auth/signup (preserves invitation/email/lang)
    res = await request(app).get(
      '/signup?invitation=abc&email=a%40b.test&lang=en',
    );
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      '/auth/signup?invitation=abc&email=a%40b.test&lang=en',
    );

    // /:agendaSlug/signup → /auth/signup with synthesized base64 redirect
    res = await request(app).get('/lyon/signup');
    expect(res.status).toBe(301);
    const expectedRedirect = Buffer.from('/lyon/contribute', 'utf8').toString(
      'base64',
    );
    expect(res.headers.location).toBe(
      `/auth/signup?redirect=${encodeURIComponent(expectedRedirect)}`,
    );

    // /:agendaSlug/signup with explicit redirect → preserved (no override)
    res = await request(app).get('/lyon/signup?redirect=Zm9v');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/signup?redirect=Zm9v');

    // /password/lost → /auth/signin?view=lost
    res = await request(app).get('/password/lost');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/signin?view=lost');

    // /activate/resend → /auth/signin?view=resend (preserves email)
    res = await request(app).get('/activate/resend?email=a%40b.test');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      '/auth/signin?email=a%40b.test&view=resend',
    );

    // /:agendaSlug/activate/resend → /auth/signin?agenda=<slug>&view=resend
    res = await request(app).get('/lyon/activate/resend?email=a%40b.test');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      '/auth/signin?agenda=lyon&email=a%40b.test&view=resend',
    );

    // /password/reset?token=… → /auth/reset?token=…
    res = await request(app).get('/password/reset?token=ABC.DEF');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/reset?token=ABC.DEF');

    // /password/reset/:token (legacy path-param shape) → /auth/reset?token=…
    res = await request(app).get('/password/reset/legacyToken123');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/reset?token=legacyToken123');

    // /google/signin → /auth/signin?provider=google (BA's social endpoint
    // is POST-only, so we land on the signin page where the user can click
    // the Google button). callbackURL is hoisted to redirect=base64.
    const homeRedirect = Buffer.from('/home', 'utf8').toString('base64');
    res = await request(app).get('/google/signin?callbackURL=%2Fhome');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      `/auth/signin?provider=google&redirect=${encodeURIComponent(homeRedirect)}`,
    );

    // /:agendaSlug/google/signin → /auth/signin?provider=google with
    // synthesized redirect=base64(/<slug>/contribute)
    const lyonRedirect = Buffer.from('/lyon/contribute', 'utf8').toString(
      'base64',
    );
    res = await request(app).get('/lyon/google/signin');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      `/auth/signin?provider=google&redirect=${encodeURIComponent(lyonRedirect)}`,
    );

    // /:agendaSlug/google/signin with explicit callbackURL → preserved as
    // the encoded redirect.
    const customRedirect = Buffer.from('/custom', 'utf8').toString('base64');
    res = await request(app).get('/lyon/google/signin?callbackURL=%2Fcustom');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      `/auth/signin?provider=google&redirect=${encodeURIComponent(customRedirect)}`,
    );

    // /facebook/signin → /auth/signin?provider=facebook (no query at all)
    res = await request(app).get('/facebook/signin');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/auth/signin?provider=facebook');

    // /:agendaSlug/facebook/signin → /auth/signin?provider=facebook with
    // synthesized redirect.
    res = await request(app).get('/lyon/facebook/signin');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(
      `/auth/signin?provider=facebook&redirect=${encodeURIComponent(lyonRedirect)}`,
    );
  });
});
