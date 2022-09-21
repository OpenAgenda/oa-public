'use strict';

const { produce } = require('immer');

function isInteger(num) {
  return !Number.isNaN(Number(num)) && Number.isInteger(parseFloat(num, 10));
}

module.exports = function preCleanSearchQuery(query) {
  if (!isInteger(query.search)) {
    return query;
  }

  return produce(query, draft => {
    draft.uid = parseInt(draft.search, 10);
    delete draft.search;
  });
};
