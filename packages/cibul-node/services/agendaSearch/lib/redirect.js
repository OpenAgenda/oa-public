export default (message) => (req, res) => {
  req.app.services.sessions.setFlash(req, res, message);
  res.redirect(302, '/agendas');
};

export function slashed(req, res, next) {
  if (req.url.slice(-1) === '/') {
    return res.redirect(301, '/agendas');
  }
  next();
}
