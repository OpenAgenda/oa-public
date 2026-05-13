import { jest } from '@jest/globals';
import Auth, { projectUser as namedExport } from '../src/index.js';
import projectUser from '../src/projectUser.js';

const baseOpts = {
  mysqlPool: {},
  secret: 'x'.repeat(32),
  baseURL: 'http://localhost:3000',
};

describe('projectUser', () => {
  it('is exported both as named import and as factory output', () => {
    const auth = Auth(baseOpts);
    expect(typeof projectUser).toBe('function');
    expect(typeof namedExport).toBe('function');
    expect(auth.projectUser).toBe(projectUser);
  });

  it('returns null for null/undefined input', () => {
    expect(projectUser(null)).toBeNull();
    expect(projectUser(undefined)).toBeNull();
  });

  it('projects the OA-shape from a BA user row', () => {
    const projected = projectUser({
      id: '42',
      uid: 1234567890,
      email: 'test@oa.test',
      name: 'Test User',
      image: 'thumbs/x.png',
      culture: 'fr',
      emailVerified: true,
      isBlacklisted: false,
    });
    expect(projected).toEqual({
      id: '42',
      uid: 1234567890,
      email: 'test@oa.test',
      name: 'Test User',
      image: 'thumbs/x.png',
      culture: 'fr',
      isActivated: true,
      isBlacklisted: false,
    });
  });
});

describe('validateSignUp before-hook', () => {
  it('rejects sign-up with 400 when validateSignUp returns errors', async () => {
    const validateSignUp = jest.fn(async () => ({
      errors: { email: 'taken' },
    }));
    const auth = Auth({ ...baseOpts, validateSignUp });

    const beforeHook = auth.instance.options.hooks.before;
    const ctx = {
      path: '/sign-up/email',
      body: { email: 'taken@oa.test', password: 'plain', name: 'N' },
      request: { url: '/api/auth/sign-up/email' },
      context: { logger: { error: () => {} } },
    };

    await expect(beforeHook(ctx)).rejects.toMatchObject({
      status: 'BAD_REQUEST',
    });
    expect(validateSignUp).toHaveBeenCalledWith({
      body: ctx.body,
      request: ctx.request,
    });
  });

  it('lets sign-up through when validateSignUp returns falsy', async () => {
    const validateSignUp = jest.fn(async () => undefined);
    const auth = Auth({ ...baseOpts, validateSignUp });
    const beforeHook = auth.instance.options.hooks.before;
    await expect(
      beforeHook({
        path: '/sign-up/email',
        body: { email: 'ok@oa.test', password: 'plain', name: 'N' },
        request: {},
        context: { logger: { error: () => {} } },
      }),
    ).resolves.toBeUndefined();
    expect(validateSignUp).toHaveBeenCalledTimes(1);
  });

  it('does not invoke validateSignUp on unrelated paths', async () => {
    const validateSignUp = jest.fn();
    const auth = Auth({ ...baseOpts, validateSignUp });
    const beforeHook = auth.instance.options.hooks.before;
    await beforeHook({
      path: '/sign-in/email',
      body: { email: 'x@oa.test' },
      context: {
        internalAdapter: { findUserByEmail: async () => ({ user: null }) },
        logger: { error: () => {} },
      },
    });
    expect(validateSignUp).not.toHaveBeenCalled();
  });

  it('rewraps thrown non-APIError into BAD_REQUEST', async () => {
    const validateSignUp = jest.fn(async () => {
      throw new Error('captcha invalid');
    });
    const auth = Auth({ ...baseOpts, validateSignUp });
    const beforeHook = auth.instance.options.hooks.before;
    await expect(
      beforeHook({
        path: '/sign-up/email',
        body: { email: 'x@oa.test' },
        request: {},
        context: { logger: { error: () => {} } },
      }),
    ).rejects.toMatchObject({
      status: 'BAD_REQUEST',
      body: expect.objectContaining({ message: 'captcha invalid' }),
    });
  });
});

