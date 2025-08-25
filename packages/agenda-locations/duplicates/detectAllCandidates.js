'use strict';

const detectDuplicateCandidates = require('./detectCandidates');

const sleep = (ms) => new Promise((rs) => setTimeout(rs, ms));

async function detectAllDuplicateCandidates(
  { endpoints, internals },
  options = {},
) {
  let after = 0;
  let count = 0;
  while (after !== -1) {
    const { after: nextAfter, items: locations } = await endpoints.list(
      {},
      { after, includeFields: ['uid'] },
    );

    if (!locations.length) {
      after = -1;
      continue;
    }

    for (const location of locations) {
      const candidates = await detectDuplicateCandidates(
        { endpoints, internals },
        location.uid,
        {
          saveCandidates: true,
        },
      );
      if (options.sleep) {
        await sleep(options.sleep);
      }
      count += candidates.length;
    }
    after = nextAfter;
  }

  return count;
}

module.exports = detectAllDuplicateCandidates;
