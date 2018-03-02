"use strict";

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _documentLocation = require('@openagenda/dom-utils/documentLocation');

var _documentLocation2 = _interopRequireDefault(_documentLocation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// little counter
function _syncCounter() {

  if (typeof window === 'undefined') return;

  if (!window.oa || !window.oa.verifiedLocationsCounter) return;

  setTimeout(function () {

    window.oa.verifiedLocationsCounter();
  }, 1000);
}

module.exports = actions;

module.exports.updateSearchQuery = updateSearchQuery;

module.exports.tests = {
  updateEditedLocation: updateEditedLocation,
  addLocation: addLocation,
  newLocation: newLocation,
  closeForm: closeForm,
  closeMerge: closeMerge,
  toggleMerge: toggleMerge,
  toggleMergeItem: toggleMergeItem,
  launchMerge: launchMerge,
  updateLocationList: updateLocationList,
  editLocation: editLocation,
  removedLocation: removedLocation,
  getQuery: getQuery,
  queryChange: queryChange,
  displayRemoveConfirmModal: displayRemoveConfirmModal,
  closeModal: closeModal
};

function actions(options) {
  var _utils$extend = _utils2.default.extend({
    setState: function setState() {}, // state setter
    getState: function getState() {}
  }, options),
      getState = _utils$extend.getState,
      setState = _utils$extend.setState;

  return {

    // not actually an action
    getState: getState,

    editLocation: assign(editLocation),

    updateEditedLocation: assign(updateEditedLocation),
    newLocation: assign(newLocation),
    addLocation: assign(addLocation),
    removedLocation: assign(removedLocation),
    closeForm: assign(closeForm),

    closeMerge: assign(closeMerge),
    toggleMerge: assign(toggleMerge),
    launchMerge: assign(launchMerge),

    updateLocationList: assign(updateLocationList),
    toggleMergeItem: assign(toggleMergeItem),

    queryChange: assign(queryChange),

    getQuery: getQuery,

    displayRemoveConfirmModal: assign(displayRemoveConfirmModal),
    closeModal: assign(closeModal)

    /**
     * simplifies stateless testing. calls
     * input function by prepending current state
     * and applies value as new state
     */

  };function assign(fn) {

    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var state = getState(),
          newState = fn.apply(undefined, _toConsumableArray([state].concat(args)));

      setState(newState);

      return newState;
    };
  }
}

function removedLocation(state, index) {

  _syncCounter();

  return (0, _immutabilityHelper2.default)(state, {
    locations: { $splice: [[index, 1]] },
    modal: {
      data: {
        isRemoved: { $set: true }
      }
    }
  });
}

function editLocation(state, location, locationIndex) {

  return (0, _immutabilityHelper2.default)(state, {
    form: {
      $set: {
        location: location,
        locationIndex: locationIndex
      }
    }
  });
}

function updateLocationList(state, locations, total, page) {

  _syncCounter();

  return {
    locations: locations,
    total: total,
    page: page
  };
}

function closeForm(state, location) {

  var updatedState = {
    locations: {}
  };

  updatedState.form = { $set: false };

  // if an image was uploaded before form was closed,
  // image must be updated
  if (state.form && state.form.locationIndex) {

    updatedState.locations[state.form.locationIndex] = {
      image: { $set: location.image }
    };
  }

  return (0, _immutabilityHelper2.default)(state, updatedState);
}

function newLocation(state) {

  return (0, _immutabilityHelper2.default)(state, {
    form: { $set: {} }
  });
}

function addLocation(state, location) {

  _syncCounter();

  return (0, _immutabilityHelper2.default)(state, {
    locations: { $splice: [[0, 0, location]] },
    form: { $set: false }
  });
}

/**
 * add or remove location item from
 * merge list
 */

function toggleMergeItem(state, location) {

  var locationUids = state.merge.locationUids.concat(),
      index = locationUids.indexOf(location.uid);

  if (index == -1) {

    locationUids.push(location.uid);
  } else {

    locationUids.splice(index, 1);
  }

  return {
    merge: {
      locationUids: locationUids
    }
  };
}

/**
 * update a location in general location list.
 * Optionnally, close the form
 */
function updateEditedLocation(state, location, closeForm) {

  var updatedState = {
    locations: {}
  };

  if (closeForm) {

    updatedState.form = { $set: false };
  }

  updatedState.locations[state.form.locationIndex] = { $set: location };

  _syncCounter();

  return (0, _immutabilityHelper2.default)(state, updatedState);
}

function launchMerge(state, mergedLocations) {

  return (0, _immutabilityHelper2.default)(state, {
    merge: {
      $set: state.merge || true
    },
    form: {
      $set: {
        location: mergedLocations[0],
        alternatives: mergedLocations.map(function (l, i) {
          return {
            location: l
          };
        })
      }
    }
  });
}

function closeMerge(state) {

  return (0, _immutabilityHelper2.default)(state, {
    merge: { $set: false },
    form: { $set: false },
    query: { $set: {} },
    locations: { $set: [] }
  });
}

/**
 * toggle merge mode on or off
 * used in AgendaAdminLocations
 */
function toggleMerge(state, on) {

  if (on) {

    return {
      merge: {
        locationUids: []
      }
    };
  } else {

    return {
      merge: false
    };
  }
}

function updateSearchQuery(current, field, newSearchValue) {

  var query = JSON.parse(JSON.stringify(current || {}));

  if (typeof newSearchValue == 'string' && !newSearchValue.length) {

    newSearchValue = undefined;
  }

  if (newSearchValue === undefined) {

    if (query[field] !== undefined) delete query[field];
  } else {

    query[field] = newSearchValue;
  }

  return query;
}

function queryChange(state, query) {

  _documentLocation2.default.setQueryPart(query);

  return {
    query: query
  };
}

function getQuery() {

  // query reference is in url now.
  return _documentLocation2.default.getQuery() || {};
}

function displayRemoveConfirmModal(state, location, index) {

  return {
    modal: {
      type: 'removeLocation',
      data: {
        location: location,
        index: index
      }
    }
  };
}

function closeModal(state) {

  return {
    modal: false
  };
}
//# sourceMappingURL=actions.js.map