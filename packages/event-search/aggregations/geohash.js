import schema from '@openagenda/validators/schema/index';
import integerValidator from '@openagenda/validators/integer';

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

export function formatDSL(query, options = {}) {
  const { zoom, radius } = validateOptions(options);

  return {
    geo_point_clustering: {
      field: '_search_location',
      zoom,
      radius,
    },
  };
}

export function formatResult(result) {
  return result.buckets.map((b) => ({
    key: b.geohash_grids.join('.'),
    eventCount: b.doc_count,
    latitude: b.centroid.lat,
    longitude: b.centroid.lon,
  }));
}
