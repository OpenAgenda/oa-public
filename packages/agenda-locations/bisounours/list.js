'use strict';

const addListQuery = require('./lib/addListQuery');
const cleanListOptions = require('./lib/cleanListOptions');
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const addPaginationAndOrder = require('./lib/addPaginationAndOrder');

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  query = {},
  nav = {},
  options = {}
) => {
  const k = service.clients.knex(service.config.schema);
  const {
    total: includeTotal
  } = cleanListOptions(options);

  await addListQuery(service, k, {
    ...query,
    agendaUid
  });

  if (includeTotal) {
    total = k.clone();
  };

  const total = includeTotal ? await k.clone()
    .count('id as total')
    .then(r => r[0].total) : null;

  await addPaginationAndOrder(k, nav);

  const items = k.then(rows => rows.map(r => fromDbEntryToItem(r, {
    imagePath: service.config.imagePath
  })));

  if (!total) return items;

  return {
    items,
    total
  }
}
