import createEventOffer from './createEventOffer.js';
import validateEventOffer from './validateEventOffer.js';

export default async function validateAndCreateEventOffer({ pc, siren }, event, data = {}) {
  return createEventOffer(
    pc,
    event,
    await validateEventOffer({ pc, siren }, event, data)
  );
}