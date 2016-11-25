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
exports.remove = remove;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LOAD = 'aggregator-sources/sources/LOAD';
var LOAD_SUCCESS = 'aggregator-sources/sources/LOAD_SUCCESS';
var LOAD_FAIL = 'aggregator-sources/sources/LOAD_FAIL';
var LIST = 'aggregator-sources/sources/LIST';
var LIST_SUCCESS = 'aggregator-sources/sources/LIST_SUCCESS';
var LIST_FAIL = 'aggregator-sources/sources/LIST_FAIL';
var NEXT_PAGE = 'aggregator-sources/sources/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'aggregator-sources/sources/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'aggregator-sources/sources/NEXT_PAGE_FAIL';
var REMOVE = 'aggregator-sources/sources/REMOVE';
var REMOVE_SUCCESS = 'aggregator-sources/sources/REMOVE_SUCCESS';
var REMOVE_FAIL = 'aggregator-sources/sources/REMOVE_FAIL';

var initialState = {
  loaded: false
};

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
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return _extends({}, state, {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      });
    case LIST:
      return _extends({}, state, {
        loading: true
      });
    case LIST_SUCCESS:
      return _extends({}, state, {
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      });
    case LIST_FAIL:
      return _extends({}, state, {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      });
    case NEXT_PAGE:
      return _extends({}, state, {
        nextLoading: true
      });
    case NEXT_PAGE_SUCCESS:
      return _extends({}, state, {
        data: [].concat(_toConsumableArray(state.data), _toConsumableArray(action.result.reviews)),
        total: action.result.total,
        page: action.page,
        error: null,
        nextLoading: false
      });
    case NEXT_PAGE_FAIL:
      return _extends({}, state, {
        error: action.error,
        nextLoading: false
      });
    case REMOVE:
      return _extends({}, state, {
        removeLoading: true
      });
    case REMOVE_SUCCESS:
      return _extends({}, state, {
        data: state.data.filter(function (v) {
          return v.uid !== action.uid;
        }),
        total: state.total - 1,
        removeError: null,
        removeLoading: false
      });
    case REMOVE_FAIL:
      return _extends({}, state, {
        removeError: action.error,
        removeLoading: false
      });
    default:
      return state;
  }
}

function isLoaded(globalState) {
  return globalState.sources && globalState.sources.loaded;
}

function load(query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res,
          agenda = _ref.agenda;
      return client.get(res.list.replace(':slug', agenda.slug), { query: query });
    }
  };
}

function list(query) {
  return {
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res,
          agenda = _ref2.agenda;
      return client.get(res.list.replace(':slug', agenda.slug), { query: query });
    }
  };
}

function nextPage(query, page) {
  return {
    types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
    page: page,
    promise: function promise(client, _ref3) {
      var res = _ref3.res,
          agenda = _ref3.agenda;
      return client.get(res.list.replace(':slug', agenda.slug), {
        query: _extends({}, query, {
          page: page
        })
      });
    }
  };
}

function remove(uid) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    uid: uid,
    promise: function promise(client, _ref4) {
      var res = _ref4.res,
          agenda = _ref4.agenda;
      return client.get(res.remove.replace(':slug', agenda.slug), {
        query: {
          uid: uid
        }
      });
    }
  };
}