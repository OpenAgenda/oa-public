'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

module.exports.formatDSL = (/* query, options = {} */) => {
  return {
    geo_bounds: {
      field: '_search_location'
    }
  };
};



module.exports.formatResult = (result, options = {}) => {
  if (!result.bounds) {
    return null;
  }

  return {
    topLeft: {
      latitude: result.bounds.top_left.lat,
      longitude: result.bounds.top_left.lon
    },
    bottomRight: {
      latitude: result.bounds.bottom_right.lat,
      longitude: result.bounds.bottom_right.lon
    }
  };
};
