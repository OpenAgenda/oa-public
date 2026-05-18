import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';
import logger from '@openagenda/logs';

import addListQuery from './lib/addListQuery.js';
import addPaginationAndOrder from './lib/paginationAndOrder.js';
import {
  make as makeAfter,
  include as includeAfterFields,
} from './lib/after.js';
import addSelect from './lib/addSelect.js';
import createStream from './lib/createStream.js';
import validateNav from './lib/validateNav.js';
import validateListOptions from './lib/validateListOptions.js';
import transformAndDecorateItems from './lib/transformAndDecorateItems.js';
import pickContextIdentifiers from './lib/pickAndCleanContextIdentifiers.js';

const log = logger('list');

async function list(service, query = {}, nav = {}, options = {}) {
  const inflatedQuery = Object.keys(query || {}).length
    ? Object.keys(query).reduce(
      (inflated, key) => _.set(inflated, key.split('.'), query[key]),
      {},
    )
    : null;
  log('received %j %j %j', inflatedQuery, nav, options);
  const k = service.clients.knex(service.config.schema);
  const cleanListOptions = validateListOptions(options);
  const {
    total: includeTotal,
    endpointId,
    detailed,
    includeFields,
    deleted,
  } = cleanListOptions;

  const cleanNav = validateNav(nav);

  await addListQuery(service, k, deleted, {
    ...inflatedQuery,
    ...pickContextIdentifiers(endpointId, ['agendaUid', 'setUid']),
  });

  const total = includeTotal
    ? await k
      .clone()
      .count('id as total')
      .then((r) => r[0].total)
    : null;

  log('total: %s', total);

  addSelect(k, detailed ? 'public' : 'list', {
    include: includeAfterFields(cleanNav),
    includeFields,
  });

  if ((includeFields ?? []).includes('agendaUid')) {
    k.select('agenda_id');
  }

  addPaginationAndOrder(k, cleanNav, cleanListOptions);

  const result = {};

  if (cleanListOptions.stream) {
    result.stream = createStream(service, k, cleanListOptions);
  } else {
    result.rows = await k;
    result.items = await transformAndDecorateItems(
      service,
      result.rows,
      cleanListOptions,
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
    result.after = makeAfter(result, cleanNav);
  }

  return _.omit(result, ['rows']);
}

list.byAgendaUid = async (
  service,
  agendaUid,
  query = {},
  nav = {},
  options = {},
) => {
  if (!agendaUid) {
    throw new BadRequest('agendaUid is not specified');
  }

  return list(service, query, nav, {
    ...options,
    endpointId: { agendaUid },
  });
};

list.bySetUid = async (service, setUid, query = {}, nav = {}, options = {}) => {
  if (!setUid) {
    throw new BadRequest('set uid is not specified');
  }

  return list(service, query, nav, {
    ...options,
    endpointId: { setUid },
  });
};

export default list;
