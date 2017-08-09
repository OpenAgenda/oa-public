'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.openRequestForm = openRequestForm;
exports.closeRequestForm = closeRequestForm;
exports.sendRequestForm = sendRequestForm;
var OPEN_REQUEST_FORM = 'CALL_TO_ACTION/OPEN_REQUEST_FORM';
var CLOSE_REQUEST_FORM = 'CALL_TO_ACTION/CLOSE_REQUEST_FORM';
var SEND_REQUEST = 'CALL_TO_ACTION/SEND_REQUEST';
var SEND_REQUEST_SUCCESS = 'CALL_TO_ACTION/SEND_REQUEST_SUCCESS';
var SEND_REQUEST_FAIL = 'CALL_TO_ACTION/SEND_REQUEST_FAIL';

var initialState = {
  opened: false
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];


  switch (action.type) {
    case OPEN_REQUEST_FORM:
      return _extends({}, state, {
        opened: true,
        lang: action.lang,
        subject: action.subject,
        agenda: action.agenda
      });
    case CLOSE_REQUEST_FORM:
      return _extends({}, state, {
        opened: false,
        subject: null,
        agenda: null
      });
    default:
      return state;
  }
};

function openRequestForm(_ref) {
  var lang = _ref.lang,
      subject = _ref.subject,
      agenda = _ref.agenda;

  return {
    type: OPEN_REQUEST_FORM,
    subject: subject,
    agenda: agenda,
    lang: lang
  };
}

function closeRequestForm() {
  return {
    type: CLOSE_REQUEST_FORM
  };
}

function sendRequestForm(data) {
  return {
    types: [SEND_REQUEST, SEND_REQUEST_SUCCESS, SEND_REQUEST_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res;
      return client.post(res.request, { data: data });
    }
  };
}
//# sourceMappingURL=callToAction.js.map