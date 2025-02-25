import base64 from './base64';

const COOKIE_NAME = 'oa.user';

export default function getSession(cookies) {
  const sessionCookie = typeof cookies.get === 'function'
    ? cookies.get(COOKIE_NAME)
    : cookies[COOKIE_NAME];

  if (!sessionCookie) return null;

  try {
    return JSON.parse(base64.decode(sessionCookie));
  } catch {
    return null;
  }
}
