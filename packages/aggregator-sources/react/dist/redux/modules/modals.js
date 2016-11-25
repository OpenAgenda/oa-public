'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.showModal = showModal;
exports.closeModal = closeModal;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SHOW = 'aggregator-sources/modals/SHOW';
var CLOSE = 'aggregator-sources/modals/CLOSE';

var initialState = {};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case SHOW:
      return _extends({}, state, _defineProperty({}, action.name, _extends({}, action.options, {
        visible: true
      })));
    case CLOSE:
      return _extends({}, state, _defineProperty({}, action.name, _extends({}, state[action.name], {
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