import { BadRequest } from '@openagenda/verror';

import { getCurrentValue } from '../utils.js';
import validateLocalData from './validateLocalData.js';
import validateDate from './validateDate.js';
import validatePriceCategory from './validatePriceCategory.js';
import validateEventOffer from './validateEventOffer.js';

async function validate({ pc, siren }, event, data = {}, options = {}) {
  const mergedData = getCurrentValue(data);
  const {
    venueId,
  } = mergedData;

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

export default validate;

export {
  validateDate,
  validatePriceCategory,
  validateEventOffer,
  validateLocalData,
};
