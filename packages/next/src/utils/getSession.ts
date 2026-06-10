import { headers } from 'next/headers';
import { getCookieCache } from '@openagenda/auth/server';
import type { Session } from '@openagenda/auth/session';

const secret = process.env.OA_AUTH_SECRET;

type RequestLike = Request | Headers;

export async function getSessionFromRequest(
  request: RequestLike,
): Promise<{ user: Session['user']; session: Session['session'] } | null> {
  if (!secret) return null;
  // Match the renamed session-cache cookie in `@openagenda/auth` (`oa.sess_data`,
  // which avoids Sentry's sensitive-header filter on the `session` snippet).
  // better-auth writes it with a `__Secure-` prefix when the auth baseURL is
  // https, but `getCookieCache` only assumes that prefix under
  // `NODE_ENV==='production'`. On an https stack with `NODE_ENV !== 'production'`
  // the unprefixed read misses the cookie, so read both name variants.
  const opts = { secret, cookiePrefix: 'oa', cookieName: 'sess_data' } as const;
  const cached =
    await getCookieCache(request, { ...opts, isSecure: true }) ??
    await getCookieCache(request, { ...opts, isSecure: false });
  if (!cached) return null;
  return {
    user: cached.user as unknown as Session['user'],
    session: cached.session as unknown as Session['session'],
  };
}

export default async function getSession(request?: RequestLike) {
  const h = request ?? await headers();
  return getSessionFromRequest(h as RequestLike);
}
