'use strict';

const getLabel = require('@openagenda/labels')(
  require('@openagenda/labels/event/states')
);
const base64 = require('@openagenda/utils/base64');

module.exports = (req, res, next) => {
  req.log.debug('updating featured to %s', req.params.type);

  const {
    core,
    sessions
  } = req.app.services;

  core.agendas(req.agenda.uid).events.patch(req.event.uid, {
    featured: req.params.type === 'featured'
  }, {
    userUid: req.user.uid
  }).then(() => {
    sessions.setFlash(req, res, getLabel(req.params.type === 'featured' ? 'featuredChange' : 'unfeaturedChange', req.lang));

    res.redirect(
      302,
      req.query.redirect ? base64.decode(req.query.redirect) : `/${req.agenda.slug}/events/${req.event.slug}`
    );
  }, next);
}
