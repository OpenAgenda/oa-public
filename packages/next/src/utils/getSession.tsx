import base64 from './base64';

export default function getSession(cookies) {
  const sessionCookie = typeof cookies.get === 'function'
    ? cookies.get('oa')
    : cookies.oa;

  if (!sessionCookie) return null;

  try {
    return JSON.parse(base64.decode(sessionCookie));
  } catch {
    return null;
  }
}
