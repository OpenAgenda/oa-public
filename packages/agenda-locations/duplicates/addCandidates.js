'use strict';

const _ = require('lodash');

async function addDuplicatesCandidates(endpoints, location, candidates) {
  const { duplicateCandidates: oldCandidates } = await endpoints.get(location, { includeFields: 'duplicateCandidates' });
  await endpoints.patch(location, { duplicateCandidates: _.uniq(candidates.concat(oldCandidates || [])) });
  for (const candidat of candidates) {
    const { duplicateCandidates: oldCandidatesOfCandidat } = await endpoints.get(candidat, { includeFields: 'duplicateCandidates' });
    await endpoints.patch(candidat, { duplicateCandidates: _.uniq([location].concat(oldCandidatesOfCandidat || [])) });
  }
  return true;
}

module.exports = addDuplicatesCandidates;
