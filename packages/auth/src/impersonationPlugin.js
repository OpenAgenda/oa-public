import * as z from 'zod';
import {
  createAuthEndpoint,
  APIError,
  getSessionFromCtx,
} from 'better-auth/api';
import {
  setSessionCookie,
  deleteSessionCookie,
  expireCookie,
} from 'better-auth/cookies';

export default function oaImpersonationPlugin() {
  return {
    id: 'oa-impersonation',
    endpoints: {
      // Generic primitive used by `auth/lib/auth.js#signin` for OAuth /
      // legacy aa-token activation fallback. Opens a BA session on `res`
      // for an arbitrary user id, no impersonation marker.
      openSession: createAuthEndpoint(
        '/oa/open-session',
        {
          method: 'POST',
          body: z.object({ userId: z.string() }),
        },
        async (ctx) => {
          const userId = String(ctx.body.userId);
          const user = await ctx.context.internalAdapter.findUserById(userId);
          if (!user) {
            throw new APIError('NOT_FOUND', { code: 'USER_NOT_FOUND' });
          }
          const session = await ctx.context.internalAdapter.createSession(
            userId,
            false,
          );
          if (!session) {
            throw new APIError('UNAUTHORIZED', {
              code: 'FAILED_TO_CREATE_SESSION',
            });
          }
          await setSessionCookie(ctx, { session, user });
          return ctx.json({ ok: true });
        },
      ),

      // Superadmin "sign as" — closes nothing on the impersonator's session
      // (BA's admin plugin deliberately keeps it alive and stashes its token
      // in a signed cookie, so /oa/stop-impersonating can restore it
      // verbatim). Authorization is the consumer's responsibility — see
      // module docstring.
      impersonateUser: createAuthEndpoint(
        '/oa/impersonate-user',
        {
          method: 'POST',
          body: z.object({ userId: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          // `requireHeaders: true` does NOT auto-populate `ctx.context.session`
          // (it only enforces that headers were forwarded). Use
          // `getSessionFromCtx`, which lazily resolves the session via BA's
          // `getSession()` endpoint and caches it back on `ctx.context`.
          const current = await getSessionFromCtx(ctx);
          if (!current?.session) {
            throw new APIError('UNAUTHORIZED');
          }
          const impersonatorId = String(current.user.id);
          const impersonatorToken = current.session.token;

          const targetUser = await ctx.context.internalAdapter.findUserById(
            String(ctx.body.userId),
          );
          if (!targetUser) {
            throw new APIError('NOT_FOUND', { code: 'USER_NOT_FOUND' });
          }

          const session = await ctx.context.internalAdapter.createSession(
            targetUser.id,
            // dontRememberMe — impersonation sessions are short-lived and
            // intentionally don't carry the persistent expiry.
            true,
            { impersonatedBy: impersonatorId },
            true,
          );
          if (!session) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              code: 'FAILED_TO_CREATE_SESSION',
            });
          }

          const { authCookies } = ctx.context;
          // Stash the impersonator's session token in a BA-signed cookie,
          // mirroring the admin plugin's `oa.admin_session` pattern. The
          // payload here is just the token (BA admin uses
          // `${token}:${dontRememberMe}` because it tracks the original
          // remember-me flag — we don't carry that signal here, /signin always
          // uses dontRememberMe=false in this codebase).
          const adminCookieProp = ctx.context.createAuthCookie('admin_session');
          await ctx.setSignedCookie(
            adminCookieProp.name,
            impersonatorToken,
            ctx.context.secret,
            authCookies.sessionToken.attributes,
          );

          deleteSessionCookie(ctx);
          await setSessionCookie(ctx, { session, user: targetUser }, true);

          return ctx.json({ ok: true });
        },
      ),

      // Restore the impersonator's session and drop the impersonated one.
      // Reads the signed `oa.admin_session` cookie (written above), fetches
      // the corresponding BA session, deletes the impersonated session, and
      // re-emits the impersonator's session_token via `setSessionCookie`.
      stopImpersonating: createAuthEndpoint(
        '/oa/stop-impersonating',
        {
          method: 'POST',
          requireHeaders: true,
        },
        async (ctx) => {
          const current = await getSessionFromCtx(ctx);
          if (!current?.session) {
            throw new APIError('UNAUTHORIZED');
          }
          if (!current.session.impersonatedBy) {
            throw new APIError('BAD_REQUEST', { code: 'NOT_IMPERSONATING' });
          }

          const adminCookieProp = ctx.context.createAuthCookie('admin_session');
          const adminToken = await ctx.getSignedCookie(
            adminCookieProp.name,
            ctx.context.secret,
          );
          if (!adminToken) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              code: 'ADMIN_SESSION_MISSING',
            });
          }

          const adminSession = await ctx.context.internalAdapter.findSession(adminToken);
          if (
            !adminSession
            || String(adminSession.session.userId)
              !== String(current.session.impersonatedBy)
          ) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              code: 'ADMIN_SESSION_MISMATCH',
            });
          }

          await ctx.context.internalAdapter.deleteSession(
            current.session.token,
          );
          // Restore the impersonator's session cookie. dontRememberMe=false
          // matches the simplification we made on the impersonate side
          // (see comment above).
          await setSessionCookie(ctx, adminSession, false);
          expireCookie(ctx, adminCookieProp);

          return ctx.json({ ok: true });
        },
      ),
    },
  };
}
