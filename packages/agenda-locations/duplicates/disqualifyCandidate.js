'use strict';

const validate = require('@openagenda/validators/integer')({ list: { min: 2 } });

async function disqualifyCandidate(endpoints, dirtyUids) {
  const locationUids = validate(dirtyUids);
  const locations = await endpoints.list({ uids: locationUids }, {}, { detailed: true });
  const loadedLocationUids = locations.map(l => l.uid);
  for (const location of locations) {
    const toMove = location.duplicateCandidates.filter(c => loadedLocationUids.includes(c));
    await endpoints.patch(location.uid, {
      duplicateCandidates: location.duplicateCandidates.filter(c => !toMove.includes(c)),
      disqualifiedDuplicates: (location.disqualifiedDuplicates || []).concat(toMove),
    });
  }
}

module.exports = disqualifyCandidate;
