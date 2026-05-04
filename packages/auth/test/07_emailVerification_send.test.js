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

describe('auth - unit: sendVerificationEmail wiring', () => {
  it('exposes sendVerificationEmail on the instance options', () => {
    const auth = makeAuth({ onSendVerificationEmail: async () => {} });
    expect(
      typeof auth.instance.options.emailVerification.sendVerificationEmail,
    ).toBe('function');
  });

  it('delegates to onSendVerificationEmail with ({user, url, token}, request)', async () => {
    const onSendVerificationEmail = jest.fn().mockResolvedValue(undefined);
    const auth = makeAuth({ onSendVerificationEmail });

    const user = { id: 7, email: 'verify@oa.test' };
    const url = 'http://localhost:3000/api/auth/verify-email?token=tok-123&callbackURL=%2F';
    const token = 'tok-123';
    const request = { url: '/send-verification-email' };

    await auth.instance.options.emailVerification.sendVerificationEmail(
      { user, url, token },
      request,
    );

    expect(onSendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(onSendVerificationEmail).toHaveBeenCalledWith(
      { user, url, token },
      request,
    );
  });

  it('forwards a verify-email URL containing the token', async () => {
    const onSendVerificationEmail = jest.fn().mockResolvedValue(undefined);
    const auth = makeAuth({ onSendVerificationEmail });

    const url = 'http://localhost:3000/api/auth/verify-email?token=abc-xyz&callbackURL=%2Fhome';
    await auth.instance.options.emailVerification.sendVerificationEmail(
      { user: { id: 1, email: 'u@oa.test' }, url, token: 'abc-xyz' },
      undefined,
    );

    const call = onSendVerificationEmail.mock.calls[0][0];
    expect(call.url).toContain('/api/auth/verify-email');
    expect(call.url).toContain('token=abc-xyz');
    expect(call.token).toBe('abc-xyz');
  });

  it('is a no-op when onSendVerificationEmail is not provided', async () => {
    const auth = makeAuth();
    await expect(
      auth.instance.options.emailVerification.sendVerificationEmail(
        {
          user: { id: 1, email: 'u@oa.test' },
          url: 'http://localhost:3000/api/auth/verify-email?token=t',
          token: 't',
        },
        undefined,
      ),
    ).resolves.toBeUndefined();
  });

  it('configures sendOnSignUp and autoSignInAfterVerification', () => {
    const auth = makeAuth();
    expect(auth.instance.options.emailVerification.sendOnSignUp).toBe(true);
    expect(
      auth.instance.options.emailVerification.autoSignInAfterVerification,
    ).toBe(true);
  });

  it('rate-limits /send-verification-email at 60s/1', () => {
    const auth = makeAuth();
    const rule = auth.instance.options.rateLimit?.customRules?.[
      '/send-verification-email'
    ];
    expect(rule).toEqual({ window: 60, max: 1 });
  });
});
