'use strict';

const _ = require('lodash');

module.exports = async (services, agendaUid) => {
  const {
    agendaEvents
  } = services;

  const totals = {
    total: ( await agendaEvents( agendaUid ).list( 0, 0 ) ).total,
    published: ( await agendaEvents( agendaUid ).list( { state: 'published' }, 0, 0 ) ).total,
    ready: ( await agendaEvents( agendaUid ).list( { state: 'controlled' }, 0, 0 ) ).total,
    toBeCompleted: ( await agendaEvents( agendaUid ).list( { state: 'tocontrol' }, 0, 0 ) ).total
  };

  return _.extend( totals, {
    checksum: totals.total === totals.published + totals.ready + totals.toBeCompleted
  } );

}
