'use strict';

async function clearCandidates(endpoints) {
  let after = 0;

  while (after !== -1) {
    const {
      after: nextAfter,
      items: locations
    } = await endpoints.list({}, { after });

    if (!locations.length) {
      after = -1;
      continue;
    }

    for (const location of locations) {
      await endpoints.patch(location, { duplicateCandidates: [] });
    }

    after = nextAfter;
  }
}

module.exports = clearCandidates;
