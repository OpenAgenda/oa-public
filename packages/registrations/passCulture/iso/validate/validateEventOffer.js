import { BadRequest } from '@openagenda/verror';

import validateLocalData from './validateLocalData.js';

export default async function validateEventOffer({ pc, siren }, event, data = {}, options = {}) {
  const {
    venueId,
  } = data;

  const {
    categories,
    related,
  } = options.categories && options.related ? options : await pc.offers.events.categories.list();

  const clean = validateLocalData(data, event, { categories, related });

  const hasVenue = await pc.offers.offererVenues({ siren })
    .then(offererVenues => offererVenues.reduce((acc, { venues }) => [...acc, ...venues], []).find(v => v.id === venueId));
  if (!hasVenue) {
    throw new BadRequest(`offerer ${siren} has no venue with id ${venueId}`);
  }

  return clean;
}
