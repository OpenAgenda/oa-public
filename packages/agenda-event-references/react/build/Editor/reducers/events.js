"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _default = function _default() {
  var _context, _context2, _context3, _context4, _context5;

  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case 'EVENTS_REQUEST':
      return (0, _immutabilityHelper.default)(state, {
        loading: {
          $set: true
        },
        events: []
      });
      break;

    case 'EVENTS_SUCCESS':
      return (0, _immutabilityHelper.default)(state, {
        loading: {
          $set: false
        },
        events: {
          $set: (0, _map.default)(_context = action.events).call(_context, function (e) {
            return {
              uid: e.uid,
              title: e.title[state.lang],
              dateRange: e.dateRange[state.lang],
              location: {
                name: e.location.name,
                address: e.location.address
              }
            };
          })
        },
        error: {
          $set: false
        }
      });
      break;

    case 'EVENTS_FAILED':
      return (0, _immutabilityHelper.default)(state, {
        loading: {
          $set: false
        },
        events: {
          $set: []
        },
        error: {
          $set: action.error
        }
      });
      break;

    case 'EVENT_REMOVE':
      var removedEventIndex = (0, _indexOf.default)(_context2 = (0, _map.default)(_context3 = state.events).call(_context3, function (e) {
        return e.uid;
      })).call(_context2, action.eventUid);

      if (removedEventIndex == -1) {
        return state;
      }

      return (0, _immutabilityHelper.default)(state, {
        events: {
          $splice: [[removedEventIndex, 1]]
        }
      });

    case 'EVENT_ADD':
      if ((0, _indexOf.default)(_context4 = (0, _map.default)(_context5 = state.events).call(_context5, function (e) {
        return e.uid;
      })).call(_context4, action.event.uid) !== -1) {
        return state;
      }

      return (0, _immutabilityHelper.default)(state, {
        search: {
          searching: {
            $set: false
          },
          display: {
            $set: false
          },
          query: {
            $set: false
          },
          events: {
            $set: []
          }
        },
        events: {
          $push: [action.event]
        }
      });

    default:
      return state;
  }
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=events.js.map