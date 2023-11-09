import createEventOffer from './createEventOffer';
import validateEventOffer from './validateEventOffer';

export default async function validateAndCreateEventOffer({ pc, siren }, event, data = {}) {
  return createEventOffer(
    pc,
    event,
    await validateEventOffer({ pc, siren }, event, data),
  );
}
