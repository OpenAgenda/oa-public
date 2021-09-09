'use strict';

const _ = require('lodash');
require('@openagenda/logs')('services/agendaContribute/filterByAuthorizations');

function filterEventDataByAuthorizations(core, agendaUid, authorizations, data) {
  const eventFieldNames = core.agendas(agendaUid).events.validate.eventFields.map(f => f.field);

  if (authorizations.canEditEvent) {
    return data;
  }

  return _.omit(data, eventFieldNames);
}

module.exports = filterEventDataByAuthorizations;
