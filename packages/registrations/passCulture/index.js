import PassCultureSDK from './lib/PassCultureSDK.js';
import validateEventOffer from './iso/validate/validateEventOffer.js';
import createEventOffer from './createEventOffer.js';
import validateAndCreateEventOffer from './validateAndCreateEventOffer.js';
import getParameters from './lib/getParameters.js';

export default function PassCulture({
  key,
  api,
  offerLink,
  log = { info: () => {}, error: () => {} },
}, params) {
  const pc = PassCultureSDK({ key, api, offerLink });

  return {
    validateEventOffer: validateEventOffer.bind(null, { ...params, pc }),
    validateAndCreateEventOffer: validateAndCreateEventOffer.bind(null, { ...params, pc, log }),
    createEventOffer: createEventOffer.bind(null, { pc, log }),
    getParameters: getParameters.bind(null, { ...params, pc }),
    getEventOfferLink: eventOffer => pc.offers.events(eventOffer.id).getLink(),
  };
}
