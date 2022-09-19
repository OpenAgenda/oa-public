'use strict';

const log = require('@openagenda/logs')('api/middleware/getEventFromSearchOrAsDraft');

const {
  NotFound,
  Forbidden
} = require('@openagenda/verror');

module.exports = function getEventFromSearchOrAsDraft(req, res, next) {
  const {
    core
  } = req.app.services;

  const identifier = {
    ...(req.params.eventUid ? {
      uid: req.params.eventUid
    } : {
      slug: req.params.eventSlug
    })
  };

  log('getting event matching identifier %j', identifier);

  core
    .agendas(req.agenda.uid)
    .events
    .search.get(identifier, {
      detailed: true,
      userUid: req.user?.uid,
      longDescriptionFormat: req.query.longDescriptionFormat,
      useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
      includeLabels: req.query.includeLabels,
      monolingual: req.query.monolingual
    }).then(indexedEvent => {
      req.event = indexedEvent;
      next();
    }, err => {
      if (err.name !== 'NotFound') {
        return next(err);
      }

      log('event not found in index, getting draft');

      core.agendas(req.agenda.uid).events
        .get(req.params.eventUid, {
          useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
          useLocationObjectFormat: true,
          access: 'internal',
          private: null
        })
        .then(event => {
          if (!event?.draft) {
            return next(new NotFound({
              info: { uid: req.params.eventUid }
            }, 'event not found'));
          }

          // only creator can load draft
          if (event.creatorUid !== parseInt(req.user?.uid, 10)) {
            return next(
              new Forbidden('not authorized to read event')
            );
          }

          req.event = event;

          next();
        });
    });
};
