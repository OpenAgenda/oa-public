'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('addCandidates');

async function addDuplicateCandidates(endpoints, location, candidates) {
  if (candidates.length === 0) return;
  log.info('adding %j to %j (%j) duplicate candidates', candidates, location.name, location.slug);
  const { duplicateCandidates: oldCandidates } = await endpoints.get(location, { includeFields: 'duplicateCandidates' });
  const newDuplicateCandidates = _.uniq(candidates.concat(oldCandidates || []));
  await endpoints.patch(location, { duplicateCandidates: newDuplicateCandidates.length ? newDuplicateCandidates : null });
  for (const candidat of candidates) {
    const { duplicateCandidates: oldCandidatesOfCandidat } = await endpoints.get(candidat, { includeFields: 'duplicateCandidates' });
    const newDuplicateCandidatesOfCanidate = _.uniq([location].concat(oldCandidatesOfCandidat || []));
    await endpoints.patch(candidat, { duplicateCandidates: newDuplicateCandidatesOfCanidate.length ? newDuplicateCandidatesOfCanidate : null });
  }
  return true;
}

module.exports = addDuplicateCandidates;
