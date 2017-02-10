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
exports.update = update;
exports.invite = invite;
exports.cleanInviteResult = cleanInviteResult;
exports.remove = remove;
exports.addCredFilter = addCredFilter;
exports.removeCredFilter = removeCredFilter;
exports.cleanCredFilters = cleanCredFilters;

var _Stakeholder = require('agenda-stakeholders/iso/Stakeholder');

var _Stakeholder2 = _interopRequireDefault(_Stakeholder);

var _reduxForm = require('redux-form');

var _credentialTypes = require('agenda-stakeholders/iso/credentialTypes');

var credentialsTypes = _interopRequireWildcard(_credentialTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
var UPDATE = 'member-apps/members/UPDATE';
var UPDATE_SUCCESS = 'member-apps/members/UPDATE_SUCCESS';
var UPDATE_FAIL = 'member-apps/members/UPDATE_FAIL';
var INVITE = 'member-apps/members/INVITE';
var INVITE_SUCCESS = 'member-apps/members/INVITE_SUCCESS';
var INVITE_FAIL = 'member-apps/members/INVITE_FAIL';
var REMOVE = 'member-apps/members/REMOVE';
var REMOVE_SUCCESS = 'member-apps/members/REMOVE_SUCCESS';
var REMOVE_FAIL = 'member-apps/members/REMOVE_FAIL';
var CLEAN_INVITE_RESULT = 'member-apps/members/CLEAN_INVITE_RESULT';
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
    case UPDATE:
      return _extends({}, state, {
        updateLoading: true
      });
    case UPDATE_SUCCESS:
      var data = state.data.map(function (sh) {
        return sh.user.uid === action.uid ? _extends({}, sh, {
          custom: _extends({}, sh.custom, action.result.data)
        }) : sh;
      });
      return _extends({}, state, {
        data: data,
        updateError: null,
        updateLoading: false
      });
    case UPDATE_FAIL:
      return _extends({}, state, {
        updateError: action.error,
        updateLoading: false
      });
    case INVITE:
      return _extends({}, state, {
        inviteLoading: true
      });
    case INVITE_SUCCESS:
      return _extends({}, state, {
        inviteError: null,
        inviteLoading: false,
        showInviteResult: true
      });
    case INVITE_FAIL:
      return _extends({}, state, {
        inviteError: action.error,
        inviteLoading: false,
        showInviteResult: true
      });
    case REMOVE_SUCCESS:
      var index = state.data.findIndex(function (sh) {
        return sh.user.uid === action.uid;
      });
      var stakeholder = state.data[index];
      var credential = credentialsTypes.codes.get(stakeholder.credential);
      return _extends({}, state, {
        data: [].concat(_toConsumableArray(state.data.slice(0, index)), _toConsumableArray(state.data.slice(index + 1))),
        total: state.total - 1,
        stats: _extends({}, state.stats, {
          total: state.stats.total - 1,
          credentialTotals: _extends({}, state.stats.credentialTotals, _defineProperty({}, credential, state.stats.credentialTotals[credential] - 1))
        })
      });
    case CLEAN_INVITE_RESULT:
      return _extends({}, state, {
        inviteError: false,
        showInviteResult: false
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

function update(uid, values) {
  return {
    types: [UPDATE, UPDATE_SUCCESS, UPDATE_FAIL],
    uid: uid,
    promise: function promise(client, _ref5) {
      var res = _ref5.res;

      var stakeholder = new _Stakeholder2.default(values, { res: res.update.replace(':uid', uid) });

      var flatErrors = function flatErrors(e) {
        return e.reduce(function (prev, next) {
          return _extends({}, prev, _defineProperty({}, next.field, next.code));
        }, {});
      };

      var errors = stakeholder.getErrors();
      if (errors.length) {
        return Promise.reject(new _reduxForm.SubmissionError(flatErrors(errors)));
      }

      return new Promise(function (resolve, reject) {
        stakeholder.commit(function (err, result) {
          if (err) {
            if (err.errors && err.errors.length) {
              return reject(new _reduxForm.SubmissionError(flatErrors(err.errors)));
            }
            return reject(err);
          }
          resolve(result);
        });
      });
    }
  };
}

function invite(data) {
  return {
    types: [INVITE, INVITE_SUCCESS, INVITE_FAIL],
    promise: function promise(client, _ref6) {
      var res = _ref6.res;

      var stakeholders = data.emails && data.emails.split(',').map(function (v) {
        return v.trim();
      }).filter(function (v) {
        return !!v;
      }).map(function (email) {
        return { email: email };
      });
      return client.post(res.invite, { data: { stakeholders: stakeholders, credential: data.credential } });
    }
  };
}

function cleanInviteResult() {
  return {
    type: CLEAN_INVITE_RESULT
  };
}

function remove(uid) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    uid: uid,
    promise: function promise(client, _ref7) {
      var res = _ref7.res;
      return client.get(res.remove.replace(':uid', uid));
    }
  };
}

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