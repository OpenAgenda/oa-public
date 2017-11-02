'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends11 = require('babel-runtime/helpers/extends');

var _extends12 = _interopRequireDefault(_extends11);

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.list = list;
exports.nextPage = nextPage;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOAD = 'home/agendas/LOAD';
var LOAD_SUCCESS = 'home/agendas/LOAD_SUCCESS';
var LOAD_FAIL = 'home/agendas/LOAD_FAIL';
var LIST = 'home/agendas/LIST';
var LIST_SUCCESS = 'home/agendas/LIST_SUCCESS';
var LIST_FAIL = 'home/agendas/LIST_FAIL';
var NEXT_PAGE = 'home/agendas/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'home/agendas/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'home/agendas/NEXT_PAGE_FAIL';

var initialState = {};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case LOAD:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        loading: true
      })));
    case LOAD_SUCCESS:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        loaded: true,
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      })));
    case LOAD_FAIL:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      })));
    case LIST:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        listLoading: true
      })));
    case LIST_SUCCESS:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        listLoading: false
      })));
    case LIST_FAIL:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        listLoading: false
      })));
    case NEXT_PAGE:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        nextLoading: true
      })));
    case NEXT_PAGE_SUCCESS:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        data: [].concat((0, _toConsumableArray3.default)(state[action.key].data), (0, _toConsumableArray3.default)(action.result.reviews)),
        total: action.result.total,
        page: action.page,
        error: null,
        nextLoading: false
      })));
    case NEXT_PAGE_FAIL:
      return (0, _extends12.default)({}, state, (0, _defineProperty3.default)({}, action.key, (0, _extends12.default)({}, state[action.key], {
        error: action.error,
        nextLoading: false
      })));
    default:
      return state;
  }
}

function isLoaded(key, globalState) {
  return globalState.agendas && globalState.agendas[key] && globalState.agendas[key].loaded;
}

function load(key, query) {
  return {
    key: key,
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res;
      return client.get(res.agendas.list, { query: query });
    }
  };
}

function list(key, query) {
  return {
    key: key,
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res;
      return client.get(res.agendas.list, { query: query });
    }
  };
}

function nextPage(key, query, page) {
  return {
    key: key,
    page: page,
    types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
    promise: function promise(client, _ref3) {
      var res = _ref3.res,
          agendas = _ref3.agendas;
      return client.get(res.agendas.list, { query: (0, _extends12.default)({}, query, { page: page }) });
    }
  };
}
//# sourceMappingURL=agendas.js.map