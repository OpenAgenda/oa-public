import countries from '@openagenda/labels/agenda-locations/countries.js';
import * as aggObjects from './aggregatorObjects.js';
import cleanTextForSearch from './cleanTextForSearch.js';

const locationFields = [
  'name',
  'address',
  'countryCode',
  'city',
  'region',
  'department',
  'adminLevel3',
  'adminLevel5',
  'district',
];

const searchFullAddressText = (location, country) =>
  locationFields
    .map((f) => location[f])
    .filter((f) => !!f)
    .concat(Object.values(country))
    .join(' ');

const clearEmptyLabels = (labels) =>
  Object.keys(labels)
    .filter((lang) => labels[lang].length)
    .reduce(
      (filtered, lang) => ({
        ...filtered,
        [lang]: labels[lang],
      }),
      {},
    );

function formatLocation(data, options = {}) {
  const location = {
    ...data,
    _agg: aggObjects.flatten(data, ['uid', 'name']),
  };
  const { tagSet } = options;

  if (!(location.tags ?? []).length || !tagSet) {
    return location;
  }

  const tagSetTags = tagSet.groups.reduce((t, g) => t.concat(g.tags), []);

  location.tags = location.tags.map(({ id, label }) => ({
    id,
    label: tagSetTags.find((t) => t.id === id)?.label ?? label,
  }));

  return location;
}

const extractSearchData = (location, country) => ({
  _search_full_address_text: cleanTextForSearch(
    searchFullAddressText(location, country),
  ),
  _search_location: {
    lat: location.latitude,
    lon: location.longitude,
  },
});

export default function extractLocationData(location, options = {}) {
  if (!location) {
    return {
      emptyFields: locationFields,
    };
  }

  const { formSchema } = options;

  const country = clearEmptyLabels(
    countries[(location.countryCode ?? '').toUpperCase()] ?? {},
  );
  delete country.io;

  const formattedLocation = formatLocation(location, {
    tagSet: (formSchema?.fields ?? []).find((f) => f.field === 'location')
      ?.legacy?.tagSet,
  });

  return {
    country: Object.keys(country).length ? country : undefined,
    location: formattedLocation,
    search: extractSearchData(formattedLocation, country),
    emptyFields: locationFields.filter(
      (f) => !(formattedLocation[f] ?? '').length,
    ),
  };
}
