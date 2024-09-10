import _ from 'lodash';
import logs from '@openagenda/logs';
import extractListParameters from './lib/extractListParameters.js';
import buildListQuery from './lib/buildListQuery.js';

const log = logs('listAllRemoved');

function _total(client, query, options) {
  const k = client('agenda_event');

  buildListQuery.addWheres(k, query, options);

  return k.count('id as total').then((rows) => rows[0].total);
}

async function listAllRemoved(service, query, offset, limit, options) {
  const { client } = service;

  const params = extractListParameters(
    undefined, // agendaUid
    query,
    offset,
    limit,
    options,
  );
  log('called with params', params);

  const items = await buildListQuery(
    service,
    params.query,
    _.pick(params, ['offset', 'limit']),
    { removed: true },
  );

  return {
    items,
    total: await _total(client, params.query, { removed: true }),
  };
}

export default listAllRemoved;
