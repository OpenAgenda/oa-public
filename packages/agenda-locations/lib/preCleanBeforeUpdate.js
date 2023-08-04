'use strict';

const { produce } = require('immer');

module.exports = produce((draft, current, options = {}) => {
  const {
    geocodeResult,
    isPatch,
  } = options;

  if (!draft.extId && current.extId) {
    draft.extId = current.extId;
  }

  if (geocodeResult?.latitude && isPatch) {
    Object.assign(draft, {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
    });
  } else if (geocodeResult) {
    Object.assign(draft, geocodeResult);
  }
});
