"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var utils = require('utils');

module.exports = {
  prepareAlternatives: prepareAlternatives
};

/**
 * prepare alternatives for display in location form
 */

function prepareAlternatives(state, props, labels) {

  var location = {},
      userSuggestion = state.location.suggestions.length ? state.location.suggestions[0] : false,
      alternative = {
    label: labels.currentValue[props.lang],
    location: {}
  };

  Object.keys(state.location).forEach(function (f) {

    // basic text fields
    if (userSuggestion && userSuggestion.location[f] !== undefined && _typeof(userSuggestion.location[f]) !== 'object') {

      alternative.location[f] = state.location[f];

      location[f] = userSuggestion.location[f];

      // multilingual fields
    } else if (userSuggestion && userSuggestion.location[f] !== undefined) {

        alternative.location[f] = {};

        location[f] = utils.extend({}, state.location[f]);

        for (var l in userSuggestion.location[f]) {

          alternative.location[f][l] = state.location[f][l];

          location[f][l] = userSuggestion.location[f][l];
        }
      } else {

        location[f] = state.location[f];
      }
  });

  return {
    location: location,
    alternatives: [alternative]
  };
}