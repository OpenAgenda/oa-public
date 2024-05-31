import getMatchingPassId from './getMatchingPassId.js';

export default function getOperationType(previousEntries, objectType, entry) {
  return getMatchingPassId(previousEntries, entry[objectType][0]?.id) ? 'update' : 'create';
}
