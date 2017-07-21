'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends5 = require('babel-runtime/helpers/extends');

var _extends6 = _interopRequireDefault(_extends5);

exports.default = reducer;
exports.showModal = showModal;
exports.setModal = setModal;
exports.closeModal = closeModal;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SHOW = 'member-apps/modals/SHOW';
var SET = 'member-apps/modals/SET';
var CLOSE = 'member-apps/modals/CLOSE';

var initialState = {};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case SHOW:
      return (0, _extends6.default)({}, state, (0, _defineProperty3.default)({}, action.name, (0, _extends6.default)({}, action.options, {
        visible: true
      })));
    case SET:
      return (0, _extends6.default)({}, state, (0, _defineProperty3.default)({}, action.name, (0, _extends6.default)({}, state[action.name], action.options)));
    case CLOSE:
      return (0, _extends6.default)({}, state, (0, _defineProperty3.default)({}, action.name, (0, _extends6.default)({}, state[action.name], {
        visible: false
      })));
    default:
      return state;
  }
}

function showModal(name) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return {
    type: SHOW,
    name: name,
    options: options
  };
}

function setModal(name) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return {
    type: SET,
    name: name,
    options: options
  };
}

function closeModal(name) {
  return {
    type: CLOSE,
    name: name
  };
}