export const FLASH_COOKIE = 'oa.flash';

export function setFlash(res, message) {
  if (typeof message !== 'string' || message.length === 0) return;
  res.cookie(
    FLASH_COOKIE,
    message.length > 1000 ? message.slice(0, 1000) : message,
    {
      maxAge: 60_000,
      sameSite: 'lax',
      path: '/',
    },
  );
}
