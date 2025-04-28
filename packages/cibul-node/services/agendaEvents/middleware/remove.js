import logs from '@openagenda/logs';
import base64 from '@openagenda/utils/base64.js';
import makeLabelGetter from '@openagenda/labels';
import removeLabels from '@openagenda/labels/event/remove.js';

const getLabel = makeLabelGetter(removeLabels);
const log = logs('services/agendaEvents/middleware/remove');

export default [
  (req, res, next) => {
    req.isOwner = req.user.uid === req.event.ownerUid;
    req.isAdminMod = req.app.services.members.utils.compareRoles.isSuperiorToOrEqual(
      req.member.role,
      'moderator',
    );
    if (req.isOwner || req.isAdminMod) {
      return next();
    }
    next({ code: 401 });
  },
  (req, res, next) => {
    req.app.services.core
      .agendas(req.agenda.uid)
      .events.remove(req.event.uid, {
        returnPayload: true,
        context: { user: req.user, member: req.member },
        private: !!req.agenda.private,
      })
      .then((result) => {
        req.result = result;
        next();
      }, next);
  },
  (req, res) => {
    if (req.xhr) {
      return res.sendStatus(200);
    }

    const redirect = req.query.redirect
      ? base64.decode(req.query.redirect)
      : null;

    req.app.services.sessions.setFlash(
      req,
      res,
      getLabel(req.result.deletion ? 'eventDeleted' : 'eventRemoved', req.lang),
    );

    if (redirect) {
      log('redirecting to %s', redirect);
      return res.redirect(302, redirect);
    }

    if (req.isAdminMod) {
      return res.redirect(302, `/${req.agenda.slug}/admin/events`);
    }

    res.redirect(302, `/${req.agenda.slug}`);
  },
];
