'use strict';

const _ = require('lodash');
const axios = require('axios');
const ParseAndTransform = require('./lib/parseAndTransform');
const buildGeoTree = require('./lib/buildGeoTree');

const geoTreePath = `${__dirname}/../geoTree`;

const forwardURL = (query, {
  key, pretty, countryCode, language
}) => [
  `https://api.opencagedata.com/geocode/v1/json?key=${key}&q=${encodeURIComponent(query)}`,
  countryCode ? `&countrycode=${countryCode}` : '',
  pretty ? '&pretty=1' : '',
  language ? `&language=${language}` : ''
].join('');

const reverseURL = (latitude, longitude, { key, pretty, language }) => [
  `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${key}`,
  pretty ? '&pretty=1' : '',
  language ? `&language=${language}` : ''
].join('');

/**
 * DOMTOM, HONG KONG... country codes are not known by OpenCage
 */
function cleanGeocodeQuery(query, countryCode) {
  const cleanQuery = (query || '').trim();

  for (const transform of [{
    from: ['YT', 'PF', 'GF', 'PM', 'MQ', 'GP', 'RE', 'NC'],
    to: 'FR'
  }, {
    from: ['HK'],
    to: 'CN'
  }, {
    from: ['AW'],
    to: 'NL'
  }]) {
    if (transform.from.includes(countryCode)) {
      return {
        countryCode: transform.to,
        query: cleanQuery
      };
    }
  }

  return {
    countryCode,
    query: cleanQuery
  };
}

async function reverse(key, parseAndTransform, latitude, longitude, { first, language, raw }) {
  const results = await axios.request({
    url: reverseURL(latitude, longitude, { key, language }),
  }).then(r => _.get(r, 'data.results'));

  const transformed = await parseAndTransform(results, { raw });
  return first ? _.first(transformed) : transformed;
}

async function geocode(key, parseAndTransform, query, {
  countryCode,
  language,
  raw,
  first
}) {
  const {
    query: cleanQuery,
    countryCode: cleanCountryCode
  } = cleanGeocodeQuery(query, countryCode);

  if (!cleanQuery.length) {
    return first ? null : [];
  }

  const results = await axios.request({
    url: forwardURL(cleanQuery, {
      key,
      countryCode: cleanCountryCode,
      language
    })
  }).then(r => _.get(r, 'data.results'));

  const transformed = await parseAndTransform(results, { raw });
  return first ? _.first(transformed) : transformed;
}

module.exports = ({ key }) => _.assign(geocode.bind(null, key), {
  reverse: reverse.bind(null, key)
});

module.exports = ({ key }) => {
  const geoTree = buildGeoTree(geoTreePath);
  const parseAndTransform = ParseAndTransform(geoTree);
  return Object.assign(geocode.bind(null, key, parseAndTransform), {
    reverse: reverse.bind(null, key, parseAndTransform)
  });
};
