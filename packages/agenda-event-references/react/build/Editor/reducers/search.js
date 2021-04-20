"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _bind = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/bind"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _helpers = require("./helpers");

var _default = function _default() {
  var _context, _context2, _context3;

  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case 'SEARCH_REQUEST':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: true
          },
          query: {
            $set: action.query
          }
        }
      });

    case 'SEARCH_FAILED':
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

    case 'SEARCH_SUCCESS':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: false
          },
          query: {
            $set: action.query
          },
          events: {
            $set: (0, _map.default)(_context = (0, _filter.default)(_context2 = action.events).call(_context2, (0, _bind.default)(_helpers.excludeEventsWithUids).call(_helpers.excludeEventsWithUids, null, (0, _map.default)(_context3 = state.events).call(_context3, function (e) {
              return e.uid;
            })))).call(_context, (0, _bind.default)(_helpers.formatEventItem).call(_helpers.formatEventItem, null, state.lang))
          }
        }
      });

    case 'SEARCH_SHOW':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          display: {
            $set: true
          }
        }
      });

    case 'SEARCH_HIDE':
      return (0, _immutabilityHelper.default)(state, {
        search: {
          display: {
            $set: false
          }
        }
      });

    default:
      return state;
  }
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=search.js.map