'use strict';

const _ = require('lodash');
const getDSLNav = require('./getDSLNavPart');
const getDSLQueryPart = require('./getDSLQueryPart');
const getDSLSortPart = require('./getDSLSortPart');
const getDSLSourcePart = require('./getDSLSourcePart');

module.exports = (query = {}, nav = {}, options = {}) => {
  const {
    formSchema = null,
    includes = null,
    emptyValue
  } = options;

  const DSL = {
    track_total_hits: true,
    query: getDSLQueryPart(query, { formSchema, emptyValue }),
    _source: getDSLSourcePart(includes)
  };
  
  const sort = getDSLSortPart(query.sort);

  if (sort) DSL.sort = sort;

  return nav ? Object.assign(DSL, getDSLNav(nav)) : DSL;
}
