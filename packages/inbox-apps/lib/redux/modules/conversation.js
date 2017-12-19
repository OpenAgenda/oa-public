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
exports.isAuthorLoaded = isAuthorLoaded;
exports.loadAuthor = loadAuthor;
exports.nextPage = nextPage;
exports.sendMessage = sendMessage;
exports.triggerAction = triggerAction;
exports.resume = resume;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOAD = 'inbox-apps/conversation/LOAD';
var LOAD_SUCCESS = 'inbox-apps/conversation/LOAD_SUCCESS';
var LOAD_FAIL = 'inbox-apps/conversation/LOAD_FAIL';
var NEXT_PAGE = 'inbox-apps/conversation/NEXT_PAGE';
var NEXT_PAGE_SUCCESS = 'inbox-apps/conversation/NEXT_PAGE_SUCCESS';
var NEXT_PAGE_FAIL = 'inbox-apps/conversation/NEXT_PAGE_FAIL';
var SEND_MESSAGE = 'inbox-apps/conversation/SEND_MESSAGE';
var SEND_MESSAGE_SUCCESS = 'inbox-apps/conversation/SEND_MESSAGE_SUCCESS';
var SEND_MESSAGE_FAIL = 'inbox-apps/conversation/SEND_MESSAGE_FAIL';
var TRIGGER_ACTION = 'inbox-apps/conversation/TRIGGER_ACTION';
var TRIGGER_ACTION_SUCCESS = 'inbox-apps/conversation/TRIGGER_ACTION_SUCCESS';
var TRIGGER_ACTION_FAIL = 'inbox-apps/conversation/TRIGGER_ACTION_FAIL';
var RESUME = 'inbox-apps/conversation/RESUME';
var RESUME_SUCCESS = 'inbox-apps/conversation/RESUME_SUCCESS';
var RESUME_FAIL = 'inbox-apps/conversation/RESUME_FAIL';
var LOAD_AUTHOR = 'inbox-apps/conversation/LOAD_AUTHOR';
var LOAD_AUTHOR_SUCCESS = 'inbox-apps/conversation/LOAD_AUTHOR_SUCCESS';
var LOAD_AUTHOR_FAIL = 'inbox-apps/conversation/LOAD_AUTHOR_FAIL';

var initialState = {
  loaded: false,
  author: false
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
        data: action.result.conversation,
        messages: action.result.messages,
        lastPage: action.result.messages.length < action.perPageLimit,
        page: 1,
        error: null,
        loading: false
      });
    case LOAD_FAIL:
      return (0, _extends3.default)({}, state, {
        data: null,
        messages: null,
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
        messages: [].concat((0, _toConsumableArray3.default)(state.messages), (0, _toConsumableArray3.default)(action.result.messages)),
        lastPage: action.result.messages.length < action.perPageLimit,
        page: state.page + (action.result.messages.length ? 1 : 0),
        error: null,
        nextLoading: false
      });
    case NEXT_PAGE_FAIL:
      return (0, _extends3.default)({}, state, {
        error: action.error,
        nextLoading: false
      });
    case SEND_MESSAGE:
      return state;
    case SEND_MESSAGE_SUCCESS:
      return (0, _extends3.default)({}, state, {
        messages: [action.result.message].concat((0, _toConsumableArray3.default)(state.messages))
      });
    case SEND_MESSAGE_FAIL:
      // TODO throw SubmissionError if needed
      return state;
    case TRIGGER_ACTION:
      return (0, _extends3.default)({}, state, {
        actionLoading: true
      });
    case TRIGGER_ACTION_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: action.result.conversation,
        actionError: null,
        actionLoading: false
      });
    case TRIGGER_ACTION_FAIL:
      return (0, _extends3.default)({}, state, {
        actionError: action.error,
        actionLoading: false
      });
    case RESUME:
      return (0, _extends3.default)({}, state, {
        resumeLoading: true
      });
    case RESUME_SUCCESS:
      return (0, _extends3.default)({}, state, {
        data: action.result.conversation,
        resumeError: null,
        resumeLoading: false
      });
    case RESUME_FAIL:
      return (0, _extends3.default)({}, state, {
        resumeError: action.error,
        resumeLoading: false
      });
    case LOAD_AUTHOR:
      return (0, _extends3.default)({}, state, {
        authorFetching: true
      });
    case LOAD_AUTHOR_SUCCESS:
      return (0, _extends3.default)({}, state, {
        author: action.result,
        authorFetching: false,
        authorFetchingError: false
      });
    case LOAD_AUTHOR_FAIL:
      return (0, _extends3.default)({}, state, {
        author: false,
        authorFetching: false,
        authorFetchingError: action.error
      });
    default:
      return state;
  }
}

function isLoaded(globalState) {
  return globalState.conversation && globalState.conversation.loaded;
}

function load(conversationId, query) {
  return function (_ref) {
    var getState = _ref.getState;

    var state = getState();

    return {
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      query: query,
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref2) {
        var res = _ref2.res,
            agenda = _ref2.agenda,
            event = _ref2.event;
        return client.get(res.messages.list.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid).replace(':conversationId', conversationId), { query: query });
      }
    };
  };
}

function isAuthorLoaded(globalState) {
  return globalState.conversation && globalState.conversation.author;
}

function loadAuthor() {
  return {
    types: [LOAD_AUTHOR, LOAD_AUTHOR_SUCCESS, LOAD_AUTHOR_FAIL],
    promise: function promise(client, _ref3) {
      var res = _ref3.res,
          agenda = _ref3.agenda,
          event = _ref3.event;
      return client.get(res.author.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid));
    }
  };
}

function nextPage(conversationId) {
  return function (_ref4) {
    var getState = _ref4.getState;

    var state = getState();

    return {
      types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
      perPageLimit: state.settings.perPageLimit,
      promise: function promise(client, _ref5) {
        var res = _ref5.res,
            agenda = _ref5.agenda,
            event = _ref5.event;
        return client.get(res.messages.list.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid).replace(':conversationId', conversationId), {
          query: (0, _extends3.default)({}, state.conversation.query, {
            page: state.conversation.page + 1
          })
        });
      }
    };
  };
}

function sendMessage(conversationId, data) {
  return {
    types: [SEND_MESSAGE, SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAIL],
    promise: function promise(client, _ref6) {
      var res = _ref6.res,
          agenda = _ref6.agenda,
          event = _ref6.event;
      return client.post(res.messages.create.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid).replace(':conversationId', conversationId), { data: data });
    }
  };
}

function triggerAction(conversationId, code) {
  return {
    types: [TRIGGER_ACTION, TRIGGER_ACTION_SUCCESS, TRIGGER_ACTION_FAIL],
    promise: function promise(client, _ref7) {
      var res = _ref7.res,
          agenda = _ref7.agenda,
          event = _ref7.event;
      return client.get(res.conversations.action.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid).replace(':conversationId', conversationId).replace(':code', code));
    }
  };
}

function resume(conversationId) {
  return {
    types: [RESUME, RESUME_SUCCESS, RESUME_FAIL],
    promise: function promise(client, _ref8) {
      var res = _ref8.res,
          agenda = _ref8.agenda,
          event = _ref8.event;
      return client.get(res.conversations.resume.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid).replace(':conversationId', conversationId));
    }
  };
}
//# sourceMappingURL=conversation.js.map