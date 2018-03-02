"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = require('@openagenda/utils'),
    suggestables = require('../../lib/suggestables');

module.exports = {
  prepareAlternatives: prepareAlternatives,
  suggestedTagsDiffer: suggestedTagsDiffer,
  getSameAsSuggestedTagIds: getSameAsSuggestedTagIds,
  fieldHasAlternative: fieldHasAlternative,
  getLangAlternatives: getLangAlternatives
};

function getLangAlternatives(fieldName, alternatives) {

  return alternatives.reduce(function (langs, alternative) {

    if (!alternative.location[fieldName] || _typeof(alternative.location[fieldName]) !== 'object') {

      return langs;
    }

    return langs.concat(Object.keys(alternative.location[fieldName]).filter(function (lang) {
      return langs.indexOf(lang) === -1;
    }));
  }, []);
}

function fieldHasAlternative(fieldName, alternatives) {

  if (!alternatives || !alternatives.length) return false;

  return !!alternatives.filter(function (a) {

    return Object.keys(a.location).indexOf(fieldName) !== -1;
  }).length;
}

/**
 * return ids of tags that have the same value ( checked or unchecked )
 * in location and alternatives
 */
function getSameAsSuggestedTagIds(tagSet, location, alternatives) {

  var tags = tagSet.groups.reduce(function (tags, group) {
    return tags.concat(group.tags);
  }, []);

  return tags.filter(function (t) {
    return !suggestedTagsDiffer(t, location, alternatives).length;
  }).map(function (t) {
    return t.id;
  });
}

/**
 * tell wether tag differs in at least one alternative
 */
function suggestedTagsDiffer(tag, location, alternatives) {

  var isInLocation = !!(location && location.tags || []).filter(function (t) {
    return t.id === tag.id;
  }).length,
      differentAlternatives = alternatives.filter(function (a) {

    var alternativeTags = a.location.tags || [],
        isInAlternative = !!alternativeTags.filter(function (t) {
      return t.id === tag.id;
    }).length;

    return isInAlternative !== isInLocation;
  });

  return differentAlternatives;
}

/**
 * prepare alternatives for display in location form
 */
function prepareAlternatives(location, props, labels, suggestionIndex) {

  if (typeof suggestionIndex === 'undefined') {

    suggestionIndex = 0;
  }

  var baseLocation = {},
      userSuggestion = (location.suggestions || []).length > suggestionIndex ? location.suggestions[suggestionIndex] : false,


  // state is not changed when alternatives are handled
  fields = Object.keys(location).filter(function (f) {
    return f !== 'state';
  }),
      alternative = {
    label: labels.currentValue[props.lang],
    location: {}
  };

  if (!userSuggestion) return {
    location: location,
    alternatives: []

    // add suggestables to fields if missing
  };suggestables.forEach(function (s) {

    if (fields.indexOf(s) !== -1) return;

    if (userSuggestion.location[s] === undefined) return;

    fields.push(s);
  });

  // if location does not have tags, they won't appear by themselves.
  fields.forEach(function (f) {

    if (userSuggestion && ['phone', 'timezone', 'tags'].indexOf(f) !== -1) {

      if (location[f]) {

        alternative.location[f] = location[f];
      }

      baseLocation[f] = userSuggestion.location[f];

      // basic text fields
    } else if (userSuggestion && userSuggestion.location[f] !== undefined && _typeof(userSuggestion.location[f]) !== 'object') {

      alternative.location[f] = location[f];

      baseLocation[f] = userSuggestion.location[f];
    } else if (userSuggestion && f === 'image') {

      if (userSuggestion.location[f] !== undefined) {

        alternative.location[f] = location[f];

        baseLocation[f] = userSuggestion.location[f];
      } else {

        baseLocation[f] = location[f];
      }
    } else if (userSuggestion && f === 'links') {

      if ((location.links || []).join(';') !== (alternative.location.links || []).join(';')) {

        alternative.location.links = location.links;
      }

      baseLocation[f] = userSuggestion.location[f];
    } else if (userSuggestion && userSuggestion.location[f] !== undefined) {

      alternative.location[f] = {};

      baseLocation[f] = utils.extend({}, location[f]);

      for (var l in userSuggestion.location[f]) {

        alternative.location[f][l] = location[f] ? location[f][l] : undefined;

        baseLocation[f][l] = userSuggestion.location[f][l];
      }
    } else {

      baseLocation[f] = location[f];
    }
  });

  return {
    location: baseLocation,
    alternatives: [alternative]
  };
}
//# sourceMappingURL=suggestions.helpers.js.map