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

var LOAD = 'home/events/LOAD';
var LOAD_SUCCESS = 'home/events/LOAD_SUCCESS';
var LOAD_FAIL = 'home/events/LOAD_FAIL';
var LIST = 'home/events/LIST';
var LIST_SUCCESS = 'home/events/LIST_SUCCESS';
var LIST_FAIL = 'home/events/LIST_FAIL';
var NEXT_PAGE = 'home/events/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'home/events/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'home/events/NEXT_PAGE_FAIL';

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
        data: action.result.events,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return (0, _extends3.default)({}, state, {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      });
    case LIST:
      return (0, _extends3.default)({}, state, {
        listLoading: true
      });
    case LIST_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: action.result.events,
        total: action.result.total,
        page: 1,
        error: null,
        listLoading: false
      });
    case LIST_FAIL:
      return (0, _extends3.default)({}, state, {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        listLoading: false
      });
    case NEXT_PAGE:
      return (0, _extends3.default)({}, state, {
        nextLoading: true
      });
    case NEXT_PAGE_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: [].concat((0, _toConsumableArray3.default)(state.data), (0, _toConsumableArray3.default)(action.result.events)),
        total: action.result.total,
        page: action.page,
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
  return globalState.events && globalState.events.loaded;
}

function load(query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res;
      return client.get(res.events.list, { query: query });
    }
  };
}

function list(query) {
  return {
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res;
      return client.get(res.events.list, { query: query });
    }
  };
}

function nextPage(query, page) {
  return {
    types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
    page: page,
    promise: function promise(client, _ref3) {
      var res = _ref3.res,
          events = _ref3.events;
      return client.get(res.events.list, { query: (0, _extends3.default)({}, query, { page: page }) });
    }
  };
}
//# sourceMappingURL=events.js.map