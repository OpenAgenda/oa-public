'use strict';

const validate = require('@openagenda/validators/integer')({ list: { min: 2 } });

async function disqualifyCandidate(endpoints, dirtyUids) {
  const locationUids = validate(dirtyUids);
  const locations = await endpoints.list({ uids: locationUids }, {}, { detailed: true });
  const loadedLocationUids = locations.map(l => l.uid);
  for (const location of locations) {
    const toMove = location.duplicateCandidates.filter(c => loadedLocationUids.includes(c));
    const newDuplicateCandidates = location.duplicateCandidates.filter(c => !toMove.includes(c));
    const newDisqualifiedDuplicates = (location.disqualifiedDuplicates || []).concat(toMove);
    await endpoints.patch(location.uid, {
      duplicateCandidates: newDuplicateCandidates.length ? newDuplicateCandidates : null,
      disqualifiedDuplicates: newDisqualifiedDuplicates.length ? newDisqualifiedDuplicates : null,
    });
  }
}

module.exports = disqualifyCandidate;
