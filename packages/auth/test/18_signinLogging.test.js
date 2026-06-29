import { EventEmitter } from 'node:events';
import { jest } from '@jest/globals';
import Auth, {
  signinMethodFromUrl,
  withRateLimitLogging,
} from '../src/index.js';

const baseOpts = {
  mysqlPool: {},
  secret: 'x'.repeat(32),
  baseURL: 'http://localhost:3000',
};

// Phase 1 — structured `auth.signin.success` events emitted from the after-hooks
// (single fan-out). These exercise the hooks directly with a hand-crafted ctx +
// a spy logger, the same unit style as 11_extensions.test.js.

function afterHookOf() {
  return Auth({ ...baseOpts }).instance.options.hooks.after;
}

function beforeHookOf() {
  return Auth({ ...baseOpts }).instance.options.hooks.before;
}

function spyLogger() {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
}

describe('auth.signin.success emission', () => {
  it('emits for /sign-in/email (password, never new, linked when credential+social)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: { email: 'x@oa.test' },
      request: { url: '/api/auth/sign-in/email' },
      context: {
        internalAdapter: {
          findAccountByUserId: async () => [
            { providerId: 'credential' },
            { providerId: 'google' },
          ],
        },
        newSession: {
          session: { id: 's1', userId: 42 },
          user: { id: 42, uid: 4242, email: 'x@oa.test' },
        },
        logger,
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      'auth.signin.success',
      expect.objectContaining({
        event: 'auth.signin.success',
        method: 'password',
        is_new: false,
        user_uid: 4242,
      }),
    );
  });

  it('emits for /callback/:id (oauth:google, is_new from request flag, not linked)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/callback/:id',
      params: { id: 'google' },
      request: { url: '/api/auth/callback/google' },
      context: {
        oaUserCreated: true, // set by databaseHooks.user.create.after this request
        newSession: {
          session: { id: 's2', userId: 7 },
          user: { id: 7, uid: 707, email: 'oauth@oa.test' },
        },
        internalAdapter: {
          findUserById: async () => ({
            id: 7,
            isRemoved: false,
            isBlacklisted: false,
            facebookUid: null,
          }),
        },
        responseHeaders: new Headers(),
        logger,
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      'auth.signin.success',
      expect.objectContaining({
        method: 'oauth:google',
        provider: 'google',
        is_new: true,
        user_uid: 707,
      }),
    );
  });

  it('reports is_new:false on OAuth when no user was created this request', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/callback/:id',
      params: { id: 'google' },
      request: {},
      context: {
        newSession: {
          session: { id: 's3' },
          user: { id: 8, uid: 808 },
        },
        internalAdapter: {
          findUserById: async () => ({
            id: 8,
            isRemoved: false,
            isBlacklisted: false,
            facebookUid: null,
          }),
        },
        responseHeaders: new Headers(),
        logger,
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      'auth.signin.success',
      expect.objectContaining({ method: 'oauth:google', is_new: false }),
    );
  });

  it('emits for /magic-link/verify (magic_link, never new)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/magic-link/verify',
      request: {},
      context: {
        newSession: {
          session: { id: 's4' },
          user: { id: 9, uid: 909 },
        },
        internalAdapter: {
          findUserById: async () => ({
            id: 9,
            isRemoved: false,
            isBlacklisted: false,
          }),
        },
        responseHeaders: new Headers(),
        logger,
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      'auth.signin.success',
      expect.objectContaining({
        method: 'magic_link',
        is_new: false,
        user_uid: 909,
      }),
    );
  });

  it('never emits email or password in the event (RGPD)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: { email: 'secret@oa.test', password: 'hunter2' },
      request: {},
      context: {
        internalAdapter: { findAccountByUserId: async () => [] },
        newSession: {
          session: {},
          user: { id: 1, uid: 11, email: 'secret@oa.test' },
        },
        logger,
      },
    });

    const meta = logger.info.mock.calls.find(
      (c) => c[0] === 'auth.signin.success',
    )?.[1];
    expect(meta).toBeDefined();
    expect(meta).not.toHaveProperty('email');
    expect(meta).not.toHaveProperty('password');
  });

  it('does not emit when sign-in produced no session', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: {},
      context: { newSession: undefined, logger },
    });
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('swallows a logging failure without breaking the request', async () => {
    const logger = {
      info: jest.fn(() => {
        throw new Error('transport down');
      }),
      error: jest.fn(),
    };
    await expect(
      afterHookOf()({
        path: '/sign-in/email',
        body: {},
        request: {},
        context: {
          internalAdapter: { findAccountByUserId: async () => [] },
          newSession: { session: {}, user: { id: 1, uid: 11 } },
          logger,
        },
      }),
    ).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      'auth.signin.success log failed',
      expect.objectContaining({ err: expect.any(Error) }),
    );
  });
});

