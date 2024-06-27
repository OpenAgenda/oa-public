import logs from '@openagenda/logs';

const log = logs('services/users/requireSuperAdmin');

export default function requireSuperAdmin(params = {}) {
  const {
    jsonResponse = false,
    redirectURL = '/',
  } = params;

  return (req, res, next) => {
    const {
      core,
    } = req.app.services;

    const config = core.getConfig();

    if (req.user?.isSuperAdmin || config.superAdminUids.includes(req.user.uid)) {
      log.info('authorized', { originalUrl: req.originalUrl, userUid: req.user.uid });
      return next();
    }

    log.info('unauthorized', { originalUrl: req.originalUrl, userUid: req.user.uid });

    if (jsonResponse) {
      res.status(403).json({
        agendaUid: req.params.agendaUid,
      });
      return;
    }

    res.redirect(302, redirectURL);
  };
}
