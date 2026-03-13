import _ from 'lodash';
import ky from 'ky';
import ParseAndTransform from './lib/parseAndTransform.js';
import buildGeoTree from './lib/buildGeoTree.js';

const geoTreePath = `${import.meta.dirname}/../geoTree`;

const forwardURL = (query, { key, pretty, countryCode, language }) =>
  [
    `https://api.opencagedata.com/geocode/v1/json?key=${key}&q=${encodeURIComponent(query)}`,
    countryCode ? `&countrycode=${countryCode}` : '',
    pretty ? '&pretty=1' : '',
    language ? `&language=${language}` : '',
  ].join('');

const reverseURL = (latitude, longitude, { key, pretty, language }) =>
  [
    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${key}`,
    pretty ? '&pretty=1' : '',
    language ? `&language=${language}` : '',
  ].join('');

/**
 * DOMTOM, HONG KONG... country codes are not known by OpenCage
 */
const MAX_QUERY_LENGTH = 200;

function isInvalidQuery(query) {
  if (query.length > MAX_QUERY_LENGTH) return true;
  if (/^https?:\/\//i.test(query)) return true;
  return false;
}

function cleanGeocodeQuery(query, countryCode) {
  const cleanQuery = (query || '').trim();

  if (isInvalidQuery(cleanQuery)) {
    return { countryCode, query: '' };
  }

  for (const transform of [
    {
      from: ['YT', 'PF', 'GF', 'PM', 'MQ', 'GP', 'RE', 'NC'],
      to: 'FR',
    },
    {
      from: ['HK'],
      to: 'CN',
    },
    {
      from: ['AW'],
      to: 'NL',
    },
  ]) {
    if (transform.from.includes(countryCode)) {
      return {
        countryCode: transform.to,
        query: cleanQuery,
      };
    }
  }

  return {
    countryCode,
    query: cleanQuery,
  };
}

async function reverse(
  key,
  parseAndTransform,
  latitude,
  longitude,
  { first, language, raw },
) {
  const data = await ky(
    reverseURL(latitude, longitude, { key, language }),
  ).json();
  const results = _.get(data, 'results', []);
  const transformed = await parseAndTransform(results, { raw });
  return first ? _.first(transformed) : transformed;
}

async function geocode(
  key,
  parseAndTransform,
  query,
  { countryCode, language, raw, first },
) {
  const { query: cleanQuery, countryCode: cleanCountryCode } = cleanGeocodeQuery(query, countryCode);

  if (!cleanQuery.length) {
    return first ? null : [];
  }

  const data = await ky(
    forwardURL(cleanQuery, {
      key,
      countryCode: cleanCountryCode,
      language,
    }),
  ).json();

  const results = _.get(data, 'results', []);
  const transformed = await parseAndTransform(results, { raw });
  return first ? _.first(transformed) : transformed;
}

export default ({ key }) => {
  const geoTree = buildGeoTree(geoTreePath);
  const parseAndTransform = ParseAndTransform(geoTree);
  return Object.assign(geocode.bind(null, key, parseAndTransform), {
    reverse: reverse.bind(null, key, parseAndTransform),
  });
};
