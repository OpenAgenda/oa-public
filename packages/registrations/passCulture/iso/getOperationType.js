import getMatchingPassId from './getMatchingPassId.js';

function getEntryItemOperationType(previousEntries, entryItem) {
  if (entryItem.deleted) {
    return 'delete';
  }
  return getMatchingPassId(previousEntries, entryItem.id) ? 'update' : 'create';
}

export default function getOperationType(previousEntries, objectType, entry) {
  return getEntryItemOperationType(
    previousEntries,
    objectType === 'eventOffer' ? entry : entry[objectType][0],
  );
}

export { getEntryItemOperationType };
