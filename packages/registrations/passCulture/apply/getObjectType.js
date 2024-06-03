export default function getObjectType(entry) {
  const {
    priceCategories,
    dates,
    ...remaining
  } = entry;

  if (priceCategories) {
    return 'priceCategories';
  }

  if (dates) {
    return 'dates';
  }

  if (Object.keys(remaining).length) {
    return 'eventOffer';
  }

  return null;
}
