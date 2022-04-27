'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('countByLocationUids');

const addQuery = require('./lib/addQuery');
const cleanOptions = require('./lib/cleanOptions');


module.exports = async (service, query = {}, o = {}) => {
  log('called', query);
  const { knex } = service.clients;
  const k = service.clients.knex(service.config.schema);
  const options = cleanOptions(o);

  addQuery(k, query, options);
  
  k.select(knex.raw('count(id) as count, location_uid as locationUid')).groupBy('location_uid');
  
  const result = await k;
  return result.map(e => ({ ...e }));
}