'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('list');

const validateNav = require('./lib/validateNav');
const addListQuery = require('./lib/addListQuery');
const cleanListOptions = require('./lib/cleanListOptions');
const getDatabaseFieldName = require('./lib/databaseField').getName;
const getFieldsByAccess = require('./lib/getFieldsByAccess');
const addPagination = require('./lib/pagination');
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const handleInterface = require('./lib/handleInterface');
const toHTML = require('./lib/toHTML');
const flatten = require('./lib/flatten');

module.exports = async (service, query = {}, n = {}, o = {}) => {
  const k = service.clients.knex(service.config.schema);
  
  const nav = validateNav(n);
  const options = cleanListOptions(o);
  
  addListQuery(k, query, options);
  
  const total = options.total ? await k.clone()
    .count('id as total')
    .then(r => r[0].total) : null;

  k.select(
    getFieldsByAccess('read', options.access)
      .filter(f => options.includeFields.length ? options.includeFields.includes(f.field) : true)
      .map(getDatabaseFieldName)
      .concat(nav.useAfter ? ['id'] : [])
  );

  addPagination(k, nav);

  k.orderBy('id', 'asc');

  const result = {};

  result.rows = await k;
  
  result.items = result.rows.map(item => fromDbEntryToItem(service, item, options));
  
  if (total !== null) {
    result.total = total;
  }

  if (options.detailed) {
    const agendas = await handleInterface(
      service, 
      'getOriginAgendas',
      _.uniq(result.items.map(i => i.agendaUid)),
      { private: options.private }
    );
    const locations = await handleInterface(
      service,
      'getLocations',
      _.uniq(result.items.map(i => i.locationUid)),
    );

    result.items.forEach(event => {
      event.location = locations.filter(l => l.uid === event.locationUid).pop();
      event.originAgenda = agendas.filter(a => a.uid == event.agendaUid).pop();
    });
  }

  if (options.html) {
    result.items.forEach(event => {
      event.html = toHTML(event.longDescription);
    });
  }

  if (options.lang) {
    result.items = result.items.map(item => flatten(item, options.lang, options));
  }

  if (total === null && !nav.useAfter) {
    return result.items;
  }

  if (nav.useAfter) {
    result.after = result.rows.length ? _.last(result.rows).id : null;
  }

  return _.omit(result, ['rows']);
}