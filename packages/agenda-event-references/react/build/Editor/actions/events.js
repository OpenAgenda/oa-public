"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _get = _interopRequireDefault(require("@openagenda/utils/get"));

var _default = {
  // loads details for events defined by current references ( used at init )
  eventsLoad: eventsLoad,
  eventsRequest: eventsRequest,
  eventsSuccess: eventsSuccess,
  eventsFailed: eventsFailed,
  eventAdd: eventAdd,
  eventRemove: eventRemove
};
exports.default = _default;

function eventsLoad() {
  return function (dispatch, getState) {
    var state = getState();
    dispatch(eventsRequest());
    (0, _get.default)(state.res.events, {
      uids: state.initUids
    }, function (err, events) {
      if (err) {
        return dispatch(eventsFailed(err));
      }

      dispatch(eventsSuccess(events));
    });
  };
}

function eventRemove(eventUid) {
  return {
    type: 'EVENT_REMOVE',
    eventUid: eventUid
  };
}

function eventAdd(event) {
  return {
    type: 'EVENT_ADD',
    event: event
  };
}

function eventsRequest() {
  return {
    type: 'EVENTS_REQUEST'
  };
}

function eventsSuccess(events) {
  return {
    type: 'EVENTS_SUCCESS',
    events: events
  };
}

function eventsFailed(error) {
  return {
    type: 'EVENTS_FAILED',
    error: error
  };
}

module.exports = exports.default;
//# sourceMappingURL=events.js.map