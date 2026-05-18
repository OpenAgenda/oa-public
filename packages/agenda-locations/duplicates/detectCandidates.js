import { BadRequest } from '@openagenda/verror';

import buildDistancesAndEvaluate from './buildDistancesAndEvaluate.js';
import cleanDetectCandidatesOptions from './cleanDetectCandidatesOptions.js';
import addDuplicateCandidates from './addCandidates.js';

async function getLocation(endpoints, locationOrUid) {
  const location = locationOrUid?.constructor.name === 'Object'
    ? locationOrUid
    : await endpoints.get(locationOrUid);
  return location;
}

async function detectDuplicateCandidates(
  { internals, endpoints },
  locationOrUid,
  options = {},
) {
  const { saveCandidates, geoRange } = cleanDetectCandidatesOptions(options);
  const { config } = internals;
  const location = await getLocation(endpoints, locationOrUid);

  if (saveCandidates && !location.uid) {
    throw new BadRequest('cannot save a non existing location');
  }

  const geoFilter = {
    northEast: {
      lat: location.latitude + geoRange,
      lng: location.longitude + geoRange,
    },
    southWest: {
      lat: location.latitude - geoRange,
      lng: location.longitude - geoRange,
    },
  };
  const excludeUids = []
    .concat(location.uid ? [location.uid] : [])
    .concat(location.disqualifiedDuplicates || [])
    .concat(location.duplicateCandidates || []);
  let after = 0;
  const candidates = [];
  while (after !== -1) {
    const { after: nextAfter, items: locations } = await endpoints.list(
      { geo: geoFilter, excludeUid: excludeUids },
      { after },
    );
    if (!locations.length) {
      after = -1;
      continue;
    }

    for (const focusedLocation of locations) {
      if (
        buildDistancesAndEvaluate(location, focusedLocation, config.duplicates)
      ) {
        candidates.push(focusedLocation.uid);
      }
    }
    after = nextAfter;
  }

  if (saveCandidates) {
    await addDuplicateCandidates(endpoints, location, candidates);
  }
  return candidates;
}

export default detectDuplicateCandidates;
