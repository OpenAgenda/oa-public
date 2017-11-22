'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = reducer;
exports.openConversationForm = openConversationForm;
exports.closeConversationForm = closeConversationForm;
exports.createConversation = createConversation;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OPEN_CONVERSATION_FORM = 'inbox-apps/conversationForm/OPEN_CONVERSATION_FORM';
var CLOSE_CONVERSATION_FORM = 'inbox-apps/conversationForm/CLOSE_CONVERSATION_FORM';
var CREATE_CONVERSATION = 'inbox-apps/conversationForm/CREATE_CONVERSATION';
var CREATE_CONVERSATION_SUCCESS = 'inbox-apps/conversationForm/CREATE_CONVERSATION_SUCCESS';
var CREATE_CONVERSATION_FAIL = 'inbox-apps/conversationForm/CREATE_CONVERSATION_FAIL';

var initialState = {
  opened: false,
  data: {}
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case OPEN_CONVERSATION_FORM:
      return (0, _extends3.default)({}, state, {
        opened: true,
        data: action.data
      });
    case CLOSE_CONVERSATION_FORM:
      return (0, _extends3.default)({}, state, {
        opened: false,
        data: {}
      });
    default:
      return state;
  }
};

function openConversationForm(data) {
  return {
    type: OPEN_CONVERSATION_FORM,
    data: data
  };
}

function closeConversationForm() {
  return {
    type: CLOSE_CONVERSATION_FORM
  };
}

function createConversation(data) {
  return {
    types: [CREATE_CONVERSATION, CREATE_CONVERSATION_SUCCESS, CREATE_CONVERSATION_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res,
          agenda = _ref.agenda,
          event = _ref.event;
      return client.post(res.conversations.create.replace(':slug', agenda && agenda.slug).replace(':agendaUid', agenda && agenda.uid).replace(':eventUid', event && event.uid), { data: data }).catch(function (err) {
        console.log(err);
        throw err;
      });
    }
  };
}
//# sourceMappingURL=conversationForm.js.map