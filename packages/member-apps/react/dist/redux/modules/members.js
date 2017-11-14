'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.getStats = getStats;
exports.list = list;
exports.nextPage = nextPage;
exports.update = update;
exports.invite = invite;
exports.resendInvitation = resendInvitation;
exports.cleanInviteResult = cleanInviteResult;
exports.remove = remove;
exports.sendMessage = sendMessage;
exports.sendAMessage = sendAMessage;
exports.addCredFilter = addCredFilter;
exports.removeCredFilter = removeCredFilter;
exports.cleanCredFilters = cleanCredFilters;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reduxForm = require('redux-form');

var _Stakeholder = require('@openagenda/agenda-stakeholders/iso/Stakeholder');

var _Stakeholder2 = _interopRequireDefault(_Stakeholder);

var _credentialTypes = require('@openagenda/agenda-stakeholders/iso/credentialTypes');

var credentialsTypes = _interopRequireWildcard(_credentialTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var RESEND_INVITATION = 'member-apps/members/RESEND_INVITATION';
var RESEND_INVITATION_SUCCESS = 'member-apps/members/RESEND_INVITATION_SUCCESS';
var RESEND_INVITATION_FAIL = 'member-apps/members/RESEND_INVITATION_FAIL';
var REMOVE = 'member-apps/members/REMOVE';
var REMOVE_SUCCESS = 'member-apps/members/REMOVE_SUCCESS';
var REMOVE_FAIL = 'member-apps/members/REMOVE_FAIL';
var CLEAN_INVITE_RESULT = 'member-apps/members/CLEAN_INVITE_RESULT';
var ADD_CRED_FILTER = 'member-apps/members/ADD_CRED_FILTER';
var REMOVE_CRED_FILTER = 'member-apps/members/REMOVE_CRED_FILTER';
var CLEAN_CRED_FILTERS = 'member-apps/members/CLEAN_CRED_FILTERS';
var SEND_MESSAGE = 'member-apps/members/SEND_MESSAGE';
var SEND_MESSAGE_SUCCESS = 'member-apps/members/SEND_MESSAGE_SUCCESS';
var SEND_MESSAGE_FAIL = 'member-apps/members/SEND_MESSAGE_FAIL';
var SEND_A_MESSAGE = 'member-apps/members/SEND_A_MESSAGE';
var SEND_A_MESSAGE_SUCCESS = 'member-apps/members/SEND_A_MESSAGE_SUCCESS';
var SEND_A_MESSAGE_FAIL = 'member-apps/members/SEND_A_MESSAGE_FAIL';

var initialState = {
  loaded: false,
  credFilters: []
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];


  switch (action.type) {
    case LOAD:
      return (0, _extends5.default)({}, state, {
        loading: true
      });
    case LOAD_SUCCESS:
      return (0, _extends5.default)({}, state, {
        loaded: true,
        data: action.result.stakeholders,
        total: action.result.total,
        credFilters: [].concat(action.query.credentials || []),
        page: 1,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return (0, _extends5.default)({}, state, {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      });
    case GET_STATS_SUCCESS:
      return (0, _extends5.default)({}, state, {
        stats: action.result.stats
      });
    case LIST:
      return (0, _extends5.default)({}, state, {
        loading: true
      });
    case LIST_SUCCESS:
      return (0, _extends5.default)({}, state, {
        data: action.result.stakeholders,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      });
    case LIST_FAIL:
      return (0, _extends5.default)({}, state, {
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loading: false
      });
    case NEXT_PAGE:
      return (0, _extends5.default)({}, state, {
        nextLoading: true
      });
    case NEXT_PAGE_SUCCESS:
      return (0, _extends5.default)({}, state, {
        data: [].concat((0, _toConsumableArray3.default)(state.data), (0, _toConsumableArray3.default)(action.result.stakeholders)),
        total: action.result.total,
        page: action.page,
        error: null,
        nextLoading: false
      });
    case NEXT_PAGE_FAIL:
      return (0, _extends5.default)({}, state, {
        error: action.error,
        nextLoading: false
      });
    case UPDATE:
      return (0, _extends5.default)({}, state, {
        updateLoading: true
      });
    case UPDATE_SUCCESS:
      var data = state.data.map(function (sh) {
        return sh.id === action.id ? (0, _extends5.default)({}, sh, {
          credential: action.result.credential || sh.credential,
          custom: (0, _extends5.default)({}, sh.custom, action.result.fieldValues)
        }) : sh;
      });
      return (0, _extends5.default)({}, state, {
        data: data,
        updateError: null,
        updateLoading: false
      });
    case UPDATE_FAIL:
      return (0, _extends5.default)({}, state, {
        updateError: action.error,
        updateLoading: false
      });
    case INVITE:
      return (0, _extends5.default)({}, state, {
        inviteLoading: true
      });
    case INVITE_SUCCESS:
      return (0, _extends5.default)({}, state, {
        inviteError: null,
        inviteLoading: false,
        showInviteResult: true
      });
    case INVITE_FAIL:
      return (0, _extends5.default)({}, state, {
        inviteError: action.error,
        inviteLoading: false,
        showInviteResult: true
      });
    case REMOVE_SUCCESS:
      var index = state.data.findIndex(function (sh) {
        return sh.id === action.id;
      });
      var stakeholder = state.data[index];
      var credential = credentialsTypes.codes.get(stakeholder.credential);
      return (0, _extends5.default)({}, state, {
        data: [].concat((0, _toConsumableArray3.default)(state.data.slice(0, index)), (0, _toConsumableArray3.default)(state.data.slice(index + 1))),
        total: state.total - 1,
        stats: (0, _extends5.default)({}, state.stats, {
          total: state.stats.total - 1,
          credentialTotals: (0, _extends5.default)({}, state.stats.credentialTotals, (0, _defineProperty3.default)({}, credential, state.stats.credentialTotals[credential] - 1))
        })
      });
    case CLEAN_INVITE_RESULT:
      return (0, _extends5.default)({}, state, {
        inviteError: false,
        showInviteResult: false
      });
    case ADD_CRED_FILTER:
      return (0, _extends5.default)({}, state, {
        credFilters: [].concat((0, _toConsumableArray3.default)(state.credFilters), [action.credential])
      });
    case REMOVE_CRED_FILTER:
      return (0, _extends5.default)({}, state, {
        credFilters: state.credFilters.filter(function (credential) {
          return credential !== action.credential;
        })
      });
    case CLEAN_CRED_FILTERS:
      return (0, _extends5.default)({}, state, {
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
        query: (0, _extends5.default)({}, query, {
          page: page
        })
      });
    }
  };
}

function update(id, values) {
  return {
    types: [UPDATE, UPDATE_SUCCESS, UPDATE_FAIL],
    id: id,
    promise: function promise(client, _ref5) {
      var res = _ref5.res;

      var stakeholder = new _Stakeholder2.default({
        fieldValues: _lodash2.default.omit(values, 'credential'),
        credential: values.credential
      }, { res: res.update.replace(':id', id) });

      var flatErrors = function flatErrors(e) {
        return e.reduce(function (prev, next) {
          return (0, _extends5.default)({}, prev, (0, _defineProperty3.default)({}, next.field, next.code));
        }, {});
      };

      var errors = stakeholder.getErrors(true);

      if (errors.length) {
        return _promise2.default.reject(new _reduxForm.SubmissionError(flatErrors(errors)));
      }

      return new _promise2.default(function (resolve, reject) {
        stakeholder.commit(true, function (err, result) {
          if (err) return reject(err);
          if (result.errors && result.errors.length) {
            return reject(new _reduxForm.SubmissionError(flatErrors(result.errors)));
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
      return client.post(res.invite, {
        data: {
          stakeholders: stakeholders, credential: data.credential, context: {
            message: data.message
          }
        }
      });
    }
  };
}

function resendInvitation(id) {
  return {
    types: [RESEND_INVITATION, RESEND_INVITATION_SUCCESS, RESEND_INVITATION_FAIL],
    promise: function promise(client, _ref7) {
      var res = _ref7.res;

      return client.post(res.update.replace(':id', id), { data: { fieldValues: {} } });
    }
  };
}

function cleanInviteResult() {
  return {
    type: CLEAN_INVITE_RESULT
  };
}

function remove(id) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    id: id,
    promise: function promise(client, _ref8) {
      var res = _ref8.res;
      return client.get(res.remove.replace(':id', id));
    }
  };
}

function sendMessage(data, inactive) {
  return {
    types: [SEND_MESSAGE, SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAIL],
    promise: function promise(client, _ref9) {
      var res = _ref9.res;
      return client.post(res.sendMessage, { data: data, query: { inactive: inactive } });
    }
  };
}

function sendAMessage(data, stakeholder) {
  return {
    types: [SEND_A_MESSAGE, SEND_A_MESSAGE_SUCCESS, SEND_A_MESSAGE_FAIL],
    promise: function promise(client, _ref10) {
      var res = _ref10.res;
      return client.post(res.sendAMessage.replace(':id', stakeholder.id), { data: data });
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
//# sourceMappingURL=members.js.map