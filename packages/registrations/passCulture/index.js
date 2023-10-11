import PassCultureSDK from './lib/PassCultureSDK.js';
import verifyAndCreateEventOffer from './lib/verifyAndCreateEventOffer.js';
import getParameters from './lib/getParameters.js';

export default function PassCulture({
  key,
  api,
}) {
  const pc = PassCultureSDK({ key, api });

  return params => ({
    verifyAndCreateEventOffer: verifyAndCreateEventOffer.bind(null, { ...params, pc }),
    getParameters: getParameters.bind(null, { ...params, pc }),
  });
}