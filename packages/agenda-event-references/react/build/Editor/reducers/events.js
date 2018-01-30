"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];


  switch (action.type) {

    case 'EVENTS_REQUEST':

      return (0, _immutabilityHelper2.default)(state, {
        loading: { $set: true },
        events: []
      });

      break;

    case 'EVENTS_SUCCESS':

      return (0, _immutabilityHelper2.default)(state, {
        loading: { $set: false },
        events: { $set: action.events.map(function (e) {
            return {
              uid: e.uid,
              title: e.title[state.lang],
              dateRange: e.dateRange[state.lang],
              location: {
                name: e.location.name,
                address: e.location.address
              }
            };
          }) },
        error: { $set: false }
      });

      break;

    case 'EVENTS_FAILED':

      return (0, _immutabilityHelper2.default)(state, {
        loading: { $set: false },
        events: { $set: [] },
        error: { $set: action.error }
      });

      break;

    case 'EVENT_REMOVE':

      var removedEventIndex = state.events.map(function (e) {
        return e.uid;
      }).indexOf(action.eventUid);

      if (removedEventIndex == -1) {

        return state;
      }

      return (0, _immutabilityHelper2.default)(state, {
        events: {
          $splice: [[removedEventIndex, 1]]
        }
      });

    case 'EVENT_ADD':

      if (state.events.map(function (e) {
        return e.uid;
      }).indexOf(action.event.uid) !== -1) {

        return state;
      }

      return (0, _immutabilityHelper2.default)(state, {
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

module.exports = exports['default'];