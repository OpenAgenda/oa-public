'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.list = list;
exports.nextPage = nextPage;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LOAD = 'activity-apps/activities/LOAD';
var LOAD_SUCCESS = 'activity-apps/activities/LOAD_SUCCESS';
var LOAD_FAIL = 'activity-apps/activities/LOAD_FAIL';
var LIST = 'activity-apps/activities/LIST';
var LIST_SUCCESS = 'activity-apps/activities/LIST_SUCCESS';
var LIST_FAIL = 'activity-apps/activities/LIST_FAIL';
var NEXT_PAGE = 'activity-apps/activities/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'activity-apps/activities/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'activity-apps/activities/NEXT_PAGE_FAIL';

var initialState = {
  loaded: false
};

// TODO last page

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case LOAD:
      return _extends({}, state, {
        loading: true
      });
    case LOAD_SUCCESS:
      return _extends({}, state, {
        loaded: true,
        data: action.result.activities,
        fromId: 0,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return _extends({}, state, {
        data: null,
        fromId: 0,
        error: action.error,
        loading: false
      });
    case LIST:
      return _extends({}, state, {
        loading: true
      });
    case LIST_SUCCESS:
      return _extends({}, state, {
        data: action.result.activities,
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: 0,
        error: null,
        loading: false
      });
    case LIST_FAIL:
      return _extends({}, state, {
        data: null,
        fromId: 0,
        error: action.error,
        loading: false
      });
    case NEXT_PAGE:
      return _extends({}, state, {
        nextLoading: true
      });
    case NEXT_PAGE_SUCCESS:
      return _extends({}, state, {
        data: [].concat(_toConsumableArray(state.data), _toConsumableArray(action.result.activities)),
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: action.fromId,
        error: null,
        nextLoading: false
      });
    case NEXT_PAGE_FAIL:
      return _extends({}, state, {
        error: action.error,
        nextLoading: false
      });
    default:
      return state;
  }
}

function isLoaded(globalState) {
  return globalState.activities && globalState.activities.loaded;
}

function load(query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res;
      return client.get(res.list, { query: query });
    }
  };
}

function list(query) {
  return function (_ref2) {
    var getState = _ref2.getState;

    var state = getState();

    return {
      types: [LIST, LIST_SUCCESS, LIST_FAIL],
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref3) {
        var res = _ref3.res;
        return client.get(res.list, { query: query });
      }
    };
  };
}

function nextPage(query, fromId) {
  return function (_ref4) {
    var getState = _ref4.getState;

    var state = getState();

    return {
      types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
      fromId: fromId,
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref5) {
        var res = _ref5.res;
        return client.get(res.list, {
          query: _extends({}, query, {
            fromId: fromId
          })
        });
      }
    };
  };
}