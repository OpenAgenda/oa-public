"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = require('utils/get');

var _get2 = _interopRequireDefault(_get);

var _clickTracker = require('../../clickTracker');

var _clickTracker2 = _interopRequireDefault(_clickTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  // the async search
  search: search,
  searchShow: searchShow,
  searchHide: searchHide,
  searchRequest: searchRequest,
  searchSuccess: searchSuccess,
  searchFailed: searchFailed

};


function searchHide() {

  return {
    type: 'SEARCH_HIDE'
  };
}

function searchShow() {

  return {
    type: 'SEARCH_SHOW'
  };
}

function searchRequest(query) {

  return {
    type: 'SEARCH_REQUEST',
    query: query
  };
}

function searchSuccess(_ref) {
  var events = _ref.events,
      query = _ref.query;


  _clickTracker2.default.switchOff('search');

  return {
    type: 'SEARCH_SUCCESS',
    events: events,
    query: query
  };
}

function searchFailed(error) {

  _clickTracker2.default.switchOff('search');

  return {
    type: 'SEARCH_FAILED',
    error: error
  };
}

function search(query) {

  return function (dispatch, getState) {

    var state = getState();

    dispatch(searchRequest(query));

    (0, _get2.default)(state.res.events, {
      search: query,
      exclude: state.events.map(function (e) {
        return e.uid;
      })
    }, function (err, events) {

      if (err) {

        return dispatch(searchFailed(err));
      }

      dispatch(searchSuccess({ events: events, query: query }));
    });
  };
}
module.exports = exports['default'];