"use strict";

const _ = require( 'lodash' );

const VError = require('verror');

const validate = require('../iso/validate');

const validateListQuery = require('./lib/validateListQuery');
const extractListParameters = require('./lib/extractListParameters');
const validateOptions = require('./lib/validateOptions');

module.exports = (config, client) => Object.assign(list.bind(null, config, client), {
  byUserUid: listByUserUid.bind(null, config, client),
  byEventUid: listByEventUid.bind(null, config, client),
  byLastId: listByLastId.bind(null, config, client)
});

async function list(config, knex, agendaUid, query, offset, limit, options) {
  const params = extractListParameters(agendaUid, query, offset, limit, options);
  const {
    decorate
  } = validateOptions(params.options);

  const items = (await _list(
    knex,
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
    total: await _total(knex, params.query)
  }
}

async function listByLastId(config, knex, agendaUid, query, lastId, limit = 2) {
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

  const items = await _list(knex, cleanQuery, nav);

  return {
    items: items.map(validate),
    total: await _total(knex, cleanQuery),
    lastId: _.get(_.last(items), 'id', -1)
  }
}

async function listByUserUid(config, knex, userUid, offset, limit) {
  return {
    items: (await _list(knex, { userUid }, { offset, limit })).map(validate),
    total: await _total(knex, { userUid })
  }
}

async function listByEventUid(config, knex, eventUid, ...args) {
  const offset = args.length === 2 ? args[0] : args[1];
  const limit = args.length === 2 ? args[1] : (args[2] || 20);
  const query = args.length === 3 ? { ...args[0], eventUid } : { eventUid };

  if (!knex) throw new VError( 'agenda-events service is not configured' );

  return {
    items: (await _list(knex, query, { offset, limit })).map(validate),
    total: await _total(knex, query)
  }
}

function _total(knex, query) {
  const k = knex('agenda_event');

  _query(k, query);

  return k.count('id as total')
    .then(rows => rows[0]['total']);
}

function _list(knex, query, nav) {
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

  const k = knex('agenda_event').select(fields);

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
