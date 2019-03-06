"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _helpers = require("./helpers");

var _default = function _default() {
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
            $set: action.events.filter(_helpers.excludeEventsWithUids.bind(null, state.events.map(function (e) {
              return e.uid;
            }))).map(_helpers.formatEventItem.bind(null, state.lang))
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