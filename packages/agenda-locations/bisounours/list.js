'use strict';

const log = require('@openagenda/logs')('list');

const addListQuery = require('./lib/addListQuery');
const addSelect = require('./lib/addSelect');
const cleanListOptions = require('./lib/cleanListOptions');
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const addPaginationAndOrder = require('./lib/addPaginationAndOrder');
const decorateWithCounts = require('./lib/decorateWithCounts');

async function list(service, query = {}, nav = {}, options = {}) {
  log('received %j %j', query, nav);
  const k = service.clients.knex(service.config.schema);
  const {
    total: includeTotal,
    eventCounts: includeEventCounts,
    context,
    detailed
  } = cleanListOptions(options);


  await addListQuery(service, k, {
    ...query,
    ...(context.agendaUid ? { agendaUid: context.agendaUid } : {})
  });

  const total = includeTotal ? await k.clone()
    .count('id as total')
    .then(r => r[0].total) : null;

  log('total: %s', total);

  addSelect(k, detailed ? 'public' : 'list');

  addPaginationAndOrder(k, nav);

  const items = await k.then(rows => rows.map(r => fromDbEntryToItem(r, {
    imagePath: service.config.imagePath,
    access: detailed ? 'public' : 'list'
  })));

  log('fetched %s items', items.length);

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      items,
      await service.interfaces.getEventCounts(items.map(i => i.uid), context)
    );
  }

  if (total === null) return items;

  return {
    items,
    total
  }
}

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  query = {},
  nav = {},
  options = {}
) => list(service, query, nav, {
  ...options,
  context: { agendaUid }
});
