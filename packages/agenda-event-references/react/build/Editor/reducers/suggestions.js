"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _bind = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/bind"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _helpers = require("./helpers");

var _ = {
  isEqual: require('lodash/isEqual')
};

var _default = function _default() {
  var _context, _context2, _context3, _context4, _context5, _context6, _context7, _context8;

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
            $set: (0, _map.default)(_context = (0, _filter.default)(_context2 = action.suggestions).call(_context2, (0, _bind.default)(_helpers.excludeEventsWithUids).call(_helpers.excludeEventsWithUids, null, (0, _map.default)(_context3 = state.events).call(_context3, function (e) {
              return e.uid;
            })))).call(_context, (0, _bind.default)(_helpers.formatEventItem).call(_helpers.formatEventItem, null, state.lang))
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
          $set: (0, _concat.default)(_context4 = state.events).call(_context4, (0, _map.default)(_context5 = (0, _filter.default)(_context6 = (0, _filter.default)(_context7 = action.suggestions).call(_context7, (0, _bind.default)(_helpers.excludeEventsWithUids).call(_helpers.excludeEventsWithUids, null, (0, _map.default)(_context8 = state.events).call(_context8, function (e) {
            return e.uid;
          })))).call(_context6, function (e, i) {
            return i < 3;
          }) // keep three items
          ).call(_context5, (0, _bind.default)(_helpers.formatEventItem).call(_helpers.formatEventItem, null, state.lang)))
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