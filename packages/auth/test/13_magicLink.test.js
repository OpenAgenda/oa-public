import { jest } from '@jest/globals';
import Auth from '../src/index.js';

function makeAuth(overrides = {}) {
  return Auth({
    mysqlPool: {},
    secret: 'x'.repeat(32),
    baseURL: 'http://localhost:3000',
    ...overrides,
  });
}

function magicLinkOptions(auth) {
  const plugin = auth.instance.options.plugins.find(
    (p) => p.id === 'magic-link',
  );
  return plugin?.options;
}

describe('auth - unit: magicLink plugin wiring', () => {
  it('registers the magic-link plugin', () => {
    const opts = magicLinkOptions(makeAuth());
    expect(opts).toBeDefined();
  });

  it('configures expiresIn=600, disableSignUp, hashed token, per-IP rate-limit', () => {
    const opts = magicLinkOptions(makeAuth());
    expect(opts.expiresIn).toBe(600);
    // Magic-link only signs in existing accounts — never auto-creates one.
    expect(opts.disableSignUp).toBe(true);
    // Only the token hash is persisted (the after-hook guard never reads it
    // back, so hashing is free).
    expect(opts.storeToken).toBe('hashed');
    // Per-IP, kept at BA's default (the real control is the per-email throttle
    // in the cibul-node façade).
    expect(opts.rateLimit).toEqual({ window: 60, max: 5 });
  });

  it('delegates sendMagicLink to onSendMagicLink with ({email, url, token}, request)', async () => {
    const onSendMagicLink = jest.fn().mockResolvedValue(undefined);
    const opts = magicLinkOptions(makeAuth({ onSendMagicLink }));

    const payload = {
      email: 'u@oa.test',
      url: 'http://localhost:3000/api/auth/magic-link/verify?token=abc-xyz&callbackURL=%2Fpost-activate',
      token: 'abc-xyz',
    };
    const request = { url: '/sign-in/magic-link' };

    await opts.sendMagicLink(payload, request);

    expect(onSendMagicLink).toHaveBeenCalledTimes(1);
    expect(onSendMagicLink).toHaveBeenCalledWith(payload, request);
  });

  it('forwards a magic-link verify URL carrying the token', async () => {
    const onSendMagicLink = jest.fn().mockResolvedValue(undefined);
    const opts = magicLinkOptions(makeAuth({ onSendMagicLink }));

    await opts.sendMagicLink(
      {
        email: 'u@oa.test',
        url: 'http://localhost:3000/api/auth/magic-link/verify?token=tok-1&callbackURL=%2Fpost-activate',
        token: 'tok-1',
      },
      undefined,
    );

    const call = onSendMagicLink.mock.calls[0][0];
    expect(call.url).toContain('/api/auth/magic-link/verify');
    expect(call.url).toContain('token=tok-1');
    expect(call.token).toBe('tok-1');
  });

  it('is a no-op when onSendMagicLink is not provided', async () => {
    const opts = magicLinkOptions(makeAuth());
    await expect(
      opts.sendMagicLink(
        {
          email: 'u@oa.test',
          url: 'http://localhost:3000/api/auth/magic-link/verify?token=t',
          token: 't',
        },
        undefined,
      ),
    ).resolves.toBeUndefined();
  });
});
