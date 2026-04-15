import { SESSION_COOKIE_NAME } from '../config/constants';
import base64 from './base64';

function getCookie(cookies: any, name: string) {
  if (typeof cookies.get === 'function') {
    const cookie = cookies.get(name);
    return typeof cookie === 'object' && cookie !== null
      ? cookie.value
      : cookie;
  }

  return cookies?.[name];
}

/**
 * Decode the raw base64-JSON payload of the session cookie. Returns null on
 * absence or parse failure. Exposed separately so callers that already have
 * the cookie value as a string (e.g. span attributes) can skip the lookup
 * step in `getSession`.
 */
export function parseSessionCookie(value: string | undefined | null) {
  if (!value) return null;
  try {
    return JSON.parse(base64.decode(value));
  } catch {
    return null;
  }
}

export default function getSession(cookies: any) {
  return parseSessionCookie(getCookie(cookies, SESSION_COOKIE_NAME));
}
