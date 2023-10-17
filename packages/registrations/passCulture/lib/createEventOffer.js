import logs from '@openagenda/logs';
import formatEvent from './formatEvent.js';
import { omit } from './utils.js';

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

  const eventOffer = await formatEvent(OAEvent, { venueId, category }, { lang });

  const createdEventOffer = await pc.offers.events.create(eventOffer);
  
  log('created event offer %s', createdEventOffer.id);

  const {
    priceCategories: createdPriceCategories,
  } = await pc.offers.events(createdEventOffer.id).priceCategories.create({
    priceCategories
  });

  log('created %s price categories', createdPriceCategories.length);

  const { dates: createdDates } = await pc.offers.events(createdEventOffer.id).dates.create({
    dates: dates.map(d => {
      const timing = OAEvent.timings.find(t => d.timingId === new Date(t.begin).getTime());

      return omit({
        ...d,
        priceCategoryId: createdPriceCategories[d.priceCategoryIndex].id,
        beginningDatetime: timing.begin,
        bookingLimitDatetime: timing.begin,
      }, ['timingId', 'priceCategoryIndex'])
    })
  });

  log('created %s dates', createdDates.length);

  return {
    eventOffer: createdEventOffer,
    priceCategories: createdPriceCategories,
    dates: createdDates,
  };
}