describe('auth.signin.failure emission', () => {
  it('maps body.code on /sign-in/email (invalid_credentials)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: {},
      context: {
        newSession: undefined,
        returned: { body: { code: 'INVALID_EMAIL_OR_PASSWORD' } },
        logger,
      },
    });
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        event: 'auth.signin.failure',
        method: 'password',
        reason: 'invalid_credentials',
      }),
    );
  });

  it('maps EMAIL_NOT_VERIFIED on /sign-in/email', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: {},
      context: {
        newSession: undefined,
        returned: { body: { code: 'EMAIL_NOT_VERIFIED' } },
        logger,
      },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({ reason: 'email_not_verified' }),
    );
  });

  it('falls back to invalid_credentials on /sign-in/email with no code', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: {},
      context: { newSession: undefined, returned: undefined, logger },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({ reason: 'invalid_credentials' }),
    );
  });

  it('emits auth.signin.no_account (not a failure) on /sign-in/email when the email was unknown', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: {},
      context: {
        newSession: undefined,
        // Same response code as a wrong password (anti-enumeration); the
        // before-hook stash is what disambiguates.
        returned: { body: { code: 'INVALID_EMAIL_OR_PASSWORD' } },
        oaSigninEmailKnown: false,
        logger,
      },
    });
    // Unknown email is not a failed sign-in → distinct info event, out of the
    // failure rate (same model as the magic-link send branch).
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'auth.signin.no_account',
      expect.objectContaining({
        event: 'auth.signin.no_account',
        method: 'password',
      }),
    );
  });

  it('keeps invalid_credentials on /sign-in/email when the email was known', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/sign-in/email',
      body: {},
      context: {
        newSession: undefined,
        returned: { body: { code: 'INVALID_EMAIL_OR_PASSWORD' } },
        oaSigninEmailKnown: true,
        logger,
      },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        method: 'password',
        reason: 'invalid_credentials',
      }),
    );
  });

  it('stashes oaSigninEmailKnown in the /sign-in/email before-hook', async () => {
    const beforeHook = beforeHookOf();
    const unknownCtx = {
      path: '/sign-in/email',
      body: { email: 'ghost@oa.test' },
      context: {
        internalAdapter: { findUserByEmail: async () => null },
        logger: spyLogger(),
      },
    };
    await beforeHook(unknownCtx);
    expect(unknownCtx.context.oaSigninEmailKnown).toBe(false);

    const knownCtx = {
      path: '/sign-in/email',
      body: { email: 'real@oa.test' },
      context: {
        internalAdapter: {
          findUserByEmail: async () => ({
            user: { id: 7, uid: 77, isRemoved: false, isBlacklisted: false },
          }),
        },
        logger: spyLogger(),
      },
    };
    await beforeHook(knownCtx);
    expect(knownCtx.context.oaSigninEmailKnown).toBe(true);
  });

  it('logs account_unavailable for a barred user in the /sign-in/email before-hook', async () => {
    const logger = spyLogger();
    const beforeHook = beforeHookOf();
    const ctx = {
      path: '/sign-in/email',
      body: { email: 'banned@oa.test' },
      context: {
        internalAdapter: {
          findUserByEmail: async () => ({
            user: { id: 5, uid: 55, isRemoved: true, isBlacklisted: false },
          }),
        },
        logger,
      },
    };
    // Response stays generic (anti-enumeration) — it still throws.
    await expect(beforeHook(ctx)).rejects.toMatchObject({
      status: 'UNAUTHORIZED',
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        method: 'password',
        reason: 'account_unavailable',
        user_uid: 55,
      }),
    );
  });

  it('logs oauth_callback_error when OAuth produces no session', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/callback/:id',
      params: { id: 'google' },
      context: {
        newSession: undefined,
        responseHeaders: new Headers(),
        logger,
      },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        method: 'oauth:google',
        provider: 'google',
        reason: 'oauth_callback_error',
      }),
    );
  });

  it('logs account_unavailable for a barred OAuth user (with uid)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/callback/:id',
      params: { id: 'google' },
      context: {
        newSession: { session: {}, user: { id: 6, uid: 66 } },
        internalAdapter: {
          findUserById: async () => ({
            id: 6,
            uid: 66,
            isRemoved: false,
            isBlacklisted: true,
            facebookUid: null,
          }),
          deleteUserSessions: async () => {},
        },
        responseHeaders: new Headers(),
        logger,
      },
    });
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        method: 'oauth:google',
        reason: 'account_unavailable',
        user_uid: 66,
      }),
    );
  });

  it('logs magic_link_invalid when magic-link verify produces no session', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/magic-link/verify',
      context: { newSession: undefined, logger },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        method: 'magic_link',
        reason: 'magic_link_invalid',
      }),
    );
  });

  it('logs account_unavailable for a barred magic-link user (with uid)', async () => {
    const logger = spyLogger();
    await afterHookOf()({
      path: '/magic-link/verify',
      context: {
        newSession: { session: {}, user: { id: 7, uid: 77 } },
        internalAdapter: {
          findUserById: async () => ({
            id: 7,
            uid: 77,
            isRemoved: false,
            isBlacklisted: true,
          }),
          deleteUserSessions: async () => {},
        },
        responseHeaders: new Headers(),
        logger,
      },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'auth.signin.failure',
      expect.objectContaining({
        method: 'magic_link',
        reason: 'account_unavailable',
        user_uid: 77,
      }),
    );
  });

  it('swallows a failure-logging error without breaking the request', async () => {
    const logger = {
      info: jest.fn(),
      warn: jest.fn(() => {
        throw new Error('transport down');
      }),
      error: jest.fn(),
    };
    await expect(
      afterHookOf()({
        path: '/sign-in/email',
        body: {},
        context: { newSession: undefined, returned: undefined, logger },
      }),
    ).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      'auth.signin.failure log failed',
      expect.objectContaining({ err: expect.any(Error) }),
    );
  });
});

