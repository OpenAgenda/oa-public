import { jest } from '@jest/globals';
import Auth from '../src/index.js';

const baseOpts = {
  mysqlPool: {},
  secret: 'x'.repeat(32),
  baseURL: 'http://localhost:3000',
};

describe('auth - unit: socialProviders config', () => {
  it('omits google when no clientId is provided', () => {
    const auth = Auth(baseOpts);
    expect(auth.instance.options.socialProviders?.google).toBeUndefined();
  });

  it('configures google when google.id is provided', () => {
    const auth = Auth({
      ...baseOpts,
      google: { id: 'gid', secret: 'gsecret' },
    });
    expect(auth.instance.options.socialProviders.google.clientId).toBe('gid');
    expect(auth.instance.options.socialProviders.google.clientSecret).toBe(
      'gsecret',
    );
  });

  it('configures facebook with disableImplicitSignUp=true (phase-out)', () => {
    const auth = Auth({
      ...baseOpts,
      facebook: { id: 'fid', secret: 'fsecret' },
    });
    expect(auth.instance.options.socialProviders.facebook.clientId).toBe('fid');
    expect(
      auth.instance.options.socialProviders.facebook.disableImplicitSignUp,
    ).toBe(true);
  });

  it('google mapProfileToUser drops the provider picture (image: null)', async () => {
    const auth = Auth({
      ...baseOpts,
      google: { id: 'gid', secret: 'gsecret' },
    });
    const result = await auth.instance.options.socialProviders.google.mapProfileToUser({
      email: 'u@oa.test',
      picture: 'https://lh3.googleusercontent.com/abc',
    });
    // OA stores user.image as an S3 key and concatenates the CDN prefix on
    // read; keeping the full Google CDN URL produces a broken URL.
    expect(result).toEqual({ image: null });
  });

  it('facebook mapProfileToUser drops the provider picture (image: null)', async () => {
    const auth = Auth({
      ...baseOpts,
      facebook: { id: 'fid', secret: 'fsecret' },
    });
    const result = await auth.instance.options.socialProviders.facebook.mapProfileToUser({
      email: 'u@oa.test',
      picture: { data: { url: 'https://scontent.xx.fbcdn.net/v/...' } },
    });
    expect(result).toEqual({ image: null });
  });

  it('configures accountLinking with disableImplicitLinking + Google trusted (verified linking flow)', () => {
    const auth = Auth(baseOpts);
    const linking = auth.instance.options.account.accountLinking;
    // Implicit linking is blocked at the OAuth callback (forces password
    // challenge via /signin?linkProvider=...).
    expect(linking.disableImplicitLinking).toBe(true);
    // Google is whitelisted for the explicit /link-social branch (used after
    // the password challenge). Facebook is intentionally absent — phase-out.
    expect(linking.trustedProviders).toEqual(['google']);
  });
});

describe('auth - unit: databaseHooks.user.create.after (OAuth signup)', () => {
  function getHook(onAfterOAuthSignUp) {
    const auth = Auth({ ...baseOpts, onAfterOAuthSignUp });
    return auth.instance.options.databaseHooks.user.create.after;
  }

  it('fires onAfterOAuthSignUp when path matches /callback/:id', async () => {
    const cb = jest.fn().mockResolvedValue(undefined);
    const hook = getHook(cb);
    const user = { id: 7, email: 'u@oa.test' };
    const request = { url: '/api/auth/callback/google' };
    await hook(user, { path: '/callback/:id', request });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(user, request);
  });

  it('does not fire on /sign-up/email (legacy email flow)', async () => {
    const cb = jest.fn();
    const hook = getHook(cb);
    await hook({ id: 1 }, { path: '/sign-up/email' });
    expect(cb).not.toHaveBeenCalled();
  });

  it('is a no-op when onAfterOAuthSignUp is not provided', async () => {
    const auth = Auth(baseOpts);
    const hook = auth.instance.options.databaseHooks.user.create.after;
    await expect(
      hook({ id: 1 }, { path: '/callback/:id' }),
    ).resolves.toBeUndefined();
  });

  it('swallows errors from the callback (logs only)', async () => {
    const cb = jest.fn().mockRejectedValue(new Error('boom'));
    const hook = getHook(cb);
    const logger = { error: jest.fn() };
    await expect(
      hook({ id: 1 }, { path: '/callback/:id', logger }),
    ).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      'onAfterOAuthSignUp failed',
      expect.objectContaining({ userId: 1 }),
    );
  });
});
