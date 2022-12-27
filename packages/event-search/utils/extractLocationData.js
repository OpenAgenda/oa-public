'use strict';

const countries = require('@openagenda/labels/agenda-locations/countries');

const aggObjects = require('./aggregatorObjects');

const locationFields = [
  'name',
  'address',
  'city',
  'region',
  'department',
  'adminLevel3',
  'adminLevel5',
  'district',
];

const searchFullAddressText = (location, country) => locationFields
  .map(f => location[f])
  .filter(f => !!f)
  .concat(Object.values(country))
  .join(' ');

const clearEmptyLabels = labels => Object.keys(labels)
  .filter(lang => labels[lang].length)
  .reduce((filtered, lang) => ({
    ...filtered,
    [lang]: labels[lang],
  }), {});

function formatLocation(data) {
  const location = {
    ...data,
    _agg: aggObjects.flatten(data, ['uid', 'name']),
  };

  delete location.tagSet;

  return location;
}

const extractSearchData = (location, country) => ({
  _search_full_address_text: searchFullAddressText(location, country),
  _search_location: {
    lat: location.latitude,
    lon: location.longitude,
  },
});

module.exports = function extractLocationData(location) {
  if (!location) {
    return {
      emptyFields: locationFields,
    };
  }

  const country = clearEmptyLabels(
    countries[(location.countryCode ?? '').toUpperCase()] ?? {},
  );
  delete country.io;

  const formattedLocation = formatLocation(location);

  return {
    country,
    location: formattedLocation,
    search: extractSearchData(formattedLocation, country),
    emptyFields: locationFields.filter(f => !(formattedLocation[f] ?? '').length),
  };
};
