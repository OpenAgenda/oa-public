'use strict';

const log = require('@openagenda/logs')('services/agendaEvents/middleware/remove');
const base64 = require('@openagenda/utils/base64');
const getLabel = require('@openagenda/labels')(require('@openagenda/labels/event/remove'));

module.exports = [
  (req, res, next) => {
    req.isOwner = req.user.uid === req.event.ownerUid;
    req.isAdminMod = req.app.services.members.utils.compareRoles.isSuperiorToOrEqual(req.member.role, 'moderator');
    if (req.isOwner || req.isAdminMod) {
      return next();
    }
    next({ code: 401 });
  },
  (req, res, next) => {
    req.app.services.core
      .agendas(req.agenda.uid)
      .events.remove(req.event.uid, { returnPayload: true })
      .then(result => {
        req.result = result;
        next();
      }, next);
  },
  (req, res, next) => {
    if (req.xhr) {
      return res.sendStatus(200);
    }

    const redirect = req.query.redirect ? base64.decode(req.query.redirect) : null;

    req.app.services.sessions.setFlash(req, res, getLabel(req.result.deletion ? 'eventDeleted' : 'eventRemoved', req.lang));

    if (redirect) {
      log('redirecting to %s', redirect);
      return res.redirect(302, _appendPHPDefPrefix(redirect));
    }

    if (req.isAdminMod) {
      return res.redirect(302, `/${req.agenda.slug}/admin/events`);
    }

    res.redirect(302, `/${req.agenda.slug}`);
  }
]


function _appendPHPDefPrefix(redirect) {
  const sfPrefix = '/frontend_dev.php';

  if (redirect.indexOf('/admin') === -1) {
    return redirect;
  }

  if (process.env.NODE_ENV !== 'development') {
    return redirect;
  }

  if (redirect.indexOf(sfPrefix) !== -1) {
    return redirect;
  }

  return sfPrefix + redirect;
}
