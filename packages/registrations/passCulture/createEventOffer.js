import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from './lib/formatEvent.js';
import {
  omit,
  getTimingId,
  isDHMFormat,
  convertDHMToDate,
} from './lib/utils.js';
import formatErrors from './lib/formatErrors.js';

const log = logs('passCulture/createEventOffer');

export default async function createEventOffer(
  pc,
  OAEvent,
  PCData,
  options = {},
) {
  const { priceCategories = [], dates = [] } = PCData;

  const result = {
    eventOffer: null,
    priceCategories: null,
    dates: null,
    errors: null,
  };

  const {
    categories: categoriesFromOptions,
    related: relatedFromOptions,
    simulatePending = false,
  } = options;

  const { categories, related } = !categoriesFromOptions || !relatedFromOptions
    ? await pc.offers.events.categories.list()
    : { categories: categoriesFromOptions, related: relatedFromOptions };

  const eventOffer = await formatEvent(OAEvent, PCData, {
    ...options,
    categories,
    related,
  });

  log.info('attempting create', { eventOffer });

  try {
    result.eventOffer = await pc.offers.events.create(eventOffer);
  } catch (e) {
    const errorData = await e?.response?.json?.();
    log.error('create failed', { error: errorData });
    throw new BadRequest(
      {
        info: {
          errors: formatErrors(errorData),
        },
      },
      'data is invalid',
    );
  }

  log('created event offer %s', result.eventOffer.id);

  const formatedPriceCategories = priceCategories.map((priceCategory) => ({
    ...priceCategory,
    price: parseFloat(priceCategory.price),
  }));

  try {
    const { priceCategories: createdPriceCategories } = await pc.offers
      .events(result.eventOffer.id)
      .priceCategories.create({
        priceCategories: formatedPriceCategories,
      });

    result.priceCategories = createdPriceCategories;
    log(
      '%s: created %s price categories',
      result.eventOffer.id,
      createdPriceCategories.length,
    );
  } catch (e) {
    log.error('failed to create price categories', e);
    return {
      ...result,
      errors: formatErrors(await e.response.json()),
    };
  }

  const datesPayload = dates.map((d) => {
    const timing = OAEvent.timings.find(
      (t) => d.timingId === getTimingId(t, OAEvent.timezone),
    );

    return omit(
      {
        ...d,
        priceCategoryId: result.priceCategories[d.priceCategoryId].id,
        beginningDatetime: isDHMFormat(timing.begin)
          ? convertDHMToDate(timing.begin, { timezone: OAEvent.timezone })
          : timing.begin,
        bookingLimitDatetime: isDHMFormat(timing.begin)
          ? convertDHMToDate(timing.begin, { timezone: OAEvent.timezone })
          : timing.begin,
      },
      ['timingId', 'priceCategoryIndex'],
    );
  });

  if (simulatePending || eventOffer.status === 'PENDING') {
    log('did not create dates cause offer pending', result.eventOffer.id);
    return {
      ...result,
      warning: 'pending',
      datesPayload,
    };
  }

  try {
    const { dates: createdDates } = await pc.offers
      .events(result.eventOffer.id)
      .dates.create({
        dates: datesPayload,
      });
    result.dates = createdDates;

    log('%s: created %s dates', result.eventOffer.id, createdDates.length);
  } catch (e) {
    log.error('failed to create dates', e);
    return {
      ...result,
      errors: formatErrors(await e.response.json()),
    };
  }

  return result;
}
