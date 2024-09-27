import resetCache from './resetCache.js';

export default function onPatch(_config, services) {
  return async (context) => {
    await resetCache(services, context.result);
  };
}
