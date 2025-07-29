import { getObjectType } from './utils.js';
import { getEntryItemOperationType } from './getOperationType.js';

function decorateWithInfoFields(data, entry) {
  return {
    ...data,
    ...['response', 'appliedAt', 'operation'].reduce(
      (info, key) =>
        (entry[key] !== undefined ? { ...info, [key]: entry[key] } : info),
      {},
    ),
  };
}

function findLastVenueIdFromData(dataArray) {
  // Look through the original data array in reverse order to find the last venueId
  for (let i = dataArray.length - 1; i >= 0; i--) {
    const entry = dataArray[i];
    if (entry.venueId) {
      return entry.venueId;
    }
  }
  return null;
}

function spreadAccordingToObjectType(data) {
  const dataArray = [].concat(data);
  return dataArray.reduce((spreadEntries, entry) => {
    const {
      priceCategories,
      dates,
      response,
      appliedAt,
      operation,
      editing,
      updateAddress,
      ...remaining
    } = entry;

    const spread = [];

    const hasOtherData = !!Object.keys(remaining).length;

    if (hasOtherData) {
      spread.push(decorateWithInfoFields(remaining, entry));
    }

    if (priceCategories) {
      spread.push(decorateWithInfoFields({ priceCategories }, entry));
    }

    if (dates) {
      spread.push(decorateWithInfoFields({ dates }, entry));
    }

    // If editing is true and updateAddress is true, create an eventOffer entry to force update
    if (
      !dates
      && !priceCategories
      && !hasOtherData
      && editing
      && updateAddress
    ) {
      // Find the last venueId from the original data array
      const lastVenueId = findLastVenueIdFromData(dataArray);
      const updateEntry = { updateAddress: true };
      if (lastVenueId) {
        updateEntry.venueId = lastVenueId;
      }
      spread.push(decorateWithInfoFields(updateEntry, entry));
    } else if (!dates && !priceCategories && !hasOtherData) {
      spread.push({ operation, appliedAt, response });
    }

    return spreadEntries.concat(spread);
  }, []);
}

function spreadAccordingToOperation(data) {
  return data.reduce((spreadEntries, entry) => {
    const type = getObjectType(entry);

    if (!['priceCategories', 'dates'].includes(type)) {
      // no spread by operation possible for event offer
      return spreadEntries.concat(entry);
    }

    const {
      create: createOperations,
      update: updateOperations,
      delete: deleteOperations,
    } = entry[type].reduce(
      (carry, entryItem) => {
        const operationKey = getEntryItemOperationType(
          spreadEntries,
          entryItem,
        );

        return {
          ...carry,
          [operationKey]: carry[operationKey].concat(entryItem),
        };
      },
      { create: [], update: [], delete: [] },
    );

    const spread = [];

    if (updateOperations.length) {
      spread.push({
        ...entry,
        [type]: updateOperations,
      });
    }

    if (createOperations.length) {
      spread.push({
        ...entry,
        [type]: createOperations,
      });
    }

    if (deleteOperations.length) {
      spread.push({
        ...entry,
        [type]: deleteOperations,
      });
    }

    return spreadEntries.concat(spread);
  }, []);
}

export default function spreadPCData(data) {
  return spreadAccordingToOperation(spreadAccordingToObjectType(data));
}
