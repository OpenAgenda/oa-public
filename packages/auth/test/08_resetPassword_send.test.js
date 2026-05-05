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

describe('auth - unit: sendResetPassword wiring', () => {
  it('exposes sendResetPassword on the instance options', () => {
    const auth = makeAuth({ onSendPasswordResetEmail: async () => {} });
    expect(
      typeof auth.instance.options.emailAndPassword.sendResetPassword,
    ).toBe('function');
  });

  it('delegates to onSendPasswordResetEmail with ({user, url, token}, request)', async () => {
    const onSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
    const auth = makeAuth({ onSendPasswordResetEmail });

    const user = { id: 42, email: 'reset@oa.test' };
    // BA builds the reset URL as
    //   `${baseURL}/reset-password/${token}?callbackURL=${encodeURIComponent(redirectTo)}`
    // — verified against node_modules/better-auth/.../routes/password.mjs.
    const url = 'http://localhost:3000/api/auth/reset-password/tok-abc?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Fpassword%2Freset';
    const token = 'tok-abc';
    const request = { url: '/request-password-reset' };

    await auth.instance.options.emailAndPassword.sendResetPassword(
      { user, url, token },
      request,
    );

    expect(onSendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(onSendPasswordResetEmail).toHaveBeenCalledWith(
      { user, url, token },
      request,
    );
  });

  it('forwards a URL that carries the reset token', async () => {
    const onSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
    const auth = makeAuth({ onSendPasswordResetEmail });

    const url = 'http://localhost:3000/api/auth/reset-password/SECRET-TOKEN?callbackURL=https%3A%2F%2Foa.test%2Fpassword%2Freset';
    await auth.instance.options.emailAndPassword.sendResetPassword(
      { user: { id: 1, email: 'u@oa.test' }, url, token: 'SECRET-TOKEN' },
      undefined,
    );

    const call = onSendPasswordResetEmail.mock.calls[0][0];
    expect(call.url).toContain('SECRET-TOKEN');
    expect(call.token).toBe('SECRET-TOKEN');
    // The redirectTo provided by the consumer is preserved (URL-encoded) in the
    // callbackURL query, so the signin page can be reached after reset.
    expect(decodeURIComponent(call.url)).toContain('/password/reset');
  });

  it('is a no-op when onSendPasswordResetEmail is not provided', async () => {
    const auth = makeAuth();
    await expect(
      auth.instance.options.emailAndPassword.sendResetPassword(
        {
          user: { id: 1, email: 'u@oa.test' },
          url: 'http://localhost:3000/api/auth/reset-password/t?callbackURL=%2F',
          token: 't',
        },
        undefined,
      ),
    ).resolves.toBeUndefined();
  });

  it('configures requireEmailVerification + autoSignIn=false', () => {
    const auth = makeAuth();
    expect(
      auth.instance.options.emailAndPassword.requireEmailVerification,
    ).toBe(true);
    expect(auth.instance.options.emailAndPassword.autoSignIn).toBe(false);
  });

  it('rate-limits /request-password-reset at 60s/1', () => {
    const auth = makeAuth();
    const rule = auth.instance.options.rateLimit?.customRules?.['/request-password-reset'];
    expect(rule).toEqual({ window: 60, max: 1 });
  });
});
