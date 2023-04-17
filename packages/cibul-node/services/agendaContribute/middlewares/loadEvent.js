'use strict';

const _ = require('lodash');
const { NotFound } = require('@openagenda/verror');

module.exports = (req, res, next) => req.app.services.core
  .agendas((req.fromAgenda || req.agenda).uid)
  .events.get(req.params.eventUid, {
    access: 'internal',
    private: null,
    useDateHoursMinutesFormat: true,
    useLocationObjectFormat: true
  }).then(event => {
    if (!event) return next(new NotFound());

    req.event = _.omit(event, ['state', 'id']);

    next();
  }).catch(next);
