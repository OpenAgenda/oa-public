import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from './lib/formatEvent.js';
import { omit, getTimingId, isDHMFormat, convertDHMToDate } from './lib/utils.js';
import formatErrors from './lib/formatErrors.js';

const log = logs('passCulture/createEventOffer');

export default async function createEventOffer(pc, OAEvent, PCData, options = {}) {
  const {
    priceCategories = [],
    dates = [],
  } = PCData;

  const result = {
    eventOffer: null,
    priceCategories: null,
    dates: null,
    errors: null,
  };

  const eventOffer = await formatEvent(OAEvent, PCData, options);

  try {
    result.eventOffer = await pc.offers.events.create(eventOffer);
  } catch (e) {
    throw new BadRequest({
      info: {
        errors: formatErrors(e.response.data),
      },
    }, 'data is invalid');
  }

  log.info('created event offer %s', result.eventOffer.id);

  try {
    const {
      priceCategories: createdPriceCategories,
    } = await pc.offers.events(result.eventOffer.id).priceCategories.create({
      priceCategories,
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

  const datesPayload = dates.map(d => {
    const timing = OAEvent.timings.find(t => d.timingId === getTimingId(t, OAEvent.timezone));

    return omit({
      ...d,
      priceCategoryId: result.priceCategories[d.priceCategoryIndex].id,
      beginningDatetime: isDHMFormat(timing.begin) ? convertDHMToDate(timing.begin, { timezone: OAEvent.timezone }) : timing.begin,
      bookingLimitDatetime: isDHMFormat(timing.begin) ? convertDHMToDate(timing.begin, { timezone: OAEvent.timezone }) : timing.begin,
    }, ['timingId', 'priceCategoryIndex']);
  });

  try {
    const {
      dates: createdDates,
    } = await pc.offers.events(result.eventOffer.id).dates.create({
      dates: datesPayload,
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
