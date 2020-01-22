'use strict';

const _ = require('lodash');
const derelativize = require('../service/helpers/derelativize');
const validateQuery = require('./validateQuery');
const getDSLNav = require('./getDSLNavPart');
const getDSLQueryPart = require('./getDSLQueryPart');
const getDSLSortPart = require('./getDSLSortPart');
const getDSLSourcePart = require('./getDSLSourcePart');
const textLog = require('./textLog')

module.exports = (query = {}, nav = {}, formSchema = null, includes = null) => {
  const inflated = Object.keys(query).reduce((inflated, key) => _.set(
    inflated,
    key.split('.'),
    query[key]
  ), {});

  const derelativized = derelativize(inflated);

  const clean = validateQuery(derelativized, formSchema);

  const DSL = {
    query: getDSLQueryPart(clean, formSchema),
    sort: getDSLSortPart(clean.sort),
    _source: getDSLSourcePart(includes)
  };

  textLog(DSL);

  return nav ? Object.assign(DSL, getDSLNav(nav)) : DSL;
}
