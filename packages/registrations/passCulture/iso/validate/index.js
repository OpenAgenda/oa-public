import { BadRequest } from '@openagenda/verror';
import debug from 'debug';

import spreadPCData from '../spreadPCData.js';
import { findLastVenueIdFromData } from '../utils.js';
import validateLocalData from './validateLocalData.js';
import validateDate from './validateDate.js';
import validatePriceCategory from './validatePriceCategory.js';
import validateEventOffer from './validateEventOffer.js';

const log = debug('validate/index');

async function validate({ pc, siren }, event, data = {}, options = {}) {
  const spreadData = spreadPCData(data);
  log('processing', { data, spreadData });

  const venueId = findLastVenueIdFromData(spreadData);
  const { noThrow = false } = options;
  const { categories, related } = options.categories && options.related
    ? options
    : await pc.offers.events.categories.list();

  const clean = validateLocalData(spreadData, event, {
    categories,
    related,
    noThrow,
  });

  const hasVenue = await pc.offers
    .offererVenues({ siren })
    .then((offererVenues) =>
      offererVenues
        .reduce((acc, { venues }) => [...acc, ...venues], [])
        .find((v) => v.id === venueId));

  if (!hasVenue && !noThrow) {
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
