import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';
import { getObjectType } from '../iso/utils.js';
import validateLocalData from '../iso/validate/validateLocalData.js';
import getOperationType from '../iso/getOperationType.js';
import spreadPCData from '../iso/spreadPCData.js';
import wasApplied from './wasApplied.js';
import applyPriceCategories from './priceCategories.js';
import applyDates from './dates.js';
import applyEventOffer from './eventOffer.js';

const getApplyFn = (type, operation) =>
  ({
    dates: applyDates,
    priceCategories: applyPriceCategories,
    eventOffer: applyEventOffer,
  })[type][operation];

const log = logs('apply');

export default async function apply(
  { pc, siren },
  OAEvent,
  PCData,
  options = {},
) {
  const dataEntries = spreadPCData(PCData);

  const processed = [];
  const logBundle = {
    OAEvent: { uid: OAEvent.uid },
  };

  const { categories: categoriesFromOptions, related: relatedFromOptions } = options;

  const { categories, related } = !categoriesFromOptions || !relatedFromOptions
    ? await pc.offers.events.categories.list()
    : {
      categories: categoriesFromOptions,
      related: relatedFromOptions,
    };

  const cleanEntries = validateLocalData(dataEntries, OAEvent, {
    ...options,
    categories,
    related,
  });

  const [firstItem, ...remainingDataEntries] = cleanEntries;

  if (getObjectType(firstItem) !== 'eventOffer') {
    throw new BadRequest('first item should be eventOffer');
  }

  if (!wasApplied(firstItem)) {
    log.info('creating event offer', logBundle);
    const { response, succeeded, error } = await applyEventOffer.create(
      { pc, siren },
      OAEvent,
      firstItem,
      options,
    );

    if (error) {
      throw error; // {"offer: ["Une offre qui a un ticket..."]}}
    }

    processed.push({
      ...succeeded,
      response,
      appliedAt: new Date(),
      operation: 'create',
    });

    if (response.isPending) {
      log.info('created offer has a pending status', logBundle);
      return processed.concat(remainingDataEntries);
    }
  } else {
    processed.push(firstItem);
  }

  const wasPending = firstItem?.response?.isPending;
  const fetchedStatus = wasPending
    && await pc.offers
      .events(firstItem.response.passId)
      .get()
      .then(({ status }) => status);
  const isStillPending = wasPending && fetchedStatus === 'PENDING';
  const isRejected = wasPending && fetchedStatus === 'REJECTED';

  if (isStillPending) {
    log.info('is still pending, no action taken', logBundle);
    return dataEntries;
  }

  if (isRejected) {
    log.info('was pending at previous apply but is now rejected', logBundle);
    processed.push({
      response: {
        isPending: false,
        isRejected: true,
      },
      appliedAt: new Date(),
      operation: 'get',
    });
    log('done', { ...logBundle, processed });

    return processed;
  }

  if (wasPending) {
    log.info("was pending at previous apply but isn't anymore", logBundle);
    processed.push({
      response: {
        isPending: false,
      },
      appliedAt: new Date(),
      operation: 'get',
    });
  }

  const passEventOfferId = processed[0].response.passId;

  for (let index = 0; index < remainingDataEntries.length; index += 1) {
    const entryLogBundle = { ...logBundle, index };
    const entry = remainingDataEntries[index];

    if (wasApplied(entry)) {
      log('entry was applied', entryLogBundle);
      processed.push(entry);
      continue;
    }

    const objectType = getObjectType(entry);
    const operation = getOperationType(cleanEntries, objectType, entry);

    log(
      'entry was not yet applied, processing',
      Object.assign(entryLogBundle, { type: objectType, operation }),
    );

    const { succeeded, response, remaining, error } = await getApplyFn(
      objectType,
      operation,
    )(pc, passEventOfferId, OAEvent, processed, entry, {
      ...options,
      logBundle: entryLogBundle,
    });

    if (succeeded) {
      processed.push({
        ...succeeded,
        ...response ? { response } : undefined,
        appliedAt: new Date(),
        operation,
      });
    }

    if (!error) {
      continue;
    }

    const processedWithError = processed
      .concat({
        ...objectType === 'eventOffer'
          ? remaining
          : { [objectType]: remaining },
        error,
      })
      .concat(
        remainingDataEntries.slice(remainingDataEntries.length - index + 1),
      );

    log('done with errors', { ...logBundle, processed: processedWithError });

    return processedWithError;
  }

  log('done', { ...logBundle, processed });

  return processed;
}
