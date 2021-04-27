'use strict';

const schema = require('@openagenda/validators/schema');
const {
  decode
} = require('ngeohash');

schema.register({
  integer: require('@openagenda/validators/integer')
});

const validateOptions = schema({
  precision: {
    type: 'integer',
    default: 5
  }
});

module.exports.formatDSL = (query, options = {}) => {
  const {
    precision
  } = validateOptions(options);

  return {
    geohash_grid: {
      field: '_search_location',
      precision
    }
  };
};

module.exports.formatResult = (result, options = {}) => result.buckets.map(b => {
  const { latitude, longitude } = decode(b.key);
  
  return ({
    key: b.key,
    eventCount: b.doc_count,
    latitude,
    longitude
  });
});
