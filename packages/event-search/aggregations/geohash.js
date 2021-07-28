'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

const validateOptions = schema({
  zoom: {
    type: 'integer',
    default: 1
  },
  radius: {
    type: 'integer',
    default: 40
  }
});

module.exports.formatDSL = (query, options = {}) => {
  const {
    zoom,
    radius
  } = validateOptions(options);

  return {
    geo_point_clustering: {
      field: '_search_location',
      zoom,
      radius
    }
  };
};

module.exports.formatResult = (result, options = {}) => result.buckets.map(b => {
  // const { latitude, longitude } = decode(b.key);

  return ({
    key: b.geohash_grids.join('.'),
    eventCount: b.doc_count,
    latitude: b.centroid.lat,
    longitude: b.centroid.lon
  });
});
