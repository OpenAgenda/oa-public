"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = {
  isEqual: require('lodash/isEqual')
};

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];


  switch (action.type) {

    case 'SUGGESTION_REQUEST':

      return (0, _immutabilityHelper2.default)(state, {
        search: {
          searching: { $set: true }
        },
        loadingSuggestions: { $set: true }
      });

      break;

    case 'SUGGESTION_REQUEST_FAILED':

      return (0, _immutabilityHelper2.default)(state, {
        search: {
          searching: { $set: false },
          error: { $set: action.error }
        }
      });

      break;

    case 'SUGGESTION_REQUEST_SUCCESS':

      return (0, _immutabilityHelper2.default)(state, {
        search: {
          searching: { $set: false },
          error: { $set: null },
          suggestions: {
            $set: action.suggestions.filter(_helpers.excludeEventsWithUids.bind(null, state.events.map(function (e) {
              return e.uid;
            }))).map(_helpers.formatEventItem.bind(null, state.lang))
          }
        },
        loadingSuggestions: { $set: false }
      });

      break;

    case 'SUGGESTION_REQUEST_ADD_SUCCESS':

      return (0, _immutabilityHelper2.default)(state, {
        search: {
          searching: { $set: false },
          error: { $set: null },
          events: { $set: null },
          suggestions: { $set: [] }
        },
        events: {
          $set: state.events.concat(action.suggestions.filter(_helpers.excludeEventsWithUids.bind(null, state.events.map(function (e) {
            return e.uid;
          }))).map(_helpers.formatEventItem.bind(null, state.lang)))
        },
        loadingSuggestions: { $set: false }
      });

      break;

    case 'SUGGESTION_RESET':

      if (_.isEqual(state.sample, action.sample)) {

        return state;
      }

      return (0, _immutabilityHelper2.default)(state, {
        search: {
          suggestions: { $set: null }
        },
        sample: {
          $set: action.sample
        }
      });

    default:

      return state;

  }
};

module.exports = exports['default'];