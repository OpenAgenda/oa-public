import PassCultureSDK from './lib/PassCultureSDK.js';
import validateEventOffer from './iso/validate/validateEventOffer.js';
import createEventOffer from './createEventOffer.js';
import attemptOfferCompletion from './attemptOfferCompletion.js';
import validateAndCreateEventOffer from './validateAndCreateEventOffer.js';
import getParameters from './lib/getParameters.js';

export default function PassCulture({
  key,
  api,
  offerLink,
  interfaces,
}, params) {
  const pc = PassCultureSDK({ key, api, offerLink });

  return {
    validateEventOffer: validateEventOffer.bind(null, { ...params, pc }),
    validateAndCreateEventOffer: validateAndCreateEventOffer.bind(null, { ...params, pc }),
    createEventOffer: createEventOffer.bind(null, pc),
    getParameters: getParameters.bind(null, { ...params, pc }),
    getEventOfferLink: eventOffer => pc.offers.events(eventOffer.id).getLink(),
    attemptOfferCompletion: attemptOfferCompletion.bind(null, { pc, interfaces }),
  };
}
