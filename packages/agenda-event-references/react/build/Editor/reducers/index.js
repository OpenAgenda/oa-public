"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _reactAddonsUpdate = require('react-addons-update');

var _reactAddonsUpdate2 = _interopRequireDefault(_reactAddonsUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments[1];


  var newState = (0, _reactAddonsUpdate2.default)(state, {
    search: { $set: (0, _search2.default)(state.search, action) }
  });

  newState = (0, _events2.default)(newState, action);

  return newState;
};

module.exports = exports['default'];