describe('onSignInSuccess after-hook', () => {
  it('fires after a successful /sign-in/email', async () => {
    const onSignInSuccess = jest.fn(async () => {});
    const auth = Auth({ ...baseOpts, onSignInSuccess });
    const afterHook = auth.instance.options.hooks.after;

    const ctx = {
      path: '/sign-in/email',
      body: { email: 'x@oa.test', password: 'plain' },
      request: { url: '/api/auth/sign-in/email' },
      context: {
        internalAdapter: { findAccountByUserId: async () => [] },
        newSession: {
          session: { id: 's1', userId: 42 },
          user: { id: 42, email: 'x@oa.test' },
        },
        logger: { error: () => {} },
      },
    };
    await afterHook(ctx);
    expect(onSignInSuccess).toHaveBeenCalledWith({
      session: ctx.context.newSession.session,
      user: ctx.context.newSession.user,
      request: ctx.request,
    });
  });

  it('does not fire when sign-in did not produce a session', async () => {
    const onSignInSuccess = jest.fn();
    const auth = Auth({ ...baseOpts, onSignInSuccess });
    const afterHook = auth.instance.options.hooks.after;
    await afterHook({
      path: '/sign-in/email',
      body: {},
      context: { newSession: undefined, logger: { error: () => {} } },
    });
    expect(onSignInSuccess).not.toHaveBeenCalled();
  });

  it('swallows callback errors (logs but does not propagate)', async () => {
    const onSignInSuccess = jest.fn(async () => {
      throw new Error('downstream blew up');
    });
    const errorLog = jest.fn();
    const auth = Auth({ ...baseOpts, onSignInSuccess });
    const afterHook = auth.instance.options.hooks.after;
    await expect(
      afterHook({
        path: '/sign-in/email',
        body: {},
        request: {},
        context: {
          internalAdapter: { findAccountByUserId: async () => [] },
          newSession: { session: { id: 's' }, user: { id: 1 } },
          logger: { error: errorLog },
        },
      }),
    ).resolves.toBeUndefined();
    expect(errorLog).toHaveBeenCalledWith(
      'onSignInSuccess failed',
      expect.objectContaining({ userId: 1 }),
    );
  });

  it('fires after /callback/:id success path (OAuth)', async () => {
    const onSignInSuccess = jest.fn(async () => {});
    const auth = Auth({ ...baseOpts, onSignInSuccess });
    const afterHook = auth.instance.options.hooks.after;
    await afterHook({
      path: '/callback/:id',
      params: { id: 'google' },
      request: { url: '/api/auth/callback/google' },
      context: {
        newSession: {
          session: { id: 's2', userId: 7 },
          user: { id: 7, email: 'oauth@oa.test' },
        },
        internalAdapter: {
          findUserById: async () => ({
            id: 7,
            email: 'oauth@oa.test',
            isRemoved: false,
            isBlacklisted: false,
            facebookUid: null,
          }),
        },
        responseHeaders: new Headers(),
        logger: { error: () => {} },
      },
    });
    expect(onSignInSuccess).toHaveBeenCalledTimes(1);
  });
});

describe('onSignUpComplete database hook', () => {
  it('fires for /sign-up/email creation', async () => {
    const onSignUpComplete = jest.fn(async () => {});
    const auth = Auth({ ...baseOpts, onSignUpComplete });
    const { after } = auth.instance.options.databaseHooks.user.create;
    const created = { id: 99, email: 'new@oa.test', emailVerified: false };
    await after(created, {
      path: '/sign-up/email',
      request: { url: '/api/auth/sign-up/email' },
      logger: { error: () => {} },
    });
    expect(onSignUpComplete).toHaveBeenCalledWith(
      created,
      expect.objectContaining({ url: '/api/auth/sign-up/email' }),
    );
  });

  it('fires for /callback/:id (OAuth) creation', async () => {
    const onSignUpComplete = jest.fn(async () => {});
    const auth = Auth({ ...baseOpts, onSignUpComplete });
    const { after } = auth.instance.options.databaseHooks.user.create;
    await after(
      { id: 100, email: 'oauth@oa.test' },
      {
        path: '/callback/google',
        request: { url: '/api/auth/callback/google' },
        logger: { error: () => {} },
      },
    );
    expect(onSignUpComplete).toHaveBeenCalledTimes(1);
  });

  it('swallows callback errors', async () => {
    const onSignUpComplete = jest.fn(async () => {
      throw new Error('oops');
    });
    const errorLog = jest.fn();
    const auth = Auth({ ...baseOpts, onSignUpComplete });
    const { after } = auth.instance.options.databaseHooks.user.create;
    await expect(
      after(
        { id: 101 },
        { path: '/sign-up/email', request: {}, logger: { error: errorLog } },
      ),
    ).resolves.toBeUndefined();
    expect(errorLog).toHaveBeenCalledWith(
      'onSignUpComplete failed',
      expect.objectContaining({ userId: 101 }),
    );
  });

  // Back-compat: onAfterOAuthSignUp predates onSignUpComplete and is still
  // invoked on the OAuth path so existing callers keep working.
  it('still calls onAfterOAuthSignUp on /callback/:id', async () => {
    const onSignUpComplete = jest.fn(async () => {});
    const onAfterOAuthSignUp = jest.fn(async () => {});
    const auth = Auth({
      ...baseOpts,
      onSignUpComplete,
      onAfterOAuthSignUp,
    });
    const { after } = auth.instance.options.databaseHooks.user.create;
    await after(
      { id: 102, email: 'g@oa.test' },
      { path: '/callback/google', request: {}, logger: { error: () => {} } },
    );
    expect(onSignUpComplete).toHaveBeenCalledTimes(1);
    expect(onAfterOAuthSignUp).toHaveBeenCalledTimes(1);
  });
});

describe('customSession plugin opt-in', () => {
  it('is not registered when resolveSessionExtras is absent', () => {
    const auth = Auth(baseOpts);
    const plugins = auth.instance.options.plugins ?? [];
    expect(plugins.find((p) => p?.id === 'custom-session')).toBeUndefined();
  });

  it('is registered when resolveSessionExtras is provided', () => {
    const auth = Auth({
      ...baseOpts,
      resolveSessionExtras: async () => ({}),
    });
    const plugins = auth.instance.options.plugins ?? [];
    expect(plugins.find((p) => p?.id === 'custom-session')).toBeDefined();
  });
});
