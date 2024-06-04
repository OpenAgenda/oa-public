import { getCurrentValue } from './iso/utils.js';

export default async function isOfferPending({ pc }, data) {
  const offer = await pc.offers.events(getCurrentValue(data).passId).get();

  return offer?.status === 'PENDING';
}
