'use strict';

const log = require('@openagenda/logs')('get');
const cleanGetOptions = require('./lib/cleanGetOptions');
const addGetQuery = require('./lib/addGetQuery');
const addSelect = require('./lib/addSelect');
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const decorateWithCounts = require('./lib/decorateWithCounts');

async function get(service, identifiers, options = {}) {
  log('received %j', identifiers);
  const k = service.clients.knex(service.config.schema);
  const {
    eventCounts: includeEventCounts,
    context,
    includeImagePath
  } = cleanGetOptions(options);

  await addGetQuery(service, k, {
    uid: identifiers,
    ...(context.agendaUid ? { agendaUid: context.agendaUid } : {})
  });

  addSelect(k, 'public', { first: true });

  const location = await k.then(l => l ? fromDbEntryToItem(l, {
    imagePath: includeImagePath ? service.config.imagePath : null,
    access: 'public'
  }): null);

  if (!location) {
    return null;
  }

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      location,
      await service.interfaces.getEventCounts([location.uid], context)
    );
  }

  return location;
}

module.exports = get;

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  identifiers,
  options = {}
) => get(service, identifiers, { ...options, context: { agendaUid } });
