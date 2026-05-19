import { headers } from 'next/headers';
import { getCookieCache } from '@openagenda/auth/server';
import type { Session } from '@openagenda/auth/session';

const secret = process.env.OA_AUTH_SECRET;

type RequestLike = Request | Headers;

export async function getSessionFromRequest(
  request: RequestLike,
): Promise<{ user: Session['user']; session: Session['session'] } | null> {
  if (!secret) return null;
  const cached = await getCookieCache(request, {
    secret,
    cookiePrefix: 'oa',
  });
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