describe('rate_limited capture (node handler 429)', () => {
  it('maps sign-in URLs to a method, others to null', () => {
    expect(signinMethodFromUrl('/api/auth/sign-in/email')).toBe('password');
    expect(signinMethodFromUrl('/api/auth/sign-in/email?x=1')).toBe('password');
    expect(signinMethodFromUrl('/api/auth/magic-link/verify?token=t')).toBe(
      'magic_link',
    );
    // /sign-in/magic-link is the email-SEND route, not a sign-in → null.
    expect(signinMethodFromUrl('/api/auth/sign-in/magic-link')).toBeNull();
    expect(signinMethodFromUrl('/api/auth/sign-up/email')).toBeNull();
    expect(signinMethodFromUrl('/api/auth/callback/google')).toBeNull();
    expect(signinMethodFromUrl(undefined)).toBeNull();
  });

  function runWrapped(url, statusCode, logger) {
    const handler = (req, res) => {
      res.statusCode = statusCode;
      res.emit('close');
    };
    const res = new EventEmitter();
    withRateLimitLogging(handler, logger)({ url }, res);
  }

  it('logs auth.signin.failure rate_limited on a 429 sign-in response', () => {
    const logger = { log: jest.fn() };
    runWrapped('/api/auth/sign-in/email', 429, logger);
    expect(logger.log).toHaveBeenCalledWith('warn', 'auth.signin.failure', {
      event: 'auth.signin.failure',
      method: 'password',
      reason: 'rate_limited',
    });
  });

  it('does not log on a non-429 sign-in response', () => {
    const logger = { log: jest.fn() };
    runWrapped('/api/auth/sign-in/email', 200, logger);
    expect(logger.log).not.toHaveBeenCalled();
  });

  it('does not log a 429 on a non-sign-in route (e.g. sign-up)', () => {
    const logger = { log: jest.fn() };
    runWrapped('/api/auth/sign-up/email', 429, logger);
    expect(logger.log).not.toHaveBeenCalled();
  });

  it('returns the handler unchanged when no logger is injected', () => {
    const handler = () => {};
    expect(withRateLimitLogging(handler, undefined)).toBe(handler);
  });
});
