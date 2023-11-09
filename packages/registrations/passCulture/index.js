import PassCultureSDK from './lib/PassCultureSDK';
import validateEventOffer from './lib/validateEventOffer';
import createEventOffer from './lib/createEventOffer';
import verifyAndCreateEventOffer from './lib/validateAndCreateEventOffer';
import getParameters from './lib/getParameters';

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
