'use strict';

const detectDuplicatesCandidates = require('./detectCandidates');

const sleep = ms => new Promise(rs => setTimeout(rs, ms));

async function detectAllDuplicatesCandidates({ endpoints, internals }, option = {}) {
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
      if (option.sleep) {
        await sleep(option.sleep);
      }
    }
    after = nextAfter;
  }
}

module.exports = detectAllDuplicatesCandidates;
