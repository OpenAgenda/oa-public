export default function sortKeysChange(eventSortKeys, previousSortKeys) {
  if (previousSortKeys.length === 0) return true;

  return eventSortKeys.some(
    (eventKey, index) => eventKey.value !== previousSortKeys[index].value,
  );
}
