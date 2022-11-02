'use strict';

const { produce } = require('immer');

const { isInteger } = require('@openagenda/utils');

module.exports = function preCleanSearchQuery(query, options = {}) {
  const {
    targetKey = 'uid'
  } = options;

  if (!isInteger(query?.search)) {
    return query;
  }

  return produce(query, draft => {
    draft[targetKey] = parseInt(draft.search, 10);
    delete draft.search;
  });
};
