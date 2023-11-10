import PassCultureSDK from './lib/PassCultureSDK.js';
import { validateEventOffer } from './iso/validate.js';
import createEventOffer from './createEventOffer.js';
import verifyAndCreateEventOffer from './validateAndCreateEventOffer.js';
import getParameters from './lib/getParameters.js';

export default function PassCulture({
  key,
  api,
  offerLink,
}, params) {
  const pc = PassCultureSDK({ key, api, offerLink });

  return {
    validateEventOffer: validateEventOffer.bind(null, { ...params, pc }),
    validateAndCreateEventOffer: verifyAndCreateEventOffer.bind(null, { ...params, pc }),
    createEventOffer: createEventOffer.bind(null, pc),
    getParameters: getParameters.bind(null, { ...params, pc }),
    getEventOfferLink: eventOffer => pc.offers.events(eventOffer.id).getLink(),
  };
}
