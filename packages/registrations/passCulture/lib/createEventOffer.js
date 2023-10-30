import logs from '@openagenda/logs';
import formatEvent from './formatEvent.js';
import { omit, pick } from './utils.js';

const log = logs('createEventOffer');

export default async function createEventOffer(pc, OAEvent, PCData, options = {}) {
  const {
    lang = 'fr',
  } = options;

  const {
    priceCategories = [],
    dates = [],
    venueId,
    category
  } = PCData;

  const result = {
    eventOffer: null,
    priceCategories: null,
    dates: null,
    error: null,
  };

  const eventOffer = await formatEvent(OAEvent, { venueId, category }, { lang });

  try {
    result.eventOffer = await pc.offers.events.create(eventOffer);
  } catch (e) {
    throw e.response.data;
  }
  
  log('created event offer %s', result.eventOffer.id);

  try {
    const {
      priceCategories: createdPriceCategories,
    } = await pc.offers.events(result.eventOffer.id).priceCategories.create({
      priceCategories
    });

    result.priceCategories = createdPriceCategories;
    log('created %s price categories', createdPriceCategories.length);
  } catch (e) {
    log('failed to create price categories');
    return {
      ...result,
      error: pick(e.response, ['status', 'data']),
    };
  }

  try {
    const {
      dates: createdDates,
    } = await pc.offers.events(result.eventOffer.id).dates.create({
      dates: dates.map(d => {
        const timing = OAEvent.timings.find(t => d.timingId === new Date(t.begin).getTime());
  
        return omit({
          ...d,
          priceCategoryId: result.priceCategories[d.priceCategoryIndex].id,
          beginningDatetime: timing.begin,
          bookingLimitDatetime: timing.begin,
        }, ['timingId', 'priceCategoryIndex'])
      }),
    });
    result.dates = createdDates;

    log('created %s dates', createdDates.length);
  } catch (e) {
    log('failed to create dates');
    return {
      ...result,
      error: pick(e.response, ['status', 'data']),
    };
  }

  return result;
}