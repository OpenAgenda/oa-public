import _ from 'lodash';

import validate from '../iso/validate.js';
import validateListQuery from './lib/validateListQuery.js';
import extractListParameters from './lib/extractListParameters.js';
import validateOptions from './lib/validateOptions.js';
import decorateListItems from './lib/decorateListItems.js';
import buildListQuery from './lib/buildListQuery.js';

function _total(client, query) {
  const k = client('agenda_event');

  buildListQuery.addWheres(k, query);

  return k.count('id as total').then(rows => rows[0].total);
}

async function list(service, agendaUid, query, offset, limit, options) {
  const { client } = service;

  const params = extractListParameters(
    agendaUid,
    query,
    offset,
    limit,
    options,
  );

  const { decorate } = validateOptions(params.options);

  const items = (
    await buildListQuery(
      service,
      params.query,
      _.pick(params, ['offset', 'limit']),
      { decorate },
    )
  ).map(validate);

  if (decorate.length) {
    await decorateListItems(service, items, decorate);
  }

  return {
    items,
    total: await _total(client, params.query),
  };
}

export async function byLastId(
  service,
  agendaUid,
  query,
  lastId,
  limit = 20,
  options = {},
) {
  const { client } = service;

  const cleanQuery = {
    agendaUid,
  };

  const { decorate } = validateOptions(options);

  const nav = {};

  if (!_.isObject(query)) {
    Object.assign(cleanQuery, validateListQuery({}));
    Object.assign(nav, { lastId: query, limit: lastId || 20 });
  } else {
    Object.assign(cleanQuery, validateListQuery(query));
    Object.assign(nav, { lastId, limit });
  }

  const dirtyItems = await buildListQuery(service, cleanQuery, nav, {
    decorate,
  });
  const items = dirtyItems.map(validate);

  if (decorate.length) {
    await decorateListItems(service, items, decorate);
  }

  return {
    items,
    total: await _total(client, cleanQuery),
    lastId: _.get(_.last(dirtyItems), 'id', -1),
  };
}

export async function byUserUid(service, userUid, offset, limit) {
  const { client } = service;
  return {
    items: (await buildListQuery(service, { userUid }, { offset, limit })).map(
      validate,
    ),
    total: await _total(client, { userUid }),
  };
}

export async function byEventUid(service, eventUid, ...args) {
  const { client } = service;

  const offset = args.length === 2 ? args[0] : args[1];
  const limit = args.length === 2 ? args[1] : args[2] || 20;

  const query = { eventUid };
  if (args.length === 3 || args.length === 1) {
    Object.assign(query, args[0]);
  }

  return {
    items: (await buildListQuery(service, query, { offset, limit })).map(
      validate,
    ),
    total: await _total(client, query),
  };
}

export default Object.assign(list, {
  byLastId,
  byUserUid,
  byEventUid,
});
