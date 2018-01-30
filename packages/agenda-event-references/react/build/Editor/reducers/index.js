"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _suggestions = require('./suggestions');

var _suggestions2 = _interopRequireDefault(_suggestions);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];


  var newState = (0, _search2.default)(state, action);

  newState = (0, _events2.default)(newState, action);

  newState = (0, _suggestions2.default)(newState, action);

  return newState;
};

module.exports = exports['default'];