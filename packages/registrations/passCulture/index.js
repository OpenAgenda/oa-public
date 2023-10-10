import PassCultureSDK from './lib/PassCultureSDK';
import verifyAndCreateEventOffer from './lib/verifyAndCreateEventOffer';
import getParameters from './lib/getParameters';

export default function PassCulture({
  key
}) {
  const pc = PassCultureSDK(key);

  return params => ({
    verifyAndCreateEventOffer: verifyAndCreateEventOffer.bind(null, { ...params, pc }),
    getParameters: getParameters.bind(null, { ...params, pc }),
  });
}