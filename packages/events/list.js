'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('list');

const validateNav = require('./lib/validateNav');
const addListQuery = require('./lib/addQuery');
const cleanListOptions = require('./lib/cleanOptions');
const getDatabaseFieldName = require('@openagenda/utils/fields/databaseField').getName;
const addPaginationAndOrder = require('./lib/paginationAndOrder');
const handleInterface = require('./lib/handleInterface');
const lastEventClean = require('./lib/lastEventClean');


module.exports = async (service, query = {}, n = {}, o = {}) => {
  log('called', query);

  let agendas;
  let locations;

  const k = service.clients.knex(service.config.schema);

  const nav = validateNav(n);
  const options = cleanListOptions(o);

  addListQuery(k, query, options);

  const total = options.total ? await k.clone()
    .count('id as total')
    .then(r => r[0].total) : null;

  k.select(
    service.fieldUtils.getFieldsByAccess('read', options.access)
      .filter(f => (options.includeFields.length ? options.includeFields.includes(f.field) : true))
      .map(getDatabaseFieldName)
      .concat(options.useAfter ? ['id'] : [])
  );

  const orderField = addPaginationAndOrder(k, nav, options);

  const result = {};
  
  result.rows = await k;

  result.items = result.rows.map(item => service.fieldUtils.fromEntryToItem(item, options));
  
  if (total !== null) {
    result.total = total;
  }

  if (options.detailed) {
    agendas = await handleInterface(
      service, 
      'getOriginAgendas',
      _.uniq(result.items.map(i => i.agendaUid)),
      { private: options.private }
    );
    locations = await handleInterface(
      service,
      'getLocations',
      _.uniq(result.items.map(i => i.locationUid)),
    );
  }

  result.items = result.items.map(event => lastEventClean(event, {
    ...options,
    locations,
    agendas,
    imagePath: service.config.imagePath,
    defaultImage: service.config.defaultImage
  }));

  if (total === null && !options.useAfter) {
    return result.items;
  }

  if (options.useAfter) {
    result.after = result.rows.length ? _.last(result.rows)[orderField] : null;
  }

  return _.omit(result, ['rows']);
}