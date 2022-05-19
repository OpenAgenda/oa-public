'use strict';

const log = require('@openagenda/logs')('api/middleware/getEventFromSearchOrAsDraft');

const { NotFound } = require('@openagenda/verror');

module.exports = function getEventFromSearchOrAsDraft(req, res, next) {
  const {
    core
  } = req.app.services;

  const query = {
    state: null,
    ...(req.params.eventUid ? {
      uid: req.params.eventUid
    } : {
      slug: req.params.eventSlug
    })
  };

  log('getting event matching query %j', query);

  core
    .agendas(req.agenda.uid)
    .events
    .search(query, { size: 1 }, {
      detailed: true,
      access: 'internal', // access is evaluated in other middleware.
      longDescriptionFormat: req.query.longDescriptionFormat,
      useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
      returnAgenda: true,
      includeLabels: req.query.includeLabels,
      monolingual: req.query.monolingual
    }).then(async ({ agenda, result }) => {
      const { events } = result;

      req.schema = agenda.schema;
      req.event = (events ?? []).pop();

      if (req.event) {
        log('found event in index');
        return next();
      }

      log('event not found in index, getting draft');

      core.agendas(req.agenda.uid).events
        .get(req.params.eventUid, {
          useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
          useLocationObjectFormat: true,
          access: 'internal'
        })
        .then(event => {
          if (event?.draft) {
            req.event = event;
            return next();
          }

          next(new NotFound({
            info: { uid: req.params.eventUid }
          }, 'event not found'));
        });
    });
};
