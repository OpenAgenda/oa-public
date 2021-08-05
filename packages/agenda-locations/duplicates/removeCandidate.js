'use strict';

async function removeCandidate(endpoints, locationUids, candidate) {
  for (const locationUid of locationUids) {
    const location = await endpoints.get(locationUid, { includeFields: 'duplicateCandidates' });
    if (!location) continue;
    const { duplicateCandidates: oldCandidates } = location;
    await endpoints.patch(locationUid, { duplicateCandidates: oldCandidates.filter(c => c !== candidate) || [] });
  }
}

module.exports = removeCandidate;
