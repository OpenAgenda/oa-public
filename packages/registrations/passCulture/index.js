import apply from './apply/index.js';
import PassCultureSDK from './lib/PassCultureSDK.js';
import validate from './iso/validate/index.js';
import createEventOffer from './createEventOffer.js';
import listBooking from './listBooking.js';
import getParameters from './lib/getParameters.js';
import { getCurrentValue } from './iso/utils.js';

export default function PassCulture({ key, api, offerLink }, params) {
  const pc = PassCultureSDK({ key, api, offerLink });

  return {
    validate: validate.bind(null, { ...params, pc }),
    createEventOffer: createEventOffer.bind(null, pc),
    getParameters: getParameters.bind(null, { ...params, pc }),
    getEventOfferLink: (eventOffer) =>
      pc.offers.events(getCurrentValue(eventOffer).passId).getLink(),
    apply: apply.bind(null, { ...params, pc }),
    listBooking: listBooking.bind(null, pc),
  };
}
