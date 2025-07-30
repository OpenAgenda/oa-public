export default function redirectRootLangPaths(req, res, next) {
  const { services } = req.app;

  const { core } = services;

  const { interfaceLanguages = [] } = core.getConfig();

  const URLParts = req.url.substr(1).split('/');

  if (URLParts.length > 1 && interfaceLanguages.includes(URLParts[0])) {
    URLParts.shift();
    res.redirect(302, `/${URLParts.join('/')}`);
    return;
  }

  next();
}
