"use strict";

var update = require('immutability-helper');

module.exports = {
  loading: function loading(currentState, _loading) {

    var changes = {};

    changes.loading = {
      $set: _loading
    };

    return update(currentState, changes);
  },
  setSearch: function setSearch(currentState, query) {

    return update(currentState, {
      search: {
        query: {
          $set: query
        }
      }
    });
  },
  resetPageItems: function resetPageItems(currentState, data) {
    var page = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;


    var changes = {
      search: {}
    };

    changes.search.pageRange = {
      $set: [parseInt(page), parseInt(page)]
    };

    changes.search.agendas = {
      $set: data.agendas
    };

    changes.search.total = {
      $set: data.total
    };

    return update(currentState, changes);
  },
  addPageItems: function addPageItems(currentState, next, data) {

    var changes = {
      search: {}
    };

    changes.search.pageRange = {
      $set: [currentState.search.pageRange[0] + (next ? 0 : -1), currentState.search.pageRange[1] + (next ? 1 : 0)]
    };

    if (next) {

      changes.search.agendas = {
        $push: data.agendas
      };
    } else {

      changes.search.agendas = {
        $splice: [[0, 0].concat(data.agendas)]
      };
    }

    return update(currentState, changes);
  },
  selectAgenda: function selectAgenda(currentState, agenda, data) {
    var page = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;


    var changes = {};

    changes.agenda = {
      $set: agenda
    };

    changes.stakeholdersPageRange = {
      $set: [parseInt(page), parseInt(page)]
    };

    changes.stakeholdersTotal = {
      $set: data.total
    };

    changes.stakeholders = {
      $set: data.stakeholders
    };

    return update(currentState, changes);
  },
  addStakeholdersItems: function addStakeholdersItems(currentState, next, data) {

    var changes = {};

    changes.stakeholdersPageRange = {
      $set: [currentState.stakeholdersPageRange[0] + (next ? 0 : -1), currentState.stakeholdersPageRange[1] + (next ? 1 : 0)]
    };

    changes.stakeholdersTotal = {
      $set: data.total
    };

    if (next) {

      changes.stakeholders = {
        $push: data.stakeholders
      };
    } else {

      changes.stakeholders = {
        $splice: [[0, 0].concat(data.stakeholders)]
      };
    }

    return update(currentState, changes);
  }
};