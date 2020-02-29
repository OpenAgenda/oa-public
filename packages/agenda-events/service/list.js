"use strict";

const _ = require( 'lodash' );

const VError = require('verror');

const validate = require('../iso/validate');

const validateListQuery = require('./lib/validateListQuery');
const extractListParameters = require('./lib/extractListParameters');
const validateOptions = require('./lib/validateOptions');


module.exports = async (service, agendaUid, query, offset, limit, options) => {
  const { config, client } = service;

  const params = extractListParameters(agendaUid, query, offset, limit, options);

  const {
    decorate
  } = validateOptions(params.options);

  const items = (await _list(
    client,
    params.query,
    _.pick(params, ['offset', 'limit'])
  )).map(validate);

  if (decorate.includes('member') && _.get(config, 'interfaces.getMembers')) {
    const members = await config.interfaces.getMembers(items);

    items.forEach(item => {
      item.member = _.find(members, { userUid: item.userUid });
    });
  }

  return {
    items,
    total: await _total(client, params.query)
  }
}

module.exports.byLastId = async (service, agendaUid, query, lastId, limit = 2) => {
  const { config, client } = service;

  const cleanQuery = {
    agendaUid
  };

  const nav = {}

  if (!_.isObject(query)) {
    Object.assign(cleanQuery, validateListQuery({}));
    Object.assign(nav, { lastId: query, limit: lastId || 20 });
  } else {
    Object.assign(cleanQuery, validateListQuery(query));
    Object.assign(nav, { lastId, limit });
  }

  const items = await _list(client, cleanQuery, nav);

  return {
    items: items.map(validate),
    total: await _total(client, cleanQuery),
    lastId: _.get(_.last(items), 'id', -1)
  }
}

module.exports.byUserUid = async (service, userUid, offset, limit) => {
  const { config, client } = service;
  return {
    items: (await _list(client, { userUid }, { offset, limit })).map(validate),
    total: await _total(client, { userUid })
  }
}

module.exports.byEventUid = async (service, eventUid, ...args) => {
  const { config, client } = service;

  const offset = args.length === 2 ? args[0] : args[1];
  const limit = args.length === 2 ? args[1] : (args[2] || 20);
  const query = args.length === 3 ? { ...args[0], eventUid } : { eventUid };

  return {
    items: (await _list(client, query, { offset, limit })).map(validate),
    total: await _total(client, query)
  }
}

function _total(client, query) {
  const k = client('agenda_event');

  _query(k, query);

  return k.count('id as total')
    .then(rows => rows[0]['total']);
}

function _list(client, query, nav) {
  const {
    limit,
    offset,
    lastId
  } = nav;

  const fields = [
    'agenda_uid',
    'event_uid',
    'user_uid',
    'state',
    'featured',
    'legacy_id'
  ];

  if (lastId !== undefined) {
    fields.push('id');
  }

  const k = client('agenda_event').select(fields);

  if (limit !== undefined) {
    k.limit(limit);
  }

  if (lastId !== undefined) {
    k.where('id', '>', lastId);
  } else {
    k.offset(offset);
  }

  _query(k, query);

  return k.then(rows => rows
    .map(r => _.mapKeys(r, (v, k) => _.camelCase(k)))
  );
}

function _query(k, query) {
  if (query.agendaUid !== undefined) {
    k.where('agenda_uid', query.agendaUid);
  } else if (query.userUid !== undefined) {
    k.where('user_uid', query.userUid);
  }

  if (query.eventUid && _.isArray(query.eventUid)) {
    k.whereIn('event_uid', query.eventUid);
  } else if (query.eventUid) {
    k.where('event_uid', query.eventUid);
  }

  if (query.state !== undefined) {
    k.andWhere('state', query.state);
  }

  if (query.excludeAgendaUid) {
    k.whereNotIn('agenda_uid', [].concat(query.excludeAgendaUid))
  }

  if (![null, undefined].includes(query.aggregated)) {
    k.andWhere('aggregated', 1);
  }
}
