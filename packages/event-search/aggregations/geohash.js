'use strict';

const schema = require('@openagenda/validators/schema');
const integerValidator = require('@openagenda/validators/integer');

schema.register({
  integer: integerValidator,
});

const validateOptions = schema({
  zoom: {
    type: 'integer',
    default: 1,
  },
  radius: {
    type: 'integer',
    default: 40,
  },
});

module.exports.formatDSL = (query, options = {}) => {
  const { zoom, radius } = validateOptions(options);

  return {
    geo_point_clustering: {
      field: '_search_location',
      zoom,
      radius,
    },
  };
};

module.exports.formatResult = (result) =>
  result.buckets.map((b) => ({
    key: b.geohash_grids.join('.'),
    eventCount: b.doc_count,
    latitude: b.centroid.lat,
    longitude: b.centroid.lon,
  }));
