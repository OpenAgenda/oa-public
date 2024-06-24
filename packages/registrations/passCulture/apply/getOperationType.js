import getMatchingPassId from '../iso/getMatchingPassId.js';

export default function getOperationType(previousEntries, objectType, entry) {
  const id = objectType === 'eventOffer' ? entry.id : entry[objectType][0]?.id;
  return getMatchingPassId(previousEntries, id) ? 'update' : 'create';
}
