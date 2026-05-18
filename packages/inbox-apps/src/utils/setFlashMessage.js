import Cookies from 'js-cookie';

export default function setFlashMessage(message) {
  if (typeof message !== 'string' || message.length === 0) return;
  Cookies.set('oa.flash', message, {
    expires: 1 / 1440,
    path: '/',
    sameSite: 'lax',
  });
}
