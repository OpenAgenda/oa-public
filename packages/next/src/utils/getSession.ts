import base64 from './base64';

const COOKIE_NAME = 'oa.user';

function getCookie(cookies: any, name: string) {
  if (typeof cookies.get === 'function') {
    const cookie = cookies.get(name);
    return typeof cookie === 'object' && cookie !== null
      ? cookie.value
      : cookie;
  }

  return cookies?.[name];
}

export default function getSession(cookies: any) {
  const sessionCookie = getCookie(cookies, COOKIE_NAME);

  if (!sessionCookie) return null;

  try {
    return JSON.parse(base64.decode(sessionCookie));
  } catch {
    return null;
  }
}
