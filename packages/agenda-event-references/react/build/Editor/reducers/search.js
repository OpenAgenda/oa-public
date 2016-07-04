"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactAddonsUpdate = require('react-addons-update');

var _reactAddonsUpdate2 = _interopRequireDefault(_reactAddonsUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments[1];


  switch (action.type) {

    case 'SEARCH_REQUEST':

      return (0, _reactAddonsUpdate2.default)(state, {
        searching: { $set: true },
        query: { $set: action.query }
      });

    case 'SEARCH_FAILED':

      return (0, _reactAddonsUpdate2.default)(state, {
        searching: { $set: false },
        error: { $set: action.error }
      });

    case 'SEARCH_SUCCESS':

      return (0, _reactAddonsUpdate2.default)(state, {
        searching: { $set: false },
        query: { $set: action.query },
        events: { $set: action.events }
      });

    case 'SEARCH_SHOW':

      return {
        display: true
      };

    case 'SEARCH_HIDE':

      return {
        display: false
      };

    default:

      return state;

  }
};

module.exports = exports['default'];