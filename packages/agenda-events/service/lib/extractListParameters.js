'use strict';

const validateListQuery = require('./validateListQuery');

module.exports = (agendaUid, query, offset, limit, options) => {

  const params = {
    query: {
      agendaUid
    }
  };

  if (options !== undefined) {
    Object.assign(params, {
      query: Object.assign(params.query, validateListQuery(query)),
      offset,
      limit,
      options
    });
  } else if (typeof query !== 'object' && (limit !== undefined)) {
    Object.assign(params, {
      offset: query,
      limit: offset,
      options: limit
    });
  } else if (typeof query !== 'object') {
    Object.assign(params, {
      query: Object.assign(params.query, validateListQuery(query)),
      offset,
      limit,
      options: {}
    });
  } else {
    Object.assign(params, {
      query: Object.assign(params.query, validateListQuery(query)),
      offset,
      limit,
      options: {}
    });
  }

  return params;
}
