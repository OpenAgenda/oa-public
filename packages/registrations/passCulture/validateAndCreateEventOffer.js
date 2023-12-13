import createEventOffer from './createEventOffer.js';
import validateEventOffer from './iso/validate/validateEventOffer.js';

export default async function validateAndCreateEventOffer(internals, event, data = {}) {
  const {
    pc,
    siren,
    log = { info: () => {}, error: () => {} },
  } = internals;

  const { categories, related } = await pc.offers.events.categories.list();

  return createEventOffer(
    { log, pc },
    event,
    await validateEventOffer({ pc, siren }, event, data, { categories, related }),
    { categories, related },
  );
}
