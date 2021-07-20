'use strict';

const _ = require('lodash');

async function disqualifyCandidate(endpoints, location1, location2) {
  const { duplicateCandidates: oldCandidatesL1, disqualifiedDuplicates: oldDisqualifiedCandidateL1 } = await endpoints.get(location1, { includeFields: ['duplicateCandidates', 'disqualifiedDuplicates'] });
  const { duplicateCandidates: oldCandidatesL2, disqualifiedDuplicates: oldDisqualifiedCandidateL2 } = await endpoints.get(location2, { includeFields: ['duplicateCandidates', 'disqualifiedDuplicates'] });
  const candidatesL1 = oldCandidatesL1.filter(e => e !== location2);
  const candidatesL2 = oldCandidatesL2.filter(e => e !== location1);
  await endpoints.patch(location1, {
    duplicateCandidates: candidatesL1,
    disqualifiedDuplicates: _.uniq(oldDisqualifiedCandidateL1.concat([location2]))
  });
  await endpoints.patch(location2, {
    duplicateCandidates: candidatesL2,
    disqualifiedDuplicates: _.uniq(oldDisqualifiedCandidateL2.concat([location1]))
  });
}

module.exports = disqualifyCandidate;
