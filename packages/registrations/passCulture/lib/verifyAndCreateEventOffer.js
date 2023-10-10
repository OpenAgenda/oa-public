import { BadRequest } from '@openagenda/verror';

import createEventOffer from './createEventOffer.js';

export default async function verifyAndCreateEventOffer({ pc, siren }, event, data = {}) {
  const {
    venueId,
  } = data;

  const hasVenue = (
    await pc.offers.offererVenues({ siren })
      .then(offererVenues => offererVenues.reduce((acc, { venues }) => [...acc, ...venues], []).find(v => v.id === venueId))
  )

  if (!hasVenue) {
    throw new BadRequest(`offerer ${siren} has no venue with id ${venueId}`);
  }

  return createEventOffer(pc, event, data);
}