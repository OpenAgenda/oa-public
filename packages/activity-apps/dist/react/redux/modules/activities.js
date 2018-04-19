'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.list = list;
exports.nextPage = nextPage;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case LOAD:
      return (0, _extends3.default)({}, state, {
        loading: true
      });
    case LOAD_SUCCESS:
      return (0, _extends3.default)({}, state, {
        loaded: true,
        data: action.result.activities,
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: 0,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return (0, _extends3.default)({}, state, {
        data: null,
        fromId: 0,
        error: action.error,
        loading: false
      });
    case LIST:
      return (0, _extends3.default)({}, state, {
        loading: true
      });
    case LIST_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: action.result.activities,
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: 0,
        error: null,
        loading: false
      });
    case LIST_FAIL:
      return (0, _extends3.default)({}, state, {
        data: null,
        fromId: 0,
        error: action.error,
        loading: false
      });
    case NEXT_PAGE:
      return (0, _extends3.default)({}, state, {
        nextLoading: true
      });
    case NEXT_PAGE_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: [].concat((0, _toConsumableArray3.default)(state.data), (0, _toConsumableArray3.default)(action.result.activities)),
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: action.fromId,
        error: null,
        nextLoading: false
      });
    case NEXT_PAGE_FAIL:
      return (0, _extends3.default)({}, state, {
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
  return function (_ref) {
    var getState = _ref.getState;

    var state = getState();

    return {
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref2) {
        var res = _ref2.res;
        return client.get(res.list, { query: query });
      }
    };
  };
}

function list(query) {
  return function (_ref3) {
    var getState = _ref3.getState;

    var state = getState();

    return {
      types: [LIST, LIST_SUCCESS, LIST_FAIL],
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref4) {
        var res = _ref4.res;
        return client.get(res.list, { query: query });
      }
    };
  };
}

function nextPage(query, fromId) {
  return function (_ref5) {
    var getState = _ref5.getState;

    var state = getState();

    return {
      types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
      fromId: fromId,
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref6) {
        var res = _ref6.res;
        return client.get(res.list, {
          query: (0, _extends3.default)({}, query, {
            fromId: fromId
          })
        });
      }
    };
  };
}
//# sourceMappingURL=activities.js.map