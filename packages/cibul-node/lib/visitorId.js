import { randomUUID } from 'node:crypto';

const COOKIE_NAME = 'oa.visitor_id';
// 400 days is the browser cap (Chrome/Firefox) on cookie max-age.
const MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default function visitorId(req, res, next) {
  let id = req.cookies?.[COOKIE_NAME];
  if (!id || !UUID_RE.test(id)) {
    id = randomUUID();
    res.cookie(COOKIE_NAME, id, {
      maxAge: MAX_AGE_MS,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  req.visitorId = id;
  next();
}
