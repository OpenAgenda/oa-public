"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = require('@openagenda/utils/get');

var _get2 = _interopRequireDefault(_get);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  suggest: suggest,

  suggestionsAdd: suggestionsAdd,

  resetSuggestions: resetSuggestions

};


function getSuggestions(res, reference, excludedEvents, cb) {

  (0, _get2.default)(res, {
    sample: reference,
    exclude: excludedEvents.map(function (e) {
      return e.uid;
    })
  }, cb);
}

function suggestionsAdd() {

  return function (dispatch, getState) {
    var _getState = getState(),
        res = _getState.res,
        sample = _getState.sample,
        events = _getState.events,
        search = _getState.search;

    if (!sample) return;

    if (search.suggestions && !search.suggestions.length) return;

    dispatch({ type: 'SUGGESTION_REQUEST' });

    getSuggestions(res.suggestions, sample, events, function (error, suggestions) {

      if (error) {

        return dispatch({ type: 'SUGGESTION_REQUEST_FAILED', error: error });
      }

      dispatch({ type: 'SUGGESTION_REQUEST_ADD_SUCCESS', suggestions: suggestions });
    });
  };
}

function resetSuggestions(newSuggestFrom) {

  return {
    type: 'SUGGESTION_RESET',
    sample: newSuggestFrom
  };
}

function suggest() {

  return function (dispatch, getState) {
    var _getState2 = getState(),
        res = _getState2.res,
        sample = _getState2.sample,
        events = _getState2.events,
        search = _getState2.search;

    if (!sample) return;

    if (search.suggestions && !search.suggestions.length) return;

    dispatch({ type: 'SUGGESTION_REQUEST' });

    getSuggestions(res.suggestions, sample, events, function (error, suggestions) {

      if (error) {

        return dispatch({ type: 'SUGGESTION_REQUEST_FAILED', error: error });
      }

      dispatch({ type: 'SUGGESTION_REQUEST_SUCCESS', suggestions: suggestions });
    });
  };
}
module.exports = exports['default'];