"use strict";

var update = require('react-addons-update');

/**
 * any general state change goes through here
 */

module.exports = {
  addPageItems: addPageItems,
  resetPageItems: resetPageItems
};

/**
 * append new items to top or bottom of list
 */
function addPageItems(current, next, data) {

  var changes = {};

  changes.pageRange = {
    $set: [current.pageRange[0] + (next ? 0 : -1), current.pageRange[1] + (next ? 1 : 0)]
  };

  if (next) {

    changes.agendas = {
      $push: data.agendas
    };
  } else {

    changes.agendas = {
      $splice: [[0, 0].concat(data.agendas)]
    };
  }

  return update(current, changes);
}

/**
 * reset items in list
 * pagerange is 1,1, state is new, items are replaced
 */
function resetPageItems(currentState, query, data) {

  var changes = {};

  changes.pageRange = {
    $set: [1, 1]
  };

  changes.agendas = {
    $set: data.agendas
  };

  changes.query = {
    $set: query
  };

  changes.total = {
    $set: data.total
  };

  changes.loading = {
    $set: false
  };

  return update(currentState, changes);
}