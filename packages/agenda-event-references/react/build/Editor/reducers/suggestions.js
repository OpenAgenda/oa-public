"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _helpers = require("./helpers");

var _ = {
  isEqual: require('lodash/isEqual')
};

var _default = function _default() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case 'SUGGESTION_REQUEST':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: true
          }
        },
        loadingSuggestions: {
          $set: true
        }
      });
      break;

    case 'SUGGESTION_REQUEST_FAILED':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: false
          },
          error: {
            $set: action.error
          }
        }
      });
      break;

    case 'SUGGESTION_REQUEST_SUCCESS':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: false
          },
          error: {
            $set: null
          },
          suggestions: {
            $set: action.suggestions.filter(_helpers.excludeEventsWithUids.bind(null, state.events.map(function (e) {
              return e.uid;
            }))).map(_helpers.formatEventItem.bind(null, state.lang))
          }
        },
        loadingSuggestions: {
          $set: false
        }
      });
      break;

    case 'SUGGESTION_REQUEST_ADD_SUCCESS':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: false
          },
          error: {
            $set: null
          },
          events: {
            $set: null
          },
          suggestions: {
            $set: []
          }
        },
        events: {
          $set: state.events.concat(action.suggestions.filter(_helpers.excludeEventsWithUids.bind(null, state.events.map(function (e) {
            return e.uid;
          }))).filter(function (e, i) {
            return i < 3;
          }) // keep three items
          .map(_helpers.formatEventItem.bind(null, state.lang)))
        },
        loadingSuggestions: {
          $set: false
        }
      });
      break;

    case 'SUGGESTION_RESET':
      if (_.isEqual(state.sample, action.sample)) {
        return state;
      }

      return (0, _immutabilityHelper.default)(state, {
        search: {
          suggestions: {
            $set: null
          }
        },
        sample: {
          $set: action.sample
        }
      });

    default:
      return state;
  }
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=suggestions.js.map