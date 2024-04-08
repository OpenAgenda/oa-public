'use strict';

const schema = require('@openagenda/validators/schema');
const integerValidator = require('@openagenda/validators/integer');

schema.register({
  integer: integerValidator,
});

module.exports.formatDSL = (/* query, options = {} */) => ({
  geo_bounds: {
    field: '_search_location',
  },
});

module.exports.formatResult = result => {
  if (!result.bounds) {
    return null;
  }

  return {
    topLeft: {
      latitude: result.bounds.top_left.lat,
      longitude: result.bounds.top_left.lon,
    },
    bottomRight: {
      latitude: result.bounds.bottom_right.lat,
      longitude: result.bounds.bottom_right.lon,
    },
  };
};
