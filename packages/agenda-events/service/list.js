"use strict";

const _ = require( 'lodash' );

const VError = require('verror');

const validate = require('../iso/validate');

const validateListQuery = require('./lib/validateListQuery');
const extractListParameters = require('./lib/extractListParameters');
const validateOptions = require('./lib/validateOptions');
const decorateListItems = require('./lib/decorateListItems');
const buildListQuery = require('./lib/buildListQuery');


module.exports = async (service, agendaUid, query, offset, limit, options) => {
  const { config, client } = service;

  const params = extractListParameters(agendaUid, query, offset, limit, options);

  const {
    decorate
  } = validateOptions(params.options);

  const items = (await buildListQuery(
    service,
    params.query,
    _.pick(params, ['offset', 'limit']),
    { decorate }
  )).map(validate);

  if (decorate.length) {
    await decorateListItems(service, items, decorate);
  }

  return {
    items,
    total: await _total(client, params.query)
  }
}

module.exports.byLastId = async (service, agendaUid, query, lastId, limit = 2, options = {}) => {
  const { config, client } = service;

  const cleanQuery = {
    agendaUid
  };

  const {
    decorate
  } = validateOptions(options);

  const nav = {}

  if (!_.isObject(query)) {
    Object.assign(cleanQuery, validateListQuery({}));
    Object.assign(nav, { lastId: query, limit: lastId || 20 });
  } else {
    Object.assign(cleanQuery, validateListQuery(query));
    Object.assign(nav, { lastId, limit });
  }

  const items = await buildListQuery(service, cleanQuery, nav);

  return {
    items: items.map(validate),
    total: await _total(client, cleanQuery),
    lastId: _.get(_.last(items), 'id', -1)
  }
}

module.exports.byUserUid = async (service, userUid, offset, limit) => {
  const { config, client } = service;
  return {
    items: (await buildListQuery(service, { userUid }, { offset, limit })).map(validate),
    total: await _total(client, { userUid })
  }
}

module.exports.byEventUid = async (service, eventUid, ...args) => {
  const { config, client } = service;

  const offset = args.length === 2 ? args[0] : args[1];
  const limit = args.length === 2 ? args[1] : (args[2] || 20);
  const query = args.length === 3 ? { ...args[0], eventUid } : { eventUid };

  return {
    items: (await buildListQuery(service, query, { offset, limit })).map(validate),
    total: await _total(client, query)
  }
}

function _total(client, query) {
  const k = client('agenda_event');

  buildListQuery.addWheres(k, query);

  return k.count('id as total')
    .then(rows => rows[0]['total']);
}
