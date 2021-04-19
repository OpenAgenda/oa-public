'use strict';

const update = require('immutability-helper');

/**
 * append new items to top or bottom of list
 */
module.exports.addPageItems = (current, next, data) => {
  const changes = {};

  changes.pageRange = {
    $set: [
      current.pageRange[0] + (next ? 0 : -1),
      current.pageRange[1] + (next ? 1 : 0)
    ]
  };

  if (next) {
    changes.agendas = {
      $push: data.agendas
    }
  } else {
    changes.agendas = {
      $splice: [[0, 0].concat(data.agendas)]
    }
  }

  return update(current, changes);
};

/**
 * reset items in list
 * pagerange is 1,1, state is new, items are replaced
 */
module.exports.resetPageItems = (currentState, query, data) => {
  const changes = {};

  changes.pageRange = {
    $set: [1, 1]
  };

  changes.agendas = {
    $set: data.agendas
  }

  changes.query = {
    $set: query
  }

  changes.total = {
    $set: data.total
  }

  changes.loading = {
    $set: false
  }

  return update(currentState, changes);
};
