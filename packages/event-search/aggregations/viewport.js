import schema from '@openagenda/validators/schema/index';
import integerValidator from '@openagenda/validators/integer';

schema.register({
  integer: integerValidator,
});

export function formatDSL() {
  return /* query, options = {} */ {
    geo_bounds: {
      field: '_search_location',
    },
  };
}

export function formatResult(result) {
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
}
