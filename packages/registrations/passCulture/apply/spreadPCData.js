import getObjectType from './getObjectType.js';
import getMatchingPassId from './getMatchingPassId.js';

function spreadAccordingToObjectType(data) {
  return [].concat(data).reduce((spreadEntries, entry) => {
    const {
      priceCategories,
      dates,
      response,
      appliedAt,
      ...remaining
    } = entry;

    const spread = [];

    if (Object.keys(remaining).length) {
      spread.push({
        ...remaining,
        ...response ? { response } : undefined,
        ...appliedAt ? { appliedAt } : undefined,
      });
    }

    if (priceCategories) {
      spread.push({
        priceCategories,
        ...response ? { response } : undefined,
        ...appliedAt ? { appliedAt } : undefined,
      });
    }

    if (dates) {
      spread.push({
        dates,
        ...response ? { response } : undefined,
        ...appliedAt ? { appliedAt } : undefined,
      });
    }

    return spreadEntries.concat(spread);
  }, []);
}

function spreadAccordingToOperation(data) {
  return data.reduce((spreadEntries, entry) => {
    const type = getObjectType(entry);

    if (type === 'eventOffer') {
      // no spread by operation possible for event offer
      return spreadEntries.concat(entry);
    }

    const {
      create: createOperations,
      update: updateOperations,
    } = entry[type].reduce((carry, operation) => {
      const operationKey = getMatchingPassId(spreadEntries, operation.id) ? 'update' : 'create';

      return {
        ...carry,
        [operationKey]: carry[operationKey].concat(operation),
      };
    }, { create: [], update: [] });

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

    return spreadEntries.concat(spread);
  }, []);
}

export default function spreadPCData(data) {
  return spreadAccordingToOperation(
    spreadAccordingToObjectType(data),
  );
}
