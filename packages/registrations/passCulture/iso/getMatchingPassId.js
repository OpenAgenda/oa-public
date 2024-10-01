import { getObjectType } from './utils.js';

export default function getMatchingPassId(data, id) {
  for (const entry of [].concat(data)) {
    const type = getObjectType(entry);

    if (type === 'eventOffer' && id === undefined && entry.response?.passId) {
      return entry.response?.passId;
    }

    if (type === 'eventOffer') {
      continue;
    }

    const match = (entry.response?.[type] ?? []).find(
      (responseItem) => responseItem.id === id,
    );

    if (!match) {
      continue;
    }

    return match.passId;
  }
}
