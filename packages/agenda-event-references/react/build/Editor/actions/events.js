"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = require('utils/get');

var _get2 = _interopRequireDefault(_get);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // loads details for events defined by current references ( used at init )
  eventsLoad: eventsLoad,
  eventsRequest: eventsRequest,
  eventsSuccess: eventsSuccess,
  eventsFailed: eventsFailed,
  eventAdd: eventAdd,
  eventRemove: eventRemove
};


function eventsLoad() {

  return function (dispatch, getState) {

    var state = getState();

    dispatch(eventsRequest());

    (0, _get2.default)(state.res.events, {
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
module.exports = exports['default'];