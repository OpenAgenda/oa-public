'use strict';

const detectDuplicatesCandidates = require('./detectCandidates');

async function detectAllDuplicatesCandidates({ endpoints, internals }) {
  let after = 0;

  while (after !== -1) {
    const {
      after: nextAfter,
      items: locations
    } = await endpoints.list({}, { after, includeFields: ['uid'] });

    if (!locations.length) {
      after = -1;
      continue;
    }

    for (const location of locations) {
      await detectDuplicatesCandidates({ endpoints, internals }, location.uid, { saveCandidates: true });
    }

    after = nextAfter;
  }
}

module.exports = detectAllDuplicatesCandidates;
