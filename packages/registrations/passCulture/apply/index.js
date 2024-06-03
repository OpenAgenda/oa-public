import { BadRequest } from '@openagenda/verror';
import spreadPCData from './spreadPCData.js';
import wasApplied from './wasApplied.js';
import getObjectType from './getObjectType.js';
import getOperationType from './getOperationType.js';
import applyPriceCategories from './applyPriceCategories.js';
import applyDates from './applyDates.js';
import applyEventOffer from './applyEventOffer.js';

const getApplyFn = (type, operation) => ({
  dates: applyDates,
  priceCategories: applyPriceCategories,
  eventOffer: applyEventOffer,
})[type][operation];

export default async function apply(pc, OAEvent, PCData, options = {}) {
  const dataEntries = spreadPCData(PCData);
  const processed = [];

  const [firstItem, ...remainingDataEntries] = dataEntries;

  if (getObjectType(firstItem) !== 'eventOffer') {
    throw new BadRequest('first item should be eventOffer');
  }

  if (!wasApplied(firstItem)) {
    const { result, succeeded } = await applyEventOffer.create(pc, OAEvent, firstItem, options);

    processed.push({
      ...succeeded,
      result,
      appliedAt: new Date(),
    });

    if (result.isPending) {
      return processed.concat(remainingDataEntries.slice(remainingDataEntries.length - 1));
    }
  } else {
    processed.push(firstItem);
  }

  const passEventOfferId = processed[0].result.passId;

  for (let index = 0; index < remainingDataEntries.length; index += 1) {
    const entry = remainingDataEntries[index];

    if (wasApplied(entry)) {
      processed.push(entry);
      continue;
    }

    const objectType = getObjectType(entry);
    const operationType = getOperationType(remainingDataEntries, objectType, entry);

    const {
      succeeded,
      result,
      remaining,
      error,
    } = await getApplyFn(objectType, operationType)(pc, passEventOfferId, OAEvent, processed, entry);

    if (succeeded) {
      processed.push({
        ...succeeded,
        ...result ? { result } : undefined,
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
