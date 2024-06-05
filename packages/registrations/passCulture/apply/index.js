import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';
import spreadPCData from './spreadPCData.js';
import wasApplied from './wasApplied.js';
import getObjectType from './getObjectType.js';
import getOperationType from './getOperationType.js';
import applyPriceCategories from './priceCategories.js';
import applyDates from './dates.js';
import applyEventOffer from './eventOffer.js';

const getApplyFn = (type, operation) => ({
  dates: applyDates,
  priceCategories: applyPriceCategories,
  eventOffer: applyEventOffer,
})[type][operation];

const log = logs('apply');

export default async function apply(pc, OAEvent, PCData, options = {}) {
  const dataEntries = spreadPCData(PCData);
  const processed = [];
  const logBundle = {
    OAEvent: { uid: OAEvent.uid },
  };

  const [firstItem, ...remainingDataEntries] = dataEntries;

  if (getObjectType(firstItem) !== 'eventOffer') {
    throw new BadRequest('first item should be eventOffer');
  }

  if (!wasApplied(firstItem)) {
    log.info('creating event offer', logBundle);
    const { response, succeeded } = await applyEventOffer.create(pc, OAEvent, firstItem, options);

    processed.push({
      ...succeeded,
      response,
      appliedAt: new Date(),
    });

    if (response.isPending) {
      log.info('created offer has a pending status', logBundle);
      return processed.concat(remainingDataEntries);
    }
  } else {
    processed.push(firstItem);
  }

  const wasPending = firstItem?.response?.isPending;
  const isStillPending = wasPending && await pc.offers.events(firstItem.response.passId)
    .get()
    .then(({ status }) => status === 'PENDING');

  if (isStillPending) {
    log.info('is still pending, no action taken');
    return dataEntries;
  }

  if (wasPending) {
    log.info('was pending at previous apply but isn\'t anymore');
    processed.push({
      response: {
        isPending: false,
      },
      appliedAt: new Date(),
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
    const operationType = getOperationType(remainingDataEntries, objectType, entry);

    log('entry was not yet applied, processing', Object.assign(entryLogBundle, { type: objectType, operation: operationType }));

    const {
      succeeded,
      response,
      remaining,
      error,
    } = await getApplyFn(objectType, operationType)(pc, passEventOfferId, OAEvent, processed, entry, { logBundle: entryLogBundle });

    if (succeeded) {
      processed.push({
        ...succeeded,
        ...response ? { response } : undefined,
        appliedAt: new Date(),
      });
    }

    if (!error) {
      continue;
    }

    return processed.concat({
      ...objectType === 'eventOffer' ? remaining : { [objectType]: remaining },
      error,
    }).concat(remainingDataEntries.slice(remainingDataEntries.length - index + 1));
  }

  return processed;
}
