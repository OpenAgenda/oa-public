import utils from '@openagenda/utils';

const suggestables = [
  'name',
  'address',
  'access',
  'description',
  'website',
  'phone',
  'address',
  'city',
  'region',
  'department',
  'countryCode',
  'postalCode',
  'latitude',
  'longitude',
  'image',
  'tags',
  'links',
  'timezone',
];

function getLangAlternatives(fieldName, alternatives) {
  return alternatives.reduce((langs, alternative) => {
    if (
      !alternative.location[fieldName]
      || typeof alternative.location[fieldName] !== 'object'
    ) {
      return langs;
    }

    return langs.concat(
      Object.keys(alternative.location[fieldName]).filter(
        lang => langs.indexOf(lang) === -1
      )
    );
  }, []);
}

function fieldHasAlternative(fieldName, alternatives) {
  if (!alternatives || !alternatives.length) return false;

  return !!alternatives.filter(a => Object.keys(a.location).indexOf(fieldName) !== -1).length;
}

/**
 * tell wether tag differs in at least one alternative
 */
function suggestedTagsDiffer(tag, location, alternatives) {
  const isInLocation = !!((location && location.tags) || []).filter(
    t => t.id === tag.id
  ).length;
  const differentAlternatives = alternatives.filter(a => {
    const alternativeTags = a.location.tags || [];
    const isInAlternative = !!alternativeTags.filter(t => t.id === tag.id).length;

    return isInAlternative !== isInLocation;
  });

  return differentAlternatives;
}

/**
 * return ids of tags that have the same value ( checked or unchecked )
 * in location and alternatives
 */
function getSameAsSuggestedTagIds(tagSet, location, alternatives) {
  const tags = tagSet.groups.reduce((tags, group) => tags.concat(group.tags), []);

  return tags
    .filter(t => !suggestedTagsDiffer(t, location, alternatives).length)

    .map(t => t.id);
}

/**
 * prepare alternatives for display in location form
 */
function prepareAlternatives(location, props, labels, paramSuggestionIndex) {
  let suggestionIndex = paramSuggestionIndex;
  if (typeof suggestionIndex === 'undefined') {
    suggestionIndex = 0;
  }

  const baseLocation = {};
  const userSuggestion = (location.suggestions || []).length > suggestionIndex
    ? location.suggestions[suggestionIndex]
    : false;
    // state is not changed when alternatives are handled
  const fields = Object.keys(location).filter(f => f !== 'state');
  const alternative = {
    label: labels.currentValue[props.lang],
    location: {},
  };

  if (!userSuggestion) {
    return {
      location,
      alternatives: [],
    };
  }

  // add suggestables to fields if missing
  suggestables.forEach(s => {
    if (fields.indexOf(s) !== -1) return;

    if (userSuggestion.location[s] === undefined) return;

    fields.push(s);
  });

  // if location does not have tags, they won't appear by themselves.
  fields.forEach(f => {
    if (userSuggestion && ['phone', 'timezone', 'tags'].indexOf(f) !== -1) {
      if (location[f]) {
        alternative.location[f] = location[f];
      }

      baseLocation[f] = userSuggestion.location[f];

      // basic text fields
    } else if (
      userSuggestion
      && userSuggestion.location[f] !== undefined
      && typeof userSuggestion.location[f] !== 'object'
    ) {
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
      if (
        (location.links || []).join(';')
        !== (alternative.location.links || []).join(';')
      ) {
        alternative.location.links = location.links;
      }

      baseLocation[f] = userSuggestion.location[f];
    } else if (userSuggestion && userSuggestion.location[f] !== undefined) {
      alternative.location[f] = {};

      baseLocation[f] = utils.extend({}, location[f]);

      for (const l in userSuggestion.location[f]) {
        if (Object.prototype.hasOwnProperty.call(userSuggestion.location[f], l)) {
          alternative.location[f][l] = location[f] ? location[f][l] : undefined;
          baseLocation[f][l] = userSuggestion.location[f][l];
        }
      }
    } else {
      baseLocation[f] = location[f];
    }
  });

  return {
    location: baseLocation,
    alternatives: [alternative],
  };
}

module.exports = {
  prepareAlternatives,
  suggestedTagsDiffer,
  getSameAsSuggestedTagIds,
  fieldHasAlternative,
  getLangAlternatives,
};
