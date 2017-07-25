'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

exports.default = reducer;
exports.showModal = showModal;
exports.closeModal = closeModal;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SHOW = 'activity-apps/modals/SHOW';
var CLOSE = 'activity-apps/modals/CLOSE';

var initialState = {};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case SHOW:
      return (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, action.name, (0, _extends5.default)({}, action.options, {
        visible: true
      })));
    case CLOSE:
      return (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, action.name, (0, _extends5.default)({}, state[action.name], {
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

function closeModal(name) {
  return {
    type: CLOSE,
    name: name
  };
}