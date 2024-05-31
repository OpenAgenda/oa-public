import formatEvent from '../lib/formatEvent.js';
import { loadCategoriesAndRelated } from './loadCategoriesAndRelated.js';

export default async function createEventOffer(pc, OAEvent, PCData, options = {}) {
  const eventOffer = await formatEvent(pc, OAEvent, PCData, {
    ...options,
    ...await loadCategoriesAndRelated(pc, options),
  });

  return pc.offers.events.create(eventOffer);
}
