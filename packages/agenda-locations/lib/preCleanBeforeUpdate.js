'use strict';

const { produce } = require('immer');

module.exports = produce((draft, current, options = {}) => {
  const {
    geocodeResult,
    isPatch
  } = options;

/*   if (isPatch && draft.duplicateCandidates && current.duplicateCandidates) {
    draft.duplicateCandidates = draft.duplicateCandidates.concat(current.duplicateCandidates).sort((a, b) => a - b);
  }

  if (isPatch && draft.disqualiedDuplicates && current.disqualiedDuplicates) {
    draft.disqualiedDuplicates = draft.disqualiedDuplicates.concat(current.disqualiedDuplicates).sort((a, b) => a - b);
  } */

  if (!draft.extId && current.extId) {
    draft.extId = current.extId;
  }

  if (geocodeResult && isPatch) {
    Object.assign(draft, {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude
    });
  } else if (geocodeResult) {
    Object.assign(draft, geocodeResult);
  }
});
