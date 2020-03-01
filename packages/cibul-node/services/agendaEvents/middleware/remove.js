'use strict';

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
    const redirect = req.query.redirect ? base64.decode(req.query.redirect) : null;
    const sfPrefix = process.env.NODE_ENV === 'development' ? '/frontend_dev.php' : null;

    req.app.services.sessions.setFlash(req, res, getLabel(req.result.deletion ? 'eventDeleted' : 'eventRemoved', req.lang));

    if (redirect) {
      return res.redirect(302, sfPrefix + redirect);
    }

    if (req.isAdminMod) {
      return res.redirect(302, `${sfPrefix}/${req.agenda.slug}/admin`);
    }

    res.redirect(302, `/${req.agenda.slug}`);
  }
]
