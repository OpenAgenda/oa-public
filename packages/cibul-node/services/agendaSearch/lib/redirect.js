import { setFlash } from '../../../lib/flash.js';

export default (message) => (req, res) => {
  setFlash(res, message);
  res.redirect(302, '/agendas');
};

export function slashed(req, res, next) {
  if (req.url.slice(-1) === '/') {
    return res.redirect(301, '/agendas');
  }
  next();
}
