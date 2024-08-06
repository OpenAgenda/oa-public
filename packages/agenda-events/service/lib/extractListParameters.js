import validateListQuery from './validateListQuery.js';

export default (agendaUid, query, offset, limit, options) => {
  const params = {
    query: {
      agendaUid,
    },
  };

  if (options !== undefined) {
    Object.assign(params, {
      query: Object.assign(params.query, validateListQuery(query)),
      offset,
      limit,
      options,
    });
  } else if (typeof query !== 'object') {
    Object.assign(params, {
      offset: query,
      limit: offset,
      options: limit || {},
    });
  } else {
    Object.assign(params, {
      query: Object.assign(params.query, validateListQuery(query)),
      offset,
      limit,
      options: {},
    });
  }

  return params;
};
