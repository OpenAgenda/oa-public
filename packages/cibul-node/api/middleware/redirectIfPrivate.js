const redirectURL = req => {
  const path = `${req.baseUrl}/agendas/${req.agenda.uid}.prv`;

  const queryPart = req.url.split('?')[1];

  if (!queryPart) {
    return path;
  }

  return `${path}?${queryPart}`;
};

export default (req, res, next) => {
  if (!req.agenda.private) {
    return next();
  }

  if (req.path.split('.').pop() === 'prv') {
    return next();
  }

  return res.redirect(302, redirectURL(req));
};
