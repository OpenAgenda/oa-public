import logs from '@openagenda/logs';
import { Forbidden } from '@openagenda/verror';

const log = logs('services/users/allowSuperAdmin');

export default function allowSuperAdmin(params = {}) {
  const { jsonResponse = false, redirectURL = '/', redirect = true } = params;

  return (req, res, next) => {
    const { core } = req.app.services;

    const config = core.getConfig();

    if (
      req.user?.isSuperAdmin
      || config.superAdminUids.includes(req.user.uid)
    ) {
      log.info('authorized', {
        originalUrl: req.originalUrl,
        userUid: req.user.uid,
      });
      req.access = 'internal';
      return next();
    }

    log.info('unauthorized', {
      originalUrl: req.originalUrl,
      userUid: req.user.uid,
    });

    if (jsonResponse) {
      res.status(403).json({
        agendaUid: req.params.agendaUid,
      });
      return;
    }

    if (redirect) {
      res.redirect(302, redirectURL);
      return;
    }

    next(new Forbidden());
  };
}
