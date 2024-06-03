import getObjectType from './getObjectType.js';

export default function getMatchingPassId(data, id) {
  for (const entry of [].concat(data)) {
    const type = getObjectType(entry);

    if (type === 'eventOffer' && id === undefined && entry.result?.passId) {
      return entry.result?.passId;
    }

    if (type === 'eventOffer') {
      continue;
    }

    const match = (entry.result?.[type] ?? []).find(resultItem => resultItem.id === id);

    if (!match) {
      continue;
    }

    return match.passId;
  }
}
