import _ from 'lodash';

export default function filterEventDataByAuthorizations(core, agendaUid, authorizations, data) {
  const eventFieldNames = core.agendas(agendaUid).events.validate.eventFields.map(f => f.field);

  if (authorizations.canEditEvent) {
    return data;
  }

  return _.omit(data, eventFieldNames);
}
