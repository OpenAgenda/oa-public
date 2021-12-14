'use strict';

const { NotFound } = require('@openagenda/verror');

module.exports = function getEventFromSearchOrAsDraft(req, res, next) {
  const {
    core
  } = req.app.services;

  core
    .agendas(req.agenda.uid).events
    .search({ state: null, uid: req.params.eventUid }, { size: 1 }, {
      detailed: true,
      access: 'internal',
      longDescriptionFormat: req.query.longDescriptionFormat,
      useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
    }).then(async ({ events }) => {
      req.event = (events ?? []).pop();

      if (req.event) {
        return next();
      }

      core.agendas(req.agenda.uid).events
        .get(req.params.eventUid)
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
