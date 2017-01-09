'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.getStats = getStats;
exports.list = list;
exports.nextPage = nextPage;
exports.addCredFilter = addCredFilter;
exports.removeCredFilter = removeCredFilter;
exports.cleanCredFilters = cleanCredFilters;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LOAD = 'member-apps/members/LOAD';
var LOAD_SUCCESS = 'member-apps/members/LOAD_SUCCESS';
var LOAD_FAIL = 'member-apps/members/LOAD_FAIL';
var GET_STATS = 'member-apps/members/GET_STATS';
var GET_STATS_SUCCESS = 'member-apps/members/GET_STATS_SUCCESS';
var GET_STATS_FAIL = 'member-apps/members/GET_STATS_FAIL';
var LIST = 'member-apps/members/LIST';
var LIST_SUCCESS = 'member-apps/members/LIST_SUCCESS';
var LIST_FAIL = 'member-apps/members/LIST_FAIL';
var NEXT_PAGE = 'member-apps/members/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'member-apps/members/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'member-apps/members/NEXT_PAGE_FAIL';
var ADD_CRED_FILTER = 'member-apps/members/ADD_CRED_FILTER';
var REMOVE_CRED_FILTER = 'member-apps/members/REMOVE_CRED_FILTER';
var CLEAN_CRED_FILTERS = 'member-apps/members/CLEAN_CRED_FILTERS';

var initialState = {
  loaded: false,
  credFilters: []
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
        data: action.result.stakeholders,
        total: action.result.total,
        credFilters: [].concat(action.query.credentials || []),
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
    case GET_STATS_SUCCESS:
      return _extends({}, state, {
        stats: action.result.stats
      });
    case LIST:
      return _extends({}, state, {
        loading: true
      });
    case LIST_SUCCESS:
      return _extends({}, state, {
        data: action.result.stakeholders,
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
        data: [].concat(_toConsumableArray(state.data), _toConsumableArray(action.result.stakeholders)),
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
    case ADD_CRED_FILTER:
      return _extends({}, state, {
        credFilters: [].concat(_toConsumableArray(state.credFilters), [action.credential])
      });
    case REMOVE_CRED_FILTER:
      return _extends({}, state, {
        credFilters: state.credFilters.filter(function (credential) {
          return credential !== action.credential;
        })
      });
    case CLEAN_CRED_FILTERS:
      return _extends({}, state, {
        credFilters: []
      });
    default:
      return state;

  }
}

function isLoaded(globalState) {
  return globalState.members && globalState.members.loaded;
}

function load(query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    query: query,
    promise: function promise(client, _ref) {
      var res = _ref.res;
      return client.get(res.list, { query: query });
    }
  };
}

function getStats() {
  return {
    types: [GET_STATS, GET_STATS_SUCCESS, GET_STATS_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res;
      return client.get(res.stats);
    }
  };
}

function list(query) {
  return {
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: function promise(client, _ref3) {
      var res = _ref3.res;
      return client.get(res.list, { query: query });
    }
  };
}

function nextPage(query, page) {
  return {
    types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
    page: page,
    promise: function promise(client, _ref4) {
      var res = _ref4.res;
      return client.get(res.list, {
        query: _extends({}, query, {
          page: page
        })
      });
    }
  };
}

/* export function remove( id ) {
  return {
    types: [ REMOVE, REMOVE_SUCCESS, REMOVE_FAIL ],
    promise: ( client, { res } ) => client.get( res.remove )
  }
} */

function addCredFilter(credential) {
  return {
    type: ADD_CRED_FILTER,
    credential: credential
  };
}

function removeCredFilter(credential) {
  return {
    type: REMOVE_CRED_FILTER,
    credential: credential
  };
}

function cleanCredFilters() {
  return {
    type: CLEAN_CRED_FILTERS
  };
}