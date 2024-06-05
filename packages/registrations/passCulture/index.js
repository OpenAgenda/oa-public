import apply from './apply/index.js';
import PassCultureSDK from './lib/PassCultureSDK.js';
import validateEventOffer from './iso/validate/validateEventOffer.js';
import createEventOffer from './createEventOffer.js';
import validateAndCreateEventOffer from './validateAndCreateEventOffer.js';
import getParameters from './lib/getParameters.js';
import { getCurrentValue } from './iso/utils.js';

export default function PassCulture({
  key,
  api,
  offerLink,
}, params) {
  const pc = PassCultureSDK({ key, api, offerLink });

  return {
    validateEventOffer: validateEventOffer.bind(null, { ...params, pc }),
    validateAndCreateEventOffer: validateAndCreateEventOffer.bind(null, { ...params, pc }),
    createEventOffer: createEventOffer.bind(null, pc),
    getParameters: getParameters.bind(null, { ...params, pc }),
    getEventOfferLink: eventOffer => pc.offers.events(
      getCurrentValue(eventOffer).passId,
    ).getLink(),
    apply: apply.bind(null, pc),
  };
}
