import createEventOffer from './createEventOffer.js';
import validateEventOffer from './iso/validate/validateEventOffer.js';

export default async function validateAndCreateEventOffer({ pc, siren }, event, data = {}) {
  const { categories, related } = await pc.offers.events.categories.list();

  return createEventOffer(
    pc,
    event,
    await validateEventOffer({ pc, siren }, event, data, { categories, related }),
    { categories, related },
  );
}
