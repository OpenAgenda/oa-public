"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _get = _interopRequireDefault(require("@openagenda/utils/get"));

var _clickTracker = _interopRequireDefault(require("../../clickTracker"));

var _default = {
  // the async search
  search: search,
  searchShow: searchShow,
  searchHide: searchHide,
  searchRequest: searchRequest,
  searchSuccess: searchSuccess,
  searchFailed: searchFailed
};
exports.default = _default;

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

  _clickTracker.default.switchOff('search');

  return {
    type: 'SEARCH_SUCCESS',
    events: events,
    query: query
  };
}

function searchFailed(error) {
  _clickTracker.default.switchOff('search');

  return {
    type: 'SEARCH_FAILED',
    error: error
  };
}

function search(query) {
  return function (dispatch, getState) {
    var state = getState();
    dispatch(searchRequest(query));
    (0, _get.default)(state.res.events, {
      search: query,
      exclude: state.events.map(function (e) {
        return e.uid;
      })
    }, function (err, events) {
      if (err) {
        return dispatch(searchFailed(err));
      }

      dispatch(searchSuccess({
        events: events,
        query: query
      }));
    });
  };
}

module.exports = exports.default;
//# sourceMappingURL=search.js.map