'use strict';

const _ = require('lodash');

module.exports = (core, agendaOrUid) => {
  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  return {
    list: (query, nav) => core.services.agendaLocations(agendaUid).list(query, nav, {
      total: true
    })
  }
}
