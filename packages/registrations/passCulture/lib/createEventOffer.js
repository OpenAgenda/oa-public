import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from './formatEvent.js';
import { omit, pick } from './utils.js';
import formatErrors from './formatErrors.js';

const log = logs('passCulture/createEventOffer');

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
    throw new BadRequest({
      info: {
        errors: formatErrors(e.response.data),
      }
    }, 'data is invalid');
  }
  
  log.info('created event offer %s', result.eventOffer.id);

  try {
    const {
      priceCategories: createdPriceCategories,
    } = await pc.offers.events(result.eventOffer.id).priceCategories.create({
      priceCategories
    });

    result.priceCategories = createdPriceCategories;
    log.info('%s: created %s price categories', result.eventOffer.id, createdPriceCategories.length);
  } catch (e) {
    log.error('failed to create price categories', e);
    return {
      ...result,
      errors: formatErrors(e.response.data),
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

    log.info('%s: created %s dates', result.eventOffer.id, createdDates.length);
  } catch (e) {
    log.error('failed to create dates', e);
    return {
      ...result,
      errors: formatErrors(e.response.data),
    };
  }

  return result;
}