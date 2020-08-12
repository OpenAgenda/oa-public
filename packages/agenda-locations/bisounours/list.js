'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('list');

const addListQuery = require('./lib/addListQuery');
const addSelect = require('./lib/addSelect');
const cleanNav = require('./lib/cleanNav');
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

  const {
    useAfter,
    after
  } = cleanNav(nav);

  await addListQuery(service, k, {
    ...query,
    ...(context.agendaUid ? { agendaUid: context.agendaUid } : {})
  });

  const total = includeTotal ? await k.clone()
    .count('id as total')
    .then(r => r[0].total) : null;

  log('total: %s', total);

  addSelect(k, detailed ? 'public' : 'list', useAfter ? { include: ['id'] } : {});

  addPaginationAndOrder(k, nav);

  const rows = await k;

  const items = rows.map(r => fromDbEntryToItem(r, {
    imagePath: service.config.imagePath,
    access: detailed ? 'public' : 'list'
  }));

  log('fetched %s items', items.length);

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      items,
      await service.interfaces.getEventCounts(items.map(i => i.uid), context)
    );
  }

  if (total === null && !useAfter) {
    return items;
  }

  const response = { items };

  if (total !== null) {
    response.total = total;
  }

  if (useAfter) {
    response.after = rows.length ? _.last(rows).id : null;
  }

  return response;
}

module.exports = list;

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
