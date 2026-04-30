import { jest } from '@jest/globals';
import Auth from '../src/index.js';

function makeAuth(onEmailVerified) {
  return Auth({
    mysqlPool: {},
    secret: 'x'.repeat(32),
    baseURL: 'http://localhost:3000',
    onEmailVerified,
  });
}

describe('auth - unit: afterEmailVerification wiring', () => {
  it('exposes afterEmailVerification on the instance options', () => {
    const auth = makeAuth(async () => {});
    expect(
      typeof auth.instance.options.emailVerification.afterEmailVerification,
    ).toBe('function');
  });

  it('delegates to onEmailVerified with (user, request)', async () => {
    const onEmailVerified = jest.fn().mockResolvedValue(undefined);
    const auth = makeAuth(onEmailVerified);

    const user = { id: 42, email: 'verify@oa.test' };
    const request = { url: '/verify-email?token=abc' };
    await auth.instance.options.emailVerification.afterEmailVerification(
      user,
      request,
    );

    expect(onEmailVerified).toHaveBeenCalledTimes(1);
    expect(onEmailVerified).toHaveBeenCalledWith(user, request);
  });

  it('passes user.id through unchanged (BIGINT preserved)', async () => {
    const onEmailVerified = jest.fn().mockResolvedValue(undefined);
    const auth = makeAuth(onEmailVerified);

    const user = { id: 9007199254740991, email: 'big@oa.test' };
    await auth.instance.options.emailVerification.afterEmailVerification(
      user,
      undefined,
    );
    expect(onEmailVerified.mock.calls[0][0].id).toBe(9007199254740991);
  });

  it('is a no-op when onEmailVerified is not provided', async () => {
    const auth = Auth({
      mysqlPool: {},
      secret: 'x'.repeat(32),
      baseURL: 'http://localhost:3000',
    });
    await expect(
      auth.instance.options.emailVerification.afterEmailVerification(
        { id: 1 },
        undefined,
      ),
    ).resolves.toBeUndefined();
  });
});

describe('auth - unit: forwardSetCookieHeaders + toHeaders', () => {
  it('forwardSetCookieHeaders copies Set-Cookie to the Express response', async () => {
    const auth = makeAuth(async () => {});
    const response = new Response(null, {
      headers: { 'Set-Cookie': 'oa.session_token=abc; HttpOnly' },
    });
    const setHeaders = {};
    const res = {
      getHeader: (k) => setHeaders[k],
      setHeader: (k, v) => {
        setHeaders[k] = v;
      },
    };
    auth.forwardSetCookieHeaders(response, res);
    expect(setHeaders['Set-Cookie']).toBeDefined();
    const flat = [].concat(setHeaders['Set-Cookie']).join(';');
    expect(flat).toMatch(/oa\.session_token=abc/);
  });

  it('forwardSetCookieHeaders is a no-op when there is no Set-Cookie', () => {
    const auth = makeAuth(async () => {});
    const response = new Response(null);
    const res = {
      getHeader: () => undefined,
      setHeader: jest.fn(),
    };
    auth.forwardSetCookieHeaders(response, res);
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('toHeaders folds previous Set-Cookie into the cookie request header', () => {
    const auth = makeAuth(async () => {});
    const response = new Response(null, {
      headers: { 'Set-Cookie': 'oa.session_token=NEW; HttpOnly' },
    });
    const req = {
      headers: { cookie: 'foo=bar' },
    };
    const headers = auth.toHeaders(req, response);
    expect(headers.get('cookie')).toMatch(/foo=bar/);
    expect(headers.get('cookie')).toMatch(/oa\.session_token=NEW/);
  });
});
