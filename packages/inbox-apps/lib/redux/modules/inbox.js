'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _pick2 = require('lodash/pick');

var _pick3 = _interopRequireDefault(_pick2);

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.nextPage = nextPage;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOAD = 'inbox-apps/inbox/LOAD';
var LOAD_SUCCESS = 'inbox-apps/inbox/LOAD_SUCCESS';
var LOAD_FAIL = 'inbox-apps/inbox/LOAD_FAIL';
var NEXT_PAGE = 'inbox-apps/inbox/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'inbox-apps/inbox/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'inbox-apps/inbox/NEXT_PAGE_FAIL';

var initialState = {
  loaded: false,
  query: {}
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
        query: action.result.query,
        data: action.result.conversations,
        lastPage: action.result.conversations.length < action.perPageLimit,
        page: 1,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return (0, _extends3.default)({}, state, {
        data: null,
        page: 1,
        error: action.error,
        loading: false
      });
    case NEXT_PAGE:
      return (0, _extends3.default)({}, state, {
        nextLoading: true
      });
    case NEXT_PAGE_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: [].concat((0, _toConsumableArray3.default)(state.data), (0, _toConsumableArray3.default)(action.result.conversations)),
        lastPage: action.result.conversations.length < action.perPageLimit,
        page: state.page + (action.result.conversations.length ? 1 : 0),
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
  return globalState.inbox && globalState.inbox.loaded;
}

function load(query) {
  return function (_ref) {
    var getState = _ref.getState;

    var state = getState();

    var defaultQuery = state.settings.defaultQuery;


    return {
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      query: query,
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref2) {
        var res = _ref2.res,
            agenda = _ref2.agenda,
            event = _ref2.event;
        return client.get(res.conversations.list.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid), {
          query: (0, _extends3.default)({}, (0, _pick3.default)(defaultQuery, 'type', 'typeIdentifier'), query)
        });
      }
    };
  };
}

function nextPage() {
  return function (_ref3) {
    var getState = _ref3.getState;

    var state = getState();

    return {
      types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref4) {
        var res = _ref4.res,
            agenda = _ref4.agenda,
            event = _ref4.event;
        return client.get(res.conversations.list.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid), {
          query: (0, _extends3.default)({}, state.inbox.query, {
            page: state.inbox.page + 1
          })
        });
      }
    };
  };
}
//# sourceMappingURL=inbox.js.map