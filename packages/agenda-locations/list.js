'use strict';

const _ = require('lodash');
const { BadRequest } = require('@openagenda/verror');
const logs = require('@openagenda/logs');

const addListQuery = require('./lib/addListQuery');
const addPagination = require('./lib/addPagination');
const addSelect = require('./lib/addSelect');
const createStream = require('./lib/createStream');
const validateNav = require('./lib/validateNav');
const validateListOptions = require('./lib/validateListOptions');
const transformAndDecorateItems = require('./lib/transformAndDecorateItems');
const pickContextIdentifiers = require('./lib/pickContextIdentifiers');

const log = logs('list');

async function list(service, query = {}, nav = {}, options = {}) {
  log('received %j %j %j', query, nav, options);
  const k = service.clients.knex(service.config.schema);
  const cleanListOptions = validateListOptions(options);
  const {
    total: includeTotal,
    endpointId,
    detailed,
    includeFields,
    stream: streamOptions,
    deleted
  } = cleanListOptions;

  const cleanNav = validateNav(nav);

  await addListQuery(service, k, deleted, {
    ...query,
    ...pickContextIdentifiers(endpointId, ['agendaUid', 'setUid']),
  });

  const total = includeTotal
    ? await k
      .clone()
      .count('id as total')
      .then(r => r[0].total)
    : null;

  log('total: %s', total);

  addSelect(k, detailed ? 'public' : 'list', {
    include: cleanNav.useAfter ? ['id'] : [],
    includeFields,
  });

  if ((includeFields ?? []).includes('agendaUid')) {
    k.select('agenda_id');
  }

  if (!streamOptions) {
    addPagination(k, cleanNav);
  }

  k.orderBy('id', 'desc');

  const result = {};

  if (cleanListOptions.stream) {
    result.stream = createStream(service, k, cleanListOptions);
  } else {
    result.rows = await k;
    result.items = await transformAndDecorateItems(
      service,
      result.rows,
      cleanListOptions
    );
    log('fetched %s items', result.rows.length);
  }

  if (total === null && !cleanNav.useAfter) {
    return cleanListOptions.stream ? result.stream : result.items;
  }

  if (total !== null) {
    result.total = total;
  }

  if (cleanNav.useAfter) {
    result.after = result.rows.length ? _.last(result.rows).id : null;
  }

  return _.omit(result, ['rows']);
}

module.exports = list;

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  query = {},
  nav = {},
  options = {}
) => {
  if (!agendaUid) {
    throw new BadRequest('agendaUid is not specified');
  }

  return list(service, query, nav, {
    ...options,
    endpointId: { agendaUid },
  });
};

module.exports.bySetUid = async (
  service,
  setUid,
  query = {},
  nav = {},
  options = {}
) => {
  if (!setUid) {
    throw new BadRequest('set uid is not specified');
  }

  return list(service, query, nav, {
    ...options,
    endpointId: { setUid },
  });
};
