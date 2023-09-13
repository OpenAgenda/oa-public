import formatEvent from './formatEvent.mjs';

const omit = (obj, fields = []) => Object.keys(obj).reduce((filtered, key) => {
  if (fields.includes(key)) {
    return filtered;
  }
  return Object.assign(filtered, { [key]: obj[key] });
}, {});

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

  const {
    priceCategories: createdPriceCategories,
  } = await pc.offers.events(createdEventOffer.id).priceCategories.create({
    priceCategories
  });

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

  return {
    eventOffer: createdEventOffer,
    priceCategories: createdPriceCategories,
    dates: createdDates,
  };
}