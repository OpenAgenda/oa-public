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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        loading: true
      })));
    case LOAD_SUCCESS:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        loaded: true,
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      })));
    case LOAD_FAIL:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      })));
    case LIST:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        listLoading: true
      })));
    case LIST_SUCCESS:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        listLoading: false
      })));
    case LIST_FAIL:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        listLoading: false
      })));
    case NEXT_PAGE:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        nextLoading: true
      })));
    case NEXT_PAGE_SUCCESS:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
        data: [].concat(_toConsumableArray(state[action.key].data), _toConsumableArray(action.result.reviews)),
        total: action.result.total,
        page: action.page,
        error: null,
        nextLoading: false
      })));
    case NEXT_PAGE_FAIL:
      return _extends({}, state, _defineProperty({}, action.key, _extends({}, state[action.key], {
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
      return client.get(res.agendas.list, { query: _extends({}, query, { page: page }) });
    }
  };
}
//# sourceMappingURL=agendas.js.map